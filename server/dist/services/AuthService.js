"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const User_1 = require("@/models/User");
const AuthToken_1 = require("@/models/AuthToken");
const auth_1 = require("@/config/auth");
class AuthService {
    static async login(loginData) {
        const user = await User_1.UserModel.findByEmail(loginData.email);
        if (!user || !user.isActive) {
            return null;
        }
        const isPasswordValid = await User_1.UserModel.verifyPassword(loginData.password, user.password);
        if (!isPasswordValid) {
            return null;
        }
        if (user.twoFactorEnabled) {
            if (!loginData.twoFactorCode) {
                const tempUser = { ...user };
                delete tempUser.password;
                delete tempUser.twoFactorSecret;
                return {
                    user: tempUser,
                    accessToken: '',
                    refreshToken: '',
                    requiresTwoFactor: true
                };
            }
            const isTwoFactorValid = await User_1.UserModel.verifyTwoFactor(user.id, loginData.twoFactorCode);
            if (!isTwoFactorValid) {
                return null;
            }
        }
        await User_1.UserModel.updateLastLogin(user.id);
        const accessToken = (0, auth_1.generateAccessToken)(user);
        const refreshToken = (0, auth_1.generateRefreshToken)(user);
        const accessExpiry = new Date(Date.now() + 15 * 60 * 1000);
        const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await AuthToken_1.AuthTokenModel.create(user.id, accessToken, 'access', accessExpiry);
        await AuthToken_1.AuthTokenModel.create(user.id, refreshToken, 'refresh', refreshExpiry);
        const userWithoutPassword = { ...user };
        delete userWithoutPassword.password;
        delete userWithoutPassword.twoFactorSecret;
        return {
            user: userWithoutPassword,
            accessToken,
            refreshToken
        };
    }
    static async register(registerData) {
        const existingUserByEmail = await User_1.UserModel.findByEmail(registerData.email);
        if (existingUserByEmail) {
            throw new Error('Email already exists');
        }
        const existingUserByUsername = await User_1.UserModel.findByUsername(registerData.username);
        if (existingUserByUsername) {
            throw new Error('Username already exists');
        }
        const adminCount = await User_1.UserModel.countAdmins();
        const role = adminCount === 0 ? 'admin' : 'user';
        const newUser = await User_1.UserModel.create({
            username: registerData.username,
            email: registerData.email,
            password: registerData.password,
            firstName: registerData.firstName,
            lastName: registerData.lastName,
            role,
            isActive: true,
            twoFactorSecret: null,
            twoFactorEnabled: false
        });
        const userWithoutPassword = { ...newUser };
        delete userWithoutPassword.password;
        delete userWithoutPassword.twoFactorSecret;
        return userWithoutPassword;
    }
    static async refreshTokens(refreshToken) {
        const tokenRecord = await AuthToken_1.AuthTokenModel.findByToken(refreshToken);
        if (!tokenRecord || tokenRecord.isRevoked || tokenRecord.expiresAt < new Date()) {
            return null;
        }
        const payload = (0, auth_1.verifyRefreshToken)(refreshToken);
        if (!payload) {
            return null;
        }
        const user = await User_1.UserModel.findById(payload.userId);
        if (!user || !user.isActive) {
            return null;
        }
        await AuthToken_1.AuthTokenModel.revokeToken(refreshToken);
        const newAccessToken = (0, auth_1.generateAccessToken)(user);
        const newRefreshToken = (0, auth_1.generateRefreshToken)(user);
        const accessExpiry = new Date(Date.now() + 15 * 60 * 1000);
        const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await AuthToken_1.AuthTokenModel.create(user.id, newAccessToken, 'access', accessExpiry);
        await AuthToken_1.AuthTokenModel.create(user.id, newRefreshToken, 'refresh', refreshExpiry);
        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        };
    }
    static async logout(token) {
        await AuthToken_1.AuthTokenModel.revokeToken(token);
    }
    static async logoutAll(userId) {
        await AuthToken_1.AuthTokenModel.revokeAllUserTokens(userId);
    }
    static async validateToken(token) {
        const isRevoked = await AuthToken_1.AuthTokenModel.isTokenRevoked(token);
        if (isRevoked) {
            return null;
        }
        return null;
    }
    static async getUserById(id) {
        const user = await User_1.UserModel.findById(id);
        if (!user) {
            return null;
        }
        const userWithoutPassword = { ...user };
        delete userWithoutPassword.password;
        delete userWithoutPassword.twoFactorSecret;
        return userWithoutPassword;
    }
    static async updateProfile(userId, updates) {
        const updatedUser = await User_1.UserModel.updateProfile(userId, updates);
        if (!updatedUser) {
            return null;
        }
        const userWithoutPassword = { ...updatedUser };
        delete userWithoutPassword.password;
        delete userWithoutPassword.twoFactorSecret;
        return userWithoutPassword;
    }
    static async changePassword(userId, currentPassword, newPassword) {
        const user = await User_1.UserModel.findById(userId);
        if (!user) {
            return false;
        }
        const isCurrentPasswordValid = await User_1.UserModel.verifyPassword(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return false;
        }
        await User_1.UserModel.changePassword(userId, newPassword);
        await AuthToken_1.AuthTokenModel.revokeAllUserTokens(userId);
        return true;
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=AuthService.js.map