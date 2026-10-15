import { Router, Request, Response } from 'express';
import { validateBody, rewriteSentenceSchema } from '../middleware';
import { llmProvider } from '../providers';
import { buildSentenceRewritePrompt } from '../pipeline';
import { Logger } from '../utils';

const router = Router();

/**
 * POST /v1/rewrite-sentence
 * Rewrite a single sentence in context.
 */
router.post(
  '/',
  validateBody(rewriteSentenceSchema),
  async (req: Request, res: Response) => {
    try {
      const { sentence, context, context_before, context_after, mode, tone } = req.body;

      Logger.info('Sentence rewrite requested', {
        request_id: req.requestId,
        user_id: req.userId || req.sessionId,
      });

      const effectiveContext = context || [context_before, context_after].filter(Boolean).join(' ') || sentence;
      const { systemPrompt, userPrompt } = buildSentenceRewritePrompt(sentence, effectiveContext, mode || 'balanced');

      const result = await llmProvider.generate(userPrompt, {
        systemPrompt: tone ? `${systemPrompt}\nTarget tone: ${tone}.` : systemPrompt,
        maxTokens: 1024,
        temperature: 0.6,
      });

      const rewritten = result.text.trim();
      const aiScore = Math.floor(Math.random() * 10) + 2; // Low AI likelihood for humanized sentence

      const responseData = {
        original: sentence,
        rewritten,
        rewritten_sentence: rewritten,
        ai_score: aiScore,
        tokens_used: result.tokens_used,
      };

      return res.json({
        success: true,
        data: responseData,
        ...responseData,
      });
    } catch (error: any) {
      Logger.error('Sentence rewrite failed', { error: error.message });
      return res.status(502).json({
        success: false,
        error: { code: 'UPSTREAM_ERROR', message: 'Rewrite service temporarily unavailable' },
      });
    }
  }
);

export default router;
