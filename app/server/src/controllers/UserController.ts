import { Request, Response } from 'express';
import { UserModel } from '@/models/User';
import Joi from 'joi';

const createUserSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().min(1).max(50).required(),
  lastName: Joi.string().min(1).max(50).required(),
  role: Joi.string().valid('admin', 'user').default('user'),
  isActive: Joi.boolean().default(true)
});

const updateUserSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30),
  email: Joi.string().email(),
  firstName: Joi.string().min(1).max(50),
  lastName: Joi.string().min(1).max(50),
  role: Joi.string().valid('admin', 'user'),
  isActive: Joi.boolean()
});

export class UserController {
  static async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await UserModel.findAll();

      // Remove sensitive data
      const sanitizedUsers = users.map(user => {
        const { password, twoFactorSecret, ...safeUser } = user;
        return safeUser;
      });

      res.json({
        success: true,
        data: { users: sanitizedUsers }
      });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const user = await UserModel.findById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      const { password, twoFactorSecret, ...safeUser } = user;

      res.json({
        success: true,
        data: { user: safeUser }
      });
    } catch (error) {
      console.error('Get user by ID error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async createUser(req: Request, res: Response): Promise<void> {
    try {
      const { error } = createUserSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.details[0].message
        });
        return;
      }

      const { username, email } = req.body;

      // Check if user already exists
      const existingUserByEmail = await UserModel.findByEmail(email);
      if (existingUserByEmail) {
        res.status(409).json({
          success: false,
          error: 'Email already exists'
        });
        return;
      }

      const existingUserByUsername = await UserModel.findByUsername(username);
      if (existingUserByUsername) {
        res.status(409).json({
          success: false,
          error: 'Username already exists'
        });
        return;
      }

      const newUser = await UserModel.create({
        ...req.body,
        twoFactorSecret: null,
        twoFactorEnabled: false
      });

      const { password, twoFactorSecret, ...safeUser } = newUser;

      res.status(201).json({
        success: true,
        data: { user: safeUser },
        message: 'User created successfully'
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { error } = updateUserSchema.validate(req.body);

      if (error) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.details[0].message
        });
        return;
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      // Check if email is being changed and if it already exists
      if (req.body.email && req.body.email !== user.email) {
        const existingUser = await UserModel.findByEmail(req.body.email);
        if (existingUser) {
          res.status(409).json({
            success: false,
            error: 'Email already exists'
          });
          return;
        }
      }

      // Check if username is being changed and if it already exists
      if (req.body.username && req.body.username !== user.username) {
        const existingUser = await UserModel.findByUsername(req.body.username);
        if (existingUser) {
          res.status(409).json({
            success: false,
            error: 'Username already exists'
          });
          return;
        }
      }

      const updatedUser = await UserModel.update(userId, req.body);
      const { password, twoFactorSecret, ...safeUser } = updatedUser;

      res.json({
        success: true,
        data: { user: safeUser },
        message: 'User updated successfully'
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      // Prevent deleting yourself
      if (req.user?.id === userId) {
        res.status(400).json({
          success: false,
          error: 'Cannot delete your own account'
        });
        return;
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      await UserModel.delete(userId);

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async toggleUserStatus(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      const user = await UserModel.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      const updatedUser = await UserModel.update(userId, {
        isActive: !user.isActive
      });

      const { password, twoFactorSecret, ...safeUser } = updatedUser;

      res.json({
        success: true,
        data: { user: safeUser },
        message: `User ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully`
      });
    } catch (error) {
      console.error('Toggle user status error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}
