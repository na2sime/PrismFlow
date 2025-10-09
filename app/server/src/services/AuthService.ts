import { UserModel } from '@/models/User';
import { AuthTokenModel } from '@/models/AuthToken';
import { User, LoginRequest, RegisterRequest } from '@/types';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '@/config/auth';

export class AuthService {
  static async login(loginData: LoginRequest): Promise<{ user: User; accessToken: string; refreshToken: string; requiresTwoFactor?: boolean } | null> {
    const user = await UserModel.findByEmail(loginData.email);

    if (!user || !user.isActive) {
      return null;
    }

    const isPasswordValid = await UserModel.verifyPassword(loginData.password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    if (user.twoFactorEnabled) {
      if (!loginData.twoFactorCode) {
        const tempUser = { ...user };
        delete (tempUser as any).password;
        delete (tempUser as any).twoFactorSecret;

        return {
          user: tempUser,
          accessToken: '',
          refreshToken: '',
          requiresTwoFactor: true
        };
      }

      const isTwoFactorValid = await UserModel.verifyTwoFactor(user.id, loginData.twoFactorCode);
      if (!isTwoFactorValid) {
        return null;
      }
    }

    await UserModel.updateLastLogin(user.id);

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const accessExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await AuthTokenModel.create(user.id, accessToken, 'access', accessExpiry);
    await AuthTokenModel.create(user.id, refreshToken, 'refresh', refreshExpiry);

    const userWithoutPassword = { ...user };
    delete (userWithoutPassword as any).password;
    delete (userWithoutPassword as any).twoFactorSecret;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken
    };
  }

  static async register(registerData: RegisterRequest): Promise<User | null> {
    const existingUserByEmail = await UserModel.findByEmail(registerData.email);
    if (existingUserByEmail) {
      throw new Error('Email already exists');
    }

    const existingUserByUsername = await UserModel.findByUsername(registerData.username);
    if (existingUserByUsername) {
      throw new Error('Username already exists');
    }

    const adminCount = await UserModel.countAdmins();
    const role = adminCount === 0 ? 'Administrator' : 'Team Member';

    const newUser = await UserModel.create({
      username: registerData.username,
      email: registerData.email,
      password: registerData.password,
      firstName: registerData.firstName,
      lastName: registerData.lastName,
      role,
      isActive: true,
      profilePicture: null,
      twoFactorSecret: null,
      twoFactorEnabled: false,
      theme: 'light',
    });

    const userWithoutPassword = { ...newUser };
    delete (userWithoutPassword as any).password;
    delete (userWithoutPassword as any).twoFactorSecret;

    return userWithoutPassword;
  }

  static async refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string } | null> {
    const tokenRecord = await AuthTokenModel.findByToken(refreshToken);
    if (!tokenRecord || tokenRecord.isRevoked || tokenRecord.expiresAt < new Date()) {
      return null;
    }

    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return null;
    }

    const user = await UserModel.findById(payload.userId);
    if (!user || !user.isActive) {
      return null;
    }

    await AuthTokenModel.revokeToken(refreshToken);

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    const accessExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await AuthTokenModel.create(user.id, newAccessToken, 'access', accessExpiry);
    await AuthTokenModel.create(user.id, newRefreshToken, 'refresh', refreshExpiry);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  }

  static async logout(token: string): Promise<void> {
    await AuthTokenModel.revokeToken(token);
  }

  static async logoutAll(userId: string): Promise<void> {
    await AuthTokenModel.revokeAllUserTokens(userId);
  }

  static async validateToken(token: string): Promise<User | null> {
    const isRevoked = await AuthTokenModel.isTokenRevoked(token);
    if (isRevoked) {
      return null;
    }

    return null;
  }

  static async getUserById(id: string): Promise<User | null> {
    const user = await UserModel.findById(id);
    if (!user) {
      return null;
    }

    const userWithoutPassword = { ...user };
    delete (userWithoutPassword as any).password;
    delete (userWithoutPassword as any).twoFactorSecret;

    return userWithoutPassword;
  }

  static async updateProfile(userId: string, updates: Partial<Pick<User, 'firstName' | 'lastName' | 'username'>>): Promise<User | null> {
    const updatedUser = await UserModel.updateProfile(userId, updates);
    if (!updatedUser) {
      return null;
    }

    const userWithoutPassword = { ...updatedUser };
    delete (userWithoutPassword as any).password;
    delete (userWithoutPassword as any).twoFactorSecret;

    return userWithoutPassword;
  }

  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    const user = await UserModel.findById(userId);
    if (!user) {
      return false;
    }

    const isCurrentPasswordValid = await UserModel.verifyPassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return false;
    }

    await UserModel.changePassword(userId, newPassword);
    await AuthTokenModel.revokeAllUserTokens(userId);

    return true;
  }
}