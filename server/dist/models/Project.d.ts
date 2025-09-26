import { Project, ProjectMember } from '@/types';
export declare class ProjectModel {
    static findById(id: string): Promise<Project | null>;
    static findByOwner(ownerId: string): Promise<Project[]>;
    static findByUser(userId: string): Promise<Project[]>;
    static create(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project>;
    static update(id: string, updates: Partial<Pick<Project, 'name' | 'description' | 'settings'>>): Promise<Project | null>;
    static delete(id: string): Promise<void>;
    static addMember(projectId: string, userId: string, role?: 'owner' | 'member' | 'viewer'): Promise<ProjectMember>;
    static getMembers(projectId: string): Promise<ProjectMember[]>;
    static removeMember(projectId: string, userId: string): Promise<void>;
    static getUserRole(projectId: string, userId: string): Promise<string | null>;
    static count(): Promise<number>;
    private static mapRowToProject;
}
//# sourceMappingURL=Project.d.ts.map