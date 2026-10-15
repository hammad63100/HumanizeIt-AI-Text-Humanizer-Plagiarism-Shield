import { Router, Request, Response } from 'express';
import { config } from '../config';
import { UsageRepo } from '../db/repositories';
import { Logger, getResetDate } from '../utils';

const router = Router();

/**
 * GET /v1/usage
 * Get word counts used, current plan limits, and reset date.
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const plan = req.userPlan || 'guest';
    const planLimits = config.plans[plan];

    if (!planLimits) {
      return res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Unknown plan tier' },
      });
    }

    let wordsUsed = 0;
    if (req.userId) {
      wordsUsed = planLimits.period === 'day'
        ? await UsageRepo.getWordsUsedToday(req.userId)
        : await UsageRepo.getWordsUsedThisMonth(req.userId);
    }

    const resetDate = getResetDate(planLimits.period);
    const normalizedPlan = (plan === 'guest' ? 'free' : plan) as 'free' | 'pro' | 'premium' | 'team';

    const usageData = {
      plan: normalizedPlan,
      words_used: wordsUsed,
      words_used_today: wordsUsed,
      words_limit: planLimits.wordsPerPeriod,
      daily_limit: planLimits.wordsPerPeriod,
      period: planLimits.period,
      reset_date: resetDate,
      resets_at: resetDate,
      max_words_per_request: planLimits.maxWordsPerRequest,
      voice_profiles_count: 0,
      voice_profiles_limit: plan === 'pro' || plan === 'premium' || plan === 'team' ? 5 : 1,
      plagiarism_scans_used: 0,
      plagiarism_scans_limit: planLimits.plagiarismScans === -1 ? 9999 : planLimits.plagiarismScans,
    };

    return res.json({
      success: true,
      data: usageData,
      ...usageData,
    });
  } catch (error: any) {
    Logger.error('Usage endpoint failed', { error: error.message });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to retrieve usage data' },
    });
  }
});

export default router;
