import api from './api';

export interface ExhibitorProfile {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  website?: string;
  logo?: string;
  description?: string;
  panNumber?: string;
  gstNumber?: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  rejectionReason?: string;
  isActive: boolean;
  businessCategories?: string[];
  products?: string[];
  services?: string[];
  yearEstablished?: number;
  employeeCount?: number;
  companySize?: 'small' | 'medium' | 'large' | 'enterprise';
  lastLoginAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExhibitorDto {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  password?: string; // Optional since auto-generated
  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  website?: string;
  description?: string;
  panNumber?: string;
  gstNumber?: string;
  businessCategories?: string[];
  products?: string[];
  services?: string[];
  yearEstablished?: number;
  employeeCount?: number;
  companySize?: 'small' | 'medium' | 'large' | 'enterprise';
  isActive?: boolean;
}

export interface UpdateExhibitorDto {
  companyName?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  website?: string;
  logo?: string;
  description?: string;
  panNumber?: string;
  gstNumber?: string;
  businessCategories?: string[];
  products?: string[];
  services?: string[];
  yearEstablished?: number;
  employeeCount?: number;
  companySize?: 'small' | 'medium' | 'large' | 'enterprise';
  isActive?: boolean;
}

export interface ExhibitorQueryParams {
  page?: number;
  limit?: number;
  status?: 'pending' | 'approved' | 'rejected' | 'suspended';
  isActive?: boolean;
  search?: string;
  sortBy?: 'createdAt' | 'companyName' | 'status' | 'contactPerson' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ExhibitorListResponse {
  data: ExhibitorProfile[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ExhibitorStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  suspended: number;
  active: number;
  inactive: number;
}

export interface ExhibitorLoginDto {
  email: string;
  password: string;
}

export interface ExhibitorRegisterDto {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  password: string;
  address?: string;
}

export interface LoginResponse {
  access_token: string;
  exhibitor: ExhibitorProfile;
}

class ExhibitorService {
  // Public endpoints for exhibitor authentication
  async register(data: ExhibitorRegisterDto): Promise<ExhibitorProfile> {
    const response = await api.post('/exhibitors/register', data);
    return response.data;
  }

  async login(data: ExhibitorLoginDto): Promise<LoginResponse> {
    const response = await api.post('/exhibitors/login', data);
    return response.data;
  }

  // Protected endpoints for exhibitor profile management
  async getProfile(): Promise<ExhibitorProfile> {
    const response = await api.get('/exhibitors/profile');
    return response.data;
  }

  async updateProfile(data: UpdateExhibitorDto): Promise<ExhibitorProfile> {
    const response = await api.patch('/exhibitors/profile', data);
    return response.data;
  }

  // Admin endpoints for exhibitor management
  async getExhibitors(params: ExhibitorQueryParams = {}): Promise<ExhibitorListResponse> {
    const response = await api.get('/exhibitors', { params });
    return response.data;
  }

  async getExhibitorStats(): Promise<ExhibitorStats> {
    const response = await api.get('/exhibitors/stats');
    return response.data;
  }

  async getExhibitorById(id: string): Promise<ExhibitorProfile> {
    const response = await api.get(`/exhibitors/${id}`);
    return response.data;
  }

  async createExhibitor(data: CreateExhibitorDto): Promise<ExhibitorProfile> {
    const response = await api.post('/exhibitors', data);
    return response.data;
  }

  async updateExhibitor(id: string, data: UpdateExhibitorDto): Promise<ExhibitorProfile> {
    const response = await api.patch(`/exhibitors/${id}`, data);
    return response.data;
  }

  async updateExhibitorStatus(id: string, status: string, rejectionReason?: string): Promise<ExhibitorProfile> {
    const response = await api.patch(`/exhibitors/${id}/status`, {
      status,
      rejectionReason,
    });
    return response.data;
  }

  async deleteExhibitor(id: string): Promise<void> {
    await api.delete(`/exhibitors/${id}`);
  }

  // Bulk operations
  async bulkApproveExhibitors(ids: string[]): Promise<{ message: string; count: number }> {
    const response = await api.post('/exhibitors/bulk/approve', { ids });
    return response.data;
  }

  async bulkRejectExhibitors(ids: string[], rejectionReason?: string): Promise<{ message: string; count: number }> {
    const response = await api.post('/exhibitors/bulk/reject', { ids, rejectionReason });
    return response.data;
  }

  async bulkDeleteExhibitors(ids: string[]): Promise<{ message: string; count: number }> {
    const response = await api.delete('/exhibitors/bulk', { data: { ids } });
    return response.data;
  }

  // Helper methods
  getStatusColor(status: string): string {
    switch (status) {
      case 'approved':
        return '#52c41a';
      case 'pending':
        return '#faad14';
      case 'rejected':
        return '#ff4d4f';
      case 'suspended':
        return '#722ed1';
      default:
        return '#d9d9d9';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'pending':
        return 'Pending';
      case 'rejected':
        return 'Rejected';
      case 'suspended':
        return 'Suspended';
      default:
        return 'Unknown';
    }
  }

  formatCompanySize(size?: string): string {
    if (!size) return 'Not specified';
    
    switch (size) {
      case 'small':
        return 'Small (1-50 employees)';
      case 'medium':
        return 'Medium (51-200 employees)';
      case 'large':
        return 'Large (201-1000 employees)';
      case 'enterprise':
        return 'Enterprise (1000+ employees)';
      default:
        return size;
    }
  }
}

export default new ExhibitorService(); 