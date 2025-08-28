
// server.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

import authRoutes   from './routes/auth.js';
import courseRoutes from './routes/courses.js';
import videosRoutes from './routes/videos.js';
import aiRoutes     from './routes/ai.js';      // make sure routes/ai.js exists

dotenv.config();                  // load env first
const app    = express();         // ← create app before using it
const prisma = new PrismaClient();
const PORT   = process.env.PORT || 3001;

/* ---------- global middleware ---------- */
app.use(helmet());

app.use(
  cors({
    origin: process.env.NODE_ENV === 'production'
      ? 'https://your-frontend-domain.com'
      : ['http://localhost:5173', 'http://localhost:3000'], // Vite + CRA
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/* ---------- health & info ---------- */
app.get('/', (_req, res) => {
  res.json({
    message: 'AI Course Builder API',
    version: '1.0.0',
    status: 'running',
    endpoints: [
      '/api/health',
      '/api/auth',
      '/api/courses',
      '/api/videos',
      '/api/ai',
    ],
  });
});

app.get('/api/health', (_req, res) => {
  res.json({
    message: 'AI Course Builder API is running!',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

/* ---------- API routes ---------- */
app.use('/api/auth',    authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/videos',  videosRoutes); // now after app is defined
app.use('/api/ai',      aiRoutes);

/* ---------- error handlers ---------- */
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

/* ---------- start server ---------- */
app.listen(PORT, () => {
  console.log(`🚀  Server running on http://localhost:${PORT}`);
  console.log(`📊  Database: Connected via Prisma`);
  console.log(`🌍  Environment: ${process.env.NODE_ENV}`);
});

/* ---------- graceful shutdown ---------- */
process.on('SIGTERM', async () => {
  console.log('⏳  Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('⏳  Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});

