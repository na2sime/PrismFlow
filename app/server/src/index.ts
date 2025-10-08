import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

import { database } from '@/config/database';
import { conditionalSetupCheck } from '@/middleware/setup';
import { csrfCookieSetter, csrfProtection, getCsrfToken } from '@/middleware/csrf';
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

// Verify required environment variables
if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  console.error('❌ FATAL ERROR: JWT secrets are not configured!');
  console.error('');
  console.error('Please configure JWT_SECRET and JWT_REFRESH_SECRET in your .env file.');
  console.error('');
  console.error('Generate secrets with:');
  console.error('  node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
  console.error('');
  console.error('Then add them to app/server/.env:');
  console.error('  JWT_SECRET=your_generated_secret_here');
  console.error('  JWT_REFRESH_SECRET=your_other_generated_secret_here');
  console.error('');
  process.exit(1);
}

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
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true, // Allow cookies to be sent
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' })); // Increased limit for profile picture uploads
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CSRF Protection
app.use(csrfCookieSetter); // Set CSRF cookie for all requests
app.get('/api/csrf-token', getCsrfToken); // Endpoint to get CSRF token

// Initialize database
database.getDb();

// Apply setup check middleware to API routes (except setup and health)
app.use(conditionalSetupCheck);

// Setup routes (available even when setup is required)
app.use('/api/setup', setupRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/auth/2fa', twoFactorRoutes);

// Protected API routes (require setup to be completed + CSRF protection)
app.use('/api/profile', csrfProtection, profileRoutes);
app.use('/api/users', csrfProtection, userRoutes);
app.use('/api/roles', csrfProtection, roleRoutes);
app.use('/api/projects', csrfProtection, projectRoutes);
app.use('/api/tasks', csrfProtection, taskRoutes);
app.use('/api/boards', csrfProtection, boardRoutes);

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