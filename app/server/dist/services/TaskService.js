"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskService = void 0;
const Task_1 = require("@/models/Task");
const ProjectService_1 = require("./ProjectService");
class TaskService {
    static async getTasksByProject(projectId, userId) {
        const canAccess = await ProjectService_1.ProjectService.canAccessProject(projectId, userId, 'read');
        if (!canAccess) {
            return null;
        }
        return Task_1.TaskModel.findByProject(projectId);
    }
    static async getTaskById(id, userId) {
        const task = await Task_1.TaskModel.findById(id);
        if (!task) {
            return null;
        }
        const canAccess = await ProjectService_1.ProjectService.canAccessProject(task.projectId, userId, 'read');
        if (!canAccess) {
            return null;
        }
        return task;
    }
    static async createTask(taskData, userId) {
        const canAccess = await ProjectService_1.ProjectService.canAccessProject(taskData.projectId, userId, 'write');
        if (!canAccess) {
            return null;
        }
        const position = await Task_1.TaskModel.getNextPosition(taskData.projectId, 'todo');
        const newTask = await Task_1.TaskModel.create({
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
    static async updateTask(id, updates, userId) {
        const task = await Task_1.TaskModel.findById(id);
        if (!task) {
            return null;
        }
        const canAccess = await ProjectService_1.ProjectService.canAccessProject(task.projectId, userId, 'write');
        if (!canAccess) {
            return null;
        }
        const updateData = {};
        if (updates.title)
            updateData.title = updates.title;
        if (updates.description !== undefined)
            updateData.description = updates.description;
        if (updates.status)
            updateData.status = updates.status;
        if (updates.priority)
            updateData.priority = updates.priority;
        if (updates.assigneeId !== undefined)
            updateData.assigneeId = updates.assigneeId;
        if (updates.tags)
            updateData.tags = updates.tags;
        if (updates.dueDate !== undefined) {
            updateData.dueDate = updates.dueDate ? new Date(updates.dueDate) : null;
        }
        if (updates.estimatedHours !== undefined)
            updateData.estimatedHours = updates.estimatedHours;
        if (updates.actualHours !== undefined)
            updateData.actualHours = updates.actualHours;
        return Task_1.TaskModel.update(id, updateData);
    }
    static async deleteTask(id, userId) {
        const task = await Task_1.TaskModel.findById(id);
        if (!task) {
            return false;
        }
        const canAccess = await ProjectService_1.ProjectService.canAccessProject(task.projectId, userId, 'write');
        if (!canAccess) {
            return false;
        }
        await Task_1.TaskModel.delete(id);
        return true;
    }
    static async moveTask(id, newStatus, newPosition, userId) {
        const task = await Task_1.TaskModel.findById(id);
        if (!task) {
            return null;
        }
        const canAccess = await ProjectService_1.ProjectService.canAccessProject(task.projectId, userId, 'write');
        if (!canAccess) {
            return null;
        }
        return Task_1.TaskModel.update(id, {
            status: newStatus,
            position: newPosition
        });
    }
    static async updateTaskPositions(projectId, tasks, userId) {
        const canAccess = await ProjectService_1.ProjectService.canAccessProject(projectId, userId, 'write');
        if (!canAccess) {
            return false;
        }
        await Task_1.TaskModel.updatePositions(tasks);
        return true;
    }
    static async getTasksByStatus(projectId, status, userId) {
        const canAccess = await ProjectService_1.ProjectService.canAccessProject(projectId, userId, 'read');
        if (!canAccess) {
            return null;
        }
        return Task_1.TaskModel.findByStatus(projectId, status);
    }
    static async getTasksByAssignee(assigneeId, userId) {
        if (assigneeId !== userId) {
            return [];
        }
        return Task_1.TaskModel.findByAssignee(assigneeId);
    }
    static async getProjectTaskStats(projectId, userId) {
        const canAccess = await ProjectService_1.ProjectService.canAccessProject(projectId, userId, 'read');
        if (!canAccess) {
            return null;
        }
        return Task_1.TaskModel.getTaskStats(projectId);
    }
}
exports.TaskService = TaskService;
//# sourceMappingURL=TaskService.js.map