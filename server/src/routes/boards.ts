import { Router } from 'express';
import { authenticateToken, requireProjectAccess, apiLimiter } from '@/middleware/auth';

const router = Router();

router.use(authenticateToken);
router.use(apiLimiter);

// Basic placeholder routes for boards
router.get('/project/:projectId', requireProjectAccess('read'), (req, res) => {
  res.json({
    success: true,
    data: {
      boards: []
    }
  });
});

router.post('/project/:projectId', requireProjectAccess('write'), (req, res) => {
  res.json({
    success: true,
    message: 'Board creation coming soon'
  });
});

export default router;