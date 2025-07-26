import api, { apiRequest } from '@/lib/api';
import { User } from '@/types/auth';

export interface UpdateProfileData {
  companyName?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  website?: string;
  panNumber?: string;
  gstNumber?: string;
}

export class ExhibitorService {
  // Update exhibitor profile
  static async updateProfile(data: UpdateProfileData): Promise<User> {
    const response = await apiRequest<any>(() =>
      api.patch('/exhibitors/profile', data)
    );

    if (response.success && response.data) {
      // Transform exhibitor data to User format for frontend compatibility
      const exhibitor = response.data;
      
      const user: User = {
        id: exhibitor._id || exhibitor.id,
        email: exhibitor.email,
        name: exhibitor.contactPerson,
        companyName: exhibitor.companyName,
        contactNumber: exhibitor.phone || '',
        address: exhibitor.address || '',
        city: exhibitor.city,
        state: exhibitor.state,
        pinCode: exhibitor.pinCode,
        website: exhibitor.website,
        panNumber: exhibitor.panNumber,
        gstNumber: exhibitor.gstNumber,
        isApproved: exhibitor.status === 'approved',
        role: 'exhibitor' as const,
        createdAt: exhibitor.createdAt || '',
        updatedAt: exhibitor.updatedAt || '',
      };

      return user;
    }

    throw new Error(response.error || 'Failed to update profile');
  }

  // Get current profile
  static async getProfile(): Promise<User> {
    const response = await apiRequest<any>(() =>
      api.get('/exhibitors/profile')
    );

    if (response.success && response.data) {
      // Transform exhibitor data to User format for frontend compatibility
      const exhibitor = response.data;
      
      const user: User = {
        id: exhibitor._id || exhibitor.id,
        email: exhibitor.email,
        name: exhibitor.contactPerson,
        companyName: exhibitor.companyName,
        contactNumber: exhibitor.phone || '',
        address: exhibitor.address || '',
        city: exhibitor.city,
        state: exhibitor.state,
        pinCode: exhibitor.pinCode,
        website: exhibitor.website,
        panNumber: exhibitor.panNumber,
        gstNumber: exhibitor.gstNumber,
        isApproved: exhibitor.status === 'approved',
        role: 'exhibitor' as const,
        createdAt: exhibitor.createdAt || '',
        updatedAt: exhibitor.updatedAt || '',
      };

      return user;
    }

    throw new Error(response.error || 'Failed to fetch profile');
  }
}

export const exhibitorService = ExhibitorService; 