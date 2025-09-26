"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetupController = void 0;
const SetupService_1 = require("@/services/SetupService");
const joi_1 = __importDefault(require("joi"));
const createAdminSchema = joi_1.default.object({
    username: joi_1.default.string().alphanum().min(3).max(30).required(),
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(6).required(),
    firstName: joi_1.default.string().min(1).max(50).required(),
    lastName: joi_1.default.string().min(1).max(50).required()
});
const createProjectSchema = joi_1.default.object({
    name: joi_1.default.string().min(1).max(100).required(),
    description: joi_1.default.string().max(500).allow(''),
    templateId: joi_1.default.string(),
    settings: joi_1.default.object({
        visibility: joi_1.default.string().valid('private', 'public'),
        allowGuests: joi_1.default.boolean(),
        boardLayout: joi_1.default.string().valid('kanban', 'list', 'calendar')
    })
});
class SetupController {
    static async getSetupStatus(req, res) {
        try {
            const status = await SetupService_1.SetupService.getSetupStatus();
            res.json({
                success: true,
                data: status
            });
        }
        catch (error) {
            console.error('Get setup status error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async getAuthProviders(req, res) {
        try {
            const providers = await SetupService_1.SetupService.getAuthProviders();
            res.json({
                success: true,
                data: { providers }
            });
        }
        catch (error) {
            console.error('Get auth providers error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async getProjectTemplates(req, res) {
        try {
            const templates = await SetupService_1.SetupService.getProjectTemplates();
            res.json({
                success: true,
                data: { templates }
            });
        }
        catch (error) {
            console.error('Get project templates error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async createAdminUser(req, res) {
        try {
            const { error } = createAdminSchema.validate(req.body);
            if (error) {
                res.status(400).json({
                    success: false,
                    error: 'Validation error',
                    details: error.details[0].message
                });
                return;
            }
            const adminData = req.body;
            const admin = await SetupService_1.SetupService.createAdminUser(adminData);
            res.status(201).json({
                success: true,
                data: { user: admin },
                message: 'Admin user created successfully'
            });
        }
        catch (error) {
            console.error('Create admin user error:', error);
            if (error.message === 'Admin user already exists' ||
                error.message === 'Email already exists' ||
                error.message === 'Username already exists') {
                res.status(409).json({
                    success: false,
                    error: error.message
                });
                return;
            }
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async createFirstProject(req, res) {
        try {
            const { error } = createProjectSchema.validate(req.body);
            if (error) {
                res.status(400).json({
                    success: false,
                    error: 'Validation error',
                    details: error.details[0].message
                });
                return;
            }
            const { adminUserId } = req.query;
            if (!adminUserId || typeof adminUserId !== 'string') {
                res.status(400).json({
                    success: false,
                    error: 'Admin user ID is required'
                });
                return;
            }
            const projectData = req.body;
            const project = await SetupService_1.SetupService.createFirstProject(projectData, adminUserId);
            res.status(201).json({
                success: true,
                data: { project },
                message: 'First project created successfully'
            });
        }
        catch (error) {
            console.error('Create first project error:', error);
            if (error.message === 'Projects already exist') {
                res.status(409).json({
                    success: false,
                    error: error.message
                });
                return;
            }
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async completeSetup(req, res) {
        try {
            await SetupService_1.SetupService.completeSetup();
            res.json({
                success: true,
                message: 'Setup completed successfully'
            });
        }
        catch (error) {
            console.error('Complete setup error:', error);
            if (error.message === 'Admin user must be created first' ||
                error.message === 'First project must be created') {
                res.status(400).json({
                    success: false,
                    error: error.message
                });
                return;
            }
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
}
exports.SetupController = SetupController;
//# sourceMappingURL=SetupController.js.map