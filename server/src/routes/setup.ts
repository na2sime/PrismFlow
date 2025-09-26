import { Router } from 'express';
import { SetupController } from '@/controllers/SetupController';
import { requireSetupMode } from '@/middleware/setup';
import { authLimiter } from '@/middleware/auth';

const router = Router();

// Apply setup mode requirement to all setup routes
router.use(requireSetupMode);

// Apply rate limiting to setup routes
router.use(authLimiter);

// Get setup status
router.get('/status', SetupController.getSetupStatus);

// Get available authentication providers
router.get('/auth-providers', SetupController.getAuthProviders);

// Get project templates
router.get('/project-templates', SetupController.getProjectTemplates);

// Create admin user
router.post('/admin-user', SetupController.createAdminUser);

// Create first project
router.post('/first-project', SetupController.createFirstProject);

// Complete setup
router.post('/complete', SetupController.completeSetup);

export default router;