import { ProjectModel } from '@/models/Project';
import { Project, CreateProjectRequest } from '@/types';

export class ProjectService {
  static async getAllProjects(userId: string): Promise<Project[]> {
    return ProjectModel.findByUser(userId);
  }

  static async getProjectById(id: string, userId: string): Promise<Project | null> {
    const project = await ProjectModel.findById(id);
    if (!project) {
      return null;
    }

    const userRole = await ProjectModel.getUserRole(id, userId);
    if (!userRole) {
      return null;
    }

    return project;
  }

  static async createProject(projectData: CreateProjectRequest, ownerId: string): Promise<Project> {
    const defaultSettings = {
      visibility: 'private' as const,
      allowGuests: false,
      boardLayout: 'kanban' as const
    };

    const project = await ProjectModel.create({
      name: projectData.name,
      description: projectData.description,
      ownerId,
      isActive: true,
      settings: { ...defaultSettings, ...projectData.settings }
    });

    return project;
  }

  static async updateProject(
    id: string,
    updates: Partial<Pick<Project, 'name' | 'description' | 'settings'>>,
    userId: string
  ): Promise<Project | null> {
    const userRole = await ProjectModel.getUserRole(id, userId);
    if (!userRole || (userRole !== 'owner' && userRole !== 'member')) {
      return null;
    }

    return ProjectModel.update(id, updates);
  }

  static async deleteProject(id: string, userId: string): Promise<boolean> {
    const userRole = await ProjectModel.getUserRole(id, userId);
    if (!userRole || userRole !== 'owner') {
      return false;
    }

    await ProjectModel.delete(id);
    return true;
  }

  static async addMember(projectId: string, userId: string, memberUserId: string, role: 'member' | 'viewer' = 'member'): Promise<boolean> {
    const userRole = await ProjectModel.getUserRole(projectId, userId);
    if (!userRole || (userRole !== 'owner' && userRole !== 'member')) {
      return false;
    }

    const existingRole = await ProjectModel.getUserRole(projectId, memberUserId);
    if (existingRole) {
      return false;
    }

    await ProjectModel.addMember(projectId, memberUserId, role);
    return true;
  }

  static async removeMember(projectId: string, userId: string, memberUserId: string): Promise<boolean> {
    const userRole = await ProjectModel.getUserRole(projectId, userId);
    if (!userRole || userRole !== 'owner') {
      return false;
    }

    await ProjectModel.removeMember(projectId, memberUserId);
    return true;
  }

  static async getProjectMembers(projectId: string, userId: string) {
    const userRole = await ProjectModel.getUserRole(projectId, userId);
    if (!userRole) {
      return null;
    }

    return ProjectModel.getMembers(projectId);
  }

  static async getUserRole(projectId: string, userId: string): Promise<string | null> {
    return ProjectModel.getUserRole(projectId, userId);
  }

  static async canAccessProject(projectId: string, userId: string, requiredRole: 'read' | 'write' | 'admin' = 'read'): Promise<boolean> {
    const userRole = await ProjectModel.getUserRole(projectId, userId);
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