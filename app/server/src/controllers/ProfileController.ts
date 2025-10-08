import { Request, Response } from 'express';
import { UserModel } from '@/models/User';
import Joi from 'joi';
import path from 'path';
import fs from 'fs';

const updateProfileSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).optional(),
  firstName: Joi.string().min(1).max(50).optional(),
  lastName: Joi.string().min(1).max(50).optional()
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required()
});

export class ProfileController {
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
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
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { error } = updateProfileSchema.validate(req.body);

      if (error) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.details[0].message
        });
        return;
      }

      // Check if username is being changed and if it already exists
      if (req.body.username) {
        const user = await UserModel.findById(userId);
        if (user && req.body.username !== user.username) {
          const existingUser = await UserModel.findByUsername(req.body.username);
          if (existingUser) {
            res.status(409).json({
              success: false,
              error: 'Username already exists'
            });
            return;
          }
        }
      }

      const updatedUser = await UserModel.updateProfile(userId, req.body);

      if (!updatedUser) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      const { password, twoFactorSecret, ...safeUser } = updatedUser;

      res.json({
        success: true,
        data: { user: safeUser },
        message: 'Profile updated successfully'
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
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

      // Verify current password
      const user = await UserModel.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      const isPasswordValid = await UserModel.verifyPassword(currentPassword, user.password);
      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          error: 'Current password is incorrect'
        });
        return;
      }

      await UserModel.changePassword(userId, newPassword);

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async uploadProfilePicture(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      if (!req.body.image) {
        res.status(400).json({
          success: false,
          error: 'No image provided'
        });
        return;
      }

      // Extract base64 image data
      const imageData = req.body.image;
      const matches = imageData.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);

      if (!matches || matches.length !== 3) {
        res.status(400).json({
          success: false,
          error: 'Invalid image format'
        });
        return;
      }

      const imageType = matches[1];
      const base64Data = matches[2];

      // Validate image type
      if (!['jpeg', 'jpg', 'png', 'gif', 'webp'].includes(imageType.toLowerCase())) {
        res.status(400).json({
          success: false,
          error: 'Invalid image type. Only JPEG, PNG, GIF, and WebP are allowed'
        });
        return;
      }

      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'data', 'uploads', 'profile-pictures');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Generate unique filename
      const filename = `${userId}-${Date.now()}.${imageType}`;
      const filepath = path.join(uploadsDir, filename);

      // Delete old profile picture if exists
      const user = await UserModel.findById(userId);
      if (user?.profilePicture) {
        const oldFilepath = path.join(process.cwd(), 'data', user.profilePicture);
        if (fs.existsSync(oldFilepath)) {
          fs.unlinkSync(oldFilepath);
        }
      }

      // Save new image
      fs.writeFileSync(filepath, Buffer.from(base64Data, 'base64'));

      // Update user profile picture path
      const relativePath = `uploads/profile-pictures/${filename}`;
      await UserModel.updateProfilePicture(userId, relativePath);

      res.json({
        success: true,
        data: { profilePicture: relativePath },
        message: 'Profile picture uploaded successfully'
      });
    } catch (error) {
      console.error('Upload profile picture error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async deleteProfilePicture(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const user = await UserModel.findById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      if (user.profilePicture) {
        const filepath = path.join(process.cwd(), 'data', user.profilePicture);
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }

        await UserModel.updateProfilePicture(userId, '');
      }

      res.json({
        success: true,
        message: 'Profile picture deleted successfully'
      });
    } catch (error) {
      console.error('Delete profile picture error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}