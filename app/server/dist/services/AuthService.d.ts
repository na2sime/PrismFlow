import { User, LoginRequest, RegisterRequest } from '@/types';
export declare class AuthService {
    static login(loginData: LoginRequest): Promise<{
        user: User;
        accessToken: string;
        refreshToken: string;
        requiresTwoFactor?: boolean;
    } | null>;
    static register(registerData: RegisterRequest): Promise<User | null>;
    static refreshTokens(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    } | null>;
    static logout(token: string): Promise<void>;
    static logoutAll(userId: string): Promise<void>;
    static validateToken(token: string): Promise<User | null>;
    static getUserById(id: string): Promise<User | null>;
    static updateProfile(userId: string, updates: Partial<Pick<User, 'firstName' | 'lastName' | 'username'>>): Promise<User | null>;
    static changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean>;
}
//# sourceMappingURL=AuthService.d.ts.map