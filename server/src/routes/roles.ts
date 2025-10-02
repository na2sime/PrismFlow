import express from 'express';
import { RoleController } from '../controllers/RoleController';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/requireAdmin';

const router = express.Router();

// All role routes require authentication and admin privileges
router.use(authenticateToken);
router.use(requireAdmin);

// Role CRUD operations
router.get('/', RoleController.getAllRoles);
router.get('/:id', RoleController.getRole);
router.post('/', RoleController.createRole);
router.put('/:id', RoleController.updateRole);
router.delete('/:id', RoleController.deleteRole);

// User role assignment
router.get('/users/:userId/roles', RoleController.getUserRoles);
router.post('/users/:userId/roles', RoleController.assignRoleToUser);
router.delete('/users/:userId/roles/:roleId', RoleController.removeRoleFromUser);
router.get('/users/:userId/permissions', RoleController.getUserPermissions);

export default router;
