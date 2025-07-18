import axios, { AxiosInstance, AxiosError } from 'axios';
import { ApiResponse } from '@/types/auth';

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Check if this is a login attempt (don't redirect during login)
      const isLoginAttempt = error.config?.url?.includes('/login') || 
                            error.config?.url?.includes('/login-flexible');
      
      if (!isLoginAttempt && typeof window !== 'undefined') {
        // Only redirect for token expiration, not login failures
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        window.location.href = '/?auth=login';
      }
    }
    return Promise.reject(error);
  }
);

// API wrapper function for consistent error handling
export const apiRequest = async <T>(
  requestFn: () => Promise<any>
): Promise<ApiResponse<T>> => {
  try {
    const response = await requestFn();
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    console.error('API Error:', error);
    
    if (error.response?.data?.message) {
      return {
        success: false,
        error: error.response.data.message,
      };
    }
    
    if (error.message) {
      return {
        success: false,
        error: error.message,
      };
    }
    
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
};

export default api; 