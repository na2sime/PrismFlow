"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetupService = void 0;
const database_1 = require("@/config/database");
const User_1 = require("@/models/User");
const Project_1 = require("@/models/Project");
class SetupService {
    static async getSetupStatus() {
        return new Promise((resolve, reject) => {
            const query = 'SELECT value FROM app_settings WHERE key = "setup_completed"';
            database_1.database.getDb().get(query, [], async (err, row) => {
                if (err) {
                    reject(err);
                }
                else {
                    const isCompleted = row && row.value === 'true';
                    const adminCount = await User_1.UserModel.countAdmins();
                    const projectCount = await Project_1.ProjectModel.count();
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
    static async createAdminUser(userData) {
        const adminCount = await User_1.UserModel.countAdmins();
        if (adminCount > 0) {
            throw new Error('Admin user already exists');
        }
        const existingUserByEmail = await User_1.UserModel.findByEmail(userData.email);
        if (existingUserByEmail) {
            throw new Error('Email already exists');
        }
        const existingUserByUsername = await User_1.UserModel.findByUsername(userData.username);
        if (existingUserByUsername) {
            throw new Error('Username already exists');
        }
        const adminUser = await User_1.UserModel.create({
            username: userData.username,
            email: userData.email,
            password: userData.password,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: 'admin',
            isActive: true,
            twoFactorSecret: null,
            twoFactorEnabled: false
        });
        const userWithoutPassword = { ...adminUser };
        delete userWithoutPassword.password;
        delete userWithoutPassword.twoFactorSecret;
        return userWithoutPassword;
    }
    static async createFirstProject(projectData, adminUserId) {
        const projectCount = await Project_1.ProjectModel.count();
        if (projectCount > 0) {
            throw new Error('Projects already exist');
        }
        const defaultSettings = {
            visibility: 'private',
            allowGuests: false,
            boardLayout: 'kanban'
        };
        const project = await Project_1.ProjectModel.create({
            name: projectData.name,
            description: projectData.description,
            ownerId: adminUserId,
            isActive: true,
            settings: { ...defaultSettings, ...projectData.settings }
        });
        return project;
    }
    static async completeSetup() {
        const status = await this.getSetupStatus();
        if (!status.hasAdminUser) {
            throw new Error('Admin user must be created first');
        }
        if (!status.hasFirstProject) {
            throw new Error('First project must be created');
        }
        return new Promise((resolve, reject) => {
            const query = 'UPDATE app_settings SET value = "true", updatedAt = CURRENT_TIMESTAMP WHERE key = "setup_completed"';
            database_1.database.getDb().run(query, [], (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    console.log('✅ Setup completed successfully');
                    resolve();
                }
            });
        });
    }
    static async getProjectTemplates() {
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
                    { name: 'Todo', color: '#e2e8f0' },
                    { name: 'In Progress', color: '#fbbf24' },
                    { name: 'Done', color: '#10b981' }
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
                    { name: 'Backlog', color: '#e2e8f0' },
                    { name: 'Sprint Planning', color: '#a78bfa' },
                    { name: 'In Progress', color: '#fbbf24' },
                    { name: 'Review', color: '#f472b6' },
                    { name: 'Done', color: '#10b981' }
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
                    { name: 'Reported', color: '#ef4444' },
                    { name: 'Investigating', color: '#fbbf24' },
                    { name: 'In Progress', color: '#3b82f6' },
                    { name: 'Testing', color: '#a78bfa' },
                    { name: 'Resolved', color: '#10b981' }
                ]
            }
        ];
    }
    static async getAuthProviders() {
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
exports.SetupService = SetupService;
//# sourceMappingURL=SetupService.js.map