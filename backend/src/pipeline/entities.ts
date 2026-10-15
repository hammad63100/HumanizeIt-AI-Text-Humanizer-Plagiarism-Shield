import { Logger, countWords } from '../utils';

/**
 * Entity types that should be protected from LLM rewriting.
 */
interface ProtectedEntity {
  placeholder: string;
  original: string;
  type: 'url' | 'email' | 'number' | 'date' | 'quote' | 'citation' | 'proper_noun' | 'code';
}

// Regex patterns for entity detection
const PATTERNS = {
  url: /https?:\/\/[^\s<>"{}|\\^`\[\]]+/g,
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  number: /\b\d[\d,.]*(?:%|°[CF]?|[kmKMBT]|st|nd|rd|th)?\b/g,
  date: /\b(?:\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}|\w+ \d{1,2},? \d{4}|\d{1,2} \w+ \d{4})\b/g,
  quote: /"[^"]{3,}"/g,
  citation: /\[[\d,;\s]+\]|\(\w+(?:\s+et\s+al\.?)?,?\s*\d{4}[a-z]?\)/g,
  code: /`[^`]+`/g,
};

/**
 * Detect and replace entities with numbered placeholders.
 * Returns the modified text and a map for restoration.
 */
export function protectEntities(text: string): {
  protectedText: string;
  entities: ProtectedEntity[];
} {
  const entities: ProtectedEntity[] = [];
  let counter = 1;
  let result = text;

  // Process each pattern type
  for (const [type, pattern] of Object.entries(PATTERNS)) {
    const regex = new RegExp(pattern.source, pattern.flags);
    result = result.replace(regex, (match) => {
      const placeholder = `[[P${counter}]]`;
      entities.push({
        placeholder,
        original: match,
        type: type as ProtectedEntity['type'],
      });
      counter++;
      return placeholder;
    });
  }

  Logger.debug('Entity protection completed', {
    entities_found: entities.length,
    types: [...new Set(entities.map((e) => e.type))],
  });

  return { protectedText: result, entities };
}

/**
 * Restore protected entities from placeholders back to original values.
 */
export function restoreEntities(text: string, entities: ProtectedEntity[]): string {
  let result = text;

  for (const entity of entities) {
    // Replace all occurrences of the placeholder
    result = result.split(entity.placeholder).join(entity.original);
  }

  // Verify all placeholders were restored
  const remainingPlaceholders = result.match(/\[\[P\d+\]\]/g);
  if (remainingPlaceholders) {
    Logger.warn('Some placeholders were not restored', {
      remaining: remainingPlaceholders,
    });
  }

  return result;
}

/**
 * Split text into chunks of 300-500 words at natural boundaries.
 * Carries small contextual overlap between chunks.
 */
export function chunkText(
  text: string,
  minWords: number = 300,
  maxWords: number = 500
): string[] {
  const totalWords = countWords(text);

  // If text fits in a single chunk, return as-is
  if (totalWords <= maxWords) {
    return [text];
  }

  const paragraphs = text.split(/\n\s*\n/);
  const chunks: string[] = [];
  let currentChunk = '';
  let currentWordCount = 0;

  for (const paragraph of paragraphs) {
    const paraWords = countWords(paragraph);

    // If adding this paragraph exceeds max and we have enough for a chunk
    if (currentWordCount + paraWords > maxWords && currentWordCount >= minWords) {
      chunks.push(currentChunk.trim());
      // Carry last sentence as overlap context
      const sentences = currentChunk.split(/(?<=[.!?])\s+/);
      const lastSentence = sentences[sentences.length - 1] || '';
      currentChunk = lastSentence + '\n\n' + paragraph;
      currentWordCount = countWords(currentChunk);
    } else if (paraWords > maxWords) {
      // Large paragraph: split by sentences
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
      const sentenceChunks = chunkBySentences(paragraph, minWords, maxWords);
      chunks.push(...sentenceChunks.slice(0, -1));
      currentChunk = sentenceChunks[sentenceChunks.length - 1] || '';
      currentWordCount = countWords(currentChunk);
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
      currentWordCount += paraWords;
    }
  }

  // Don't forget the last chunk
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  Logger.debug('Text chunking completed', {
    total_words: totalWords,
    num_chunks: chunks.length,
    chunk_sizes: chunks.map((c) => countWords(c)),
  });

  return chunks;
}

/**
 * Split a single large paragraph by sentence boundaries.
 */
function chunkBySentences(
  paragraph: string,
  minWords: number,
  maxWords: number
): string[] {
  const sentences = paragraph.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let current = '';
  let currentCount = 0;

  for (const sentence of sentences) {
    const words = countWords(sentence);
    if (currentCount + words > maxWords && currentCount >= minWords) {
      chunks.push(current.trim());
      current = sentence;
      currentCount = words;
    } else {
      current += (current ? ' ' : '') + sentence;
      currentCount += words;
    }
  }

  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks;
}

/**
 * Clean up rewritten text: normalize whitespace, fix punctuation, remove repetitive transitions.
 */
export function cleanupText(text: string): string {
  let result = text;

  // Remove common robotic transitions that the LLM might still produce
  const roboticPhrases = [
    /\bMoreover,?\s*/gi,
    /\bFurthermore,?\s*/gi,
    /\bIn conclusion,?\s*/gi,
    /\bAdditionally,?\s*/gi,
    /\bIt is worth noting that\s*/gi,
    /\bIt's important to note that\s*/gi,
    /\bIt should be noted that\s*/gi,
    /\bNonetheless,?\s*/gi,
  ];

  for (const phrase of roboticPhrases) {
    result = result.replace(phrase, '');
  }

  // Normalize whitespace
  result = result.replace(/\n{3,}/g, '\n\n');    // Max 2 consecutive newlines
  result = result.replace(/  +/g, ' ');            // No double spaces
  result = result.replace(/\s+([.!?,;:])/g, '$1'); // No space before punctuation
  result = result.replace(/([.!?])\s*\n/g, '$1\n');// Clean line endings after sentences

  // Fix double punctuation
  result = result.replace(/([.!?])\1+/g, '$1');

  // Capitalize first letter after period + space
  result = result.replace(/([.!?]\s+)([a-z])/g, (_, p1, p2) => p1 + p2.toUpperCase());

  return result.trim();
}
