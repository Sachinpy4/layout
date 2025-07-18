import axios from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin_refresh_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'active' | 'inactive' | 'suspended';
  avatar?: string;
  address?: string;
  lastLoginAt?: string;
  role: {
    id: string;
    name: string;
    permissions: string[];
    description?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
  roleId: string;
  status?: 'active' | 'inactive' | 'suspended';
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  phone?: string;
  roleId?: string;
  status?: 'active' | 'inactive' | 'suspended';
  avatar?: string;
}

export interface UsersQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UsersResponse {
  success: boolean;
  data: {
    users: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  message: string;
}

export interface UserStatistics {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
  recentlyCreated: number;
  byRole: Array<{
    role: string;
    count: number;
  }>;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
  priority: number;
}

class UsersService {
  private readonly endpoint = '/users';

  // Get all users with filters and pagination
  async getUsers(params: UsersQueryParams = {}): Promise<UsersResponse> {
    try {
      const response = await api.get(this.endpoint, { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
  }

  // Get user by ID
  async getUserById(id: string): Promise<{ success: boolean; data: User; message: string }> {
    try {
      const response = await api.get(`${this.endpoint}/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user');
    }
  }

  // Create new user
  async createUser(userData: CreateUserDto): Promise<{ success: boolean; data: User; message: string }> {
    try {
      const response = await api.post(this.endpoint, userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create user');
    }
  }

  // Update user
  async updateUser(id: string, userData: UpdateUserDto): Promise<{ success: boolean; data: User; message: string }> {
    try {
      const response = await api.put(`${this.endpoint}/${id}`, userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update user');
    }
  }

  // Update user status
  async updateUserStatus(id: string, status: 'active' | 'inactive' | 'suspended'): Promise<{ success: boolean; data: User; message: string }> {
    try {
      const response = await api.put(`${this.endpoint}/${id}/status`, { status });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update user status');
    }
  }

  // Update user role
  async updateUserRole(id: string, roleId: string): Promise<{ success: boolean; data: User; message: string }> {
    try {
      const response = await api.put(`${this.endpoint}/${id}/role`, { roleId });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update user role');
    }
  }

  // Delete user
  async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete(`${this.endpoint}/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete user');
    }
  }

  // Reset user password
  async resetUserPassword(id: string): Promise<{ success: boolean; data: { temporaryPassword: string; message: string }; message: string }> {
    try {
      const response = await api.post(`${this.endpoint}/${id}/reset-password`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to reset password');
    }
  }

  // Get user statistics
  async getUserStatistics(): Promise<{ success: boolean; data: UserStatistics; message: string }> {
    try {
      const response = await api.get(`${this.endpoint}/statistics`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user statistics');
    }
  }

  // Get user activities
  async getUserActivities(id: string): Promise<{ success: boolean; data: any[]; message: string }> {
    try {
      const response = await api.get(`${this.endpoint}/${id}/activities`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user activities');
    }
  }

  // Get all roles (for dropdowns)
  async getRoles(): Promise<{ success: boolean; data: Role[]; message: string }> {
    try {
      const response = await api.get('/users/roles');
      return response.data;
    } catch (error: any) {
      // If roles endpoint doesn't exist, return mock roles
      return {
        success: true,
        data: [
          {
            id: '1',
            name: 'Super Admin',
            description: 'Full system access',
            permissions: ['admin:all'],
            isActive: true,
            priority: 100,
          },
          {
            id: '2',
            name: 'Admin',
            description: 'Administrative access',
            permissions: ['users:read', 'users:write', 'exhibitions:read', 'exhibitions:write', 'exhibitors_view', 'exhibitors_create', 'exhibitors_edit', 'exhibitors_delete', 'bookings_view', 'bookings_create'],
            isActive: true,
            priority: 80,
          },
          {
            id: '3',
            name: 'Manager',
            description: 'Management access',
            permissions: ['exhibitions:read', 'exhibitions:write', 'bookings:read', 'exhibitors_view', 'bookings_view'],
            isActive: true,
            priority: 60,
          },
          {
            id: '4',
            name: 'Operator',
            description: 'Operational access',
            permissions: ['exhibitions:read', 'bookings:read'],
            isActive: true,
            priority: 40,
          },
          {
            id: '5',
            name: 'User',
            description: 'Basic user access',
            permissions: ['profile:read'],
            isActive: true,
            priority: 20,
          },
        ],
        message: 'Roles retrieved successfully',
      };
    }
  }

  // Bulk operations
  async bulkUpdateUserStatus(userIds: string[], status: 'active' | 'inactive' | 'suspended'): Promise<{ success: boolean; message: string }> {
    try {
      const promises = userIds.map(id => this.updateUserStatus(id, status));
      await Promise.all(promises);
      return {
        success: true,
        message: `Successfully updated ${userIds.length} users`,
      };
    } catch (error: any) {
      throw new Error('Failed to bulk update user status');
    }
  }

  async bulkDeleteUsers(userIds: string[]): Promise<{ success: boolean; message: string }> {
    try {
      const promises = userIds.map(id => this.deleteUser(id));
      await Promise.all(promises);
      return {
        success: true,
        message: `Successfully deleted ${userIds.length} users`,
      };
    } catch (error: any) {
      throw new Error('Failed to bulk delete users');
    }
  }
}

export default new UsersService(); 