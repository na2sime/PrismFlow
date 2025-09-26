import QRCode from 'qrcode';
import { UserModel } from '@/models/User';
import { TwoFactorSetupResponse } from '@/types';

export class TwoFactorService {
  static async setupTwoFactor(userId: string): Promise<TwoFactorSetupResponse> {
    try {
      const result = await UserModel.setupTwoFactor(userId);

      const qrCodeDataURL = await QRCode.toDataURL(result.qrCode);

      return {
        secret: result.secret,
        qrCode: qrCodeDataURL,
        manualEntryKey: result.secret
      };
    } catch (error) {
      throw new Error(`Failed to setup 2FA: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async verifyTwoFactor(userId: string, token: string): Promise<boolean> {
    try {
      return await UserModel.verifyTwoFactor(userId, token);
    } catch (error) {
      throw new Error(`Failed to verify 2FA: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async enableTwoFactor(userId: string, token: string): Promise<void> {
    const isValid = await this.verifyTwoFactor(userId, token);
    if (!isValid) {
      throw new Error('Invalid 2FA token');
    }

    try {
      await UserModel.enableTwoFactor(userId);
    } catch (error) {
      throw new Error(`Failed to enable 2FA: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async disableTwoFactor(userId: string, token: string): Promise<void> {
    const isValid = await this.verifyTwoFactor(userId, token);
    if (!isValid) {
      throw new Error('Invalid 2FA token');
    }

    try {
      await UserModel.disableTwoFactor(userId);
    } catch (error) {
      throw new Error(`Failed to disable 2FA: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getTwoFactorStatus(userId: string): Promise<{ enabled: boolean }> {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      return { enabled: user.twoFactorEnabled };
    } catch (error) {
      throw new Error(`Failed to get 2FA status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}