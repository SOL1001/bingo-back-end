import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { connectDB } from './lib/db';
import authRoutes from './routes/authRoutes';
import gameRoutes from './routes/gameRoutes';

const app = express();

app.use(cors({
  origin: [
    'https://bingo-game-front-end.vercel.app',
    'http://localhost:3000',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Handle preflight for all routes
app.options('*', cors({
  origin: [
    'https://bingo-game-front-end.vercel.app',
    'http://localhost:3000',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());

// Ensure DB is connected before every request (safe for serverless)
app.use(async (_req: Request, _res: Response, next: NextFunction) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);

// Health check — useful for diagnosing Vercel cold starts
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    await connectDB();
    res.json({ success: true, db: 'connected', env: !!process.env.MONGODB_URI });
  } catch (err) {
    res.status(500).json({ success: false, db: 'failed', error: (err as Error).message });
  }
});

// 404
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err: Error & { statusCode?: number }, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.message);
  res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Internal server error' });
});

export default app;
