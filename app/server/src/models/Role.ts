import { database } from '@/config/database';
import { v4 as uuidv4 } from 'uuid';

export interface Role {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  assignedAt: Date;
}

export class RoleModel {
  static async findAll(): Promise<Role[]> {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM roles ORDER BY createdAt DESC';
      database.getDb().all(query, [], (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => this.mapRowToRole(row)));
        }
      });
    });
  }

  static async findById(id: string): Promise<Role | null> {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM roles WHERE id = ?';
      database.getDb().get(query, [id], (err, row: any) => {
        if (err) {
          reject(err);
        } else if (!row) {
          resolve(null);
        } else {
          resolve(this.mapRowToRole(row));
        }
      });
    });
  }

  static async findByName(name: string): Promise<Role | null> {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM roles WHERE name = ?';
      database.getDb().get(query, [name], (err, row: any) => {
        if (err) {
          reject(err);
        } else if (!row) {
          resolve(null);
        } else {
          resolve(this.mapRowToRole(row));
        }
      });
    });
  }

  static async create(roleData: {
    name: string;
    description?: string;
    isSystem?: boolean;
    permissions: string[];
  }): Promise<Role> {
    return new Promise((resolve, reject) => {
      const id = uuidv4();
      const now = new Date().toISOString();
      const permissionsJson = JSON.stringify(roleData.permissions);

      const query = `
        INSERT INTO roles (id, name, description, isSystem, permissions, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      database.getDb().run(
        query,
        [
          id,
          roleData.name,
          roleData.description || null,
          roleData.isSystem ? 1 : 0,
          permissionsJson,
          now,
          now
        ],
        function (err) {
          if (err) {
            reject(err);
          } else {
            RoleModel.findById(id).then(resolve).catch(reject);
          }
        }
      );
    });
  }

  static async update(id: string, updates: {
    name?: string;
    description?: string;
    permissions?: string[];
  }): Promise<Role | null> {
    return new Promise(async (resolve, reject) => {
      try {
        // Check if role exists and is not a system role
        const existingRole = await this.findById(id);
        if (!existingRole) {
          reject(new Error('Role not found'));
          return;
        }

        if (existingRole.isSystem) {
          reject(new Error('Cannot modify system roles'));
          return;
        }

        const fields: string[] = [];
        const values: any[] = [];

        if (updates.name !== undefined) {
          fields.push('name = ?');
          values.push(updates.name);
        }

        if (updates.description !== undefined) {
          fields.push('description = ?');
          values.push(updates.description);
        }

        if (updates.permissions !== undefined) {
          fields.push('permissions = ?');
          values.push(JSON.stringify(updates.permissions));
        }

        if (fields.length === 0) {
          resolve(existingRole);
          return;
        }

        fields.push('updatedAt = ?');
        values.push(new Date().toISOString());
        values.push(id);

        const query = `UPDATE roles SET ${fields.join(', ')} WHERE id = ?`;

        database.getDb().run(query, values, async (err) => {
          if (err) {
            reject(err);
          } else {
            const updatedRole = await this.findById(id);
            resolve(updatedRole);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  static async delete(id: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        // Check if role exists and is not a system role
        const role = await this.findById(id);
        if (!role) {
          reject(new Error('Role not found'));
          return;
        }

        if (role.isSystem) {
          reject(new Error('Cannot delete system roles'));
          return;
        }

        const query = 'DELETE FROM roles WHERE id = ?';
        database.getDb().run(query, [id], (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  static async getUserRoles(userId: string): Promise<Role[]> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT r.* FROM roles r
        INNER JOIN user_roles ur ON r.id = ur.roleId
        WHERE ur.userId = ?
        ORDER BY r.createdAt ASC
      `;

      database.getDb().all(query, [userId], (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => this.mapRowToRole(row)));
        }
      });
    });
  }

  static async assignToUser(userId: string, roleId: string): Promise<UserRole> {
    return new Promise(async (resolve, reject) => {
      try {
        // Check if role exists
        const role = await this.findById(roleId);
        if (!role) {
          reject(new Error('Role not found'));
          return;
        }

        const id = uuidv4();
        const now = new Date().toISOString();

        const query = `
          INSERT INTO user_roles (id, userId, roleId, assignedAt)
          VALUES (?, ?, ?, ?)
        `;

        database.getDb().run(query, [id, userId, roleId, now], function (err) {
          if (err) {
            if (err.message.includes('UNIQUE constraint')) {
              reject(new Error('Role already assigned to user'));
            } else {
              reject(err);
            }
          } else {
            resolve({
              id,
              userId,
              roleId,
              assignedAt: new Date(now)
            });
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  static async removeFromUser(userId: string, roleId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM user_roles WHERE userId = ? AND roleId = ?';
      database.getDb().run(query, [userId, roleId], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  static async getUserPermissions(userId: string): Promise<string[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const roles = await this.getUserRoles(userId);
        const allPermissions = new Set<string>();

        roles.forEach(role => {
          role.permissions.forEach(permission => {
            allPermissions.add(permission);
          });
        });

        resolve(Array.from(allPermissions));
      } catch (error) {
        reject(error);
      }
    });
  }

  static async hasPermission(userId: string, permission: string): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        const permissions = await this.getUserPermissions(userId);
        resolve(permissions.includes(permission));
      } catch (error) {
        reject(error);
      }
    });
  }

  private static mapRowToRole(row: any): Role {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      isSystem: Boolean(row.isSystem),
      permissions: JSON.parse(row.permissions),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    };
  }
}
