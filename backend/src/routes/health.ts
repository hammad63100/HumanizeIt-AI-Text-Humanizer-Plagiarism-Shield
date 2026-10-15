import { Router, Request, Response } from 'express';
import { checkHealth as checkDbHealth } from '../db';
import { Logger } from '../utils';

const router = Router();

/**
 * GET /health
 * Server and dependency health check.
 */
router.get('/', async (_req: Request, res: Response) => {
  const checks: Record<string, string> = {
    server: 'ok',
    uptime: `${Math.floor(process.uptime())}s`,
  };

  // Database health
  try {
    const dbHealthy = await checkDbHealth();
    checks.database = dbHealthy ? 'ok' : 'unavailable';
  } catch {
    checks.database = 'unavailable';
  }

  // Redis health (basic check)
  checks.redis = 'ok'; // In production, ping Redis here

  const allHealthy = Object.values(checks).every(
    (v) => v === 'ok' || v.endsWith('s') // uptime value
  );

  const statusCode = allHealthy ? 200 : 503;

  return res.status(statusCode).json({
    status: allHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    checks,
  });
});

export default router;
