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
      console.log('=== EXHIBITION UPDATE DEBUG ===');
      console.log('Exhibition ID:', id);
      console.log('Update data size:', JSON.stringify(data).length, 'characters');
      
      // Check for large base64 images and warn
      if (data.headerLogo && data.headerLogo.length > 1000000) { // > 1MB base64
        console.warn('Header logo is large:', (data.headerLogo.length / 1024 / 1024).toFixed(2), 'MB');
      }
      if (data.sponsorLogos && Array.isArray(data.sponsorLogos)) {
        const totalSponsorSize = data.sponsorLogos.join('').length;
        if (totalSponsorSize > 2000000) { // > 2MB total
          console.warn('Sponsor logos are large:', (totalSponsorSize / 1024 / 1024).toFixed(2), 'MB');
        }
      }
      
      const response = await api.patch(`${this.endpoint}/${id}`, data);
      return {
        success: true,
        data: this.transformExhibition(response.data),
        message: 'Exhibition updated successfully',
      };
    } catch (error: any) {
      console.error('=== EXHIBITION UPDATE ERROR ===');
      console.error('Error details:', error);
      
      // Enhanced error handling for specific cases
      if (error.response?.status === 413) {
        // Payload Too Large error
        throw new Error(
          '🚨 File Upload Error: The images you uploaded are too large. ' +
          'Please try:\n' +
          '• Using smaller image files (< 2MB each)\n' +
          '• Compressing images before upload\n' +
          '• Uploading fewer sponsor logos at once\n' +
          'The system automatically compresses images, but very large files may still exceed limits.'
        );
      } else if (error.response?.status === 400) {
        // Bad Request - possibly malformed data
        throw new Error(
          'Invalid data format. Please check all fields and try again. ' +
          'If uploading images, ensure they are in JPG, PNG, or WebP format.'
        );
      } else if (error.response?.status === 500) {
        // Server error
        throw new Error(
          'Server error occurred while updating exhibition. ' +
          'This might be due to large file processing. Please try again with smaller images.'
        );
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        // Timeout error
        throw new Error(
          'Request timed out. This usually happens with large file uploads. ' +
          'Please try uploading smaller images or check your internet connection.'
        );
      } else if (error.response?.status === 0 || !error.response) {
        // Network error
        throw new Error(
          'Network error: Unable to connect to server. ' +
          'Please check your internet connection and try again.'
        );
      } else {
        // Generic error with original message
        const originalMessage = error.response?.data?.message || error.message || 'Failed to update exhibition';
        throw new Error(`Update failed: ${originalMessage}`);
      }
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