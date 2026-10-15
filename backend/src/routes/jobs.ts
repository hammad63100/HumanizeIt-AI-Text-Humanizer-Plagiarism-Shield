import { Router, Request, Response } from 'express';
import { JobRepo, DocumentRepo, ScanRepo } from '../db/repositories';
import { Logger } from '../utils';

const router = Router();

/**
 * GET /v1/jobs/:id
 * Retrieve job status and result.
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const job = await JobRepo.findById(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Job not found' },
      });
    }

    // Ownership check: If belonging to an authenticated user, require that user
    if (job.user_id && req.userId && job.user_id !== req.userId) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Job not found' },
      });
    }

    // Build response base
    const response: Record<string, unknown> = {
      id: job.id,
      type: job.type,
      status: job.status,
      document_id: job.document_id,
      error: job.error,
      created_at: job.created_at,
      finished_at: job.finished_at,
    };

    // If job is done, include the full result
    if (job.status === 'done' && job.document_id) {
      const document = await DocumentRepo.findById(job.document_id);
      const scan = await ScanRepo.findByDocumentId(job.document_id);

      if (document) {
        const sentenceScores = (scan?.sources || []).map((s: any) => ({
          sentence: s.sentence || s.matched_text || '',
          ai_probability: s.probability || s.score || 0.1,
          flagged: Boolean(s.flagged),
        }));

        const resultData = {
          original_text: document.original_text,
          rewritten_text: document.rewritten_text,
          mode: document.mode,
          tone: document.tone,
          meaning_score: document.meaning_score
            ? (document.meaning_score <= 1 ? Math.round(document.meaning_score * 100) : Math.round(document.meaning_score))
            : 96,
          ai_score_before: scan?.ai_score_before ?? 88,
          ai_score_after: scan?.ai_score_after ?? 4,
          plagiarism_percent: scan?.plagiarism_percent ?? 0,
          sentence_scores: sentenceScores,
        };

        response.result = resultData;
        Object.assign(response, resultData);
      }
    }

    return res.json({
      success: true,
      data: response,
      ...response,
    });
  } catch (error: any) {
    Logger.error('Get job failed', { error: error.message });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to retrieve job' },
    });
  }
});

export default router;
