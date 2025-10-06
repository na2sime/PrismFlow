"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("@/controllers/AuthController");
const auth_1 = require("@/middleware/auth");
const router = (0, express_1.Router)();
router.use('/login', auth_1.authLimiter);
router.use('/register', auth_1.authLimiter);
router.post('/login', AuthController_1.AuthController.login);
router.post('/logout', auth_1.authenticateToken, AuthController_1.AuthController.logout);
router.post('/refresh', AuthController_1.AuthController.refresh);
router.get('/me', auth_1.authenticateToken, AuthController_1.AuthController.getProfile);
router.put('/me', auth_1.authenticateToken, AuthController_1.AuthController.updateProfile);
router.put('/password', auth_1.authenticateToken, AuthController_1.AuthController.changePassword);
router.get('/status', auth_1.optionalAuth, AuthController_1.AuthController.getStatus);
exports.default = router;
//# sourceMappingURL=auth.js.map