export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string; // Dynamic role name (can be custom role)
  isActive: boolean;
  profilePicture: string | null;
  theme: string;
  twoFactorSecret: string | null;
  twoFactorEnabled: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  isActive: boolean;
  settings: ProjectSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectSettings {
  visibility: 'private' | 'public';
  allowGuests: boolean;
  boardLayout: 'kanban' | 'list' | 'calendar';
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  assigneeId: string | null;
  reporterId: string;
  boardId: string | null;
  position: number;
  tags: string[];
  dueDate: Date | null;
  estimatedHours: number | null;
  actualHours: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Board {
  id: string;
  name: string;
  description: string;
  projectId: string;
  type: 'kanban' | 'scrum';
  columns: BoardColumn[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BoardColumn {
  id: string;
  name: string;
  position: number;
  color: string;
  taskLimit: number | null;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: 'owner' | 'member' | 'viewer';
  joinedAt: Date;
}

export interface AuthToken {
  id: string;
  userId: string;
  token: string;
  type: 'access' | 'refresh';
  expiresAt: Date;
  isRevoked: boolean;
  createdAt: Date;
}

export interface SetupStatus {
  isCompleted: boolean;
  hasAdminUser: boolean;
  hasFirstProject: boolean;
  version: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  twoFactorCode?: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
  settings?: Partial<ProjectSettings>;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  projectId: string;
  assigneeId?: string;
  priority?: TaskPriority;
  dueDate?: string;
  tags?: string[];
  estimatedHours?: number;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  dueDate?: string;
  tags?: string[];
  estimatedHours?: number;
  actualHours?: number;
}

export interface TwoFactorSetupResponse {
  secret: string;
  qrCode: string;
  manualEntryKey: string;
}

export interface TwoFactorVerificationRequest {
  token: string;
}

export interface TwoFactorStatusResponse {
  enabled: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
      token?: string;
    }
  }
}