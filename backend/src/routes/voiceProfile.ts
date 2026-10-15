import { Router, Request, Response } from 'express';
import { validateBody, voiceProfileSchema } from '../middleware';
import { VoiceProfileRepo } from '../db/repositories';
import { Logger, countWords } from '../utils';

const router = Router();

/**
 * POST /v1/voice-profile
 * Upload sample texts to construct a custom writing style profile.
 */
router.post(
  '/',
  validateBody(voiceProfileSchema),
  async (req: Request, res: Response) => {
    try {
      const { sample_texts, sample_text, name, description } = req.body;
      const effectiveUserId = req.userId || req.sessionId || 'guest-user';
      const samples: string[] = sample_texts || (sample_text ? [sample_text] : []);

      Logger.info('Voice profile creation requested', {
        request_id: req.requestId,
        user_id: effectiveUserId,
        samples: samples.length,
      });

      // Analyze writing style from samples
      const style = analyzeWritingStyle(samples);
      const profileName = name || 'Custom Voice';
      const profileDesc = description || 'Personal writing style profile';

      const profile = await VoiceProfileRepo.create(
        effectiveUserId,
        { ...style, name: profileName, description: profileDesc },
        { name: profileName, description: profileDesc }
      );

      const profileData = {
        id: profile.id,
        name: profileName,
        description: profileDesc,
        created_at: profile.created_at.toISOString(),
        sample_count: samples.length,
        avg_sentence_length: (style.avg_sentence_length as number) || 16,
        vocabulary_level: (style.vocabulary_level as string) || 'Advanced',
        style: profile.style,
      };

      return res.status(201).json({
        success: true,
        data: profileData,
        ...profileData,
      });
    } catch (error: any) {
      Logger.error('Voice profile creation failed', { error: error.message });
      return res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to create voice profile' },
      });
    }
  }
);

/**
 * GET /v1/voice-profile
 * List voice profiles.
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const effectiveUserId = req.userId || req.sessionId || 'guest-user';
    const rawProfiles = await VoiceProfileRepo.findByUser(effectiveUserId);

    const profiles = rawProfiles.map((p) => {
      const s = (p.style as any) || {};
      return {
        id: p.id,
        name: p.name || s.name || 'Custom Voice',
        description: p.description || s.description || 'Personal writing style',
        created_at: new Date(p.created_at).toISOString(),
        sample_count: s.sample_count || 1,
        avg_sentence_length: s.avg_sentence_length || 15,
        vocabulary_level: s.vocabulary_level || 'Advanced',
        style: p.style,
      };
    });

    return res.json({
      success: true,
      data: { profiles },
      profiles,
    });
  } catch (error: any) {
    Logger.error('List voice profiles failed', { error: error.message });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list voice profiles' },
    });
  }
});

// ──────────────────────────────────────────
// Style analysis helper
// ──────────────────────────────────────────

function analyzeWritingStyle(samples: string[]): Record<string, unknown> {
  const allText = samples.join(' ');
  const sentences = allText.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const words = allText.split(/\s+/).filter((w) => w.length > 0);

  // Sentence length distribution
  const sentenceLengths = sentences.map((s) => countWords(s));
  const avgSentenceLength = sentenceLengths.reduce((a, b) => a + b, 0) / (sentenceLengths.length || 1);
  const shortSentences = sentenceLengths.filter((l) => l < 10).length;
  const longSentences = sentenceLengths.filter((l) => l > 25).length;

  // Vocabulary level (heuristic: average word length)
  const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / (words.length || 1);
  const vocabLevel = avgWordLength > 5.5 ? 'Advanced' : avgWordLength > 4.5 ? 'College' : 'Standard';

  // Common patterns
  const exclamationCount = (allText.match(/!/g) || []).length;
  const questionCount = (allText.match(/\?/g) || []).length;
  const contractionCount = (allText.match(/\b\w+'\w+\b/g) || []).length;

  // Passive voice frequency
  const passiveCount = (allText.match(/\b(?:was|were|been|being|is|are)\s+\w+(?:ed|en|t)\b/gi) || []).length;

  return {
    avg_sentence_length: Math.round(avgSentenceLength * 10) / 10,
    short_sentence_ratio: Math.round((shortSentences / (sentences.length || 1)) * 100) / 100,
    long_sentence_ratio: Math.round((longSentences / (sentences.length || 1)) * 100) / 100,
    avg_word_length: Math.round(avgWordLength * 10) / 10,
    vocabulary_level: vocabLevel,
    exclamation_rate: Math.round((exclamationCount / (sentences.length || 1)) * 100) / 100,
    question_rate: Math.round((questionCount / (sentences.length || 1)) * 100) / 100,
    contraction_rate: Math.round((contractionCount / (words.length || 1)) * 100) / 100,
    passive_voice_count: passiveCount,
    sample_count: samples.length,
  };
}

export default router;
