import axios from 'axios';
import type { Exhibition, CreateExhibitionForm, ApiResponse } from '../types';

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

export interface ExhibitionStats {
  total: number;
  active: number;
  published: number;
  completed: number;
  draft: number;
}

class ExhibitionService {
  private readonly endpoint = '/exhibitions';

  // Transform MongoDB document to frontend-friendly format
  private transformExhibition(exhibition: any): Exhibition {
    if (!exhibition) return exhibition;
    
    // Convert _id to id for consistency
    if (exhibition._id && !exhibition.id) {
      exhibition.id = exhibition._id.toString();
    }
    
    return exhibition;
  }

  // Transform array of exhibitions
  private transformExhibitions(exhibitions: any[]): Exhibition[] {
    return exhibitions.map(exhibition => this.transformExhibition(exhibition));
  }

  // Get all exhibitions with optional filters
  async getExhibitions(params?: {
    status?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<Exhibition[]>> {
    try {
      const response = await api.get(this.endpoint, { params });
      
      return {
        success: true,
        data: this.transformExhibitions(response.data.exhibitions || []),
      };
    } catch (error: any) {
      console.error('Error fetching exhibitions:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch exhibitions');
    }
  }

  // Get active published exhibitions
  async getActiveExhibitions(): Promise<ApiResponse<Exhibition[]>> {
    try {
      const response = await api.get(`${this.endpoint}/active`);
      return {
        success: true,
        data: this.transformExhibitions(response.data),
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch active exhibitions');
    }
  }

  // Get exhibition by ID
  async getExhibition(id: string): Promise<ApiResponse<Exhibition>> {
    try {
      const response = await api.get(`${this.endpoint}/${id}`);
      return {
        success: true,
        data: this.transformExhibition(response.data),
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch exhibition');
    }
  }

  // Get exhibition by ID (direct method for compatibility)
  async getById(id: string): Promise<Exhibition> {
    try {
      const response = await api.get(`${this.endpoint}/${id}`);
      return this.transformExhibition(response.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch exhibition');
    }
  }

  // Get exhibition by slug
  async getExhibitionBySlug(slug: string): Promise<ApiResponse<Exhibition>> {
    try {
      const response = await api.get(`${this.endpoint}/slug/${slug}`);
      return {
        success: true,
        data: this.transformExhibition(response.data),
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch exhibition');
    }
  }

  // Create new exhibition
  async createExhibition(data: CreateExhibitionForm): Promise<ApiResponse<Exhibition>> {
    try {
      const response = await api.post(this.endpoint, data);
      return {
        success: true,
        data: this.transformExhibition(response.data),
        message: 'Exhibition created successfully',
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create exhibition');
    }
  }

  // Update exhibition
  async updateExhibition(id: string, data: Partial<CreateExhibitionForm>): Promise<ApiResponse<Exhibition>> {
    try {
      const response = await api.patch(`${this.endpoint}/${id}`, data);
      return {
        success: true,
        data: this.transformExhibition(response.data),
        message: 'Exhibition updated successfully',
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update exhibition');
    }
  }

  // Update exhibition status
  async updateExhibitionStatus(
    id: string, 
    status: 'draft' | 'published' | 'completed'
  ): Promise<ApiResponse<Exhibition>> {
    try {
      const response = await api.patch(`${this.endpoint}/${id}/status`, { status });
      return {
        success: true,
        data: this.transformExhibition(response.data),
        message: 'Exhibition status updated successfully',
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update exhibition status');
    }
  }

  // Toggle exhibition active status
  async toggleExhibitionActive(id: string): Promise<ApiResponse<Exhibition>> {
    try {
      const response = await api.patch(`${this.endpoint}/${id}/toggle-active`);
      return {
        success: true,
        data: this.transformExhibition(response.data),
        message: 'Exhibition status toggled successfully',
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to toggle exhibition status');
    }
  }

  // Delete exhibition (soft delete)
  async deleteExhibition(id: string): Promise<ApiResponse<void>> {
    try {
      await api.delete(`${this.endpoint}/${id}`);
      return {
        success: true,
        data: undefined,
        message: 'Exhibition deleted successfully',
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete exhibition');
    }
  }

  // Get exhibition statistics
  async getExhibitionStats(): Promise<ApiResponse<ExhibitionStats>> {
    try {
      const response = await api.get(`${this.endpoint}/stats`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch exhibition statistics');
    }
  }
}

export const exhibitionService = new ExhibitionService();
export default exhibitionService; 