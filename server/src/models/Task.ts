import { database } from '@/config/database';
import { Task, TaskStatus, TaskPriority } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export class TaskModel {
  static async findById(id: string): Promise<Task | null> {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM tasks WHERE id = ?';
      database.getDb().get(query, [id], (err, row: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? this.mapRowToTask(row) : null);
        }
      });
    });
  }

  static async findByProject(projectId: string): Promise<Task[]> {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM tasks WHERE projectId = ? ORDER BY position ASC, createdAt DESC';
      database.getDb().all(query, [projectId], (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => this.mapRowToTask(row)));
        }
      });
    });
  }

  static async findByAssignee(assigneeId: string): Promise<Task[]> {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM tasks WHERE assigneeId = ? ORDER BY createdAt DESC';
      database.getDb().all(query, [assigneeId], (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => this.mapRowToTask(row)));
        }
      });
    });
  }

  static async findByStatus(projectId: string, status: TaskStatus): Promise<Task[]> {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM tasks WHERE projectId = ? AND status = ? ORDER BY position ASC, createdAt DESC';
      database.getDb().all(query, [projectId, status], (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => this.mapRowToTask(row)));
        }
      });
    });
  }

  static async create(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const id = uuidv4();
    const now = new Date().toISOString();

    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO tasks (
          id, title, description, status, priority, projectId, assigneeId,
          reporterId, boardId, position, tags, dueDate, estimatedHours,
          actualHours, createdAt, updatedAt
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      database.getDb().run(query, [
        id,
        taskData.title,
        taskData.description,
        taskData.status,
        taskData.priority,
        taskData.projectId,
        taskData.assigneeId,
        taskData.reporterId,
        taskData.boardId,
        taskData.position,
        JSON.stringify(taskData.tags),
        taskData.dueDate ? taskData.dueDate.toISOString() : null,
        taskData.estimatedHours,
        taskData.actualHours,
        now,
        now
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          const newTask: Task = {
            id,
            title: taskData.title,
            description: taskData.description,
            status: taskData.status,
            priority: taskData.priority,
            projectId: taskData.projectId,
            assigneeId: taskData.assigneeId,
            reporterId: taskData.reporterId,
            boardId: taskData.boardId,
            position: taskData.position,
            tags: taskData.tags,
            dueDate: taskData.dueDate,
            estimatedHours: taskData.estimatedHours,
            actualHours: taskData.actualHours,
            createdAt: new Date(now),
            updatedAt: new Date(now)
          };
          resolve(newTask);
        }
      });
    });
  }

  static async update(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Task | null> {
    const now = new Date().toISOString();
    const fields = [];
    const values = [];

    if (updates.title) {
      fields.push('title = ?');
      values.push(updates.title);
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.status) {
      fields.push('status = ?');
      values.push(updates.status);
    }
    if (updates.priority) {
      fields.push('priority = ?');
      values.push(updates.priority);
    }
    if (updates.assigneeId !== undefined) {
      fields.push('assigneeId = ?');
      values.push(updates.assigneeId);
    }
    if (updates.boardId !== undefined) {
      fields.push('boardId = ?');
      values.push(updates.boardId);
    }
    if (updates.position !== undefined) {
      fields.push('position = ?');
      values.push(updates.position);
    }
    if (updates.tags) {
      fields.push('tags = ?');
      values.push(JSON.stringify(updates.tags));
    }
    if (updates.dueDate !== undefined) {
      fields.push('dueDate = ?');
      values.push(updates.dueDate ? updates.dueDate.toISOString() : null);
    }
    if (updates.estimatedHours !== undefined) {
      fields.push('estimatedHours = ?');
      values.push(updates.estimatedHours);
    }
    if (updates.actualHours !== undefined) {
      fields.push('actualHours = ?');
      values.push(updates.actualHours);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push('updatedAt = ?');
    values.push(now, id);

    return new Promise((resolve, reject) => {
      const query = `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`;

      database.getDb().run(query, values, async (err) => {
        if (err) {
          reject(err);
        } else {
          try {
            const updatedTask = await this.findById(id);
            resolve(updatedTask);
          } catch (error) {
            reject(error);
          }
        }
      });
    });
  }

  static async delete(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM tasks WHERE id = ?';

      database.getDb().run(query, [id], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  static async getNextPosition(projectId: string, status: TaskStatus): Promise<number> {
    return new Promise((resolve, reject) => {
      const query = 'SELECT MAX(position) as maxPosition FROM tasks WHERE projectId = ? AND status = ?';
      database.getDb().get(query, [projectId, status], (err, row: any) => {
        if (err) {
          reject(err);
        } else {
          resolve((row.maxPosition || 0) + 1);
        }
      });
    });
  }

  static async updatePositions(tasks: Array<{ id: string; position: number }>): Promise<void> {
    const now = new Date().toISOString();

    return new Promise((resolve, reject) => {
      const db = database.getDb();

      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        let completed = 0;
        let hasError = false;

        tasks.forEach(task => {
          db.run('UPDATE tasks SET position = ?, updatedAt = ? WHERE id = ?',
            [task.position, now, task.id],
            (err) => {
              if (err && !hasError) {
                hasError = true;
                db.run('ROLLBACK');
                reject(err);
                return;
              }

              completed++;
              if (completed === tasks.length && !hasError) {
                db.run('COMMIT', (commitErr) => {
                  if (commitErr) {
                    reject(commitErr);
                  } else {
                    resolve();
                  }
                });
              }
            }
          );
        });

        if (tasks.length === 0) {
          db.run('COMMIT');
          resolve();
        }
      });
    });
  }

  static async getTaskStats(projectId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT
          status,
          COUNT(*) as count,
          AVG(actualHours) as avgHours,
          SUM(estimatedHours) as totalEstimated,
          SUM(actualHours) as totalActual
        FROM tasks
        WHERE projectId = ?
        GROUP BY status
      `;

      database.getDb().all(query, [projectId], (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          const stats = {
            total: 0,
            byStatus: {} as any,
            totalEstimated: 0,
            totalActual: 0
          };

          rows.forEach(row => {
            stats.total += row.count;
            stats.byStatus[row.status] = {
              count: row.count,
              avgHours: row.avgHours || 0
            };
            stats.totalEstimated += row.totalEstimated || 0;
            stats.totalActual += row.totalActual || 0;
          });

          resolve(stats);
        }
      });
    });
  }

  private static mapRowToTask(row: any): Task {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status,
      priority: row.priority,
      projectId: row.projectId,
      assigneeId: row.assigneeId,
      reporterId: row.reporterId,
      boardId: row.boardId,
      position: row.position,
      tags: JSON.parse(row.tags || '[]'),
      dueDate: row.dueDate ? new Date(row.dueDate) : null,
      estimatedHours: row.estimatedHours,
      actualHours: row.actualHours,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    };
  }
}