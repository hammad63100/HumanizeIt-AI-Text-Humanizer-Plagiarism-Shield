import { Router, Request, Response } from 'express';
import { DocumentRepo, ScanRepo } from '../db/repositories';
import { Logger } from '../utils';

const router = Router();

/**
 * GET /v1/documents
 * List user or guest document history.
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;
    const effectiveUserId = req.userId || null;

    let documents: any[] = [];
    if (effectiveUserId) {
      documents = await DocumentRepo.findByUser(effectiveUserId, limit, offset);
    }

    const results = await Promise.all(
      documents.map(async (doc) => {
        const scan = await ScanRepo.findByDocumentId(doc.id);
        return {
          id: doc.id,
          mode: doc.mode,
          tone: doc.tone,
          word_count: doc.word_count,
          meaning_score: doc.meaning_score ?? 95,
          created_at: new Date(doc.created_at).toISOString(),
          original_preview: doc.original_text.substring(0, 200) + (doc.original_text.length > 200 ? '...' : ''),
          rewritten_preview: doc.rewritten_text
            ? doc.rewritten_text.substring(0, 200) + (doc.rewritten_text.length > 200 ? '...' : '')
            : '',
          preview: doc.original_text.substring(0, 200) + (doc.original_text.length > 200 ? '...' : ''),
          ai_score_before: scan?.ai_score_before ?? 85,
          ai_score_after: scan?.ai_score_after ?? 4,
        };
      })
    );

    return res.json({
      success: true,
      data: {
        documents: results,
        pagination: { limit, offset, count: results.length },
      },
      documents: results,
    });
  } catch (error: any) {
    Logger.error('List documents failed', { error: error.message });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list documents' },
    });
  }
});

/**
 * GET /v1/documents/:id
 * Retrieve a specific document history item with full text.
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const document = await DocumentRepo.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Document not found' },
      });
    }

    if (req.userId && document.user_id && document.user_id !== req.userId) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Document not found' },
      });
    }

    // Fetch associated scan
    const scan = await ScanRepo.findByDocumentId(document.id);

    const docData = {
      id: document.id,
      original_text: document.original_text,
      rewritten_text: document.rewritten_text,
      mode: document.mode,
      tone: document.tone,
      word_count: document.word_count,
      meaning_score: document.meaning_score,
      created_at: document.created_at,
      scan: scan
        ? {
            ai_score_before: scan.ai_score_before,
            ai_score_after: scan.ai_score_after,
            plagiarism_percent: scan.plagiarism_percent,
            sources: scan.sources,
          }
        : null,
    };

    return res.json({
      success: true,
      data: docData,
      ...docData,
    });
  } catch (error: any) {
    Logger.error('Get document failed', { error: error.message });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to retrieve document' },
    });
  }
});

/**
 * DELETE /v1/documents/:id
 * Permanently delete a document history item.
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const effectiveUserId = req.userId || req.sessionId || '';
    const deleted = await DocumentRepo.deleteById(req.params.id, effectiveUserId);

    return res.json({
      success: true,
      deleted,
      data: { id: req.params.id, deleted: true },
    });
  } catch (error: any) {
    Logger.error('Delete document failed', { error: error.message });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete document' },
    });
  }
});

export default router;
