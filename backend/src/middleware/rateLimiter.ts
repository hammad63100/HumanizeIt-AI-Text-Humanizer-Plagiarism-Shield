import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { UsageRepo } from '../db/repositories';
import { countWords, Logger } from '../utils';

/**
 * Rate limiting state (in-memory for development).
 * In production, this should use Redis sliding window.
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Rate limiting middleware.
 * Uses sliding window — 10 req/min for authenticated, 5 req/min for guests.
 */
export function rateLimitMiddleware(req: Request, res: Response, next: NextFunction): void {
  const isAuthenticated = !req.isGuest && !!req.userId;
  const limits = isAuthenticated
    ? config.rateLimits.authenticated
    : config.rateLimits.guest;

  const key = isAuthenticated
    ? `user:${req.userId}`
    : `ip:${req.ip}`;

  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + limits.windowMs });
    return next();
  }

  if (entry.count >= limits.maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    res.set('Retry-After', String(retryAfter));
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Too many requests. Please try again in ${retryAfter} seconds.`,
      },
    });
    return;
  }

  entry.count++;
  next();
}

/**
 * Word limit validation middleware.
 * Checks the text payload against plan word limits.
 */
export function wordLimitMiddleware(textField: string = 'text') {
  return async (req: Request, res: Response, next: NextFunction) => {
    const text = req.body?.[textField];
    if (!text || typeof text !== 'string') {
      return next(); // Let validation handle empty text
    }

    const wordCount = countWords(text);
    const plan = req.userPlan || 'guest';
    const planLimits = config.plans[plan];

    if (!planLimits) {
      return next();
    }

    // Check per-request word limit
    if (wordCount > planLimits.maxWordsPerRequest) {
      return res.status(413).json({
        success: false,
        error: {
          code: 'PAYLOAD_TOO_LARGE',
          message: `Text exceeds the ${planLimits.maxWordsPerRequest} word limit for the ${plan} plan. Your text has ${wordCount} words.`,
        },
      });
    }

    // Check period usage limit
    if (req.userId) {
      try {
        const wordsUsed = planLimits.period === 'day'
          ? await UsageRepo.getWordsUsedToday(req.userId)
          : await UsageRepo.getWordsUsedThisMonth(req.userId);

        if (wordsUsed + wordCount > planLimits.wordsPerPeriod) {
          const remaining = Math.max(0, planLimits.wordsPerPeriod - wordsUsed);
          return res.status(402).json({
            success: false,
            error: {
              code: 'QUOTA_EXCEEDED',
              message: `You've used your ${planLimits.period}ly word quota. ${remaining} words remaining. Upgrade your plan for more.`,
            },
          });
        }
      } catch (error: any) {
        Logger.warn('Usage check failed, allowing request', { error: error.message });
      }
    }

    next();
  };
}
