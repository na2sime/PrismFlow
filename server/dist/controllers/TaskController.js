"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskController = void 0;
const TaskService_1 = require("@/services/TaskService");
const joi_1 = __importDefault(require("joi"));
const createTaskSchema = joi_1.default.object({
    title: joi_1.default.string().min(1).max(200).required(),
    description: joi_1.default.string().max(2000).allow(''),
    projectId: joi_1.default.string().required(),
    assigneeId: joi_1.default.string().allow(null),
    priority: joi_1.default.string().valid('low', 'medium', 'high', 'critical').default('medium'),
    dueDate: joi_1.default.string().isoDate().allow(null),
    tags: joi_1.default.array().items(joi_1.default.string()),
    estimatedHours: joi_1.default.number().min(0).allow(null)
});
const updateTaskSchema = joi_1.default.object({
    title: joi_1.default.string().min(1).max(200),
    description: joi_1.default.string().max(2000).allow(''),
    status: joi_1.default.string().valid('todo', 'in_progress', 'review', 'done', 'cancelled'),
    priority: joi_1.default.string().valid('low', 'medium', 'high', 'critical'),
    assigneeId: joi_1.default.string().allow(null),
    dueDate: joi_1.default.string().isoDate().allow(null),
    tags: joi_1.default.array().items(joi_1.default.string()),
    estimatedHours: joi_1.default.number().min(0).allow(null),
    actualHours: joi_1.default.number().min(0).allow(null)
});
const moveTaskSchema = joi_1.default.object({
    status: joi_1.default.string().valid('todo', 'in_progress', 'review', 'done', 'cancelled').required(),
    position: joi_1.default.number().min(0).required()
});
const updatePositionsSchema = joi_1.default.object({
    tasks: joi_1.default.array().items(joi_1.default.object({
        id: joi_1.default.string().required(),
        position: joi_1.default.number().min(0).required()
    })).required()
});
class TaskController {
    static async getByProject(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'User not authenticated'
                });
                return;
            }
            const { projectId } = req.params;
            if (!projectId) {
                res.status(400).json({
                    success: false,
                    error: 'Project ID is required'
                });
                return;
            }
            const tasks = await TaskService_1.TaskService.getTasksByProject(projectId, req.user.id);
            if (tasks === null) {
                res.status(404).json({
                    success: false,
                    error: 'Project not found or access denied'
                });
                return;
            }
            res.json({
                success: true,
                data: { tasks }
            });
        }
        catch (error) {
            console.error('Get tasks by project error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async getById(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'User not authenticated'
                });
                return;
            }
            const { taskId } = req.params;
            if (!taskId) {
                res.status(400).json({
                    success: false,
                    error: 'Task ID is required'
                });
                return;
            }
            const task = await TaskService_1.TaskService.getTaskById(taskId, req.user.id);
            if (!task) {
                res.status(404).json({
                    success: false,
                    error: 'Task not found or access denied'
                });
                return;
            }
            res.json({
                success: true,
                data: { task }
            });
        }
        catch (error) {
            console.error('Get task error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async create(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'User not authenticated'
                });
                return;
            }
            const { error } = createTaskSchema.validate(req.body);
            if (error) {
                res.status(400).json({
                    success: false,
                    error: 'Validation error',
                    details: error.details[0].message
                });
                return;
            }
            const taskData = req.body;
            const task = await TaskService_1.TaskService.createTask(taskData, req.user.id);
            if (!task) {
                res.status(404).json({
                    success: false,
                    error: 'Project not found or access denied'
                });
                return;
            }
            res.status(201).json({
                success: true,
                data: { task }
            });
        }
        catch (error) {
            console.error('Create task error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async update(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'User not authenticated'
                });
                return;
            }
            const { taskId } = req.params;
            if (!taskId) {
                res.status(400).json({
                    success: false,
                    error: 'Task ID is required'
                });
                return;
            }
            const { error } = updateTaskSchema.validate(req.body);
            if (error) {
                res.status(400).json({
                    success: false,
                    error: 'Validation error',
                    details: error.details[0].message
                });
                return;
            }
            const updates = req.body;
            const task = await TaskService_1.TaskService.updateTask(taskId, updates, req.user.id);
            if (!task) {
                res.status(404).json({
                    success: false,
                    error: 'Task not found or access denied'
                });
                return;
            }
            res.json({
                success: true,
                data: { task }
            });
        }
        catch (error) {
            console.error('Update task error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async delete(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'User not authenticated'
                });
                return;
            }
            const { taskId } = req.params;
            if (!taskId) {
                res.status(400).json({
                    success: false,
                    error: 'Task ID is required'
                });
                return;
            }
            const success = await TaskService_1.TaskService.deleteTask(taskId, req.user.id);
            if (!success) {
                res.status(404).json({
                    success: false,
                    error: 'Task not found or access denied'
                });
                return;
            }
            res.json({
                success: true,
                message: 'Task deleted successfully'
            });
        }
        catch (error) {
            console.error('Delete task error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async move(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'User not authenticated'
                });
                return;
            }
            const { taskId } = req.params;
            if (!taskId) {
                res.status(400).json({
                    success: false,
                    error: 'Task ID is required'
                });
                return;
            }
            const { error } = moveTaskSchema.validate(req.body);
            if (error) {
                res.status(400).json({
                    success: false,
                    error: 'Validation error',
                    details: error.details[0].message
                });
                return;
            }
            const { status, position } = req.body;
            const task = await TaskService_1.TaskService.moveTask(taskId, status, position, req.user.id);
            if (!task) {
                res.status(404).json({
                    success: false,
                    error: 'Task not found or access denied'
                });
                return;
            }
            res.json({
                success: true,
                data: { task }
            });
        }
        catch (error) {
            console.error('Move task error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async updatePositions(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'User not authenticated'
                });
                return;
            }
            const { projectId } = req.params;
            if (!projectId) {
                res.status(400).json({
                    success: false,
                    error: 'Project ID is required'
                });
                return;
            }
            const { error } = updatePositionsSchema.validate(req.body);
            if (error) {
                res.status(400).json({
                    success: false,
                    error: 'Validation error',
                    details: error.details[0].message
                });
                return;
            }
            const { tasks } = req.body;
            const success = await TaskService_1.TaskService.updateTaskPositions(projectId, tasks, req.user.id);
            if (!success) {
                res.status(404).json({
                    success: false,
                    error: 'Project not found or access denied'
                });
                return;
            }
            res.json({
                success: true,
                message: 'Task positions updated successfully'
            });
        }
        catch (error) {
            console.error('Update task positions error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async getByStatus(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'User not authenticated'
                });
                return;
            }
            const { projectId, status } = req.params;
            if (!projectId || !status) {
                res.status(400).json({
                    success: false,
                    error: 'Project ID and status are required'
                });
                return;
            }
            const validStatuses = ['todo', 'in_progress', 'review', 'done', 'cancelled'];
            if (!validStatuses.includes(status)) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid status'
                });
                return;
            }
            const tasks = await TaskService_1.TaskService.getTasksByStatus(projectId, status, req.user.id);
            if (tasks === null) {
                res.status(404).json({
                    success: false,
                    error: 'Project not found or access denied'
                });
                return;
            }
            res.json({
                success: true,
                data: { tasks }
            });
        }
        catch (error) {
            console.error('Get tasks by status error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async getStats(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'User not authenticated'
                });
                return;
            }
            const { projectId } = req.params;
            if (!projectId) {
                res.status(400).json({
                    success: false,
                    error: 'Project ID is required'
                });
                return;
            }
            const stats = await TaskService_1.TaskService.getProjectTaskStats(projectId, req.user.id);
            if (stats === null) {
                res.status(404).json({
                    success: false,
                    error: 'Project not found or access denied'
                });
                return;
            }
            res.json({
                success: true,
                data: { stats }
            });
        }
        catch (error) {
            console.error('Get task stats error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async getMyTasks(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'User not authenticated'
                });
                return;
            }
            const tasks = await TaskService_1.TaskService.getTasksByAssignee(req.user.id, req.user.id);
            res.json({
                success: true,
                data: { tasks }
            });
        }
        catch (error) {
            console.error('Get my tasks error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
}
exports.TaskController = TaskController;
//# sourceMappingURL=TaskController.js.map