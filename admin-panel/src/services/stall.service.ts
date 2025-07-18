import axios from 'axios';

// Get base URL from environment or default
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface StallType {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  category?: string;
  defaultSize?: {
    width: number;
    height: number;
  };
  color: string;
  defaultRate: number;
  rateType: 'per_sqm' | 'per_stall' | 'per_day';
  includedAmenities?: string[];
  availableAmenities?: string[];
  minimumBookingDuration?: number;
  maximumBookingDuration?: number;
  isActive: boolean;
  sortOrder: number;
  features?: Array<{ feature: string }>;
  status?: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateStallTypeData {
  name: string;
  description: string;
  category: string;
  defaultSize?: {
    width: number;
    height: number;
  };
  color?: string;
  defaultRate?: number;
  rateType?: 'per_sqm' | 'per_stall' | 'per_day';
  includedAmenities?: string[];
  availableAmenities?: string[];
  minimumBookingDuration?: number;
  maximumBookingDuration?: number;
  isActive?: boolean;
  sortOrder?: number;
  features?: Array<{ feature: string }>;
  status?: 'active' | 'inactive';
}

export interface UpdateStallTypeData extends Partial<CreateStallTypeData> {}

export interface StallTypeStats {
  total: number;
  categories: Array<{
    _id: string;
    count: number;
    averageRate: number;
    minRate: number;
    maxRate: number;
  }>;
}

const stallService = {
  // Get all stall types
  getStallTypes: async (query?: any) => {
    const response = await api.get('/stall-types', { params: query });
    // Handle different response formats
    const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
    return { ...response, data };
  },

  // Get stall type by ID
  getStallType: async (id: string) => {
    const response = await api.get<StallType>(`/stall-types/${id}`);
    return response;
  },

  // Create new stall type
  createStallType: async (data: CreateStallTypeData) => {
    const response = await api.post<StallType>('/stall-types', data);
    return response;
  },

  // Update stall type
  updateStallType: async (id: string, data: UpdateStallTypeData) => {
    const response = await api.patch<StallType>(`/stall-types/${id}`, data);
    return response;
  },

  // Delete stall type
  deleteStallType: async (id: string) => {
    const response = await api.delete(`/stall-types/${id}`);
    return response;
  },

  // Get stall types by category
  getStallTypesByCategory: async (category: string) => {
    const response = await api.get<StallType[]>(`/stall-types/category/${category}`);
    return response;
  },

  // Get all categories
  getCategories: async () => {
    const response = await api.get<string[]>('/stall-types/categories');
    return response;
  },

  // Get statistics
  getStats: async () => {
    const response = await api.get<StallTypeStats>('/stall-types/stats');
    return response;
  },

  // Update sort order
  updateSortOrder: async (updates: Array<{ id: string; sortOrder: number }>) => {
    const response = await api.patch('/stall-types/sort-order/update', updates);
    return response;
  },
};

export default stallService; 