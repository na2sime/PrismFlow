import { SetupStatus, RegisterRequest, CreateProjectRequest } from '@/types';
export declare class SetupService {
    static getSetupStatus(): Promise<SetupStatus>;
    static createAdminUser(userData: RegisterRequest): Promise<any>;
    static createFirstProject(projectData: CreateProjectRequest, adminUserId: string): Promise<any>;
    static completeSetup(): Promise<void>;
    static getProjectTemplates(): Promise<any[]>;
    static getAuthProviders(): Promise<any[]>;
}
//# sourceMappingURL=SetupService.d.ts.map