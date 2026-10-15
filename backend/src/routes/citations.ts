import { Router, Request, Response } from 'express';
import { validateBody, citationSchema } from '../middleware';
import { llmProvider } from '../providers';
import { Logger } from '../utils';

const router = Router();

/**
 * POST /v1/citations
 * Generate academic citation from a provided source URL, title, or text.
 */
router.post(
  '/',
  validateBody(citationSchema),
  async (req: Request, res: Response) => {
    try {
      const { source_url, source_text, source_url_or_title, format, style } = req.body;
      const citationStyle = (style || format || 'APA').toUpperCase();

      Logger.info('Citation generation requested', {
        request_id: req.requestId,
        user_id: req.userId || req.sessionId,
        format: citationStyle,
      });

      const sourceInfo = source_url_or_title
        ? `Source: ${source_url_or_title}`
        : source_url
        ? `Source URL: ${source_url}`
        : `Source text: ${source_text}`;

      const prompt = `Generate a properly formatted ${citationStyle} citation for the following source.
Return ONLY the formatted citation, nothing else.

${sourceInfo}`;

      const result = await llmProvider.generate(prompt, {
        systemPrompt: 'You are a citation formatting expert. Generate accurate academic citations.',
        maxTokens: 512,
        temperature: 0.2,
      });

      const citationText = result.text.trim();

      const responseData = {
        citation: citationText,
        format: citationStyle as any,
        style: citationStyle,
      };

      return res.json({
        success: true,
        data: responseData,
        ...responseData,
      });
    } catch (error: any) {
      Logger.error('Citation generation failed', { error: error.message });
      return res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to generate citation' },
      });
    }
  }
);

export default router;
