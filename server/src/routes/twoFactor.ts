import { Router } from 'express';
import { TwoFactorController } from '@/controllers/TwoFactorController';
import { authenticateToken } from '@/middleware/auth';

const router = Router();

router.use(authenticateToken);

router.post('/setup', TwoFactorController.setup);
router.post('/verify', TwoFactorController.verify);
router.post('/disable', TwoFactorController.disable);
router.get('/status', TwoFactorController.status);

export default router;