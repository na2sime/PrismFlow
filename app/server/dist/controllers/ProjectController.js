"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectController = void 0;
const ProjectService_1 = require("@/services/ProjectService");
const joi_1 = __importDefault(require("joi"));
const createProjectSchema = joi_1.default.object({
    name: joi_1.default.string().min(1).max(100).required(),
    description: joi_1.default.string().max(500).allow(''),
    settings: joi_1.default.object({
        visibility: joi_1.default.string().valid('private', 'public'),
        allowGuests: joi_1.default.boolean(),
        boardLayout: joi_1.default.string().valid('kanban', 'list', 'calendar')
    })
});
const updateProjectSchema = joi_1.default.object({
    name: joi_1.default.string().min(1).max(100),
    description: joi_1.default.string().max(500).allow(''),
    settings: joi_1.default.object({
        visibility: joi_1.default.string().valid('private', 'public'),
        allowGuests: joi_1.default.boolean(),
        boardLayout: joi_1.default.string().valid('kanban', 'list', 'calendar')
    })
});
const addMemberSchema = joi_1.default.object({
    userId: joi_1.default.string().required(),
    role: joi_1.default.string().valid('member', 'viewer').default('member')
});
class ProjectController {
    static async getAll(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'User not authenticated'
                });
                return;
            }
            const projects = await ProjectService_1.ProjectService.getAllProjects(req.user.id);
            res.json({
                success: true,
                data: { projects }
            });
        }
        catch (error) {
            console.error('Get projects error:', error);
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
            const { projectId } = req.params;
            if (!projectId) {
                res.status(400).json({
                    success: false,
                    error: 'Project ID is required'
                });
                return;
            }
            const project = await ProjectService_1.ProjectService.getProjectById(projectId, req.user.id);
            if (!project) {
                res.status(404).json({
                    success: false,
                    error: 'Project not found or access denied'
                });
                return;
            }
            const members = await ProjectService_1.ProjectService.getProjectMembers(projectId, req.user.id);
            res.json({
                success: true,
                data: {
                    project,
                    members
                }
            });
        }
        catch (error) {
            console.error('Get project error:', error);
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
            const { error } = createProjectSchema.validate(req.body);
            if (error) {
                res.status(400).json({
                    success: false,
                    error: 'Validation error',
                    details: error.details[0].message
                });
                return;
            }
            const projectData = req.body;
            const project = await ProjectService_1.ProjectService.createProject(projectData, req.user.id);
            res.status(201).json({
                success: true,
                data: { project }
            });
        }
        catch (error) {
            console.error('Create project error:', error);
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
            const { projectId } = req.params;
            if (!projectId) {
                res.status(400).json({
                    success: false,
                    error: 'Project ID is required'
                });
                return;
            }
            const { error } = updateProjectSchema.validate(req.body);
            if (error) {
                res.status(400).json({
                    success: false,
                    error: 'Validation error',
                    details: error.details[0].message
                });
                return;
            }
            const updatedProject = await ProjectService_1.ProjectService.updateProject(projectId, req.body, req.user.id);
            if (!updatedProject) {
                res.status(404).json({
                    success: false,
                    error: 'Project not found or access denied'
                });
                return;
            }
            res.json({
                success: true,
                data: { project: updatedProject }
            });
        }
        catch (error) {
            console.error('Update project error:', error);
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
            const { projectId } = req.params;
            if (!projectId) {
                res.status(400).json({
                    success: false,
                    error: 'Project ID is required'
                });
                return;
            }
            const success = await ProjectService_1.ProjectService.deleteProject(projectId, req.user.id);
            if (!success) {
                res.status(404).json({
                    success: false,
                    error: 'Project not found or access denied'
                });
                return;
            }
            res.json({
                success: true,
                message: 'Project deleted successfully'
            });
        }
        catch (error) {
            console.error('Delete project error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async addMember(req, res) {
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
            const { error } = addMemberSchema.validate(req.body);
            if (error) {
                res.status(400).json({
                    success: false,
                    error: 'Validation error',
                    details: error.details[0].message
                });
                return;
            }
            const { userId, role } = req.body;
            const success = await ProjectService_1.ProjectService.addMember(projectId, req.user.id, userId, role);
            if (!success) {
                res.status(400).json({
                    success: false,
                    error: 'Unable to add member. User may already be a member or you may not have permission.'
                });
                return;
            }
            res.json({
                success: true,
                message: 'Member added successfully'
            });
        }
        catch (error) {
            console.error('Add member error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async removeMember(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'User not authenticated'
                });
                return;
            }
            const { projectId, userId } = req.params;
            if (!projectId || !userId) {
                res.status(400).json({
                    success: false,
                    error: 'Project ID and User ID are required'
                });
                return;
            }
            const success = await ProjectService_1.ProjectService.removeMember(projectId, req.user.id, userId);
            if (!success) {
                res.status(404).json({
                    success: false,
                    error: 'Member not found or access denied'
                });
                return;
            }
            res.json({
                success: true,
                message: 'Member removed successfully'
            });
        }
        catch (error) {
            console.error('Remove member error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async getMembers(req, res) {
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
            const members = await ProjectService_1.ProjectService.getProjectMembers(projectId, req.user.id);
            if (members === null) {
                res.status(404).json({
                    success: false,
                    error: 'Project not found or access denied'
                });
                return;
            }
            res.json({
                success: true,
                data: { members }
            });
        }
        catch (error) {
            console.error('Get members error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
}
exports.ProjectController = ProjectController;
//# sourceMappingURL=ProjectController.js.map