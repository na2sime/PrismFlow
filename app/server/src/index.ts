import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

import { database } from '@/config/database';
import { conditionalSetupCheck } from '@/middleware/setup';
import setupRoutes from '@/routes/setup';
import authRoutes from '@/routes/auth';
import twoFactorRoutes from '@/routes/twoFactor';
import profileRoutes from '@/routes/profile';
import userRoutes from '@/routes/users';
import roleRoutes from '@/routes/roles';
import projectRoutes from '@/routes/projects';
import taskRoutes from '@/routes/tasks';
import boardRoutes from '@/routes/boards';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5001;

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit for profile picture uploads
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize database
database.getDb();

// Apply setup check middleware to API routes (except setup and health)
app.use(conditionalSetupCheck);

// Setup routes (available even when setup is required)
app.use('/api/setup', setupRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/auth/2fa', twoFactorRoutes);

// Protected API routes (require setup to be completed)
app.use('/api/profile', profileRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/boards', boardRoutes);

// Serve uploaded files
app.use('/api/uploads', express.static(path.join(process.cwd(), 'data', 'uploads')));

// Serve static files from client in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/build/index.html'));
  });
}

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'PrismFlow API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log('🚀 PrismFlow server running on port ' + PORT);
  console.log('📊 Dashboard: http://localhost:' + PORT);
  console.log('🔧 API Health: http://localhost:' + PORT + '/api/health');
  console.log('⚙️ Setup: http://localhost:' + PORT + '/api/setup/status');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n📤 Shutting down gracefully...');
  database.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('📤 Shutting down gracefully...');
  database.close();
  process.exit(0);
});