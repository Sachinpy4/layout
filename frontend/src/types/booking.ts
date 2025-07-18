// Booking discount types
export interface BookingDiscount {
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  amount: number;
}

// Stall calculation for booking
export interface StallCalculation {
  stallId: string;
  number: string;
  baseAmount: number;
  area: number; // Calculated area for display
  ratePerSqm: number;
  dimensions: {
    width: number;
    height: number;
    shapeType?: 'rectangle' | 'l-shape';
  };
  discount?: BookingDiscount;
  amountAfterDiscount: number;
}

// Tax calculation
export interface TaxCalculation {
  name: string;
  rate: number;
  amount: number;
}

// Comprehensive booking calculations
export interface BookingCalculations {
  stalls: StallCalculation[];
  totalBaseAmount: number;
  totalDiscountAmount: number;
  appliedDiscounts: Array<{ name: string; type: string; value: number; amount: number }>;
  totalAmountAfterDiscount: number;
  taxes: TaxCalculation[];
  totalTaxAmount: number;
  totalAmount: number;
}

// Amenities
export interface BasicAmenityBooking {
  name: string;
  type: string;
  perSqm: number;
  quantity: number;
  calculatedQuantity: number;
  description?: string;
}

export interface ExtraAmenityBooking {
  id: string;
  name: string;
  type: string;
  rate: number;
  quantity: number;
  description?: string;
}

// Payment details
export interface PaymentDetails {
  method: string;
  transactionId?: string;
  paidAt: Date;
  gateway?: string;
  reference?: string;
}

// Main booking interface
export interface Booking {
  id: string;
  exhibitionId: string;
  stallIds: string[];
  userId: string;
  exhibitorId?: string;
  
  // Customer information
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerGSTIN?: string;
  customerPAN?: string;
  companyName: string;
  
  amount: number;
  basicAmenities: BasicAmenityBooking[];
  extraAmenities: ExtraAmenityBooking[];
  calculations: BookingCalculations;
  
  // Status management
  status: 'pending' | 'confirmed' | 'cancelled' | 'approved' | 'rejected';
  rejectionReason?: string;
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'partial';
  paymentDetails?: PaymentDetails;
  bookingSource: 'admin' | 'exhibitor' | 'public';
  
  // Additional information
  notes?: string;
  specialRequirements?: string;
  
  // Invoice information
  invoiceNumber?: string;
  invoiceGeneratedAt?: Date;
  
  // Approval workflow
  approvedBy?: string;
  approvedAt?: Date;
  
  // Cancellation
  cancelledBy?: string;
  cancelledAt?: Date;
  cancellationReason?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// Create booking DTO
export interface CreateBookingDto {
  exhibitionId: string;
  stallIds: string[];
  exhibitorId?: string;
  
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerGSTIN?: string;
  customerPAN?: string;
  companyName: string;
  
  amount: number;
  basicAmenities?: BasicAmenityBooking[];
  extraAmenities?: ExtraAmenityBooking[];
  calculations: BookingCalculations;
  bookingSource?: 'admin' | 'exhibitor' | 'public';
  notes?: string;
  specialRequirements?: string;
  selectedDiscount?: BookingDiscount;
}

// Booking form data
export interface BookingFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerGSTIN?: string;
  customerPAN?: string;
  companyName: string;
  notes?: string;
  specialRequirements?: string;
  basicAmenities?: BasicAmenityBooking[];
  extraAmenities?: ExtraAmenityBooking[];
  extraAmenitiesTotal?: number;
}

// Booking query parameters
export interface BookingQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  paymentStatus?: string;
  exhibitionId?: string;
  exhibitorId?: string;
  bookingSource?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Booking stats
export interface BookingStats {
  totalBookings: number;
  totalRevenue: number;
  pendingBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  pendingPayments: number;
  paidBookings: number;
}

// Update booking status DTO
export interface UpdateBookingStatusDto {
  status: 'pending' | 'confirmed' | 'cancelled' | 'approved' | 'rejected';
  rejectionReason?: string;
  cancellationReason?: string;
}

// Update payment status DTO
export interface UpdatePaymentStatusDto {
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'partial';
  paymentDetails?: PaymentDetails;
}

// API response types
export interface BookingResponse {
  success: boolean;
  message: string;
  data: Booking;
}

export interface BookingsListResponse {
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
  data: BookingStats;
}

// Booking context types
export interface BookingContextState {
  currentBooking: Partial<CreateBookingDto> | null;
  selectedStalls: Array<{
    stallId: string;
    number: string;
    dimensions: {
      width: number;
      height: number;
      shapeType?: 'rectangle' | 'l-shape';
    };
    ratePerSqm: number;
  }>;
  calculations: BookingCalculations | null;
  isSubmitting: boolean;
}

export interface BookingContextActions {
  setSelectedStalls: (stalls: BookingContextState['selectedStalls'], exhibition?: any) => void;
  updateCalculations: (calculations: BookingCalculations) => void;
  setCurrentBooking: (booking: Partial<CreateBookingDto>) => void;
  clearBooking: () => void;
  submitBooking: (formData: BookingFormData) => Promise<Booking>;
}

export type BookingContextType = BookingContextState & BookingContextActions; 