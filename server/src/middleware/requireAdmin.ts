import { Request, Response, NextFunction } from 'express';

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const user = (req as any).user;

  if (!user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
    return;
  }

  if (user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Admin privileges required'
    });
    return;
  }

  next();
};
