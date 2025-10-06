import { Request, Response } from 'express';
import { ProjectService } from '@/services/ProjectService';
import { CreateProjectRequest } from '@/types';
import Joi from 'joi';

const createProjectSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(500).allow(''),
  settings: Joi.object({
    visibility: Joi.string().valid('private', 'public'),
    allowGuests: Joi.boolean(),
    boardLayout: Joi.string().valid('kanban', 'list', 'calendar')
  })
});

const updateProjectSchema = Joi.object({
  name: Joi.string().min(1).max(100),
  description: Joi.string().max(500).allow(''),
  settings: Joi.object({
    visibility: Joi.string().valid('private', 'public'),
    allowGuests: Joi.boolean(),
    boardLayout: Joi.string().valid('kanban', 'list', 'calendar')
  })
});

const addMemberSchema = Joi.object({
  userId: Joi.string().required(),
  role: Joi.string().valid('member', 'viewer').default('member')
});

export class ProjectController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const projects = await ProjectService.getAllProjects(req.user.id);

      res.json({
        success: true,
        data: { projects }
      });
    } catch (error) {
      console.error('Get projects error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const { projectId } = req.params;

      if (!projectId) {
        res.status(400).json({
          success: false,
          error: 'Project ID is required'
        });
        return;
      }

      const project = await ProjectService.getProjectById(projectId, req.user.id);

      if (!project) {
        res.status(404).json({
          success: false,
          error: 'Project not found or access denied'
        });
        return;
      }

      const members = await ProjectService.getProjectMembers(projectId, req.user.id);

      res.json({
        success: true,
        data: {
          project,
          members
        }
      });
    } catch (error) {
      console.error('Get project error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const { error } = createProjectSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.details[0].message
        });
        return;
      }

      const projectData: CreateProjectRequest = req.body;
      const project = await ProjectService.createProject(projectData, req.user.id);

      res.status(201).json({
        success: true,
        data: { project }
      });
    } catch (error) {
      console.error('Create project error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const { projectId } = req.params;

      if (!projectId) {
        res.status(400).json({
          success: false,
          error: 'Project ID is required'
        });
        return;
      }

      const { error } = updateProjectSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.details[0].message
        });
        return;
      }

      const updatedProject = await ProjectService.updateProject(projectId, req.body, req.user.id);

      if (!updatedProject) {
        res.status(404).json({
          success: false,
          error: 'Project not found or access denied'
        });
        return;
      }

      res.json({
        success: true,
        data: { project: updatedProject }
      });
    } catch (error) {
      console.error('Update project error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const { projectId } = req.params;

      if (!projectId) {
        res.status(400).json({
          success: false,
          error: 'Project ID is required'
        });
        return;
      }

      const success = await ProjectService.deleteProject(projectId, req.user.id);

      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Project not found or access denied'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Project deleted successfully'
      });
    } catch (error) {
      console.error('Delete project error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async addMember(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const { projectId } = req.params;

      if (!projectId) {
        res.status(400).json({
          success: false,
          error: 'Project ID is required'
        });
        return;
      }

      const { error } = addMemberSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.details[0].message
        });
        return;
      }

      const { userId, role } = req.body;
      const success = await ProjectService.addMember(projectId, req.user.id, userId, role);

      if (!success) {
        res.status(400).json({
          success: false,
          error: 'Unable to add member. User may already be a member or you may not have permission.'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Member added successfully'
      });
    } catch (error) {
      console.error('Add member error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async removeMember(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const { projectId, userId } = req.params;

      if (!projectId || !userId) {
        res.status(400).json({
          success: false,
          error: 'Project ID and User ID are required'
        });
        return;
      }

      const success = await ProjectService.removeMember(projectId, req.user.id, userId);

      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Member not found or access denied'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Member removed successfully'
      });
    } catch (error) {
      console.error('Remove member error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async getMembers(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const { projectId } = req.params;

      if (!projectId) {
        res.status(400).json({
          success: false,
          error: 'Project ID is required'
        });
        return;
      }

      const members = await ProjectService.getProjectMembers(projectId, req.user.id);

      if (members === null) {
        res.status(404).json({
          success: false,
          error: 'Project not found or access denied'
        });
        return;
      }

      res.json({
        success: true,
        data: { members }
      });
    } catch (error) {
      console.error('Get members error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}