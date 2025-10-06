import {database} from '@/config/database';
import {UserModel} from '@/models/User';
import {ProjectModel} from '@/models/Project';
import {SetupStatus, RegisterRequest, CreateProjectRequest} from '@/types';

export class SetupService {
    static async getSetupStatus(): Promise<SetupStatus> {
        return new Promise((resolve, reject) => {
            const query = 'SELECT value FROM app_settings WHERE key = "setup_completed"';
            database.getDb().get(query, [], async (err, row: any) => {
                if (err) {
                    reject(err);
                } else {
                    const isCompleted = row && row.value === 'true';
                    const adminCount = await UserModel.countAdmins();
                    const projectCount = await ProjectModel.count();

                    resolve({
                        isCompleted,
                        hasAdminUser: adminCount > 0,
                        hasFirstProject: projectCount > 0,
                        version: '1.0.0'
                    });
                }
            });
        });
    }

    static async createAdminUser(userData: RegisterRequest): Promise<any> {
        const adminCount = await UserModel.countAdmins();
        if (adminCount > 0) {
            throw new Error('Admin user already exists');
        }

        const existingUserByEmail = await UserModel.findByEmail(userData.email);
        if (existingUserByEmail) {
            throw new Error('Email already exists');
        }

        const existingUserByUsername = await UserModel.findByUsername(userData.username);
        if (existingUserByUsername) {
            throw new Error('Username already exists');
        }

        const adminUser = await UserModel.create({
            username: userData.username,
            email: userData.email,
            password: userData.password,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: 'Administrator',
            isActive: true,
            twoFactorSecret: null,
            twoFactorEnabled: false
        });

        const userWithoutPassword = {...adminUser};
        delete (userWithoutPassword as any).password;
        delete (userWithoutPassword as any).twoFactorSecret;

        return userWithoutPassword;
    }

    static async createFirstProject(projectData: CreateProjectRequest, adminUserId: string): Promise<any> {
        const projectCount = await ProjectModel.count();
        if (projectCount > 0) {
            throw new Error('Projects already exist');
        }

        const defaultSettings = {
            visibility: 'private' as const,
            allowGuests: false,
            boardLayout: 'kanban' as const
        };

        const project = await ProjectModel.create({
            name: projectData.name,
            description: projectData.description,
            ownerId: adminUserId,
            isActive: true,
            settings: {...defaultSettings, ...projectData.settings}
        });

        return project;
    }

    static async completeSetup(): Promise<void> {
        const status = await this.getSetupStatus();

        if (!status.hasAdminUser) {
            throw new Error('Admin user must be created first');
        }

        if (!status.hasFirstProject) {
            throw new Error('First project must be created');
        }

        return new Promise((resolve, reject) => {
            const query = 'UPDATE app_settings SET value = "true", updatedAt = CURRENT_TIMESTAMP WHERE key = "setup_completed"';
            database.getDb().run(query, [], (err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('✅ Setup completed successfully');
                    resolve();
                }
            });
        });
    }

    static async getProjectTemplates(): Promise<any[]> {
        return [
            {
                id: 'kanban-basic',
                name: 'Basic Kanban Board',
                description: 'Simple kanban board with Todo, In Progress, and Done columns',
                settings: {
                    boardLayout: 'kanban',
                    visibility: 'private',
                    allowGuests: false
                },
                columns: [
                    {name: 'Todo', color: '#e2e8f0'},
                    {name: 'In Progress', color: '#fbbf24'},
                    {name: 'Done', color: '#10b981'}
                ]
            },
            {
                id: 'scrum-advanced',
                name: 'Scrum Project',
                description: 'Advanced scrum project with backlog, sprint planning, and review stages',
                settings: {
                    boardLayout: 'kanban',
                    visibility: 'private',
                    allowGuests: false
                },
                columns: [
                    {name: 'Backlog', color: '#e2e8f0'},
                    {name: 'Sprint Planning', color: '#a78bfa'},
                    {name: 'In Progress', color: '#fbbf24'},
                    {name: 'Review', color: '#f472b6'},
                    {name: 'Done', color: '#10b981'}
                ]
            },
            {
                id: 'bug-tracking',
                name: 'Bug Tracking',
                description: 'Project template for tracking and fixing bugs',
                settings: {
                    boardLayout: 'kanban',
                    visibility: 'private',
                    allowGuests: false
                },
                columns: [
                    {name: 'Reported', color: '#ef4444'},
                    {name: 'Investigating', color: '#fbbf24'},
                    {name: 'In Progress', color: '#3b82f6'},
                    {name: 'Testing', color: '#a78bfa'},
                    {name: 'Resolved', color: '#10b981'}
                ]
            }
        ];
    }

    static async getAuthProviders(): Promise<any[]> {
        return [
            {
                id: 'local',
                name: 'Local Authentication',
                description: 'Username/password authentication',
                enabled: true,
                configurable: false
            },
            {
                id: 'saml',
                name: 'SAML 2.0',
                description: 'Enterprise single sign-on via SAML',
                enabled: false,
                configurable: true,
                comingSoon: true
            },
            {
                id: 'authentik',
                name: 'Authentik',
                description: 'Integration with Authentik identity provider',
                enabled: false,
                configurable: true,
                comingSoon: true
            }
        ];
    }
}