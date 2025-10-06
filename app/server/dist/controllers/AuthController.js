"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const AuthService_1 = require("@/services/AuthService");
const joi_1 = __importDefault(require("joi"));
const loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(6).required(),
    twoFactorCode: joi_1.default.string().length(6).pattern(/^[0-9]+$/).optional()
});
const registerSchema = joi_1.default.object({
    username: joi_1.default.string().alphanum().min(3).max(30).required(),
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(6).required(),
    firstName: joi_1.default.string().min(1).max(50).required(),
    lastName: joi_1.default.string().min(1).max(50).required()
});
const updateProfileSchema = joi_1.default.object({
    firstName: joi_1.default.string().min(1).max(50),
    lastName: joi_1.default.string().min(1).max(50),
    username: joi_1.default.string().alphanum().min(3).max(30)
});
const changePasswordSchema = joi_1.default.object({
    currentPassword: joi_1.default.string().min(6).required(),
    newPassword: joi_1.default.string().min(6).required()
});
class AuthController {
    static async login(req, res) {
        try {
            const { error } = loginSchema.validate(req.body);
            if (error) {
                res.status(400).json({
                    success: false,
                    error: 'Validation error',
                    details: error.details[0].message
                });
                return;
            }
            const loginData = req.body;
            const result = await AuthService_1.AuthService.login(loginData);
            if (!result) {
                res.status(401).json({
                    success: false,
                    error: 'Invalid credentials'
                });
                return;
            }
            res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async register(req, res) {
        try {
            const { error } = registerSchema.validate(req.body);
            if (error) {
                res.status(400).json({
                    success: false,
                    error: 'Validation error',
                    details: error.details[0].message
                });
                return;
            }
            const registerData = req.body;
            const user = await AuthService_1.AuthService.register(registerData);
            res.status(201).json({
                success: true,
                data: { user }
            });
        }
        catch (error) {
            console.error('Registration error:', error);
            if (error.message === 'Email already exists' || error.message === 'Username already exists') {
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
    static async refresh(req, res) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                res.status(400).json({
                    success: false,
                    error: 'Refresh token is required'
                });
                return;
            }
            const result = await AuthService_1.AuthService.refreshTokens(refreshToken);
            if (!result) {
                res.status(401).json({
                    success: false,
                    error: 'Invalid or expired refresh token'
                });
                return;
            }
            res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            console.error('Token refresh error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async logout(req, res) {
        try {
            const token = req.token;
            if (token) {
                await AuthService_1.AuthService.logout(token);
            }
            res.json({
                success: true,
                message: 'Logged out successfully'
            });
        }
        catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async getProfile(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'User not authenticated'
                });
                return;
            }
            const user = await AuthService_1.AuthService.getUserById(req.user.id);
            if (!user) {
                res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
                return;
            }
            res.json({
                success: true,
                data: { user }
            });
        }
        catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async updateProfile(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'User not authenticated'
                });
                return;
            }
            const { error } = updateProfileSchema.validate(req.body);
            if (error) {
                res.status(400).json({
                    success: false,
                    error: 'Validation error',
                    details: error.details[0].message
                });
                return;
            }
            const updatedUser = await AuthService_1.AuthService.updateProfile(req.user.id, req.body);
            if (!updatedUser) {
                res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
                return;
            }
            res.json({
                success: true,
                data: { user: updatedUser }
            });
        }
        catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async changePassword(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'User not authenticated'
                });
                return;
            }
            const { error } = changePasswordSchema.validate(req.body);
            if (error) {
                res.status(400).json({
                    success: false,
                    error: 'Validation error',
                    details: error.details[0].message
                });
                return;
            }
            const { currentPassword, newPassword } = req.body;
            const success = await AuthService_1.AuthService.changePassword(req.user.id, currentPassword, newPassword);
            if (!success) {
                res.status(400).json({
                    success: false,
                    error: 'Current password is incorrect'
                });
                return;
            }
            res.json({
                success: true,
                message: 'Password changed successfully'
            });
        }
        catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async getStatus(req, res) {
        try {
            const isAuthenticated = !!req.user;
            res.json({
                success: true,
                data: {
                    isAuthenticated,
                    user: isAuthenticated ? req.user : null
                }
            });
        }
        catch (error) {
            console.error('Get auth status error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=AuthController.js.map