import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

sqlite3.verbose();

const DB_PATH = path.join(process.cwd(), 'data', 'prismflow.db');

export class Database {
  private static instance: Database;
  private db: sqlite3.Database;

  private constructor() {
    // Ensure data directory exists
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    this.db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
      } else {
        console.log('📁 Connected to SQLite database');
        this.init();
      }
    });
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public getDb(): sqlite3.Database {
    return this.db;
  }

  private init(): void {
    this.createTables();
    this.runMigrations();
  }

  private createTables(): void {
    const tables = [
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        isActive BOOLEAN NOT NULL DEFAULT 1,
        twoFactorSecret TEXT NULL,
        twoFactorEnabled BOOLEAN NOT NULL DEFAULT 0,
        lastLogin DATETIME NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        ownerId TEXT NOT NULL,
        isActive BOOLEAN NOT NULL DEFAULT 1,
        settings TEXT NOT NULL DEFAULT '{}',
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ownerId) REFERENCES users (id)
      )`,

      `CREATE TABLE IF NOT EXISTS project_members (
        id TEXT PRIMARY KEY,
        projectId TEXT NOT NULL,
        userId TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'member',
        joinedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (projectId) REFERENCES projects (id),
        FOREIGN KEY (userId) REFERENCES users (id),
        UNIQUE(projectId, userId)
      )`,

      `CREATE TABLE IF NOT EXISTS boards (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        projectId TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'kanban',
        columns TEXT NOT NULL DEFAULT '[]',
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (projectId) REFERENCES projects (id)
      )`,

      `CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'todo',
        priority TEXT NOT NULL DEFAULT 'medium',
        projectId TEXT NOT NULL,
        assigneeId TEXT NULL,
        reporterId TEXT NOT NULL,
        boardId TEXT NULL,
        position INTEGER NOT NULL DEFAULT 0,
        tags TEXT NOT NULL DEFAULT '[]',
        dueDate DATETIME NULL,
        estimatedHours INTEGER NULL,
        actualHours INTEGER NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (projectId) REFERENCES projects (id),
        FOREIGN KEY (assigneeId) REFERENCES users (id),
        FOREIGN KEY (reporterId) REFERENCES users (id),
        FOREIGN KEY (boardId) REFERENCES boards (id)
      )`,

      `CREATE TABLE IF NOT EXISTS auth_tokens (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        token TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL,
        expiresAt DATETIME NOT NULL,
        isRevoked BOOLEAN NOT NULL DEFAULT 0,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id)
      )`,

      `CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS roles (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        isSystem BOOLEAN NOT NULL DEFAULT 0,
        permissions TEXT NOT NULL DEFAULT '[]',
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS user_roles (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        roleId TEXT NOT NULL,
        assignedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (roleId) REFERENCES roles (id) ON DELETE CASCADE,
        UNIQUE(userId, roleId)
      )`,

      `CREATE TABLE IF NOT EXISTS teams (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        leaderId TEXT NULL,
        isActive BOOLEAN NOT NULL DEFAULT 1,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (leaderId) REFERENCES users (id)
      )`,

      `CREATE TABLE IF NOT EXISTS team_members (
        id TEXT PRIMARY KEY,
        teamId TEXT NOT NULL,
        userId TEXT NOT NULL,
        joinedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (teamId) REFERENCES teams (id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE,
        UNIQUE(teamId, userId)
      )`
    ];

    // Use serialize to ensure tables are created in order before other operations
    this.db.serialize(() => {
      tables.forEach((table) => {
        this.db.run(table, (err) => {
          if (err) {
            console.error('Error creating table:', err.message);
          }
        });
      });

      this.db.run(`INSERT OR IGNORE INTO app_settings (key, value) VALUES ('setup_completed', 'false')`, (err) => {
        if (err) {
          console.error('Error inserting setup status:', err.message);
        }
      });

      // Initialize default roles after tables are created
      this.initializeDefaultRoles();

      console.log('✅ Database tables created successfully');
    });
  }

  private initializeDefaultRoles(): void {
    const { v4: uuidv4 } = require('uuid');
    const { DEFAULT_ROLES } = require('./permissions');

    Object.entries(DEFAULT_ROLES).forEach(([key, role]: [string, any]) => {
      const id = uuidv4();
      const permissionsJson = JSON.stringify(role.permissions);

      this.db.run(
        `INSERT OR IGNORE INTO roles (id, name, description, isSystem, permissions) VALUES (?, ?, ?, ?, ?)`,
        [id, role.name, role.description, role.isSystem ? 1 : 0, permissionsJson],
        (err) => {
          if (err && !err.message.includes('UNIQUE constraint')) {
            console.error(`Error creating role ${role.name}:`, err.message);
          }
        }
      );
    });
  }

  private runMigrations(): void {
    this.db.get('PRAGMA table_info(users)', (err, result) => {
      if (err) {
        console.error('Error checking table structure:', err.message);
        return;
      }

      this.db.all('PRAGMA table_info(users)', (err, columns: any[]) => {
        if (err) {
          console.error('Error getting table info:', err.message);
          return;
        }

        const hasTwoFactorSecret = columns.some(col => col.name === 'twoFactorSecret');
        const hasTwoFactorEnabled = columns.some(col => col.name === 'twoFactorEnabled');

        if (!hasTwoFactorSecret) {
          this.db.run('ALTER TABLE users ADD COLUMN twoFactorSecret TEXT NULL', (err) => {
            if (err && !err.message.includes('duplicate column name')) {
              console.error('Error adding twoFactorSecret column:', err.message);
            } else {
              console.log('✅ Added twoFactorSecret column to users table');
            }
          });
        }

        if (!hasTwoFactorEnabled) {
          this.db.run('ALTER TABLE users ADD COLUMN twoFactorEnabled BOOLEAN NOT NULL DEFAULT 0', (err) => {
            if (err && !err.message.includes('duplicate column name')) {
              console.error('Error adding twoFactorEnabled column:', err.message);
            } else {
              console.log('✅ Added twoFactorEnabled column to users table');
            }
          });
        }
      });
    });
  }

  public close(): void {
    this.db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed');
      }
    });
  }
}

export const database = Database.getInstance();