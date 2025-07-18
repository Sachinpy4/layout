import axios from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

// Create axios instance for auth
const authApi = axios.create({
  baseURL: `${API_BASE_URL}/auth`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: {
    id: string;
    name: string;
    permissions: string[];
  };
  status: 'active' | 'inactive' | 'suspended';
  lastLoginAt?: string;
  avatar?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
  message: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
  message: string;
}

class AuthService {
  private readonly ACCESS_TOKEN_KEY = 'admin_access_token';
  private readonly REFRESH_TOKEN_KEY = 'admin_refresh_token';
  private readonly USER_KEY = 'admin_user';

  constructor() {
    // Add request interceptor to include auth token
    authApi.interceptors.request.use((config) => {
      const token = this.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor for token refresh
    authApi.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = this.getRefreshToken();
            if (refreshToken) {
              const response = await this.refreshAccessToken();
              const newToken = response.data.accessToken;
              
              // Update the authorization header and retry the request
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return authApi(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            this.logout();
            window.location.href = '/login';
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await authApi.post<AuthResponse>('/login', credentials);
      
      if (response.data.success) {
        const { user, accessToken, refreshToken } = response.data.data;
        
        // Store tokens and user data
        this.setAccessToken(accessToken);
        this.setRefreshToken(refreshToken);
        this.setUser(user);
      }
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      // Call backend logout endpoint
      await authApi.post('/logout');
    } catch (error) {
      // Even if backend call fails, clear local storage
      console.warn('Logout API call failed:', error);
    } finally {
      // Clear all stored data
      this.clearAuthData();
    }
  }

  // Refresh access token
  async refreshAccessToken(): Promise<RefreshTokenResponse> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await authApi.post<RefreshTokenResponse>('/refresh', {
        refreshToken
      });

      if (response.data.success) {
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        this.setAccessToken(accessToken);
        this.setRefreshToken(newRefreshToken);
      }

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Token refresh failed');
    }
  }

  // Get current user profile
  async getProfile(): Promise<User> {
    try {
      const response = await authApi.get<{ success: boolean; data: User }>('/profile');
      
      if (response.data.success) {
        this.setUser(response.data.data);
        return response.data.data;
      }
      
      throw new Error('Failed to fetch profile');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch profile');
    }
  }

  // Token management
  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  private setAccessToken(token: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  private setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  // User management
  getUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  private setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    const user = this.getUser();
    return !!(token && user);
  }

  // Check if user has specific permission
  hasPermission(permission: string): boolean {
    const user = this.getUser();
    if (!user) return false;
    
    return user.role.permissions.includes(permission) || 
           user.role.permissions.includes('admin:all');
  }

  // Clear all auth data
  private clearAuthData(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  // Initialize auth state (check if user is logged in)
  async initializeAuth(): Promise<User | null> {
    if (!this.isAuthenticated()) {
      return null;
    }

    try {
      // Verify token is still valid by fetching profile
      const user = await this.getProfile();
      return user;
    } catch (error) {
      // Token is invalid, clear auth data
      this.clearAuthData();
      return null;
    }
  }
}

export default new AuthService(); 