// Permission definitions
export const PERMISSIONS = {
  // User permissions
  USERS_VIEW: 'users:view',
  USERS_CREATE: 'users:create',
  USERS_EDIT: 'users:edit',
  USERS_DELETE: 'users:delete',
  USERS_MANAGE_ROLES: 'users:manage_roles',

  // Project permissions
  PROJECTS_VIEW_ALL: 'projects:view_all',
  PROJECTS_VIEW_OWN: 'projects:view_own',
  PROJECTS_CREATE: 'projects:create',
  PROJECTS_EDIT: 'projects:edit',
  PROJECTS_DELETE: 'projects:delete',
  PROJECTS_ARCHIVE: 'projects:archive',

  // Task permissions
  TASKS_VIEW_ALL: 'tasks:view_all',
  TASKS_VIEW_OWN: 'tasks:view_own',
  TASKS_CREATE: 'tasks:create',
  TASKS_EDIT: 'tasks:edit',
  TASKS_DELETE: 'tasks:delete',
  TASKS_ASSIGN: 'tasks:assign',

  // Team permissions
  TEAMS_VIEW: 'teams:view',
  TEAMS_CREATE: 'teams:create',
  TEAMS_EDIT: 'teams:edit',
  TEAMS_DELETE: 'teams:delete',
  TEAMS_MANAGE_MEMBERS: 'teams:manage_members',

  // Board permissions
  BOARDS_VIEW: 'boards:view',
  BOARDS_CREATE: 'boards:create',
  BOARDS_EDIT: 'boards:edit',
  BOARDS_DELETE: 'boards:delete',

  // Admin permissions
  ADMIN_ACCESS: 'admin:access',
  ADMIN_SETTINGS: 'admin:settings',
  ADMIN_ROLES: 'admin:roles',
  ADMIN_LOGS: 'admin:logs',

  // Report permissions
  REPORTS_VIEW: 'reports:view',
  REPORTS_EXPORT: 'reports:export',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Default role definitions
export const DEFAULT_ROLES = {
  ADMIN: {
    name: 'Administrator',
    description: 'Full access to all features',
    isSystem: true,
    permissions: Object.values(PERMISSIONS),
  },
  PROJECT_MANAGER: {
    name: 'Project Manager',
    description: 'Project and task management',
    isSystem: true,
    permissions: [
      PERMISSIONS.PROJECTS_VIEW_OWN,
      PERMISSIONS.PROJECTS_CREATE,
      PERMISSIONS.PROJECTS_EDIT,
      PERMISSIONS.TASKS_VIEW_ALL,
      PERMISSIONS.TASKS_CREATE,
      PERMISSIONS.TASKS_EDIT,
      PERMISSIONS.TASKS_DELETE,
      PERMISSIONS.TASKS_ASSIGN,
      PERMISSIONS.TEAMS_VIEW,
      PERMISSIONS.BOARDS_VIEW,
      PERMISSIONS.BOARDS_CREATE,
      PERMISSIONS.BOARDS_EDIT,
      PERMISSIONS.REPORTS_VIEW,
    ],
  },
  TEAM_MEMBER: {
    name: 'Team Member',
    description: 'Standard user with access to assigned projects',
    isSystem: true,
    permissions: [
      PERMISSIONS.PROJECTS_VIEW_OWN,
      PERMISSIONS.TASKS_VIEW_OWN,
      PERMISSIONS.TASKS_CREATE,
      PERMISSIONS.TASKS_EDIT,
      PERMISSIONS.TEAMS_VIEW,
      PERMISSIONS.BOARDS_VIEW,
    ],
  },
  VIEWER: {
    name: 'Viewer',
    description: 'Read-only access',
    isSystem: true,
    permissions: [
      PERMISSIONS.PROJECTS_VIEW_OWN,
      PERMISSIONS.TASKS_VIEW_OWN,
      PERMISSIONS.TEAMS_VIEW,
      PERMISSIONS.BOARDS_VIEW,
    ],
  },
};

// Permission groups for UI organization
export const PERMISSION_GROUPS = [
  {
    name: 'Users',
    permissions: [
      { key: PERMISSIONS.USERS_VIEW, label: 'View users' },
      { key: PERMISSIONS.USERS_CREATE, label: 'Create users' },
      { key: PERMISSIONS.USERS_EDIT, label: 'Edit users' },
      { key: PERMISSIONS.USERS_DELETE, label: 'Delete users' },
      { key: PERMISSIONS.USERS_MANAGE_ROLES, label: 'Manage roles' },
    ],
  },
  {
    name: 'Projects',
    permissions: [
      { key: PERMISSIONS.PROJECTS_VIEW_ALL, label: 'View all projects' },
      { key: PERMISSIONS.PROJECTS_VIEW_OWN, label: 'View own projects' },
      { key: PERMISSIONS.PROJECTS_CREATE, label: 'Create projects' },
      { key: PERMISSIONS.PROJECTS_EDIT, label: 'Edit projects' },
      { key: PERMISSIONS.PROJECTS_DELETE, label: 'Delete projects' },
      { key: PERMISSIONS.PROJECTS_ARCHIVE, label: 'Archive projects' },
    ],
  },
  {
    name: 'Tasks',
    permissions: [
      { key: PERMISSIONS.TASKS_VIEW_ALL, label: 'View all tasks' },
      { key: PERMISSIONS.TASKS_VIEW_OWN, label: 'View own tasks' },
      { key: PERMISSIONS.TASKS_CREATE, label: 'Create tasks' },
      { key: PERMISSIONS.TASKS_EDIT, label: 'Edit tasks' },
      { key: PERMISSIONS.TASKS_DELETE, label: 'Delete tasks' },
      { key: PERMISSIONS.TASKS_ASSIGN, label: 'Assign tasks' },
    ],
  },
  {
    name: 'Teams',
    permissions: [
      { key: PERMISSIONS.TEAMS_VIEW, label: 'View teams' },
      { key: PERMISSIONS.TEAMS_CREATE, label: 'Create teams' },
      { key: PERMISSIONS.TEAMS_EDIT, label: 'Edit teams' },
      { key: PERMISSIONS.TEAMS_DELETE, label: 'Delete teams' },
      { key: PERMISSIONS.TEAMS_MANAGE_MEMBERS, label: 'Manage members' },
    ],
  },
  {
    name: 'Boards',
    permissions: [
      { key: PERMISSIONS.BOARDS_VIEW, label: 'View boards' },
      { key: PERMISSIONS.BOARDS_CREATE, label: 'Create boards' },
      { key: PERMISSIONS.BOARDS_EDIT, label: 'Edit boards' },
      { key: PERMISSIONS.BOARDS_DELETE, label: 'Delete boards' },
    ],
  },
  {
    name: 'Administration',
    permissions: [
      { key: PERMISSIONS.ADMIN_ACCESS, label: 'Admin access' },
      { key: PERMISSIONS.ADMIN_SETTINGS, label: 'System settings' },
      { key: PERMISSIONS.ADMIN_ROLES, label: 'Manage roles' },
      { key: PERMISSIONS.ADMIN_LOGS, label: 'System logs' },
    ],
  },
  {
    name: 'Reports',
    permissions: [
      { key: PERMISSIONS.REPORTS_VIEW, label: 'View reports' },
      { key: PERMISSIONS.REPORTS_EXPORT, label: 'Export reports' },
    ],
  },
];
