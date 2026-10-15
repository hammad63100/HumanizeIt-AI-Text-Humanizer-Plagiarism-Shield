import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { UserRepo } from '../db/repositories';
import { validateBody, registerSchema, loginSchema } from '../middleware';
import { Logger } from '../utils';
import { AuthPayload } from '../types';

const router = Router();

/**
 * POST /v1/auth/register
 * Create a new user account.
 */
router.post('/register', validateBody(registerSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const existing = await UserRepo.findByEmail(email);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: { code: 'USER_EXISTS', message: 'An account with this email already exists' },
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = await UserRepo.create(email, passwordHash);

    // Generate JWT
    const payload: AuthPayload = {
      userId: user.id,
      email: user.email,
      plan: user.plan,
    };
    const token = jwt.sign(payload, config.auth.jwtSecret, {
      expiresIn: config.auth.jwtExpiresIn as any,
    });

    Logger.info('User registered', { user_id: user.id });

    return res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          plan: user.plan,
        },
      },
    });
  } catch (error: any) {
    Logger.error('Registration failed', { error: error.message });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Registration failed' },
    });
  }
});

/**
 * POST /v1/auth/login
 * Authenticate and receive a JWT token.
 */
router.post('/login', validateBody(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await UserRepo.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
      });
    }

    // Generate JWT
    const payload: AuthPayload = {
      userId: user.id,
      email: user.email,
      plan: user.plan,
    };
    const token = jwt.sign(payload, config.auth.jwtSecret, {
      expiresIn: config.auth.jwtExpiresIn as any,
    });

    Logger.info('User logged in', { user_id: user.id });

    return res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          plan: user.plan,
        },
      },
    });
  } catch (error: any) {
    Logger.error('Login failed', { error: error.message });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Login failed' },
    });
  }
});

/**
 * GET /v1/auth/me
 * Get current authenticated user info.
 */
router.get('/me', async (req: Request, res: Response) => {
  if (!req.userId) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
    });
  }

  try {
    const user = await UserRepo.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' },
      });
    }

    const userData = {
      id: user.id,
      email: user.email,
      plan: user.plan,
      created_at: user.created_at,
    };

    return res.json({
      success: true,
      data: {
        ...userData,
        user: userData,
      },
      user: userData,
      ...userData,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch user' },
    });
  }
});

export default router;
