import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { connectDB, getDbStatus } from './backend/config/db.js';
import { seedInitialData } from './backend/services/dataStore.js';
import { errorHandler } from './backend/middleware/errorHandler.js';

// Route imports
import authRoutes from './backend/routes/authRoutes.js';
import userRoutes from './backend/routes/userRoutes.js';
import workoutRoutes from './backend/routes/workoutRoutes.js';
import exerciseRoutes from './backend/routes/exerciseRoutes.js';
import mealRoutes from './backend/routes/mealRoutes.js';
import progressRoutes from './backend/routes/progressRoutes.js';
import historyRoutes from './backend/routes/historyRoutes.js';
import favoriteRoutes from './backend/routes/favoriteRoutes.js';
import notificationRoutes from './backend/routes/notificationRoutes.js';
import categoryRoutes from './backend/routes/categoryRoutes.js';
import adminRoutes from './backend/routes/adminRoutes.js';
import uploadRoutes from './backend/routes/uploadRoutes.js';
import seedRoutes from './backend/routes/seedRoutes.js';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(cors({
    origin: '*',
    credentials: true,
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Ensure uploads directory
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));

  // Initialize DB and Seed data
  await connectDB();
  await seedInitialData();

  // Health and DB status check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'PulseFit MERN Backend API',
      timestamp: new Date().toISOString(),
      database: getDbStatus(),
    });
  });

  // REST API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/workouts', workoutRoutes);
  app.use('/api/exercises', exerciseRoutes);
  app.use('/api/meals', mealRoutes);
  app.use('/api/progress', progressRoutes);
  app.use('/api/workout-history', historyRoutes);
  app.use('/api/favorites', favoriteRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/seed', seedRoutes);

  // Global error handler for API
  app.use('/api', errorHandler);

  // Frontend & Admin App Delivery with Vite Middleware (Dev) or Static Serving (Prod)
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[PulseFit Server] Running on http://0.0.0.0:${PORT}`);
    console.log(`[PulseFit API] Ready at http://0.0.0.0:${PORT}/api/health`);
  });
}

startServer().catch((err) => {
  console.error('[Server Startup Error]', err);
});
