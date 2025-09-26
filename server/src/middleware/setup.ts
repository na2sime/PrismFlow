import { Request, Response, NextFunction } from 'express';
import { SetupService } from '@/services/SetupService';

export const requireSetupMode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const status = await SetupService.getSetupStatus();

    if (status.isCompleted) {
      res.status(403).json({
        success: false,
        error: 'Setup has already been completed',
        message: 'Application is already configured and ready to use'
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Setup status check error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const conditionalSetupCheck = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Skip setup check for setup routes, health check, and static files
    if (req.path.startsWith('/api/setup') ||
        req.path === '/api/health' ||
        !req.path.startsWith('/api/')) {
      next();
      return;
    }

    const status = await SetupService.getSetupStatus();

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
  } catch (error) {
    console.error('Conditional setup check error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};