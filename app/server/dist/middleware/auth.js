"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireProjectAccess = exports.requireAdmin = exports.requireRole = exports.optionalAuth = exports.authenticateToken = exports.authLimiter = exports.apiLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_1 = require("@/config/auth");
const User_1 = require("@/models/User");
const AuthToken_1 = require("@/models/AuthToken");
const ProjectService_1 = require("@/services/ProjectService");
exports.apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        error: 'Too many authentication attempts, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
const authenticateToken = async (req, res, next) => {
    try {
        const token = (0, auth_1.extractTokenFromHeader)(req.headers.authorization);
        if (!token) {
            res.status(401).json({
                success: false,
                error: 'Access token is required'
            });
            return;
        }
        const isRevoked = await AuthToken_1.AuthTokenModel.isTokenRevoked(token);
        if (isRevoked) {
            res.status(401).json({
                success: false,
                error: 'Token has been revoked'
            });
            return;
        }
        const payload = (0, auth_1.verifyAccessToken)(token);
        if (!payload) {
            res.status(401).json({
                success: false,
                error: 'Invalid or expired token'
            });
            return;
        }
        const user = await User_1.UserModel.findById(payload.userId);
        if (!user || !user.isActive) {
            res.status(401).json({
                success: false,
                error: 'User not found or inactive'
            });
            return;
        }
        req.user = user;
        req.token = token;
        next();
    }
    catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.authenticateToken = authenticateToken;
const optionalAuth = async (req, res, next) => {
    try {
        const token = (0, auth_1.extractTokenFromHeader)(req.headers.authorization);
        if (!token) {
            next();
            return;
        }
        const isRevoked = await AuthToken_1.AuthTokenModel.isTokenRevoked(token);
        if (isRevoked) {
            next();
            return;
        }
        const payload = (0, auth_1.verifyAccessToken)(token);
        if (!payload) {
            next();
            return;
        }
        const user = await User_1.UserModel.findById(payload.userId);
        if (user && user.isActive) {
            req.user = user;
            req.token = token;
        }
        next();
    }
    catch (error) {
        console.error('Optional authentication error:', error);
        next();
    }
};
exports.optionalAuth = optionalAuth;
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                error: 'Insufficient permissions'
            });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
exports.requireAdmin = (0, exports.requireRole)(['admin']);
const requireProjectAccess = (accessType = 'read') => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'User not authenticated'
                });
                return;
            }
            const projectId = req.params.projectId;
            if (!projectId) {
                res.status(400).json({
                    success: false,
                    error: 'Project ID is required'
                });
                return;
            }
            const hasAccess = await ProjectService_1.ProjectService.canAccessProject(projectId, req.user.id, accessType);
            if (!hasAccess) {
                res.status(403).json({
                    success: false,
                    error: 'Insufficient project permissions'
                });
                return;
            }
            next();
        }
        catch (error) {
            console.error('Project access check error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    };
};
exports.requireProjectAccess = requireProjectAccess;
//# sourceMappingURL=auth.js.map