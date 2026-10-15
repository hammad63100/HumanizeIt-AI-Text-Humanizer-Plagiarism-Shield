import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { requireAuth } from '../middleware';
import { Logger } from '../utils';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  dest: path.resolve(__dirname, '../../uploads/'),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only .pdf, .docx, and .txt files are allowed'));
    }
  },
});

/**
 * POST /v1/uploads
 * Upload .docx, .pdf, or .txt file for text extraction.
 */
router.post('/', requireAuth, upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'No file uploaded' },
      });
    }

    Logger.info('File upload received', {
      request_id: req.requestId,
      user_id: req.userId,
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    let extractedText = '';
    const ext = path.extname(req.file.originalname).toLowerCase();

    try {
      if (ext === '.txt') {
        extractedText = fs.readFileSync(req.file.path, 'utf-8');
      } else if (ext === '.docx') {
        // Use mammoth for .docx extraction
        const mammoth = await import('mammoth');
        const result = await mammoth.extractRawText({ path: req.file.path });
        extractedText = result.value;
      } else if (ext === '.pdf') {
        // Use pdf-parse for .pdf extraction
        const pdfParse = (await import('pdf-parse')).default;
        const dataBuffer = fs.readFileSync(req.file.path);
        const pdfData = await pdfParse(dataBuffer);
        extractedText = pdfData.text;
      }
    } finally {
      // Always clean up the uploaded file
      fs.unlink(req.file.path, () => {});
    }

    if (!extractedText.trim()) {
      return res.status(422).json({
        success: false,
        error: { code: 'EXTRACTION_FAILED', message: 'Could not extract text from the uploaded file' },
      });
    }

    return res.json({
      success: true,
      data: {
        text: extractedText.trim(),
        word_count: extractedText.trim().split(/\s+/).length,
        filename: req.file.originalname,
      },
    });
  } catch (error: any) {
    Logger.error('File upload failed', { error: error.message });

    // Clean up on error
    if (req.file?.path) {
      fs.unlink(req.file.path, () => {});
    }

    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to process uploaded file' },
    });
  }
});

export default router;
