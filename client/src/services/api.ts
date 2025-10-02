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
}

export const apiService = new ApiService();
