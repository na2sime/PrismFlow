"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const SetupController_1 = require("@/controllers/SetupController");
const setup_1 = require("@/middleware/setup");
const auth_1 = require("@/middleware/auth");
const router = (0, express_1.Router)();
router.use(setup_1.requireSetupMode);
router.use(auth_1.authLimiter);
router.get('/status', SetupController_1.SetupController.getSetupStatus);
router.get('/auth-providers', SetupController_1.SetupController.getAuthProviders);
router.get('/project-templates', SetupController_1.SetupController.getProjectTemplates);
router.post('/admin-user', SetupController_1.SetupController.createAdminUser);
router.post('/first-project', SetupController_1.SetupController.createFirstProject);
router.post('/complete', SetupController_1.SetupController.completeSetup);
exports.default = router;
//# sourceMappingURL=setup.js.map