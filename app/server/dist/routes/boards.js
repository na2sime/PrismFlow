"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("@/middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.use(auth_1.apiLimiter);
router.get('/project/:projectId', (0, auth_1.requireProjectAccess)('read'), (req, res) => {
    res.json({
        success: true,
        data: {
            boards: []
        }
    });
});
router.post('/project/:projectId', (0, auth_1.requireProjectAccess)('write'), (req, res) => {
    res.json({
        success: true,
        message: 'Board creation coming soon'
    });
});
exports.default = router;
//# sourceMappingURL=boards.js.map