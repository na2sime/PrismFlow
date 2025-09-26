import { Request, Response } from 'express';
import { SetupService } from '@/services/SetupService';
import { RegisterRequest, CreateProjectRequest } from '@/types';
import Joi from 'joi';

const createAdminSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().min(1).max(50).required(),
  lastName: Joi.string().min(1).max(50).required()
});

const createProjectSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(500).allow(''),
  templateId: Joi.string(),
  settings: Joi.object({
    visibility: Joi.string().valid('private', 'public'),
    allowGuests: Joi.boolean(),
    boardLayout: Joi.string().valid('kanban', 'list', 'calendar')
  })
});

export class SetupController {
  static async getSetupStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = await SetupService.getSetupStatus();

      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      console.error('Get setup status error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async getAuthProviders(req: Request, res: Response): Promise<void> {
    try {
      const providers = await SetupService.getAuthProviders();

      res.json({
        success: true,
        data: { providers }
      });
    } catch (error) {
      console.error('Get auth providers error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async getProjectTemplates(req: Request, res: Response): Promise<void> {
    try {
      const templates = await SetupService.getProjectTemplates();

      res.json({
        success: true,
        data: { templates }
      });
    } catch (error) {
      console.error('Get project templates error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async createAdminUser(req: Request, res: Response): Promise<void> {
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

      const adminData: RegisterRequest = req.body;
      const admin = await SetupService.createAdminUser(adminData);

      res.status(201).json({
        success: true,
        data: { user: admin },
        message: 'Admin user created successfully'
      });
    } catch (error: any) {
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

  static async createFirstProject(req: Request, res: Response): Promise<void> {
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

      const projectData: CreateProjectRequest = req.body;
      const project = await SetupService.createFirstProject(projectData, adminUserId);

      res.status(201).json({
        success: true,
        data: { project },
        message: 'First project created successfully'
      });
    } catch (error: any) {
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

  static async completeSetup(req: Request, res: Response): Promise<void> {
    try {
      await SetupService.completeSetup();

      res.json({
        success: true,
        message: 'Setup completed successfully'
      });
    } catch (error: any) {
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