import { Router, Request, Response } from 'express';
import { validateBody, humanizeSchema, wordLimitMiddleware } from '../middleware';
import { JobRepo } from '../db/repositories';
import { executeRewritePipeline } from '../pipeline';
import { countWords, Logger } from '../utils';

const router = Router();

/**
 * POST /v1/humanize
 * Create a rewrite job. The rewrite is processed asynchronously.
 */
router.post(
  '/',
  validateBody(humanizeSchema),
  wordLimitMiddleware('text'),
  async (req: Request, res: Response) => {
    try {
      const { text, mode, tone, voice_profile_id } = req.body;
      const wordCount = countWords(text);

      Logger.info('Humanize request received', {
        request_id: req.requestId,
        user_id: req.userId || req.sessionId,
        word_count: wordCount,
        mode,
      });

      // Create a job record
      const job = await JobRepo.create({
        user_id: req.userId || null,
        session_id: req.sessionId || null,
        type: 'humanize',
      });

      // Execute pipeline asynchronously (non-blocking)
      // In production, this would be dispatched to a BullMQ worker queue.
      // For MVP, we run it in-process but non-blocking.
      setImmediate(async () => {
        try {
          await executeRewritePipeline({
            jobId: job.id,
            userId: req.userId || null,
            sessionId: req.sessionId || null,
            text,
            mode,
            tone,
            voiceProfileId: voice_profile_id,
          });
        } catch (error: any) {
          Logger.error('Pipeline execution failed', {
            job_id: job.id,
            error: error.message,
          });
        }
      });

      return res.status(202).json({
        success: true,
        data: {
          job_id: job.id,
          status: 'queued',
          message: 'Your text is being processed. Poll GET /v1/jobs/{id} for results.',
        },
        job_id: job.id,
        status: 'queued',
      });
    } catch (error: any) {
      Logger.error('Humanize endpoint failed', {
        request_id: req.requestId,
        error: error.message,
      });
      return res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to create rewrite job' },
      });
    }
  }
);

export default router;
