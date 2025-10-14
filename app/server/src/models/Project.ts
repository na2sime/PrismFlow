import { database } from '@/config/database';
import { Project, ProjectSettings, ProjectMember } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export class ProjectModel {
  static async findById(id: string): Promise<Project | null> {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM projects WHERE id = ? AND isActive = 1';
      database.getDb().get(query, [id], (err, row: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? this.mapRowToProject(row) : null);
        }
      });
    });
  }

  static async findByOwner(ownerId: string): Promise<Project[]> {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM projects WHERE ownerId = ? AND isActive = 1 ORDER BY createdAt DESC';
      database.getDb().all(query, [ownerId], (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => this.mapRowToProject(row)));
        }
      });
    });
  }

  static async findByUser(userId: string): Promise<Project[]> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT DISTINCT p.* FROM projects p
        LEFT JOIN project_members pm ON p.id = pm.projectId
        WHERE (p.ownerId = ? OR pm.userId = ?) AND p.isActive = 1
        ORDER BY p.createdAt DESC
      `;
      database.getDb().all(query, [userId, userId], (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => this.mapRowToProject(row)));
        }
      });
    });
  }

  static async create(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const id = uuidv4();
    const now = new Date().toISOString();

    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO projects (id, name, description, ownerId, isActive, settings, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      database.getDb().run(query, [
        id,
        projectData.name,
        projectData.description,
        projectData.ownerId,
        projectData.isActive ? 1 : 0,
        JSON.stringify(projectData.settings),
        now,
        now
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          const newProject: Project = {
            id,
            name: projectData.name,
            description: projectData.description,
            ownerId: projectData.ownerId,
            isActive: projectData.isActive,
            settings: projectData.settings,
            createdAt: new Date(now),
            updatedAt: new Date(now)
          };
          resolve(newProject);
        }
      });
    });
  }

  static async update(id: string, updates: Partial<Pick<Project, 'name' | 'description' | 'settings'>>): Promise<Project | null> {
    const now = new Date().toISOString();
    const fields = [];
    const values = [];

    if (updates.name) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.settings) {
      fields.push('settings = ?');
      values.push(JSON.stringify(updates.settings));
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push('updatedAt = ?');
    values.push(now, id);

    return new Promise((resolve, reject) => {
      const query = `UPDATE projects SET ${fields.join(', ')} WHERE id = ?`;

      database.getDb().run(query, values, async (err) => {
        if (err) {
          reject(err);
        } else {
          try {
            const updatedProject = await this.findById(id);
            resolve(updatedProject);
          } catch (error) {
            reject(error);
          }
        }
      });
    });
  }

  static async delete(id: string): Promise<void> {
    const now = new Date().toISOString();

    return new Promise((resolve, reject) => {
      const query = 'UPDATE projects SET isActive = 0, updatedAt = ? WHERE id = ?';

      database.getDb().run(query, [now, id], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  static async addMember(projectId: string, userId: string, role: 'owner' | 'member' | 'viewer' = 'member'): Promise<ProjectMember> {
    const id = uuidv4();
    const now = new Date().toISOString();

    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO project_members (id, projectId, userId, role, joinedAt)
        VALUES (?, ?, ?, ?, ?)
      `;

      database.getDb().run(query, [id, projectId, userId, role, now], function(err) {
        if (err) {
          reject(err);
        } else {
          const newMember: ProjectMember = {
            id,
            projectId,
            userId,
            role,
            joinedAt: new Date(now)
          };
          resolve(newMember);
        }
      });
    });
  }

  static async getMembers(projectId: string): Promise<ProjectMember[]> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT pm.*, u.username, u.firstName, u.lastName, u.email, u.profilePicture
        FROM project_members pm
        JOIN users u ON pm.userId = u.id
        WHERE pm.projectId = ?
        ORDER BY pm.joinedAt ASC
      `;

      database.getDb().all(query, [projectId], (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => ({
            id: row.id,
            projectId: row.projectId,
            userId: row.userId,
            role: row.role,
            joinedAt: new Date(row.joinedAt),
            username: row.username,
            firstName: row.firstName,
            lastName: row.lastName,
            email: row.email,
            profilePicture: row.profilePicture
          })));
        }
      });
    });
  }

  static async updateMemberRole(projectId: string, userId: string, role: 'member' | 'viewer'): Promise<void> {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE project_members SET role = ? WHERE projectId = ? AND userId = ?';

      database.getDb().run(query, [role, projectId, userId], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  static async removeMember(projectId: string, userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM project_members WHERE projectId = ? AND userId = ?';

      database.getDb().run(query, [projectId, userId], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  static async getUserRole(projectId: string, userId: string): Promise<string | null> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT role FROM project_members WHERE projectId = ? AND userId = ?
        UNION
        SELECT 'owner' as role FROM projects WHERE id = ? AND ownerId = ?
      `;

      database.getDb().get(query, [projectId, userId, projectId, userId], (err, row: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? row.role : null);
        }
      });
    });
  }

  static async count(): Promise<number> {
    return new Promise((resolve, reject) => {
      const query = 'SELECT COUNT(*) as count FROM projects WHERE isActive = 1';
      database.getDb().get(query, [], (err, row: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.count);
        }
      });
    });
  }

  private static mapRowToProject(row: any): Project {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      ownerId: row.ownerId,
      isActive: row.isActive === 1,
      settings: JSON.parse(row.settings || '{}'),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    };
  }
}