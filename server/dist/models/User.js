"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const database_1 = require("@/config/database");
const bcrypt_1 = __importDefault(require("bcrypt"));
const uuid_1 = require("uuid");
const speakeasy_1 = __importDefault(require("speakeasy"));
class UserModel {
    static async findById(id) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM users WHERE id = ?';
            database_1.database.getDb().get(query, [id], (err, row) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(row ? this.mapRowToUser(row) : null);
                }
            });
        });
    }
    static async findByEmail(email) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM users WHERE email = ? AND isActive = 1';
            database_1.database.getDb().get(query, [email], (err, row) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(row ? this.mapRowToUser(row) : null);
                }
            });
        });
    }
    static async findByUsername(username) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM users WHERE username = ? AND isActive = 1';
            database_1.database.getDb().get(query, [username], (err, row) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(row ? this.mapRowToUser(row) : null);
                }
            });
        });
    }
    static async create(userData) {
        const hashedPassword = await bcrypt_1.default.hash(userData.password, 10);
        const id = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        return new Promise((resolve, reject) => {
            const query = `
        INSERT INTO users (id, username, email, password, firstName, lastName, role, isActive, twoFactorSecret, twoFactorEnabled, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
            database_1.database.getDb().run(query, [
                id,
                userData.username,
                userData.email,
                hashedPassword,
                userData.firstName,
                userData.lastName,
                userData.role,
                userData.isActive ? 1 : 0,
                null,
                0,
                now,
                now
            ], function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    const newUser = {
                        id,
                        username: userData.username,
                        email: userData.email,
                        password: hashedPassword,
                        firstName: userData.firstName,
                        lastName: userData.lastName,
                        role: userData.role,
                        isActive: userData.isActive,
                        twoFactorSecret: null,
                        twoFactorEnabled: false,
                        lastLogin: null,
                        createdAt: new Date(now),
                        updatedAt: new Date(now)
                    };
                    resolve(newUser);
                }
            });
        });
    }
    static async updateLastLogin(id) {
        return new Promise((resolve, reject) => {
            const now = new Date().toISOString();
            const query = 'UPDATE users SET lastLogin = ?, updatedAt = ? WHERE id = ?';
            database_1.database.getDb().run(query, [now, now, id], (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    static async updateProfile(id, updates) {
        const now = new Date().toISOString();
        const fields = [];
        const values = [];
        if (updates.firstName) {
            fields.push('firstName = ?');
            values.push(updates.firstName);
        }
        if (updates.lastName) {
            fields.push('lastName = ?');
            values.push(updates.lastName);
        }
        if (updates.username) {
            fields.push('username = ?');
            values.push(updates.username);
        }
        if (fields.length === 0) {
            return this.findById(id);
        }
        fields.push('updatedAt = ?');
        values.push(now, id);
        return new Promise((resolve, reject) => {
            const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
            database_1.database.getDb().run(query, values, async (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    try {
                        const updatedUser = await this.findById(id);
                        resolve(updatedUser);
                    }
                    catch (error) {
                        reject(error);
                    }
                }
            });
        });
    }
    static async changePassword(id, newPassword) {
        const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
        const now = new Date().toISOString();
        return new Promise((resolve, reject) => {
            const query = 'UPDATE users SET password = ?, updatedAt = ? WHERE id = ?';
            database_1.database.getDb().run(query, [hashedPassword, now, id], (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    static async verifyPassword(password, hashedPassword) {
        return bcrypt_1.default.compare(password, hashedPassword);
    }
    static async getAll() {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM users WHERE isActive = 1 ORDER BY createdAt DESC';
            database_1.database.getDb().all(query, [], (err, rows) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(rows.map(row => this.mapRowToUser(row)));
                }
            });
        });
    }
    static async countAdmins() {
        return new Promise((resolve, reject) => {
            const query = 'SELECT COUNT(*) as count FROM users WHERE role = "admin" AND isActive = 1';
            database_1.database.getDb().get(query, [], (err, row) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(row.count);
                }
            });
        });
    }
    static async setupTwoFactor(userId) {
        const user = await this.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        const secret = speakeasy_1.default.generateSecret({
            name: `PrismFlow (${user.email})`,
            issuer: 'PrismFlow',
            length: 32
        });
        return new Promise((resolve, reject) => {
            const now = new Date().toISOString();
            const query = 'UPDATE users SET twoFactorSecret = ?, updatedAt = ? WHERE id = ?';
            database_1.database.getDb().run(query, [secret.base32, now, userId], (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({
                        secret: secret.base32,
                        qrCode: secret.otpauth_url || ''
                    });
                }
            });
        });
    }
    static async verifyTwoFactor(userId, token) {
        const user = await this.findById(userId);
        if (!user || !user.twoFactorSecret) {
            return false;
        }
        return speakeasy_1.default.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token,
            window: 2
        });
    }
    static async enableTwoFactor(userId) {
        return new Promise((resolve, reject) => {
            const now = new Date().toISOString();
            const query = 'UPDATE users SET twoFactorEnabled = 1, updatedAt = ? WHERE id = ?';
            database_1.database.getDb().run(query, [now, userId], (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    static async disableTwoFactor(userId) {
        return new Promise((resolve, reject) => {
            const now = new Date().toISOString();
            const query = 'UPDATE users SET twoFactorEnabled = 0, twoFactorSecret = NULL, updatedAt = ? WHERE id = ?';
            database_1.database.getDb().run(query, [now, userId], (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    static mapRowToUser(row) {
        return {
            id: row.id,
            username: row.username,
            email: row.email,
            password: row.password,
            firstName: row.firstName,
            lastName: row.lastName,
            role: row.role,
            isActive: row.isActive === 1,
            twoFactorSecret: row.twoFactorSecret || null,
            twoFactorEnabled: row.twoFactorEnabled === 1,
            lastLogin: row.lastLogin ? new Date(row.lastLogin) : null,
            createdAt: new Date(row.createdAt),
            updatedAt: new Date(row.updatedAt)
        };
    }
}
exports.UserModel = UserModel;
//# sourceMappingURL=User.js.map