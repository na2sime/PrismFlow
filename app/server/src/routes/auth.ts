import { Router } from 'express';
import { AuthController } from '@/controllers/AuthController';
import { authenticateToken, authLimiter, optionalAuth } from '@/middleware/auth';

const router = Router();

// Apply rate limiting to auth routes
router.use('/login', authLimiter);
router.use('/register', authLimiter);

// Authentication routes
router.post('/login', AuthController.login);
router.post('/logout', authenticateToken, AuthController.logout);
router.post('/refresh', AuthController.refresh);

// User profile routes
router.get('/me', authenticateToken, AuthController.getProfile);
router.put('/me', authenticateToken, AuthController.updateProfile);
router.put('/password', authenticateToken, AuthController.changePassword);

// Check authentication status (public endpoint)
router.get('/status', optionalAuth, AuthController.getStatus);

export default router;