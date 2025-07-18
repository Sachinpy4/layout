import axios from 'axios';
import { LayoutData as Layout, Hall, Stall, Fixture } from '../pages/Exhibition/layout/types/layout-types';
import { StallType } from '../types';

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

export class LayoutService {
  private baseUrl = '/layout';

  // Layout Operations
  async getByExhibitionId(exhibitionId: string): Promise<Layout> {
    try {
      const response = await api.get(`${this.baseUrl}/exhibition/${exhibitionId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching layout:', error);
      throw error;
    }
  }

  async create(exhibitionId: string, layoutData: Partial<Layout>): Promise<Layout> {
    try {
      const response = await api.post(`${this.baseUrl}`, {
        ...layoutData,
        exhibitionId,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating layout:', error);
      throw error;
    }
  }

  async update(exhibitionId: string, layoutData: Layout): Promise<Layout> {
    try {
      console.log('=== LAYOUT SERVICE UPDATE DEBUG ===');
      console.log('Exhibition ID:', exhibitionId);
      console.log('Layout Data being sent:', JSON.stringify(layoutData, null, 2));
      console.log('API URL:', `${this.baseUrl}/exhibition/${exhibitionId}`);
      
      const response = await api.put(`${this.baseUrl}/exhibition/${exhibitionId}`, layoutData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating layout:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error;
    }
  }

  async delete(exhibitionId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/exhibition/${exhibitionId}`);
    } catch (error) {
      console.error('Error deleting layout:', error);
      throw error;
    }
  }

  // Hall Operations
  async createHall(exhibitionId: string, hallData: Partial<Hall>): Promise<Hall> {
    try {
      const response = await api.post(`${this.baseUrl}/exhibition/${exhibitionId}/halls`, hallData);
      return response.data;
    } catch (error) {
      console.error('Error creating hall:', error);
      throw error;
    }
  }

  async updateHall(exhibitionId: string, hallId: string, hallData: Partial<Hall>): Promise<Hall> {
    try {
      const response = await api.put(`${this.baseUrl}/exhibition/${exhibitionId}/halls/${hallId}`, hallData);
      return response.data;
    } catch (error) {
      console.error('Error updating hall:', error);
      throw error;
    }
  }

