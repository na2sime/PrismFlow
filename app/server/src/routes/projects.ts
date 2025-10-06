import { Router } from 'express';
import { ProjectController } from '@/controllers/ProjectController';
import { authenticateToken, requireProjectAccess, apiLimiter } from '@/middleware/auth';

const router = Router();

router.use(authenticateToken);
router.use(apiLimiter);

// Project routes
router.get('/', ProjectController.getAll);
router.get('/:projectId', requireProjectAccess('read'), ProjectController.getById);
router.post('/', ProjectController.create);
router.put('/:projectId', requireProjectAccess('write'), ProjectController.update);
router.delete('/:projectId', requireProjectAccess('admin'), ProjectController.delete);

// Project member routes
router.get('/:projectId/members', requireProjectAccess('read'), ProjectController.getMembers);
router.post('/:projectId/members', requireProjectAccess('admin'), ProjectController.addMember);
router.delete('/:projectId/members/:userId', requireProjectAccess('admin'), ProjectController.removeMember);

export default router;