import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { config } from './config';
import { Logger } from './utils';
import {
  requestIdMiddleware,
  authMiddleware,
  requestLogger,
  rateLimitMiddleware,
  errorHandler,
} from './middleware';
import {
  authRoutes,
  humanizeRoutes,
  jobsRoutes,
  detectRoutes,
  plagiarismRoutes,
  rewriteSentenceRoutes,
  citationsRoutes,
  usageRoutes,
  documentsRoutes,
  voiceProfileRoutes,
  uploadsRoutes,
  billingRoutes,
  healthRoutes,
} from './routes';

// ============================================
// Create Express Application
// ============================================
const app = express();

// ============================================
// Global Middleware
// ============================================

// Security headers
app.use(helmet());

// CORS — allow frontend origin
app.use(
  cors({
    origin: (origin, callback) => {
      // In dev, allow any localhost/127.0.0.1 origin
      if (!origin || config.isDev || origin.includes('localhost') || origin.includes('127.0.0.1')) {
        callback(null, true);
      } else {
        callback(null, origin === (process.env.FRONTEND_URL || 'https://humanizeit.app'));
      }
    },
    credentials: true,
  })
);

// Normalize /api prefix if present (e.g. /api/v1/... -> /v1/...)
app.use((req, _res, next) => {
  if (req.url.startsWith('/api/')) {
    req.url = req.url.substring(4);
  }
  next();
});

// Body parsing
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Cookie parsing for guest sessions
app.use(cookieParser());

// Gzip compression
app.use(compression());

// Request ID tracing
app.use(requestIdMiddleware);

// Structured request logging
app.use(requestLogger);

// ============================================
// Public Routes (no auth required)
// ============================================
app.use('/health', healthRoutes);

// Billing webhooks use raw body for signature verification — mount before auth
app.post('/v1/webhooks/billing', express.raw({ type: 'application/json' }), (req, res, next) => {
  if (Buffer.isBuffer(req.body)) {
    try {
      req.body = JSON.parse(req.body.toString());
    } catch {
      req.body = {};
    }
  }
  req.url = '/webhooks';
  billingRoutes(req, res, next);
});

// ============================================
// Auth + Rate Limiting (applied to all /v1/ routes)
// ============================================
app.use('/v1', authMiddleware);
app.use('/v1', rateLimitMiddleware);

// ============================================
// API v1 Routes
// ============================================
app.use('/v1/auth', authRoutes);
app.use('/v1/humanize', humanizeRoutes);
app.use('/v1/jobs', jobsRoutes);
app.use('/v1/detect', detectRoutes);
app.use('/v1/plagiarism', plagiarismRoutes);
app.use('/v1/rewrite-sentence', rewriteSentenceRoutes);
app.use('/v1/citations', citationsRoutes);
app.use('/v1/usage', usageRoutes);
app.use('/v1/documents', documentsRoutes);
app.use('/v1/voice-profile', voiceProfileRoutes);
app.use('/v1/uploads', uploadsRoutes);
app.use('/v1/billing', billingRoutes);

// ============================================
// 404 Handler
// ============================================
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Endpoint not found' },
  });
});

// ============================================
// Global Error Handler
// ============================================
app.use(errorHandler);

// ============================================
// Start Server
// ============================================
const PORT = config.port;

app.listen(PORT, () => {
  Logger.info(`🚀 HumanizeIt API server running`, {
    port: PORT,
    env: config.nodeEnv,
    url: `http://localhost:${PORT}`,
  });

  Logger.info('Available endpoints:', {
    health: `GET  /health`,
    humanize: `POST /v1/humanize`,
    detect: `POST /v1/detect`,
    plagiarism: `POST /v1/plagiarism`,
    jobs: `GET  /v1/jobs/:id`,
    usage: `GET  /v1/usage`,
    documents: `GET  /v1/documents`,
    auth: `POST /v1/auth/register | /v1/auth/login`,
  });
});

export default app;
