import { Router } from 'express';
import { ProfileController } from '@/controllers/ProfileController';
import { authenticateToken } from '@/middleware/auth';

const router = Router();

// All profile routes require authentication
router.use(authenticateToken);

// Get current user profile
router.get('/', ProfileController.getProfile);

// Update profile information
router.put('/', ProfileController.updateProfile);

// Change password
router.post('/change-password', ProfileController.changePassword);

// Upload profile picture
router.post('/picture', ProfileController.uploadProfilePicture);

// Delete profile picture
router.delete('/picture', ProfileController.deleteProfilePicture);

export default router;