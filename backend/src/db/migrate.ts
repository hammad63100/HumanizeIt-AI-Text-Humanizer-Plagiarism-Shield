import { query } from './index';
import { Logger } from '../utils';

/**
 * Run all database migrations to set up the schema.
 * These correspond to the schema defined in the Backend_README.md.
 */
export async function runMigrations(): Promise<void> {
  Logger.info('Running database migrations...');

  // Enable UUID extension
  await query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

  // Users table
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL DEFAULT '',
      plan TEXT NOT NULL DEFAULT 'free',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // Documents table
  await query(`
    CREATE TABLE IF NOT EXISTS documents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      original_text TEXT NOT NULL,
      rewritten_text TEXT,
      mode TEXT NOT NULL,
      tone TEXT,
      word_count INT NOT NULL,
      meaning_score NUMERIC,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // Jobs table
  await query(`
    CREATE TABLE IF NOT EXISTS jobs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      session_id TEXT,
      type TEXT NOT NULL,
      status TEXT NOT NULL,
      document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
      error TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      finished_at TIMESTAMPTZ
    )
  `);

  // Scans table
  await query(`
    CREATE TABLE IF NOT EXISTS scans (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
      ai_score_before NUMERIC,
      ai_score_after NUMERIC,
      plagiarism_percent NUMERIC,
      sources JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // Voice profiles table
  await query(`
    CREATE TABLE IF NOT EXISTS voice_profiles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      style JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // Usage daily table
  await query(`
    CREATE TABLE IF NOT EXISTS usage_daily (
      user_id UUID NOT NULL,
      day DATE NOT NULL,
      words_used INT NOT NULL DEFAULT 0,
      PRIMARY KEY (user_id, day)
    )
  `);

  // Subscriptions table
  await query(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      provider TEXT NOT NULL,
      provider_customer_id TEXT NOT NULL,
      status TEXT NOT NULL,
      renews_at TIMESTAMPTZ
    )
  `);

  // Indexes
  await query(`CREATE INDEX IF NOT EXISTS idx_documents_user_created ON documents(user_id, created_at DESC)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_jobs_status_created ON jobs(status, created_at)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_usage_daily_lookup ON usage_daily(user_id, day)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_jobs_session ON jobs(session_id) WHERE session_id IS NOT NULL`);

  Logger.info('Database migrations completed successfully.');
}

// If run directly as a script
if (require.main === module) {
  runMigrations()
    .then(() => {
      Logger.info('Migration script finished.');
      process.exit(0);
    })
    .catch((err) => {
      Logger.error('Migration failed', { error: err.message });
      process.exit(1);
    });
}
