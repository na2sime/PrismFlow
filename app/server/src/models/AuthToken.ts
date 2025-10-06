import { database } from '@/config/database';
import { AuthToken } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export class AuthTokenModel {
  static async create(userId: string, token: string, type: 'access' | 'refresh', expiresAt: Date): Promise<AuthToken> {
    const id = uuidv4();
    const now = new Date().toISOString();

    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO auth_tokens (id, userId, token, type, expiresAt, isRevoked, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      database.getDb().run(query, [
        id,
        userId,
        token,
        type,
        expiresAt.toISOString(),
        0,
        now
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          const newToken: AuthToken = {
            id,
            userId,
            token,
            type,
            expiresAt,
            isRevoked: false,
            createdAt: new Date(now)
          };
          resolve(newToken);
        }
      });
    });
  }

  static async findByToken(token: string): Promise<AuthToken | null> {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM auth_tokens WHERE token = ? AND isRevoked = 0';
      database.getDb().get(query, [token], (err, row: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? this.mapRowToToken(row) : null);
        }
      });
    });
  }

  static async revokeToken(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE auth_tokens SET isRevoked = 1 WHERE token = ?';

      database.getDb().run(query, [token], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  static async revokeAllUserTokens(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE auth_tokens SET isRevoked = 1 WHERE userId = ?';

      database.getDb().run(query, [userId], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  static async cleanupExpiredTokens(): Promise<void> {
    return new Promise((resolve, reject) => {
      const now = new Date().toISOString();
      const query = 'DELETE FROM auth_tokens WHERE expiresAt < ?';

      database.getDb().run(query, [now], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  static async isTokenRevoked(token: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const query = 'SELECT isRevoked FROM auth_tokens WHERE token = ?';
      database.getDb().get(query, [token], (err, row: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? row.isRevoked === 1 : true);
        }
      });
    });
  }

  private static mapRowToToken(row: any): AuthToken {
    return {
      id: row.id,
      userId: row.userId,
      token: row.token,
      type: row.type,
      expiresAt: new Date(row.expiresAt),
      isRevoked: row.isRevoked === 1,
      createdAt: new Date(row.createdAt)
    };
  }
}