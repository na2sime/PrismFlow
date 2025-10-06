import { User } from '@/types';
export declare class UserModel {
    static findById(id: string): Promise<User | null>;
    static findByEmail(email: string): Promise<User | null>;
    static findByUsername(username: string): Promise<User | null>;
    static create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'lastLogin'>): Promise<User>;
    static updateLastLogin(id: string): Promise<void>;
    static updateProfile(id: string, updates: Partial<Pick<User, 'firstName' | 'lastName' | 'username'>>): Promise<User | null>;
    static changePassword(id: string, newPassword: string): Promise<void>;
    static verifyPassword(password: string, hashedPassword: string): Promise<boolean>;
    static getAll(): Promise<User[]>;
    static countAdmins(): Promise<number>;
    static setupTwoFactor(userId: string): Promise<{
        secret: string;
        qrCode: string;
    }>;
    static verifyTwoFactor(userId: string, token: string): Promise<boolean>;
    static enableTwoFactor(userId: string): Promise<void>;
    static disableTwoFactor(userId: string): Promise<void>;
    private static mapRowToUser;
}
//# sourceMappingURL=User.d.ts.map