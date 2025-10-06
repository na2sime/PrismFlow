"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectService = void 0;
const Project_1 = require("@/models/Project");
class ProjectService {
    static async getAllProjects(userId) {
        return Project_1.ProjectModel.findByUser(userId);
    }
    static async getProjectById(id, userId) {
        const project = await Project_1.ProjectModel.findById(id);
        if (!project) {
            return null;
        }
        const userRole = await Project_1.ProjectModel.getUserRole(id, userId);
        if (!userRole) {
            return null;
        }
        return project;
    }
    static async createProject(projectData, ownerId) {
        const defaultSettings = {
            visibility: 'private',
            allowGuests: false,
            boardLayout: 'kanban'
        };
        const project = await Project_1.ProjectModel.create({
            name: projectData.name,
            description: projectData.description,
            ownerId,
            isActive: true,
            settings: { ...defaultSettings, ...projectData.settings }
        });
        return project;
    }
    static async updateProject(id, updates, userId) {
        const userRole = await Project_1.ProjectModel.getUserRole(id, userId);
        if (!userRole || (userRole !== 'owner' && userRole !== 'member')) {
            return null;
        }
        return Project_1.ProjectModel.update(id, updates);
    }
    static async deleteProject(id, userId) {
        const userRole = await Project_1.ProjectModel.getUserRole(id, userId);
        if (!userRole || userRole !== 'owner') {
            return false;
        }
        await Project_1.ProjectModel.delete(id);
        return true;
    }
    static async addMember(projectId, userId, memberUserId, role = 'member') {
        const userRole = await Project_1.ProjectModel.getUserRole(projectId, userId);
        if (!userRole || (userRole !== 'owner' && userRole !== 'member')) {
            return false;
        }
        const existingRole = await Project_1.ProjectModel.getUserRole(projectId, memberUserId);
        if (existingRole) {
            return false;
        }
        await Project_1.ProjectModel.addMember(projectId, memberUserId, role);
        return true;
    }
    static async removeMember(projectId, userId, memberUserId) {
        const userRole = await Project_1.ProjectModel.getUserRole(projectId, userId);
        if (!userRole || userRole !== 'owner') {
            return false;
        }
        await Project_1.ProjectModel.removeMember(projectId, memberUserId);
        return true;
    }
    static async getProjectMembers(projectId, userId) {
        const userRole = await Project_1.ProjectModel.getUserRole(projectId, userId);
        if (!userRole) {
            return null;
        }
        return Project_1.ProjectModel.getMembers(projectId);
    }
    static async getUserRole(projectId, userId) {
        return Project_1.ProjectModel.getUserRole(projectId, userId);
    }
    static async canAccessProject(projectId, userId, requiredRole = 'read') {
        const userRole = await Project_1.ProjectModel.getUserRole(projectId, userId);
        if (!userRole) {
            return false;
        }
        switch (requiredRole) {
            case 'read':
                return ['owner', 'member', 'viewer'].includes(userRole);
            case 'write':
                return ['owner', 'member'].includes(userRole);
            case 'admin':
                return userRole === 'owner';
            default:
                return false;
        }
    }
}
exports.ProjectService = ProjectService;
//# sourceMappingURL=ProjectService.js.map