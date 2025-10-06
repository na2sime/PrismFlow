import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

class ApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for adding auth token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for handling errors
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired, try to refresh
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            try {
              const response = await this.refreshToken(refreshToken);
              localStorage.setItem('accessToken', response.data.accessToken);
              localStorage.setItem('refreshToken', response.data.refreshToken);

              // Retry the original request
              if (error.config) {
                error.config.headers.Authorization = `Bearer ${response.data.accessToken}`;
                return this.axiosInstance.request(error.config);
              }
            } catch (refreshError) {
              // Refresh failed, logout user
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('user');
              window.location.href = '/login';
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Setup endpoints
  async getSetupStatus() {
    const response = await this.axiosInstance.get('/setup/status');
    return response.data;
  }

  async createAdminUser(userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    const response = await this.axiosInstance.post('/setup/admin-user', userData);
    return response.data;
  }

  async createFirstProject(projectData: {
    name: string;
    description?: string;
    templateId?: string;
    settings?: any;
  }, adminUserId: string) {
    const response = await this.axiosInstance.post(`/setup/first-project?adminUserId=${adminUserId}`, projectData);
    return response.data;
  }

  async completeSetup() {
    const response = await this.axiosInstance.post('/setup/complete');
    return response.data;
  }

  async getProjectTemplates() {
    const response = await this.axiosInstance.get('/setup/project-templates');
    return response.data;
  }

  async getAuthProviders() {
    const response = await this.axiosInstance.get('/setup/auth-providers');
    return response.data;
  }

  // Auth endpoints
  async login(email: string, password: string, twoFactorCode?: string) {
    const response = await this.axiosInstance.post('/auth/login', {
      email,
      password,
      twoFactorCode,
    });
    return response.data;
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    const response = await this.axiosInstance.post('/auth/register', userData);
    return response.data;
  }

  async refreshToken(refreshToken: string) {
    const response = await this.axiosInstance.post('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  }

  async logout() {
    const token = localStorage.getItem('accessToken');
    if (token) {
      await this.axiosInstance.post('/auth/logout', { token });
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  // User management endpoints
  async getUsers() {
    const response = await this.axiosInstance.get('/users');
    return response.data;
  }

  async getUser(userId: string) {
    const response = await this.axiosInstance.get(`/users/${userId}`);
    return response.data;
  }

  async createUser(userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
    isActive?: boolean;
  }) {
    const response = await this.axiosInstance.post('/users', userData);
    return response.data;
  }

  async updateUser(userId: string, userData: any) {
    const response = await this.axiosInstance.put(`/users/${userId}`, userData);
    return response.data;
  }

  async deleteUser(userId: string) {
    const response = await this.axiosInstance.delete(`/users/${userId}`);
    return response.data;
  }

  async toggleUserStatus(userId: string) {
    const response = await this.axiosInstance.patch(`/users/${userId}/toggle-status`);
    return response.data;
  }

  // Project endpoints
  async getProjects() {
    const response = await this.axiosInstance.get('/projects');
    return response.data;
  }

  async getProject(projectId: string) {
    const response = await this.axiosInstance.get(`/projects/${projectId}`);
    return response.data;
  }

  async createProject(projectData: {
    name: string;
    description?: string;
    settings?: any;
  }) {
    const response = await this.axiosInstance.post('/projects', projectData);
    return response.data;
  }

  async updateProject(projectId: string, projectData: any) {
    const response = await this.axiosInstance.put(`/projects/${projectId}`, projectData);
    return response.data;
  }

  async deleteProject(projectId: string) {
    const response = await this.axiosInstance.delete(`/projects/${projectId}`);
    return response.data;
  }

  // Task endpoints
  async getTasks(projectId: string) {
    const response = await this.axiosInstance.get(`/tasks?projectId=${projectId}`);
    return response.data;
  }

  async getTask(taskId: string) {
    const response = await this.axiosInstance.get(`/tasks/${taskId}`);
    return response.data;
  }

  async createTask(taskData: any) {
    const response = await this.axiosInstance.post('/tasks', taskData);
    return response.data;
  }

  async updateTask(taskId: string, taskData: any) {
    const response = await this.axiosInstance.put(`/tasks/${taskId}`, taskData);
    return response.data;
  }

  async deleteTask(taskId: string) {
    const response = await this.axiosInstance.delete(`/tasks/${taskId}`);
    return response.data;
  }

  // Board endpoints
  async getBoards(projectId: string) {
    const response = await this.axiosInstance.get(`/boards?projectId=${projectId}`);
    return response.data;
  }

  async getBoard(boardId: string) {
    const response = await this.axiosInstance.get(`/boards/${boardId}`);
    return response.data;
  }

  async createBoard(boardData: any) {
    const response = await this.axiosInstance.post('/boards', boardData);
    return response.data;
  }

  async updateBoard(boardId: string, boardData: any) {
    const response = await this.axiosInstance.put(`/boards/${boardId}`, boardData);
    return response.data;
  }

  async deleteBoard(boardId: string) {
    const response = await this.axiosInstance.delete(`/boards/${boardId}`);
    return response.data;
  }

  // Role management endpoints
  async getRoles() {
    const response = await this.axiosInstance.get('/roles');
    return response.data;
  }

  async getRole(roleId: string) {
    const response = await this.axiosInstance.get(`/roles/${roleId}`);
    return response.data;
  }

  async createRole(roleData: {
    name: string;
    description?: string;
    permissions: string[];
  }) {
    const response = await this.axiosInstance.post('/roles', roleData);
    return response.data;
  }

  async updateRole(roleId: string, roleData: {
    name?: string;
    description?: string;
    permissions?: string[];
  }) {
    const response = await this.axiosInstance.put(`/roles/${roleId}`, roleData);
    return response.data;
  }

  async deleteRole(roleId: string) {
    const response = await this.axiosInstance.delete(`/roles/${roleId}`);
    return response.data;
  }

  async getUserRoles(userId: string) {
    const response = await this.axiosInstance.get(`/roles/users/${userId}/roles`);
    return response.data;
  }

  async assignRoleToUser(userId: string, roleId: string) {
    const response = await this.axiosInstance.post(`/roles/users/${userId}/roles`, { roleId });
    return response.data;
  }

  async removeRoleFromUser(userId: string, roleId: string) {
    const response = await this.axiosInstance.delete(`/roles/users/${userId}/roles/${roleId}`);
    return response.data;
  }

  async getUserPermissions(userId: string) {
    const response = await this.axiosInstance.get(`/roles/users/${userId}/permissions`);
    return response.data;
  }
}

export const apiService = new ApiService();
