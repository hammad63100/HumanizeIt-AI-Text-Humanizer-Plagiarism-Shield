import { Pool, PoolClient } from 'pg';
import { config } from '../config';
import { Logger } from '../utils';

// PostgreSQL connection pool
export const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on('error', (err) => {
  Logger.error('Unexpected PostgreSQL pool error', { error: err.message });
});

/**
 * Execute a query against the database.
 */
export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  Logger.debug('DB query executed', {
    query: text.substring(0, 100),
    duration_ms: duration,
    rows: result.rowCount,
  });
  return result.rows as T[];
}

/**
 * Get a client from the pool for transaction use.
 */
export async function getClient(): Promise<PoolClient> {
  return pool.connect();
}

/**
 * Run a callback inside a database transaction.
 */
export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Check database connectivity.
 */
export async function checkHealth(): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}
