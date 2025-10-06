import { Task, TaskStatus } from '@/types';
export declare class TaskModel {
    static findById(id: string): Promise<Task | null>;
    static findByProject(projectId: string): Promise<Task[]>;
    static findByAssignee(assigneeId: string): Promise<Task[]>;
    static findByStatus(projectId: string, status: TaskStatus): Promise<Task[]>;
    static create(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task>;
    static update(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Task | null>;
    static delete(id: string): Promise<void>;
    static getNextPosition(projectId: string, status: TaskStatus): Promise<number>;
    static updatePositions(tasks: Array<{
        id: string;
        position: number;
    }>): Promise<void>;
    static getTaskStats(projectId: string): Promise<any>;
    private static mapRowToTask;
}
//# sourceMappingURL=Task.d.ts.map