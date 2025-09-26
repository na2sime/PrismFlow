import { Request, Response } from 'express';
import { TaskService } from '@/services/TaskService';
import { CreateTaskRequest, UpdateTaskRequest, TaskStatus } from '@/types';
import Joi from 'joi';

const createTaskSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().max(2000).allow(''),
  projectId: Joi.string().required(),
  assigneeId: Joi.string().allow(null),
  priority: Joi.string().valid('low', 'medium', 'high', 'critical').default('medium'),
  dueDate: Joi.string().isoDate().allow(null),
  tags: Joi.array().items(Joi.string()),
  estimatedHours: Joi.number().min(0).allow(null)
});

const updateTaskSchema = Joi.object({
  title: Joi.string().min(1).max(200),
  description: Joi.string().max(2000).allow(''),
  status: Joi.string().valid('todo', 'in_progress', 'review', 'done', 'cancelled'),
  priority: Joi.string().valid('low', 'medium', 'high', 'critical'),
  assigneeId: Joi.string().allow(null),
  dueDate: Joi.string().isoDate().allow(null),
  tags: Joi.array().items(Joi.string()),
  estimatedHours: Joi.number().min(0).allow(null),
  actualHours: Joi.number().min(0).allow(null)
});

const moveTaskSchema = Joi.object({
  status: Joi.string().valid('todo', 'in_progress', 'review', 'done', 'cancelled').required(),
  position: Joi.number().min(0).required()
});

const updatePositionsSchema = Joi.object({
  tasks: Joi.array().items(
    Joi.object({
      id: Joi.string().required(),
      position: Joi.number().min(0).required()
    })
  ).required()
});

export class TaskController {
  static async getByProject(req: Request, res: Response): Promise<void> {
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

      const tasks = await TaskService.getTasksByProject(projectId, req.user.id);

      if (tasks === null) {
        res.status(404).json({
          success: false,
          error: 'Project not found or access denied'
        });
        return;
      }

      res.json({
        success: true,
        data: { tasks }
      });
    } catch (error) {
      console.error('Get tasks by project error:', error);
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

      const { taskId } = req.params;

      if (!taskId) {
        res.status(400).json({
          success: false,
          error: 'Task ID is required'
        });
        return;
      }

      const task = await TaskService.getTaskById(taskId, req.user.id);

      if (!task) {
        res.status(404).json({
          success: false,
          error: 'Task not found or access denied'
        });
        return;
      }

      res.json({
        success: true,
        data: { task }
      });
    } catch (error) {
      console.error('Get task error:', error);
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

      const { error } = createTaskSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.details[0].message
        });
        return;
      }

      const taskData: CreateTaskRequest = req.body;
      const task = await TaskService.createTask(taskData, req.user.id);

      if (!task) {
        res.status(404).json({
          success: false,
          error: 'Project not found or access denied'
        });
        return;
      }

      res.status(201).json({
        success: true,
        data: { task }
      });
    } catch (error) {
      console.error('Create task error:', error);
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

      const { taskId } = req.params;

      if (!taskId) {
        res.status(400).json({
          success: false,
          error: 'Task ID is required'
        });
        return;
      }

      const { error } = updateTaskSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.details[0].message
        });
        return;
      }

      const updates: UpdateTaskRequest = req.body;
      const task = await TaskService.updateTask(taskId, updates, req.user.id);

      if (!task) {
        res.status(404).json({
          success: false,
          error: 'Task not found or access denied'
        });
        return;
      }

      res.json({
        success: true,
        data: { task }
      });
    } catch (error) {
      console.error('Update task error:', error);
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

      const { taskId } = req.params;

      if (!taskId) {
        res.status(400).json({
          success: false,
          error: 'Task ID is required'
        });
        return;
      }

      const success = await TaskService.deleteTask(taskId, req.user.id);

      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Task not found or access denied'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Task deleted successfully'
      });
    } catch (error) {
      console.error('Delete task error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async move(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const { taskId } = req.params;

      if (!taskId) {
        res.status(400).json({
          success: false,
          error: 'Task ID is required'
        });
        return;
      }

      const { error } = moveTaskSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.details[0].message
        });
        return;
      }

      const { status, position } = req.body;
      const task = await TaskService.moveTask(taskId, status as TaskStatus, position, req.user.id);

      if (!task) {
        res.status(404).json({
          success: false,
          error: 'Task not found or access denied'
        });
        return;
      }

      res.json({
        success: true,
        data: { task }
      });
    } catch (error) {
      console.error('Move task error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async updatePositions(req: Request, res: Response): Promise<void> {
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

      const { error } = updatePositionsSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.details[0].message
        });
        return;
      }

      const { tasks } = req.body;
      const success = await TaskService.updateTaskPositions(projectId, tasks, req.user.id);

      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Project not found or access denied'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Task positions updated successfully'
      });
    } catch (error) {
      console.error('Update task positions error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async getByStatus(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const { projectId, status } = req.params;

      if (!projectId || !status) {
        res.status(400).json({
          success: false,
          error: 'Project ID and status are required'
        });
        return;
      }

      const validStatuses = ['todo', 'in_progress', 'review', 'done', 'cancelled'];
      if (!validStatuses.includes(status)) {
        res.status(400).json({
          success: false,
          error: 'Invalid status'
        });
        return;
      }

      const tasks = await TaskService.getTasksByStatus(projectId, status as TaskStatus, req.user.id);

      if (tasks === null) {
        res.status(404).json({
          success: false,
          error: 'Project not found or access denied'
        });
        return;
      }

      res.json({
        success: true,
        data: { tasks }
      });
    } catch (error) {
      console.error('Get tasks by status error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async getStats(req: Request, res: Response): Promise<void> {
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

      const stats = await TaskService.getProjectTaskStats(projectId, req.user.id);

      if (stats === null) {
        res.status(404).json({
          success: false,
          error: 'Project not found or access denied'
        });
        return;
      }

      res.json({
        success: true,
        data: { stats }
      });
    } catch (error) {
      console.error('Get task stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async getMyTasks(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const tasks = await TaskService.getTasksByAssignee(req.user.id, req.user.id);

      res.json({
        success: true,
        data: { tasks }
      });
    } catch (error) {
      console.error('Get my tasks error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}