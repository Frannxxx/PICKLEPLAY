import 'dotenv/config';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './server/routes/auth.ts';
import courtsRoutes from './server/routes/courts.ts';
import matchesRoutes from './server/routes/matches.ts';
import scoresRoutes from './server/routes/scores.ts';
import leaderboardRoutes from './server/routes/leaderboard.ts';
import paymentsRoutes from './server/routes/payments.ts';
import duprRoutes from './server/routes/dupr.ts';
import tournamentsRoutes from './server/routes/tournaments.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Security and Parsing Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows Vite inline scripts and external fonts/avatars in dev
    crossOriginEmbedderPolicy: false,
  })
);
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courts', courtsRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/scores', scoresRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/dupr', duprRoutes);
app.use('/api/tournaments', tournamentsRoutes);

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    platform: 'PicklePlay API Engine',
    version: '1.0.0',
    time: new Date().toISOString(),
  });
});

// Centralized API Error Handler
app.use('/api', (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled API Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// Vite Middleware Integration
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  function listenOnPort(portToTry: number) {
    app.listen(portToTry, '0.0.0.0', () => {
      console.log(`PicklePlay High-Performance Server running on http://localhost:${portToTry}`);
    }).on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${portToTry} is busy, trying port ${portToTry + 1}...`);
        listenOnPort(portToTry + 1);
      } else {
        console.error('Failed to start server:', err);
        process.exit(1);
      }
    });
  }
  listenOnPort(PORT);
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
