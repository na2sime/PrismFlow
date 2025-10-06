import sqlite3 from 'sqlite3';
export declare class Database {
    private static instance;
    private db;
    private constructor();
    static getInstance(): Database;
    getDb(): sqlite3.Database;
    private init;
    private createTables;
    private runMigrations;
    close(): void;
}
export declare const database: Database;
//# sourceMappingURL=database.d.ts.map