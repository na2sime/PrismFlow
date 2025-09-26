"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthTokenModel = void 0;
const database_1 = require("@/config/database");
const uuid_1 = require("uuid");
class AuthTokenModel {
    static async create(userId, token, type, expiresAt) {
        const id = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        return new Promise((resolve, reject) => {
            const query = `
        INSERT INTO auth_tokens (id, userId, token, type, expiresAt, isRevoked, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
            database_1.database.getDb().run(query, [
                id,
                userId,
                token,
                type,
                expiresAt.toISOString(),
                0,
                now
            ], function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    const newToken = {
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
    static async findByToken(token) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM auth_tokens WHERE token = ? AND isRevoked = 0';
            database_1.database.getDb().get(query, [token], (err, row) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(row ? this.mapRowToToken(row) : null);
                }
            });
        });
    }
    static async revokeToken(token) {
        return new Promise((resolve, reject) => {
            const query = 'UPDATE auth_tokens SET isRevoked = 1 WHERE token = ?';
            database_1.database.getDb().run(query, [token], (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    static async revokeAllUserTokens(userId) {
        return new Promise((resolve, reject) => {
            const query = 'UPDATE auth_tokens SET isRevoked = 1 WHERE userId = ?';
            database_1.database.getDb().run(query, [userId], (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    static async cleanupExpiredTokens() {
        return new Promise((resolve, reject) => {
            const now = new Date().toISOString();
            const query = 'DELETE FROM auth_tokens WHERE expiresAt < ?';
            database_1.database.getDb().run(query, [now], (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    static async isTokenRevoked(token) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT isRevoked FROM auth_tokens WHERE token = ?';
            database_1.database.getDb().get(query, [token], (err, row) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(row ? row.isRevoked === 1 : true);
                }
            });
        });
    }
    static mapRowToToken(row) {
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
exports.AuthTokenModel = AuthTokenModel;
//# sourceMappingURL=AuthToken.js.map