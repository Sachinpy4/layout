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
export interface StallCalculation {
  stallId: string;
  number: string;
  baseAmount: number;
  discount?: {
    type: string;
    value: number;
    discountAmount: number;
  };
  amountAfterDiscount: number;
  dimensions?: {
    width: number;
    height: number;
    shapeType: string;
  } | null;
}

export interface BookingCalculations {
  stalls: StallCalculation[];
  totalBaseAmount: number;
  totalDiscountAmount: number;
  totalAmountAfterDiscount: number;
  taxes: any[];
  totalTaxAmount: number;
  totalAmount: number;
}

export interface Booking {
  _id: string;
  exhibitionId: {
    _id: string;
    name: string;
    venue: string;
    startDate: string;
    endDate: string;
  };
  stallIds: string[];
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  exhibitorId?: {
    _id: string;
    companyName: string;
    contactPerson: string;
    email: string;
  };
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerGSTIN?: string;
  customerPAN?: string;
  companyName: string;
  amount: number;
  basicAmenities: any[];
  extraAmenities: any[];
  calculations: BookingCalculations;
  status: 'pending' | 'confirmed' | 'cancelled' | 'approved' | 'rejected';
  rejectionReason?: string;
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'partial';
  paymentDetails?: any;
  bookingSource: 'admin' | 'exhibitor' | 'public';
  notes?: string;
  specialRequirements?: string;
  invoiceNumber?: string;
  invoiceGeneratedAt?: string;
  approvedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  approvedAt?: string;
  cancelledBy?: {
    _id: string;
    name: string;
    email: string;
  };
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'approved' | 'rejected';
  paymentStatus?: 'pending' | 'paid' | 'refunded' | 'partial';
  exhibitionId?: string;
  exhibitorId?: string;
  bookingSource?: 'admin' | 'exhibitor' | 'public';
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface BookingListResponse {
  success: boolean;
  message: string;
  data: {
    bookings: Booking[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface BookingStatsResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    pending: number;
    confirmed: number;
    cancelled: number;
    approved: number;
    rejected: number;
    totalAmount: number;
    totalStalls: number;
    averageBookingValue: number;
    byStatus: Record<string, number>;
    byPaymentStatus: Record<string, number>;
    bySource: Record<string, number>;
    recentBookings: Booking[];
  };
}

export interface UpdateBookingStatusData {
  status: 'pending' | 'confirmed' | 'cancelled' | 'approved' | 'rejected';
  rejectionReason?: string;
  cancellationReason?: string;
}

export interface UpdatePaymentStatusData {
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'partial';
  paymentDetails?: any;
}

class BookingService {
  private readonly endpoint = '/bookings';

  // Get all bookings with filters and pagination
  async getBookings(params: BookingQueryParams = {}): Promise<BookingListResponse> {
    try {
      const response = await api.get(this.endpoint, { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch bookings');
    }
  }

  // Get booking by ID
  async getBooking(id: string): Promise<{ success: boolean; data: Booking; message: string }> {
    try {
      const response = await api.get(`${this.endpoint}/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch booking');
    }
  }

  // Get booking statistics
  async getBookingStats(params: { exhibitionId?: string; startDate?: string; endDate?: string } = {}): Promise<BookingStatsResponse> {
    try {
      const response = await api.get(`${this.endpoint}/stats`, { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch booking statistics');
    }
  }

  // Update booking status (approve, reject, confirm, cancel)
  async updateBookingStatus(id: string, data: UpdateBookingStatusData): Promise<{ success: boolean; data: Booking; message: string }> {
    try {
      const response = await api.patch(`${this.endpoint}/${id}/status`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update booking status');
    }
  }

  // Update payment status
  async updatePaymentStatus(id: string, data: UpdatePaymentStatusData): Promise<{ success: boolean; data: Booking; message: string }> {
    try {
      const response = await api.patch(`${this.endpoint}/${id}/payment`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update payment status');
    }
  }

  // Delete booking
  async deleteBooking(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete(`${this.endpoint}/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete booking');
    }
  }

  // Get bookings by exhibition
  async getBookingsByExhibition(exhibitionId: string, params: BookingQueryParams = {}): Promise<BookingListResponse> {
    try {
      const response = await api.get(`${this.endpoint}/exhibition/${exhibitionId}`, { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch exhibition bookings');
    }
  }

  // Get bookings by exhibitor
  async getBookingsByExhibitor(exhibitorId: string, params: BookingQueryParams = {}): Promise<BookingListResponse> {
    try {
      const response = await api.get(`${this.endpoint}/exhibitor/${exhibitorId}`, { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch exhibitor bookings');
    }
  }

  // Create new booking
  async createBooking(data: any): Promise<{ success: boolean; data: Booking; message: string }> {
    try {
      const response = await api.post(this.endpoint, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create booking');
    }
  }
}

const bookingService = new BookingService();
export default bookingService; 