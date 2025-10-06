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
  SUPER_ADMIN: {
    name: 'Super Admin',
    description: 'Full access to all features',
    isSystem: true,
    permissions: Object.values(PERMISSIONS),
  },
  ADMIN: {
    name: 'Administrator',
    description: 'Complete management of users and projects',
    isSystem: true,
    permissions: [
      PERMISSIONS.USERS_VIEW,
      PERMISSIONS.USERS_CREATE,
      PERMISSIONS.USERS_EDIT,
      PERMISSIONS.USERS_DELETE,
      PERMISSIONS.USERS_MANAGE_ROLES,
      PERMISSIONS.PROJECTS_VIEW_ALL,
      PERMISSIONS.PROJECTS_CREATE,
      PERMISSIONS.PROJECTS_EDIT,
      PERMISSIONS.PROJECTS_DELETE,
      PERMISSIONS.PROJECTS_ARCHIVE,
      PERMISSIONS.TASKS_VIEW_ALL,
      PERMISSIONS.TASKS_CREATE,
      PERMISSIONS.TASKS_EDIT,
      PERMISSIONS.TASKS_DELETE,
      PERMISSIONS.TASKS_ASSIGN,
      PERMISSIONS.TEAMS_VIEW,
      PERMISSIONS.TEAMS_CREATE,
      PERMISSIONS.TEAMS_EDIT,
      PERMISSIONS.TEAMS_DELETE,
      PERMISSIONS.TEAMS_MANAGE_MEMBERS,
      PERMISSIONS.BOARDS_VIEW,
      PERMISSIONS.BOARDS_CREATE,
      PERMISSIONS.BOARDS_EDIT,
      PERMISSIONS.BOARDS_DELETE,
      PERMISSIONS.ADMIN_ACCESS,
      PERMISSIONS.ADMIN_SETTINGS,
      PERMISSIONS.ADMIN_ROLES,
      PERMISSIONS.REPORTS_VIEW,
      PERMISSIONS.REPORTS_EXPORT,
    ],
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
    name: 'Utilisateurs',
    permissions: [
      { key: PERMISSIONS.USERS_VIEW, label: 'Voir les utilisateurs' },
      { key: PERMISSIONS.USERS_CREATE, label: 'Créer des utilisateurs' },
      { key: PERMISSIONS.USERS_EDIT, label: 'Modifier les utilisateurs' },
      { key: PERMISSIONS.USERS_DELETE, label: 'Supprimer les utilisateurs' },
      { key: PERMISSIONS.USERS_MANAGE_ROLES, label: 'Gérer les rôles' },
    ],
  },
  {
    name: 'Projets',
    permissions: [
      { key: PERMISSIONS.PROJECTS_VIEW_ALL, label: 'Voir tous les projets' },
      { key: PERMISSIONS.PROJECTS_VIEW_OWN, label: 'Voir ses propres projets' },
      { key: PERMISSIONS.PROJECTS_CREATE, label: 'Créer des projets' },
      { key: PERMISSIONS.PROJECTS_EDIT, label: 'Modifier les projets' },
      { key: PERMISSIONS.PROJECTS_DELETE, label: 'Supprimer les projets' },
      { key: PERMISSIONS.PROJECTS_ARCHIVE, label: 'Archiver les projets' },
    ],
  },
  {
    name: 'Tâches',
    permissions: [
      { key: PERMISSIONS.TASKS_VIEW_ALL, label: 'Voir toutes les tâches' },
      { key: PERMISSIONS.TASKS_VIEW_OWN, label: 'Voir ses propres tâches' },
      { key: PERMISSIONS.TASKS_CREATE, label: 'Créer des tâches' },
      { key: PERMISSIONS.TASKS_EDIT, label: 'Modifier les tâches' },
      { key: PERMISSIONS.TASKS_DELETE, label: 'Supprimer les tâches' },
      { key: PERMISSIONS.TASKS_ASSIGN, label: 'Assigner des tâches' },
    ],
  },
  {
    name: 'Équipes',
    permissions: [
      { key: PERMISSIONS.TEAMS_VIEW, label: 'Voir les équipes' },
      { key: PERMISSIONS.TEAMS_CREATE, label: 'Créer des équipes' },
      { key: PERMISSIONS.TEAMS_EDIT, label: 'Modifier les équipes' },
      { key: PERMISSIONS.TEAMS_DELETE, label: 'Supprimer les équipes' },
      { key: PERMISSIONS.TEAMS_MANAGE_MEMBERS, label: 'Gérer les membres' },
    ],
  },
  {
    name: 'Boards',
    permissions: [
      { key: PERMISSIONS.BOARDS_VIEW, label: 'Voir les boards' },
      { key: PERMISSIONS.BOARDS_CREATE, label: 'Créer des boards' },
      { key: PERMISSIONS.BOARDS_EDIT, label: 'Modifier les boards' },
      { key: PERMISSIONS.BOARDS_DELETE, label: 'Supprimer les boards' },
    ],
  },
  {
    name: 'Administration',
    permissions: [
      { key: PERMISSIONS.ADMIN_ACCESS, label: 'Accès admin' },
      { key: PERMISSIONS.ADMIN_SETTINGS, label: 'Paramètres système' },
      { key: PERMISSIONS.ADMIN_ROLES, label: 'Gestion des rôles' },
      { key: PERMISSIONS.ADMIN_LOGS, label: 'Logs système' },
    ],
  },
  {
    name: 'Rapports',
    permissions: [
      { key: PERMISSIONS.REPORTS_VIEW, label: 'Voir les rapports' },
      { key: PERMISSIONS.REPORTS_EXPORT, label: 'Exporter les rapports' },
    ],
  },
];
