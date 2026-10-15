import { Router, Request, Response } from 'express';
import { validateBody, plagiarismSchema, wordLimitMiddleware } from '../middleware';
import { plagiarismProvider } from '../providers';
import { JobRepo, DocumentRepo, ScanRepo } from '../db/repositories';
import { countWords, Logger } from '../utils';

const router = Router();

/**
 * POST /v1/plagiarism
 * Create and run a plagiarism scan.
 */
router.post(
  '/',
  validateBody(plagiarismSchema),
  wordLimitMiddleware('text'),
  async (req: Request, res: Response) => {
    try {
      const { text } = req.body;
      const wordCount = countWords(text);

      Logger.info('Plagiarism scan requested', {
        request_id: req.requestId,
        user_id: req.userId || req.sessionId,
        word_count: wordCount,
      });

      // Create job record
      const job = await JobRepo.create({
        user_id: req.userId || null,
        session_id: req.sessionId || null,
        type: 'plagiarism',
      });

      await JobRepo.updateStatus(job.id, 'running');

      const result = await plagiarismProvider.scan(text);

      // Save document and scan
      const document = await DocumentRepo.create({
        user_id: req.userId || null,
        original_text: text,
        mode: 'plagiarism' as any,
        word_count: wordCount,
      });

      await ScanRepo.create({
        document_id: document.id,
        plagiarism_percent: result.similarity_percentage,
        sources: result.sources as any,
      });

      await JobRepo.setDocumentId(job.id, document.id);
      await JobRepo.updateStatus(job.id, 'done');

      const sources = (result.sources || []).map((s: any) => ({
        title: s.title || 'Online Article',
        url: s.url || 'https://example.com/reference',
        match_percentage: s.percentage ?? s.match_percentage ?? 0,
        matched_text: s.matched_text || '',
      }));

      const flaggedSegments = sources.map((s: any) => s.matched_text).filter(Boolean);

      const payload = {
        job_id: job.id,
        status: 'done',
        similarity_score: result.similarity_percentage,
        similarity_percentage: result.similarity_percentage,
        sources,
        flagged_segments: flaggedSegments,
      };

      return res.status(200).json({
        success: true,
        data: payload,
        ...payload,
      });
    } catch (error: any) {
      Logger.error('Plagiarism endpoint failed', { error: error.message });
      return res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to execute plagiarism scan' },
      });
    }
  }
);

export default router;
