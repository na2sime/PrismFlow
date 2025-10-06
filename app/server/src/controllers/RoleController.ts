import { Request, Response } from 'express';
import { RoleModel } from '@/models/Role';
import Joi from 'joi';

// Validation schemas
const createRoleSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  description: Joi.string().optional().allow('').max(500),
  permissions: Joi.array().items(Joi.string()).required().min(1)
});

const updateRoleSchema = Joi.object({
  name: Joi.string().optional().min(2).max(100),
  description: Joi.string().optional().allow('').max(500),
  permissions: Joi.array().items(Joi.string()).optional().min(1)
}).min(1);

const assignRoleSchema = Joi.object({
  userId: Joi.string().required(),
  roleId: Joi.string().required()
});

export class RoleController {
  static async getAllRoles(req: Request, res: Response): Promise<void> {
    try {
      const roles = await RoleModel.findAll();
      res.json({
        success: true,
        data: roles
      });
    } catch (error: any) {
      console.error('Error fetching roles:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch roles',
        error: error.message
      });
    }
  }

  static async getRole(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const role = await RoleModel.findById(id);

      if (!role) {
        res.status(404).json({
          success: false,
          message: 'Role not found'
        });
        return;
      }

      res.json({
        success: true,
        data: role
      });
    } catch (error: any) {
      console.error('Error fetching role:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch role',
        error: error.message
      });
    }
  }

  static async createRole(req: Request, res: Response): Promise<void> {
    try {
      const { error } = createRoleSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: error.details[0].message
        });
        return;
      }

      // Check if role with same name already exists
      const existingRole = await RoleModel.findByName(req.body.name);
      if (existingRole) {
        res.status(409).json({
          success: false,
          message: 'A role with this name already exists'
        });
        return;
      }

      const newRole = await RoleModel.create({
        name: req.body.name,
        description: req.body.description,
        isSystem: false,
        permissions: req.body.permissions
      });

      res.status(201).json({
        success: true,
        message: 'Role created successfully',
        data: newRole
      });
    } catch (error: any) {
      console.error('Error creating role:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create role',
        error: error.message
      });
    }
  }

  static async updateRole(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { error } = updateRoleSchema.validate(req.body);

      if (error) {
        res.status(400).json({
          success: false,
          message: error.details[0].message
        });
        return;
      }

      // Check if role name is being updated and if it conflicts
      if (req.body.name) {
        const existingRole = await RoleModel.findByName(req.body.name);
        if (existingRole && existingRole.id !== id) {
          res.status(409).json({
            success: false,
            message: 'A role with this name already exists'
          });
          return;
        }
      }

      const updatedRole = await RoleModel.update(id, req.body);

      if (!updatedRole) {
        res.status(404).json({
          success: false,
          message: 'Role not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Role updated successfully',
        data: updatedRole
      });
    } catch (error: any) {
      console.error('Error updating role:', error);

      if (error.message === 'Cannot modify system roles') {
        res.status(403).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to update role',
          error: error.message
        });
      }
    }
  }

  static async deleteRole(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await RoleModel.delete(id);

      res.json({
        success: true,
        message: 'Role deleted successfully'
      });
    } catch (error: any) {
      console.error('Error deleting role:', error);

      if (error.message === 'Role not found') {
        res.status(404).json({
          success: false,
          message: error.message
        });
      } else if (error.message === 'Cannot delete system roles') {
        res.status(403).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to delete role',
          error: error.message
        });
      }
    }
  }

  static async getUserRoles(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const roles = await RoleModel.getUserRoles(userId);

      res.json({
        success: true,
        data: roles
      });
    } catch (error: any) {
      console.error('Error fetching user roles:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user roles',
        error: error.message
      });
    }
  }

  static async assignRoleToUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { roleId } = req.body;

      if (!roleId) {
        res.status(400).json({
          success: false,
          message: 'roleId is required'
        });
        return;
      }

      const userRole = await RoleModel.assignToUser(userId, roleId);

      res.status(201).json({
        success: true,
        message: 'Role assigned to user successfully',
        data: userRole
      });
    } catch (error: any) {
      console.error('Error assigning role to user:', error);

      if (error.message === 'Role not found') {
        res.status(404).json({
          success: false,
          message: error.message
        });
      } else if (error.message === 'Role already assigned to user') {
        res.status(409).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to assign role to user',
          error: error.message
        });
      }
    }
  }

  static async removeRoleFromUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId, roleId } = req.params;
      await RoleModel.removeFromUser(userId, roleId);

      res.json({
        success: true,
        message: 'Role removed from user successfully'
      });
    } catch (error: any) {
      console.error('Error removing role from user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove role from user',
        error: error.message
      });
    }
  }

  static async getUserPermissions(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const permissions = await RoleModel.getUserPermissions(userId);

      res.json({
        success: true,
        data: permissions
      });
    } catch (error: any) {
      console.error('Error fetching user permissions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user permissions',
        error: error.message
      });
    }
  }
}
