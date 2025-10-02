import { Router } from 'express';
import { UserController } from '@/controllers/UserController';
import { authenticateToken, requireAdmin } from '@/middleware/auth';

const router = Router();

// All user routes require authentication
router.use(authenticateToken);

// Admin only routes
router.get('/', requireAdmin, UserController.getAllUsers);
router.post('/', requireAdmin, UserController.createUser);
router.get('/:userId', requireAdmin, UserController.getUserById);
router.put('/:userId', requireAdmin, UserController.updateUser);
router.delete('/:userId', requireAdmin, UserController.deleteUser);
router.patch('/:userId/toggle-status', requireAdmin, UserController.toggleUserStatus);

export default router;
