import { Router, Request, Response } from 'express';
import { validateBody, detectSchema, wordLimitMiddleware } from '../middleware';
import { detectorProvider } from '../providers';
import { JobRepo, DocumentRepo, ScanRepo } from '../db/repositories';
import { countWords, Logger } from '../utils';

const router = Router();

/**
 * POST /v1/detect
 * Analyze text and return AI probability score with sentence flags.
 */
router.post(
  '/',
  validateBody(detectSchema),
  wordLimitMiddleware('text'),
  async (req: Request, res: Response) => {
    try {
      const { text } = req.body;
      const wordCount = countWords(text);

      Logger.info('Detect request received', {
        request_id: req.requestId,
        user_id: req.userId || req.sessionId,
        word_count: wordCount,
      });

      // Create job
      const job = await JobRepo.create({
        user_id: req.userId || null,
        session_id: req.sessionId || null,
        type: 'detect',
      });

      try {
        await JobRepo.updateStatus(job.id, 'running');

        // Run AI detection
        const result = await detectorProvider.score(text);

        // Save document and scan
        const document = await DocumentRepo.create({
          user_id: req.userId || null,
          original_text: text,
          mode: 'detect' as any,
          word_count: wordCount,
        });

        await ScanRepo.create({
          document_id: document.id,
          ai_score_before: result.ai_percentage,
        });

        await JobRepo.setDocumentId(job.id, document.id);
        await JobRepo.updateStatus(job.id, 'done');

        const sentenceScores = (result.flags || []).map((f: any) => ({
          sentence: f.sentence,
          ai_probability: f.probability ?? f.score ?? (f.label === 'likely_ai' ? 0.85 : 0.2),
          flagged: Boolean(f.flagged ?? (f.score > 0.5 || f.label === 'likely_ai')),
        }));

        const responsePayload = {
          job_id: job.id,
          ai_percentage: result.ai_percentage,
          ai_score: result.ai_percentage,
          flags: result.flags,
          sentence_scores: sentenceScores,
          word_count: wordCount,
        };

        return res.json({
          success: true,
          data: responsePayload,
          ...responsePayload,
        });
      } catch (error: any) {
        await JobRepo.updateStatus(job.id, 'failed', error.message);
        throw error;
      }
    } catch (error: any) {
      Logger.error('Detect endpoint failed', {
        request_id: req.requestId,
        error: error.message,
      });

      // If it's an upstream failure, return 502
      return res.status(502).json({
        success: false,
        error: {
          code: 'UPSTREAM_ERROR',
          message: 'AI detection service is temporarily unavailable',
        },
      });
    }
  }
);

export default router;
