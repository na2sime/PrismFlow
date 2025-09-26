"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ProjectController_1 = require("@/controllers/ProjectController");
const auth_1 = require("@/middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.use(auth_1.apiLimiter);
router.get('/', ProjectController_1.ProjectController.getAll);
router.get('/:projectId', (0, auth_1.requireProjectAccess)('read'), ProjectController_1.ProjectController.getById);
router.post('/', ProjectController_1.ProjectController.create);
router.put('/:projectId', (0, auth_1.requireProjectAccess)('write'), ProjectController_1.ProjectController.update);
router.delete('/:projectId', (0, auth_1.requireProjectAccess)('admin'), ProjectController_1.ProjectController.delete);
router.get('/:projectId/members', (0, auth_1.requireProjectAccess)('read'), ProjectController_1.ProjectController.getMembers);
router.post('/:projectId/members', (0, auth_1.requireProjectAccess)('admin'), ProjectController_1.ProjectController.addMember);
router.delete('/:projectId/members/:userId', (0, auth_1.requireProjectAccess)('admin'), ProjectController_1.ProjectController.removeMember);
exports.default = router;
//# sourceMappingURL=projects.js.map