  async deleteHall(exhibitionId: string, hallId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/exhibition/${exhibitionId}/halls/${hallId}`);
    } catch (error) {
      console.error('Error deleting hall:', error);
      throw error;
    }
  }

  // Stall Operations
  async createStall(exhibitionId: string, hallId: string, stallData: Partial<Stall>): Promise<Stall> {
    try {
      const response = await api.post(`${this.baseUrl}/exhibition/${exhibitionId}/halls/${hallId}/stalls`, stallData);
      return response.data;
    } catch (error) {
      console.error('Error creating stall:', error);
      throw error;
    }
  }

  async updateStall(exhibitionId: string, hallId: string, stallId: string, stallData: Partial<Stall>): Promise<Stall> {
    try {
      const response = await api.put(`${this.baseUrl}/exhibition/${exhibitionId}/halls/${hallId}/stalls/${stallId}`, stallData);
      return response.data;
    } catch (error) {
      console.error('Error updating stall:', error);
      throw error;
    }
  }

  async deleteStall(exhibitionId: string, hallId: string, stallId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/exhibition/${exhibitionId}/halls/${hallId}/stalls/${stallId}`);
    } catch (error) {
      console.error('Error deleting stall:', error);
      throw error;
    }
  }

  // Fixture Operations
  async createFixture(exhibitionId: string, hallId: string, fixtureData: Partial<Fixture>): Promise<Fixture> {
    try {
      const response = await api.post(`${this.baseUrl}/exhibition/${exhibitionId}/halls/${hallId}/fixtures`, fixtureData);
      return response.data;
    } catch (error) {
      console.error('Error creating fixture:', error);
      throw error;
    }
  }

  async updateFixture(exhibitionId: string, hallId: string, fixtureId: string, fixtureData: Partial<Fixture>): Promise<Fixture> {
    try {
      const response = await api.put(`${this.baseUrl}/exhibition/${exhibitionId}/halls/${hallId}/fixtures/${fixtureId}`, fixtureData);
      return response.data;
    } catch (error) {
      console.error('Error updating fixture:', error);
      throw error;
    }
  }

  async deleteFixture(exhibitionId: string, hallId: string, fixtureId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/exhibition/${exhibitionId}/halls/${hallId}/fixtures/${fixtureId}`);
    } catch (error) {
      console.error('Error deleting fixture:', error);
      throw error;
    }
  }

  // Stall Types
  async getStallTypes(): Promise<StallType[]> {
    try {
      const response = await api.get(`${this.baseUrl}/stall-types`);
      return response.data;
    } catch (error) {
      console.error('Error fetching stall types:', error);
      throw error;
    }
  }

  async createStallType(stallTypeData: Partial<StallType>): Promise<StallType> {
    try {
      const response = await api.post(`${this.baseUrl}/stall-types`, stallTypeData);
      return response.data;
    } catch (error) {
      console.error('Error creating stall type:', error);
      throw error;
    }
  }

  // Fixture Templates
  async getFixtureTemplates(): Promise<Fixture[]> {
    try {
      const response = await api.get(`${this.baseUrl}/fixture-templates`);
      return response.data;
    } catch (error) {
      console.error('Error fetching fixture templates:', error);
      throw error;
    }
  }

  // Bulk Operations
  async bulkCreateStalls(exhibitionId: string, hallId: string, stallsData: Partial<Stall>[]): Promise<Stall[]> {
    try {
      const response = await api.post(`${this.baseUrl}/exhibition/${exhibitionId}/halls/${hallId}/stalls/bulk`, {
        stalls: stallsData
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk creating stalls:', error);
      throw error;
    }
  }

  async bulkUpdateStalls(exhibitionId: string, hallId: string, stallsData: Partial<Stall>[]): Promise<Stall[]> {
    try {
      const response = await api.put(`${this.baseUrl}/exhibition/${exhibitionId}/halls/${hallId}/stalls/bulk`, {
        stalls: stallsData
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk updating stalls:', error);
      throw error;
    }
  }

  // Clone Operations
  async cloneHall(exhibitionId: string, hallId: string, newName: string): Promise<Hall> {
    try {
      const response = await api.post(`${this.baseUrl}/exhibition/${exhibitionId}/halls/${hallId}/clone`, {
        name: newName
      });
      return response.data;
    } catch (error) {
      console.error('Error cloning hall:', error);
      throw error;
    }
  }

  // Export/Import
  async exportLayout(exhibitionId: string): Promise<Blob> {
    try {
      const response = await api.get(`${this.baseUrl}/exhibition/${exhibitionId}/export`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting layout:', error);
      throw error;
    }
  }

  async importLayout(exhibitionId: string, file: File): Promise<Layout> {
    try {
      const formData = new FormData();
      formData.append('layout', file);
      
      const response = await api.post(`${this.baseUrl}/exhibition/${exhibitionId}/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error importing layout:', error);
      throw error;
    }
  }

  // Get available stalls for an exhibition
  async getAvailableStalls(exhibitionId: string): Promise<any[]> {
    try {
      // Import exhibition service to get exhibition data with stallRates
      const { exhibitionService } = await import('./exhibition.service');
      
      // Get both layout and exhibition data
      const [layoutResponse, exhibition] = await Promise.all([
        api.get(`${this.baseUrl}/exhibition/${exhibitionId}`),
        exhibitionService.getById(exhibitionId)
      ]);
      
      const layout = layoutResponse.data;
      const availableStalls = [];
      
      // Create stallRates lookup map for better performance
      const stallRatesMap = new Map();
      if (exhibition.stallRates && Array.isArray(exhibition.stallRates)) {
        exhibition.stallRates.forEach((stallRate: any) => {
          const stallTypeId = typeof stallRate.stallTypeId === 'string' 
            ? stallRate.stallTypeId 
            : stallRate.stallTypeId?._id;
          if (stallTypeId) {
            stallRatesMap.set(stallTypeId, stallRate.rate);
          }
        });
      }
      
      console.log('=== STALL RATES DEBUG ===');
      console.log('Exhibition stallRates:', exhibition.stallRates);
      console.log('StallRates map:', stallRatesMap);
      
      // Extract stalls from the layout structure
      if (layout && layout.spaces) {
        for (const space of layout.spaces) {
          if (space.halls) {
            for (const hall of space.halls) {
              if (hall.stalls) {
                for (const stall of hall.stalls) {
                  // Only include available stalls
                  if (stall.status === 'available') {
                    // Get the correct rate from exhibition stallRates configuration
                    const stallTypeId = stall.stallTypeId || stall.stallType;
                    const correctRate = stallRatesMap.get(stallTypeId) || 100; // Fallback to 100
                    
                    console.log(`Stall ${stall.number}: stallTypeId=${stallTypeId}, rate=${correctRate}`);
                    
                    const dimensions = {
                      width: stall.widthSqm || ((stall.size?.width || 100) / 50),
                      height: stall.heightSqm || ((stall.size?.height || 100) / 50),
                      shapeType: 'rectangle' as const
                    };
                    
                    const area = this.calculateStallArea(dimensions);
                    const baseAmount = this.calculateBaseAmount({
                      dimensions,
                      ratePerSqm: correctRate
                    });
                    
                    availableStalls.push({
                      id: stall.id,
                      stallNumber: stall.number,
                      stallTypeName: stall.stallTypeName || 'Standard',
                      status: stall.status || 'available',
                      area,
                      dimensions,
                      ratePerSqm: correctRate, // Use the correct rate from exhibition config
                      isBooked: stall.status !== 'available',
                      stallType: { 
                        id: stallTypeId || 'default',
                        name: stall.stallTypeName || 'Standard'
                      },
                      baseAmount
                    });
                  }
                }
              }
            }
          }
        }
      }
      
      console.log('=== AVAILABLE STALLS FINAL ===');
      console.log('Total available stalls:', availableStalls.length);
      console.log('Sample stall rates:', availableStalls.slice(0, 3).map(s => ({ 
        number: s.stallNumber, 
        rate: s.ratePerSqm, 
        baseAmount: s.baseAmount 
      })));
      
      return availableStalls;
    } catch (error) {
      console.error('Error fetching available stalls:', error);
      throw error;
    }
  }

  // Helper method to calculate stall area
  private calculateStallArea(dimensions: any): number {
    if (!dimensions) return 0;
    
    const shapeType = dimensions.shapeType || 'rectangle';
    
    if (shapeType === 'rectangle') {
      return dimensions.width * dimensions.height;
    }
    
    if (shapeType === 'l-shape' && dimensions.lShape) {
      const { rect1Width, rect1Height, rect2Width, rect2Height } = dimensions.lShape;
      return (rect1Width * rect1Height) + (rect2Width * rect2Height);
    }
    
    // Fallback to rectangle
    return dimensions.width * dimensions.height;
  }

  // Helper method to calculate base amount
  private calculateBaseAmount(stall: { dimensions: any; ratePerSqm: number }): number {
    const area = this.calculateStallArea(stall.dimensions);
    return Math.round(stall.ratePerSqm * area * 100) / 100;
  }
}

export const layoutService = new LayoutService(); 