import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { verifyAccessToken, extractTokenFromHeader } from '@/config/auth';
import { UserModel } from '@/models/User';
import { AuthTokenModel } from '@/models/AuthToken';
import { ProjectService } from '@/services/ProjectService';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs for auth routes
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Access token is required'
      });
      return;
    }

    // Check if token is revoked
    const isRevoked = await AuthTokenModel.isTokenRevoked(token);
    if (isRevoked) {
      res.status(401).json({
        success: false,
        error: 'Token has been revoked'
      });
      return;
    }

    // Verify token
    const payload = verifyAccessToken(token);
    if (!payload) {
      res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
      return;
    }

    // Get user from database
    const user = await UserModel.findById(payload.userId);
    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        error: 'User not found or inactive'
      });
      return;
    }

    // Attach user and token to request
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      next();
      return;
    }

    // Check if token is revoked
    const isRevoked = await AuthTokenModel.isTokenRevoked(token);
    if (isRevoked) {
      next();
      return;
    }

    // Verify token
    const payload = verifyAccessToken(token);
    if (!payload) {
      next();
      return;
    }

    // Get user from database
    const user = await UserModel.findById(payload.userId);
    if (user && user.isActive) {
      req.user = user;
      req.token = token;
    }

    next();
  } catch (error) {
    console.error('Optional authentication error:', error);
    next();
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
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

export const requireAdmin = requireRole(['Super Admin', 'Administrateur', 'admin']);

export const requireProjectAccess = (accessType: 'read' | 'write' | 'admin' = 'read') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

      const hasAccess = await ProjectService.canAccessProject(projectId, req.user.id, accessType);
      if (!hasAccess) {
        res.status(403).json({
          success: false,
          error: 'Insufficient project permissions'
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Project access check error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };
};