import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema, ZodError } from 'zod';

/**
 * Validate request body against a Zod schema.
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(422).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed',
            details: error.errors.map((e) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          },
        });
      }
      next(error);
    }
  };
}

// ============================
// Request Validation Schemas
// ============================

export const humanizeSchema = z.object({
  text: z
    .string()
    .min(1, 'Text is required')
    .max(100_000, 'Text exceeds maximum character limit'),
  mode: z.enum(['light', 'balanced', 'strong']).optional().default('balanced'),
  tone: z.string().optional(),
  voice_profile_id: z.string().uuid().optional(),
});

export const detectSchema = z.object({
  text: z
    .string()
    .min(1, 'Text is required')
    .max(100_000, 'Text exceeds maximum character limit'),
});

export const plagiarismSchema = z.object({
  text: z
    .string()
    .min(1, 'Text is required')
    .max(100_000, 'Text exceeds maximum character limit'),
});

export const rewriteSentenceSchema = z.object({
  sentence: z.string().min(1, 'Sentence is required').max(5_000),
  context: z.string().max(50_000).optional(),
  context_before: z.string().max(25_000).optional(),
  context_after: z.string().max(25_000).optional(),
  mode: z.enum(['light', 'balanced', 'strong']).optional().default('balanced'),
  tone: z.string().optional(),
});

export const citationSchema = z.object({
  source_url_or_title: z.string().optional(),
  source_url: z.string().optional(),
  source_text: z.string().max(10_000).optional(),
  style: z.string().optional(),
  format: z.string().optional(),
}).refine(
  (data) => Boolean(data.source_url || data.source_text || data.source_url_or_title),
  { message: 'Either source_url, source_text, or source_url_or_title must be provided' }
);

export const voiceProfileSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  sample_text: z.string().min(20).optional(),
  sample_texts: z.array(z.string()).optional(),
}).refine(
  (data) => (data.sample_texts && data.sample_texts.length > 0) || Boolean(data.sample_text),
  { message: 'Provide either sample_text or sample_texts' }
);

export const checkoutSchema = z.object({
  plan: z.enum(['pro', 'premium', 'team']),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
