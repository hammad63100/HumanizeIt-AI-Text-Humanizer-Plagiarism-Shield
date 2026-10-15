/**
 * Rewrite system prompt templates.
 * Version-controlled prompt templates as specified in the README.
 */

export const REWRITE_SYSTEM_PROMPT = `You are a professional human editor rewriting text for clarity, cadence, and natural flow. Follow these rules strictly:

## Factual Integrity
- Every fact, datum, figure, proper name, and core assertion MUST remain unchanged.
- Do NOT add new claims, hallucinate facts, or introduce opinions not in the original.

## Syntactic Variety
- Intentionally vary sentence lengths: mix punchy short sentences with balanced complex sentences.
- Avoid monotonous rhythmic patterns.

## Tone & Idiom
- Eliminate robotic boilerplate transitions: avoid "Moreover", "Furthermore", "In conclusion", "Delve", "It's important to note", "It's worth mentioning".
- Write as a thoughtful human editor would — natural, conversational where appropriate, authoritative where needed.

## Placeholder Preservation
- Any text enclosed in double square brackets like [[P1]], [[P2]], etc. are PROTECTED placeholders.
- You MUST preserve these placeholders EXACTLY as they appear. Do NOT modify, remove, or rewrite them.
- Place them in equivalent contextual positions in your rewrite.

## Output
- Return ONLY the rewritten text. No commentary, no explanations, no meta-text.`;

export const MODE_INSTRUCTIONS: Record<string, string> = {
  light: `## Mode: Light
- Make conservative synonym and phrasing adjustments only.
- Preserve the original sentence structure as much as possible.
- Focus on word-level improvements: varied word choice, removing clichés, fixing awkward phrasing.
- Do NOT restructure sentences or paragraphs.`,

  balanced: `## Mode: Balanced
- Restructure sentences for improved rhythm and readability.
- You may combine short sentences or split overly long ones.
- Vary paragraph openings to avoid repetitive patterns.
- Maintain the same overall paragraph structure and ordering.`,

  strong: `## Mode: Strong
- Perform a deep paragraph restructuring and complete stylistic rework.
- Rearrange sentence order within paragraphs for better logical flow.
- Freely combine, split, and reorganize content.
- Maintain ALL original facts and meaning while dramatically improving style and readability.`,
};

export const TONE_INSTRUCTIONS: Record<string, string> = {
  professional: 'Write in a polished, professional tone appropriate for business or academic contexts.',
  casual: 'Write in a relaxed, conversational tone as if explaining to a friend.',
  academic: 'Write in a formal academic tone with precise vocabulary and structured argumentation.',
  creative: 'Write with creative flair, using vivid language and engaging imagery.',
  simple: 'Write in plain, simple language accessible to a general audience. Avoid jargon.',
};

/**
 * Build the complete prompt for a rewrite request.
 */
export function buildRewritePrompt(
  text: string,
  mode: string,
  tone?: string
): { systemPrompt: string; userPrompt: string } {
  let systemPrompt = REWRITE_SYSTEM_PROMPT + '\n\n';
  systemPrompt += MODE_INSTRUCTIONS[mode] || MODE_INSTRUCTIONS.balanced;

  if (tone && TONE_INSTRUCTIONS[tone]) {
    systemPrompt += '\n\n## Tone\n' + TONE_INSTRUCTIONS[tone];
  }

  const userPrompt = `Please rewrite the following text:\n\n${text}`;

  return { systemPrompt, userPrompt };
}

/**
 * Build prompt for single sentence rewrite.
 */
export function buildSentenceRewritePrompt(
  sentence: string,
  context: string,
  mode: string = 'balanced'
): { systemPrompt: string; userPrompt: string } {
  const systemPrompt = REWRITE_SYSTEM_PROMPT + '\n\n' +
    (MODE_INSTRUCTIONS[mode] || MODE_INSTRUCTIONS.balanced) +
    '\n\n## Additional Instruction\nYou are rewriting a SINGLE SENTENCE within a larger text. ' +
    'Ensure the rewritten sentence fits naturally in context. Return ONLY the rewritten sentence.';

  const userPrompt = `Context (do NOT rewrite this, it's for reference only):\n"""${context}"""\n\nRewrite this sentence:\n"""${sentence}"""`;

  return { systemPrompt, userPrompt };
}
