"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.database = exports.Database = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
sqlite3_1.default.verbose();
const DB_PATH = path_1.default.join(process.cwd(), 'data', 'prismflow.db');
class Database {
    constructor() {
        this.db = new sqlite3_1.default.Database(DB_PATH, (err) => {
            if (err) {
                console.error('Error opening database:', err.message);
            }
            else {
                console.log('📁 Connected to SQLite database');
                this.init();
            }
        });
    }
    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
    getDb() {
        return this.db;
    }
    init() {
        this.createTables();
        this.runMigrations();
    }
    createTables() {
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
      )`
        ];
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
        console.log('✅ Database tables created successfully');
    }
    runMigrations() {
        this.db.get('PRAGMA table_info(users)', (err, result) => {
            if (err) {
                console.error('Error checking table structure:', err.message);
                return;
            }
            this.db.all('PRAGMA table_info(users)', (err, columns) => {
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
                        }
                        else {
                            console.log('✅ Added twoFactorSecret column to users table');
                        }
                    });
                }
                if (!hasTwoFactorEnabled) {
                    this.db.run('ALTER TABLE users ADD COLUMN twoFactorEnabled BOOLEAN NOT NULL DEFAULT 0', (err) => {
                        if (err && !err.message.includes('duplicate column name')) {
                            console.error('Error adding twoFactorEnabled column:', err.message);
                        }
                        else {
                            console.log('✅ Added twoFactorEnabled column to users table');
                        }
                    });
                }
            });
        });
    }
    close() {
        this.db.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
            }
            else {
                console.log('Database connection closed');
            }
        });
    }
}
exports.Database = Database;
exports.database = Database.getInstance();
//# sourceMappingURL=database.js.map