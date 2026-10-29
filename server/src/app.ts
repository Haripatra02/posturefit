import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { config } from './config.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import exerciseRoutes from './routes/exercises.js';
import challengeRoutes from './routes/challenges.js';
import sessionRoutes from './routes/sessions.js';
import rewardRoutes from './routes/rewards.js';
import progressRoutes from './routes/progress.js';
import adminRoutes from './routes/admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp(): Express {
  const app = express();

  // Security headers with helmet
  app.use(
    helmet({
      contentSecurityPolicy: false, // Let SPA load assets seamlessly
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS configuration
  app.use(
    cors({
      origin: [config.clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Key'],
    })
  );

  app.use(express.json());
  app.use(rateLimiter);

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'healthy',
      app: 'PostureFit API',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/profile', profileRoutes);
  app.use('/api/exercises', exerciseRoutes);
  app.use('/api/challenges', challengeRoutes);
  app.use('/api/sessions', sessionRoutes);
  app.use('/api/rewards', rewardRoutes);
  app.use('/api/progress', progressRoutes);
  app.use('/api/admin', adminRoutes);

  // Serve static client build if present (for unified production deployment)
  const clientDistPath = path.resolve(__dirname, '../../client/dist');
  if (fs.existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.join(clientDistPath, 'index.html'));
    });
  }

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
