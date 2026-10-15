export const PLAN_LIMITS = {
  free: {
    name: "Guest / Free",
    maxWordsPerRequest: 300,
    dailyWords: 1000,
    plagiarismAllowed: 3, // scans per day
    voiceMatchProfiles: 0,
    priceMonthly: 0,
  },
  pro: {
    name: "Pro Writer",
    maxWordsPerRequest: 3000,
    dailyWords: 50000,
    plagiarismAllowed: 100,
    voiceMatchProfiles: 3,
    priceMonthly: 9.99,
  },
  premium: {
    name: "Unlimited Master",
    maxWordsPerRequest: 6000,
    dailyWords: 200000,
    plagiarismAllowed: 500,
    voiceMatchProfiles: 10,
    priceMonthly: 19.99,
  },
  team: {
    name: "Team & Agency",
    maxWordsPerRequest: 10000,
    dailyWords: 1000000,
    plagiarismAllowed: 2000,
    voiceMatchProfiles: 50,
    priceMonthly: 49.99,
  },
} as const;

export function checkWordLimit(wordCount: number, plan: keyof typeof PLAN_LIMITS = 'free') {
  const max = PLAN_LIMITS[plan].maxWordsPerRequest;
  const isOver = wordCount > max;
  const isNear = wordCount >= max * 0.85 && !isOver;
  const remaining = Math.max(0, max - wordCount);

  return {
    isOver,
    isNear,
    max,
    remaining,
    percentage: Math.min(100, Math.round((wordCount / max) * 100)),
  };
}
