import { AuthToken } from '@/types';
export declare class AuthTokenModel {
    static create(userId: string, token: string, type: 'access' | 'refresh', expiresAt: Date): Promise<AuthToken>;
    static findByToken(token: string): Promise<AuthToken | null>;
    static revokeToken(token: string): Promise<void>;
    static revokeAllUserTokens(userId: string): Promise<void>;
    static cleanupExpiredTokens(): Promise<void>;
    static isTokenRevoked(token: string): Promise<boolean>;
    private static mapRowToToken;
}
//# sourceMappingURL=AuthToken.d.ts.map