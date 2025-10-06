import { Router } from 'express';
import { TaskController } from '@/controllers/TaskController';
import { authenticateToken, requireProjectAccess, apiLimiter } from '@/middleware/auth';

const router = Router();

router.use(authenticateToken);
router.use(apiLimiter);

// Task routes
router.get('/my', TaskController.getMyTasks);
router.get('/project/:projectId', requireProjectAccess('read'), TaskController.getByProject);
router.get('/project/:projectId/status/:status', requireProjectAccess('read'), TaskController.getByStatus);
router.get('/project/:projectId/stats', requireProjectAccess('read'), TaskController.getStats);
router.get('/:taskId', TaskController.getById);
router.post('/', TaskController.create);
router.put('/:taskId', TaskController.update);
router.put('/:taskId/move', TaskController.move);
router.put('/project/:projectId/positions', requireProjectAccess('write'), TaskController.updatePositions);
router.delete('/:taskId', TaskController.delete);

export default router;