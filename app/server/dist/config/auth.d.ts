import { User } from '@/types';
export declare const JWT_SECRET: string;
export declare const JWT_REFRESH_SECRET: string;
export declare const JWT_EXPIRES_IN: string;
export declare const JWT_REFRESH_EXPIRES_IN: string;
export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
}
export declare const generateAccessToken: (user: User) => string;
export declare const generateRefreshToken: (user: User) => string;
export declare const verifyAccessToken: (token: string) => JWTPayload | null;
export declare const verifyRefreshToken: (token: string) => JWTPayload | null;
export declare const extractTokenFromHeader: (authHeader: string | undefined) => string | null;
//# sourceMappingURL=auth.d.ts.map