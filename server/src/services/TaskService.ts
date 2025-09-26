import { TaskModel } from '@/models/Task';
import { ProjectService } from './ProjectService';
import { Task, CreateTaskRequest, UpdateTaskRequest, TaskStatus } from '@/types';

export class TaskService {
  static async getTasksByProject(projectId: string, userId: string): Promise<Task[] | null> {
    const canAccess = await ProjectService.canAccessProject(projectId, userId, 'read');
    if (!canAccess) {
      return null;
    }

    return TaskModel.findByProject(projectId);
  }

  static async getTaskById(id: string, userId: string): Promise<Task | null> {
    const task = await TaskModel.findById(id);
    if (!task) {
      return null;
    }

    const canAccess = await ProjectService.canAccessProject(task.projectId, userId, 'read');
    if (!canAccess) {
      return null;
    }

    return task;
  }

  static async createTask(taskData: CreateTaskRequest, userId: string): Promise<Task | null> {
    const canAccess = await ProjectService.canAccessProject(taskData.projectId, userId, 'write');
    if (!canAccess) {
      return null;
    }

    const position = await TaskModel.getNextPosition(taskData.projectId, 'todo');

    const newTask = await TaskModel.create({
      title: taskData.title,
      description: taskData.description,
      status: 'todo',
      priority: taskData.priority || 'medium',
      projectId: taskData.projectId,
      assigneeId: taskData.assigneeId || null,
      reporterId: userId,
      boardId: null,
      position,
      tags: taskData.tags || [],
      dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
      estimatedHours: taskData.estimatedHours || null,
      actualHours: null
    });

    return newTask;
  }

  static async updateTask(id: string, updates: UpdateTaskRequest, userId: string): Promise<Task | null> {
    const task = await TaskModel.findById(id);
    if (!task) {
      return null;
    }

    const canAccess = await ProjectService.canAccessProject(task.projectId, userId, 'write');
    if (!canAccess) {
      return null;
    }

    const updateData: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>> = {};

    if (updates.title) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.status) updateData.status = updates.status;
    if (updates.priority) updateData.priority = updates.priority;
    if (updates.assigneeId !== undefined) updateData.assigneeId = updates.assigneeId;
    if (updates.tags) updateData.tags = updates.tags;
    if (updates.dueDate !== undefined) {
      updateData.dueDate = updates.dueDate ? new Date(updates.dueDate) : null;
    }
    if (updates.estimatedHours !== undefined) updateData.estimatedHours = updates.estimatedHours;
    if (updates.actualHours !== undefined) updateData.actualHours = updates.actualHours;

    return TaskModel.update(id, updateData);
  }

  static async deleteTask(id: string, userId: string): Promise<boolean> {
    const task = await TaskModel.findById(id);
    if (!task) {
      return false;
    }

    const canAccess = await ProjectService.canAccessProject(task.projectId, userId, 'write');
    if (!canAccess) {
      return false;
    }

    await TaskModel.delete(id);
    return true;
  }

  static async moveTask(id: string, newStatus: TaskStatus, newPosition: number, userId: string): Promise<Task | null> {
    const task = await TaskModel.findById(id);
    if (!task) {
      return null;
    }

    const canAccess = await ProjectService.canAccessProject(task.projectId, userId, 'write');
    if (!canAccess) {
      return null;
    }

    return TaskModel.update(id, {
      status: newStatus,
      position: newPosition
    });
  }

  static async updateTaskPositions(
    projectId: string,
    tasks: Array<{ id: string; position: number }>,
    userId: string
  ): Promise<boolean> {
    const canAccess = await ProjectService.canAccessProject(projectId, userId, 'write');
    if (!canAccess) {
      return false;
    }

    await TaskModel.updatePositions(tasks);
    return true;
  }

  static async getTasksByStatus(projectId: string, status: TaskStatus, userId: string): Promise<Task[] | null> {
    const canAccess = await ProjectService.canAccessProject(projectId, userId, 'read');
    if (!canAccess) {
      return null;
    }

    return TaskModel.findByStatus(projectId, status);
  }

  static async getTasksByAssignee(assigneeId: string, userId: string): Promise<Task[]> {
    if (assigneeId !== userId) {
      return [];
    }

    return TaskModel.findByAssignee(assigneeId);
  }

  static async getProjectTaskStats(projectId: string, userId: string): Promise<any> {
    const canAccess = await ProjectService.canAccessProject(projectId, userId, 'read');
    if (!canAccess) {
      return null;
    }

    return TaskModel.getTaskStats(projectId);
  }
}