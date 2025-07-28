import api from '@/lib/api';
import { calculateStallArea } from '@/utils/stallUtils';
import { 
  Booking, 
  CreateBookingDto, 
  BookingQueryParams, 
  BookingResponse, 
  BookingsListResponse,
  BookingStatsResponse,
  UpdateBookingStatusDto,
  UpdatePaymentStatusDto,
  BookingStats
} from '@/types/booking';

class BookingService {
  private readonly basePath = '/bookings';

  /**
   * Create a new booking
   */
  async createBooking(data: CreateBookingDto): Promise<Booking> {
    try {
      const requestData = {
        ...data,
        bookingSource: 'public' // Always set as public for exhibitor bookings
      };
      console.log('BookingService: Making API request to create booking:', requestData);
      
      const response = await api.post<BookingResponse>(this.basePath, requestData);
      console.log('BookingService: Booking created successfully:', response.data);
      
      return response.data.data;
    } catch (error: any) {
      console.error('BookingService: API error:', error);
      console.error('BookingService: Error response:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to create booking');
    }
  }

  /**
   * Get all bookings with filtering and pagination
   */
  async getBookings(params: BookingQueryParams = {}): Promise<BookingsListResponse['data']> {
    try {
      const response = await api.get<BookingsListResponse>(this.basePath, {
        params
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch bookings');
    }
  }

  /**
   * Get bookings for a specific exhibition
   */
  async getBookingsByExhibition(exhibitionId: string, params: BookingQueryParams = {}): Promise<BookingsListResponse['data']> {
    try {
      const response = await api.get<BookingsListResponse>(`${this.basePath}/exhibition/${exhibitionId}`, {
        params
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch exhibition bookings');
    }
  }

  /**
   * Get bookings for a specific exhibitor
   */
  async getBookingsByExhibitor(exhibitorId: string, params: BookingQueryParams = {}): Promise<BookingsListResponse['data']> {
    try {
      const response = await api.get<BookingsListResponse>(`${this.basePath}/exhibitor/${exhibitorId}`, {
        params
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch exhibitor bookings');
    }
  }

  /**
   * Get a specific booking by ID
   */
  async getBooking(id: string): Promise<Booking> {
    try {
      // Add enhanced=true by default to get real-time calculations
      const response = await api.get<BookingResponse>(`${this.basePath}/${id}`, {
        params: { enhanced: true }
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch booking');
    }
  }

  /**
   * Update booking status
   */
  async updateBookingStatus(id: string, data: UpdateBookingStatusDto): Promise<Booking> {
    try {
      const response = await api.patch<BookingResponse>(`${this.basePath}/${id}/status`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update booking status');
    }
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(id: string, data: UpdatePaymentStatusDto): Promise<Booking> {
    try {
      const response = await api.patch<BookingResponse>(`${this.basePath}/${id}/payment`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update payment status');
    }
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(id: string, reason?: string): Promise<Booking> {
    return this.updateBookingStatus(id, {
      status: 'cancelled',
      cancellationReason: reason
    });
  }

  /**
   * Delete a booking
   */
  async deleteBooking(id: string): Promise<void> {
    try {
      await api.delete(`${this.basePath}/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete booking');
    }
  }

  /**
   * Get booking statistics
   */
  async getBookingStats(params: { exhibitionId?: string; exhibitorId?: string; startDate?: string; endDate?: string } = {}): Promise<BookingStats> {
    try {
      const response = await api.get<BookingStatsResponse>(`${this.basePath}/stats`, {
        params
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch booking statistics');
    }
  }

  /**
   * Get my bookings (for current user)
   */
  async getMyBookings(params: BookingQueryParams = {}): Promise<BookingsListResponse['data']> {
    try {
      // Add enhanced=true by default to get real-time calculations
      const enhancedParams = {
        ...params,
        enhanced: true
      };
      const response = await api.get<BookingsListResponse>(`${this.basePath}/me`, {
        params: enhancedParams
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch my bookings');
    }
  }

  /**
   * Calculate booking amounts for selected stalls with exhibition configuration
   * Following demo-src pattern exactly: calculateStallArea(dimensions) × ratePerSqm → discounts → taxes
   */
  calculateBookingAmounts(
    stalls: Array<{ 
      stallId: string; 
      number: string; 
      dimensions: {
        width: number;
        height: number;
        shapeType?: 'rectangle' | 'l-shape';
      };
      ratePerSqm: number;
    }>, 
    exhibition?: {
      taxConfig?: Array<{ name: string; rate: number; isActive: boolean }>;
      publicDiscountConfig?: Array<{ name: string; type: 'percentage' | 'fixed'; value: number; isActive: boolean }>;
    }
  ) {
    // STEP 1: Calculate base amount using demo-src pattern
    const stallsWithBaseAmount = stalls.map(stall => {
      const area = calculateStallArea(stall.dimensions);
      const baseAmount = Math.round(stall.ratePerSqm * area * 100) / 100;
      return {
        ...stall,
        area,
        baseAmount
      };
    });
    
    const totalBaseAmount = stallsWithBaseAmount.reduce((sum, stall) => sum + stall.baseAmount, 0);
    
    // CRITICAL FIX: Apply public discounts from exhibition config
    let totalDiscountAmount = 0;
    let appliedDiscounts: Array<{ name: string; type: string; value: number; amount: number }> = [];
    
    if (exhibition?.publicDiscountConfig) {
      exhibition.publicDiscountConfig
        .filter(discount => discount.isActive)
        .forEach(discount => {
          let discountAmount = 0;
          
          if (discount.type === 'percentage') {
            discountAmount = (totalBaseAmount * discount.value) / 100;
          } else if (discount.type === 'fixed') {
            discountAmount = discount.value;
          }
          
          totalDiscountAmount += discountAmount;
          appliedDiscounts.push({
            name: discount.name,
            type: discount.type,
            value: discount.value,
            amount: discountAmount
          });
        });
    }
    
    const totalAmountAfterDiscount = totalBaseAmount - totalDiscountAmount;
    
    // CRITICAL FIX: Apply taxes to discounted amount (following user's specification)
    const taxes: Array<{ name: string; rate: number; amount: number }> = [];
    let totalTaxAmount = 0;
    
    if (exhibition?.taxConfig) {
      exhibition.taxConfig
        .filter(tax => tax.isActive)
        .forEach(tax => {
          // Apply tax to the discounted amount, not the base amount
          const taxAmount = Math.round((totalAmountAfterDiscount * tax.rate / 100) * 100) / 100;
          taxes.push({
            name: tax.name,
            rate: tax.rate,
            amount: taxAmount
          });
          totalTaxAmount += taxAmount;
        });
    } else {
      // Fallback to 18% GST if no tax config (applied to discounted amount)
      const defaultGSTRate = 18;
      const gstAmount = Math.round((totalAmountAfterDiscount * defaultGSTRate / 100) * 100) / 100;
      taxes.push({
        name: 'GST',
        rate: defaultGSTRate,
        amount: gstAmount
      });
      totalTaxAmount = gstAmount;
    }
    
    const totalAmount = Math.round((totalAmountAfterDiscount + totalTaxAmount) * 100) / 100;

    return {
      stalls: stallsWithBaseAmount.map(stall => ({
        stallId: stall.stallId,
        number: stall.number,
        baseAmount: stall.baseAmount,
        area: stall.area, // Calculated area for display
        ratePerSqm: stall.ratePerSqm,
        dimensions: stall.dimensions, // Keep dimensions for future calculations
        amountAfterDiscount: stall.baseAmount * (1 - totalDiscountAmount / totalBaseAmount) // Proportional discount
      })),
      totalBaseAmount,
      totalDiscountAmount,
      appliedDiscounts,
      totalAmountAfterDiscount,
      taxes,
      totalTaxAmount,
      totalAmount
    };
  }

  /**
   * Format booking status for display
   */
  formatBookingStatus(status: string): { label: string; color: string } {
    const statusMap = {
      pending: { label: 'Pending Approval', color: 'yellow' },
      approved: { label: 'Approved', color: 'green' },
      rejected: { label: 'Rejected', color: 'red' },
      confirmed: { label: 'Confirmed', color: 'blue' },
      cancelled: { label: 'Cancelled', color: 'gray' }
    };
    
    return statusMap[status as keyof typeof statusMap] || { label: status, color: 'gray' };
  }

  /**
   * Format payment status for display
   */
  formatPaymentStatus(status: string): { label: string; color: string } {
    const statusMap = {
      pending: { label: 'Payment Pending', color: 'yellow' },
      paid: { label: 'Paid', color: 'green' },
      refunded: { label: 'Refunded', color: 'blue' },
      partial: { label: 'Partially Paid', color: 'orange' }
    };
    
    return statusMap[status as keyof typeof statusMap] || { label: status, color: 'gray' };
  }

  /**
   * Download invoice PDF
   */
  async downloadInvoice(bookingId: string): Promise<Blob> {
    try {
      const response = await api.get(`${this.basePath}/${bookingId}/invoice`, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf'
        }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to download invoice');
    }
  }

  /**
   * Get invoice preview URL (opens in new tab)
   */
  getInvoicePreviewUrl(bookingId: string): string {
    // Get the base URL from the api instance or default to localhost
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1';
    return `${baseUrl}/bookings/${bookingId}/invoice/preview`;
  }
}

export const bookingService = new BookingService(); 