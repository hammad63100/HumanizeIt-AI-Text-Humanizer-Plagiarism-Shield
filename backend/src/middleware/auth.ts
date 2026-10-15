import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { UserRepo } from '../db/repositories';
import { AuthPayload, PlanTier } from '../types';
import { Logger, generateRequestId } from '../utils';

// Extend Express Request to carry auth context
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
      userPlan?: PlanTier;
      sessionId?: string;
      requestId?: string;
      isGuest?: boolean;
    }
  }
}

/**
 * Attach a unique request ID to every request for tracing.
 */
export function requestIdMiddleware(req: Request, _res: Response, next: NextFunction): void {
  req.requestId = generateRequestId();
  next();
}

/**
 * Authentication middleware.
 * Verifies JWT Bearer tokens for authenticated users.
 * Falls back to guest session via signed cookie.
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, config.auth.jwtSecret) as AuthPayload;
      req.userId = decoded.userId;
      req.userEmail = decoded.email;
      req.userPlan = decoded.plan;
      req.isGuest = false;
      return next();
    } catch (error) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid or expired authentication token' },
      });
      return;
    }
  }

  // Guest session fallback
  let sessionId = req.cookies?.guest_session;
  if (!sessionId) {
    sessionId = uuidv4();
    res.cookie('guest_session', sessionId, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });
  }

  req.sessionId = sessionId;
  req.userPlan = 'guest';
  req.isGuest = true;
  next();
}

/**
 * Require authenticated user — rejects guests.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (req.isGuest || !req.userId) {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
    });
    return;
  }
  next();
}

/**
 * Request logging middleware.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    Logger.info(`${req.method} ${req.path} ${res.statusCode}`, {
      request_id: req.requestId,
      user_id: req.userId || req.sessionId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration_ms: duration,
    });
  });

  next();
}

/**
 * Global error handler middleware.
 */
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  Logger.error('Unhandled error', {
    request_id: req.requestId,
    error: err.message,
    stack: config.isDev ? err.stack : undefined,
  });

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: config.isDev ? err.message : 'An unexpected error occurred',
    },
  });
}
