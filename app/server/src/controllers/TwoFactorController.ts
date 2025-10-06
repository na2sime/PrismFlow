import { Request, Response } from 'express';
import { TwoFactorService } from '@/services/TwoFactorService';
import { TwoFactorVerificationRequest } from '@/types';
import Joi from 'joi';

const twoFactorVerificationSchema = Joi.object({
  token: Joi.string().required().length(6).pattern(/^[0-9]+$/)
});

export class TwoFactorController {
  static async setup(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      const result = await TwoFactorService.setupTwoFactor(userId);

      res.status(200).json({
        message: '2FA setup initiated successfully',
        data: result
      });
    } catch (error) {
      console.error('2FA setup error:', error);
      res.status(500).json({
        error: 'Failed to setup 2FA',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async verify(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = twoFactorVerificationSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          error: 'Validation failed',
          details: error.details.map(d => d.message)
        });
        return;
      }

      const { token }: TwoFactorVerificationRequest = value;
      const userId = req.user!.id;

      await TwoFactorService.enableTwoFactor(userId, token);

      res.status(200).json({
        message: '2FA enabled successfully'
      });
    } catch (error) {
      console.error('2FA verification error:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      const status = message.includes('Invalid') ? 400 : 500;

      res.status(status).json({
        error: 'Failed to verify 2FA',
        message
      });
    }
  }

  static async disable(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = twoFactorVerificationSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          error: 'Validation failed',
          details: error.details.map(d => d.message)
        });
        return;
      }

      const { token }: TwoFactorVerificationRequest = value;
      const userId = req.user!.id;

      await TwoFactorService.disableTwoFactor(userId, token);

      res.status(200).json({
        message: '2FA disabled successfully'
      });
    } catch (error) {
      console.error('2FA disable error:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      const status = message.includes('Invalid') ? 400 : 500;

      res.status(status).json({
        error: 'Failed to disable 2FA',
        message
      });
    }
  }

  static async status(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      const result = await TwoFactorService.getTwoFactorStatus(userId);

      res.status(200).json(result);
    } catch (error) {
      console.error('2FA status error:', error);
      res.status(500).json({
        error: 'Failed to get 2FA status',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}