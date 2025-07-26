import api, { apiRequest } from '@/lib/api';
import { SystemSettings, SystemSettingsResponse } from '@/types/settings';

// Public settings interface (subset of SystemSettings)
export interface PublicSystemSettings {
  siteName: string;
  headerLogo?: string;
  registrationEnabled: boolean;
}

export class SettingsService {
  
  // Get public system settings (no auth required)
  static async getPublicSystemSettings(): Promise<PublicSystemSettings> {
    try {
      const response = await apiRequest<{ success: boolean; message: string; data: PublicSystemSettings }>(() =>
        api.get('/settings/public')
      );

      if (response.success && response.data) {
        return response.data.data;
      }

      throw new Error(response.error || 'Failed to fetch system settings');
    } catch (error: any) {
      console.error('SettingsService: Failed to fetch public system settings:', error);
      
      // Return default settings on error to prevent app from breaking
      return {
        siteName: 'ExhibitBook',
        registrationEnabled: true,
      };
    }
  }
  
  // Get system settings (auth required - for admin use)
  static async getSystemSettings(): Promise<SystemSettings> {
    try {
      const response = await apiRequest<SystemSettingsResponse>(() =>
        api.get('/settings/system')
      );

      if (response.success && response.data) {
        return response.data.data;
      }

      throw new Error(response.error || 'Failed to fetch system settings');
    } catch (error: any) {
      console.error('SettingsService: Failed to fetch system settings:', error);
      
      // Return default settings on error to prevent app from breaking
      return {
        siteName: 'ExhibitBook',
        defaultCurrency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        maintenanceMode: false,
        registrationEnabled: true,
        emailNotifications: true,
        newBookingAlerts: true,
        paymentNotifications: true,
        systemAlerts: true,
      };
    }
  }

  // Get the full URL for uploaded images
  static getImageUrl(imagePath?: string): string | null {
    if (!imagePath) return null;
    
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
    // Remove /api/v1 from the end for static files
    const staticBaseUrl = baseUrl.replace('/api/v1', '');
    
    // Ensure the path starts with /
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    
    return `${staticBaseUrl}${cleanPath}`;
  }
} 