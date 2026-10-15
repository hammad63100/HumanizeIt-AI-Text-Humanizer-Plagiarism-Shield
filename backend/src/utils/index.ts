import { v4 as uuidv4 } from 'uuid';

/**
 * Structured JSON logger.
 * Each log entry carries request_id, user_id, job_id for full traceability.
 */
export class Logger {
  private static formatEntry(
    level: string,
    message: string,
    meta?: Record<string, unknown>
  ): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      request_id: meta?.request_id || undefined,
      user_id: meta?.user_id || undefined,
      job_id: meta?.job_id || undefined,
      ...meta,
    });
  }

  static info(message: string, meta?: Record<string, unknown>): void {
    console.log(this.formatEntry('INFO', message, meta));
  }

  static warn(message: string, meta?: Record<string, unknown>): void {
    console.warn(this.formatEntry('WARN', message, meta));
  }

  static error(message: string, meta?: Record<string, unknown>): void {
    console.error(this.formatEntry('ERROR', message, meta));
  }

  static debug(message: string, meta?: Record<string, unknown>): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatEntry('DEBUG', message, meta));
    }
  }
}

/**
 * Generate a unique request ID for tracing.
 */
export function generateRequestId(): string {
  return uuidv4();
}

/**
 * Count words in a text string.
 */
export function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
}

/**
 * Compute cosine similarity between two vectors.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) throw new Error('Vectors must have equal length');
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

/**
 * Sleep for a specified number of milliseconds.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Truncate text for safe logging (never log full user text).
 */
export function truncateForLog(text: string, maxLen: number = 50): string {
  if (text.length <= maxLen) return text;
  return text.substring(0, maxLen) + '...';
}

/**
 * Get the start-of-period date for usage tracking.
 */
export function getPeriodStart(period: 'day' | 'month'): string {
  const now = new Date();
  if (period === 'day') {
    return now.toISOString().split('T')[0]; // YYYY-MM-DD
  }
  // month: first day of current month
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

/**
 * Get the reset date for usage tracking.
 */
export function getResetDate(period: 'day' | 'month'): string {
  const now = new Date();
  if (period === 'day') {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }
  // month: first day of next month
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth.toISOString().split('T')[0];
}
