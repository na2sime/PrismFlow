import { Task, CreateTaskRequest, UpdateTaskRequest, TaskStatus } from '@/types';
export declare class TaskService {
    static getTasksByProject(projectId: string, userId: string): Promise<Task[] | null>;
    static getTaskById(id: string, userId: string): Promise<Task | null>;
    static createTask(taskData: CreateTaskRequest, userId: string): Promise<Task | null>;
    static updateTask(id: string, updates: UpdateTaskRequest, userId: string): Promise<Task | null>;
    static deleteTask(id: string, userId: string): Promise<boolean>;
    static moveTask(id: string, newStatus: TaskStatus, newPosition: number, userId: string): Promise<Task | null>;
    static updateTaskPositions(projectId: string, tasks: Array<{
        id: string;
        position: number;
    }>, userId: string): Promise<boolean>;
    static getTasksByStatus(projectId: string, status: TaskStatus, userId: string): Promise<Task[] | null>;
    static getTasksByAssignee(assigneeId: string, userId: string): Promise<Task[]>;
    static getProjectTaskStats(projectId: string, userId: string): Promise<any>;
}
//# sourceMappingURL=TaskService.d.ts.map