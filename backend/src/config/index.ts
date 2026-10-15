import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const config = {
  // Server
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: (process.env.NODE_ENV || 'development') === 'development',

  // Database
  databaseUrl: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/humanizer_db',

  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379/0',

  // LLM
  llm: {
    apiKey: process.env.LLM_API_KEY || '',
    model: process.env.LLM_MODEL || 'claude-3-5-sonnet-20241022',
  },

  // External Services
  detector: {
    apiKey: process.env.DETECTOR_API_KEY || '',
  },
  plagiarism: {
    apiKey: process.env.PLAGIARISM_API_KEY || '',
  },
  embedding: {
    apiKey: process.env.EMBEDDING_API_KEY || '',
  },

  // Auth
  auth: {
    jwtSecret: process.env.AUTH_JWT_SECRET || 'dev_secret_change_me',
    jwtExpiresIn: process.env.AUTH_JWT_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.AUTH_REFRESH_EXPIRES_IN || '7d',
  },

  // Billing
  billing: {
    apiKey: process.env.BILLING_API_KEY || '',
    webhookSecret: process.env.BILLING_WEBHOOK_SECRET || '',
  },

  // Storage
  storage: {
    bucket: process.env.STORAGE_BUCKET || 'humanizer-documents',
    key: process.env.STORAGE_KEY || '',
    secret: process.env.STORAGE_SECRET || '',
    endpoint: process.env.STORAGE_ENDPOINT || '',
  },

  // Security
  turnstileSecret: process.env.TURNSTILE_SECRET || '',
  sentryDsn: process.env.SENTRY_DSN || '',

  // Plan Limits
  plans: {
    guest: { maxWordsPerRequest: 300, wordsPerPeriod: 1000, period: 'day' as const, plagiarismScans: 1 },
    free: { maxWordsPerRequest: 300, wordsPerPeriod: 1000, period: 'day' as const, plagiarismScans: 1 },
    pro: { maxWordsPerRequest: 3000, wordsPerPeriod: 50000, period: 'month' as const, plagiarismScans: -1 },
    premium: { maxWordsPerRequest: 10000, wordsPerPeriod: 200000, period: 'month' as const, plagiarismScans: -1 },
    team: { maxWordsPerRequest: 10000, wordsPerPeriod: 500000, period: 'month' as const, plagiarismScans: -1 },
  } as Record<string, { maxWordsPerRequest: number; wordsPerPeriod: number; period: 'day' | 'month'; plagiarismScans: number }>,

  // Rate Limits
  rateLimits: {
    authenticated: { windowMs: 60_000, maxRequests: (process.env.NODE_ENV || 'development') === 'development' ? 1000 : 30 },
    guest: { windowMs: 60_000, maxRequests: (process.env.NODE_ENV || 'development') === 'development' ? 500 : 10 },
  },

  // Pipeline
  pipeline: {
    llmTimeoutMs: 60_000,
    llmMaxRetries: 2,
    jobTimeoutMs: 180_000,
    meaningLockThreshold: 0.85,
    maxAiScoreRetries: 2,
    chunkMinWords: 300,
    chunkMaxWords: 500,
  },
} as const;
