"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.conditionalSetupCheck = exports.requireSetupMode = void 0;
const SetupService_1 = require("@/services/SetupService");
const requireSetupMode = async (req, res, next) => {
    try {
        const status = await SetupService_1.SetupService.getSetupStatus();
        if (status.isCompleted) {
            res.status(403).json({
                success: false,
                error: 'Setup has already been completed',
                message: 'Application is already configured and ready to use'
            });
            return;
        }
        next();
    }
    catch (error) {
        console.error('Setup status check error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.requireSetupMode = requireSetupMode;
const conditionalSetupCheck = async (req, res, next) => {
    try {
        if (req.path.startsWith('/api/setup') ||
            req.path === '/api/health' ||
            !req.path.startsWith('/api/')) {
            next();
            return;
        }
        const status = await SetupService_1.SetupService.getSetupStatus();
        if (!status.isCompleted) {
            res.status(503).json({
                success: false,
                error: 'Application setup required',
                message: 'Please complete the initial setup process',
                setupUrl: '/api/setup/status'
            });
            return;
        }
        next();
    }
    catch (error) {
        console.error('Conditional setup check error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.conditionalSetupCheck = conditionalSetupCheck;
//# sourceMappingURL=setup.js.map