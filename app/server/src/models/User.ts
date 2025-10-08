import { database } from '@/config/database';
import { User } from '@/types';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import speakeasy from 'speakeasy';

export class UserModel {
  static async findById(id: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE id = ?';
      database.getDb().get(query, [id], (err, row: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? this.mapRowToUser(row) : null);
        }
      });
    });
  }

  static async findByEmail(email: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE email = ? AND isActive = 1';
      database.getDb().get(query, [email], (err, row: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? this.mapRowToUser(row) : null);
        }
      });
    });
  }

  static async findByUsername(username: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE username = ? AND isActive = 1';
      database.getDb().get(query, [username], (err, row: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? this.mapRowToUser(row) : null);
        }
      });
    });
  }

  static async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'lastLogin'>): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const id = uuidv4();
    const now = new Date().toISOString();

    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO users (id, username, email, password, firstName, lastName, role, isActive, profilePicture, twoFactorSecret, twoFactorEnabled, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      database.getDb().run(query, [
        id,
        userData.username,
        userData.email,
        hashedPassword,
        userData.firstName,
        userData.lastName,
        userData.role,
        userData.isActive ? 1 : 0,
        null,
        null,
        0,
        now,
        now
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          const newUser: User = {
            id,
            username: userData.username,
            email: userData.email,
            password: hashedPassword,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role,
            isActive: userData.isActive,
            profilePicture: null,
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

  static async updateLastLogin(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const now = new Date().toISOString();
      const query = 'UPDATE users SET lastLogin = ?, updatedAt = ? WHERE id = ?';

      database.getDb().run(query, [now, now, id], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  static async updateProfile(id: string, updates: Partial<Pick<User, 'firstName' | 'lastName' | 'username'>>): Promise<User | null> {
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

      database.getDb().run(query, values, async (err) => {
        if (err) {
          reject(err);
        } else {
          try {
            const updatedUser = await this.findById(id);
            resolve(updatedUser);
          } catch (error) {
            reject(error);
          }
        }
      });
    });
  }

  static async changePassword(id: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const now = new Date().toISOString();

    return new Promise((resolve, reject) => {
      const query = 'UPDATE users SET password = ?, updatedAt = ? WHERE id = ?';

      database.getDb().run(query, [hashedPassword, now, id], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static async findAll(): Promise<User[]> {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users ORDER BY createdAt DESC';
      database.getDb().all(query, [], (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => this.mapRowToUser(row)));
        }
      });
    });
  }

  static async update(id: string, updates: Partial<User>): Promise<User> {
    const fields = [];
    const values = [];
    const now = new Date().toISOString();

    if (updates.username) {
      fields.push('username = ?');
      values.push(updates.username);
    }
    if (updates.email) {
      fields.push('email = ?');
      values.push(updates.email);
    }
    if (updates.firstName) {
      fields.push('firstName = ?');
      values.push(updates.firstName);
    }
    if (updates.lastName) {
      fields.push('lastName = ?');
      values.push(updates.lastName);
    }
    if (updates.role) {
      fields.push('role = ?');
      values.push(updates.role);
    }
    if (updates.isActive !== undefined) {
      fields.push('isActive = ?');
      values.push(updates.isActive ? 1 : 0);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push('updatedAt = ?');
    values.push(now, id);

    return new Promise((resolve, reject) => {
      const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;

      database.getDb().run(query, values, async (err) => {
        if (err) {
          reject(err);
        } else {
          try {
            const updatedUser = await this.findById(id);
            if (!updatedUser) {
              reject(new Error('User not found after update'));
            } else {
              resolve(updatedUser);
            }
          } catch (error) {
            reject(error);
          }
        }
      });
    });
  }

  static async delete(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM users WHERE id = ?';

      database.getDb().run(query, [id], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  static async countAdmins(): Promise<number> {
    return new Promise((resolve, reject) => {
      const query = 'SELECT COUNT(*) as count FROM users WHERE (role = "Administrator" OR role = "admin") AND isActive = 1';
      database.getDb().get(query, [], (err, row: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.count);
        }
      });
    });
  }

  static async setupTwoFactor(userId: string): Promise<{ secret: string; qrCode: string }> {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const secret = speakeasy.generateSecret({
      name: `PrismFlow (${user.email})`,
      issuer: 'PrismFlow',
      length: 32
    });

    return new Promise((resolve, reject) => {
      const now = new Date().toISOString();
      const query = 'UPDATE users SET twoFactorSecret = ?, updatedAt = ? WHERE id = ?';

      database.getDb().run(query, [secret.base32, now, userId], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            secret: secret.base32,
            qrCode: secret.otpauth_url || ''
          });
        }
      });
    });
  }

  static async verifyTwoFactor(userId: string, token: string): Promise<boolean> {
    const user = await this.findById(userId);
    if (!user || !user.twoFactorSecret) {
      return false;
    }

    return speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2
    });
  }

  static async enableTwoFactor(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const now = new Date().toISOString();
      const query = 'UPDATE users SET twoFactorEnabled = 1, updatedAt = ? WHERE id = ?';

      database.getDb().run(query, [now, userId], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  static async disableTwoFactor(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const now = new Date().toISOString();
      const query = 'UPDATE users SET twoFactorEnabled = 0, twoFactorSecret = NULL, updatedAt = ? WHERE id = ?';

      database.getDb().run(query, [now, userId], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  static async updateProfilePicture(userId: string, profilePicture: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const now = new Date().toISOString();
      const query = 'UPDATE users SET profilePicture = ?, updatedAt = ? WHERE id = ?';

      database.getDb().run(query, [profilePicture, now, userId], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  private static mapRowToUser(row: any): User {
    return {
      id: row.id,
      username: row.username,
      email: row.email,
      password: row.password,
      firstName: row.firstName,
      lastName: row.lastName,
      role: row.role,
      isActive: row.isActive === 1,
      profilePicture: row.profilePicture || null,
      twoFactorSecret: row.twoFactorSecret || null,
      twoFactorEnabled: row.twoFactorEnabled === 1,
      lastLogin: row.lastLogin ? new Date(row.lastLogin) : null,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    };
  }
}