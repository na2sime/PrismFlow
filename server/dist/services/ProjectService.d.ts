import { Project, CreateProjectRequest } from '@/types';
export declare class ProjectService {
    static getAllProjects(userId: string): Promise<Project[]>;
    static getProjectById(id: string, userId: string): Promise<Project | null>;
    static createProject(projectData: CreateProjectRequest, ownerId: string): Promise<Project>;
    static updateProject(id: string, updates: Partial<Pick<Project, 'name' | 'description' | 'settings'>>, userId: string): Promise<Project | null>;
    static deleteProject(id: string, userId: string): Promise<boolean>;
    static addMember(projectId: string, userId: string, memberUserId: string, role?: 'member' | 'viewer'): Promise<boolean>;
    static removeMember(projectId: string, userId: string, memberUserId: string): Promise<boolean>;
    static getProjectMembers(projectId: string, userId: string): Promise<import("@/types").ProjectMember[]>;
    static getUserRole(projectId: string, userId: string): Promise<string | null>;
    static canAccessProject(projectId: string, userId: string, requiredRole?: 'read' | 'write' | 'admin'): Promise<boolean>;
}
//# sourceMappingURL=ProjectService.d.ts.map