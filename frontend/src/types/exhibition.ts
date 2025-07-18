export interface Exhibition {
  _id: string;
  name: string;
  description: string;
  venue: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'published' | 'completed';
  isActive: boolean;
  thumbnail?: string;
  images?: string[];
  organizerName: string;
  organizerEmail: string;
  organizerPhone: string;
  registrationDeadline: string;
  maxExhibitors: number;
  currentExhibitors: number;
  bookingEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  
  // CRITICAL ADDITION: Tax and Discount Configuration
  taxConfig?: Array<{
    name: string;
    rate: number;
    isActive: boolean;
  }>;
  discountConfig?: Array<{
    name: string;
    type: 'percentage' | 'fixed';
    value: number;
    isActive: boolean;
  }>;
  publicDiscountConfig?: Array<{
    name: string;
    type: 'percentage' | 'fixed';
    value: number;
    isActive: boolean;
  }>;
  
  // Stall rates for pricing calculation
  stallRates?: Array<{
    stallTypeId: string;
    rate: number;
  }>;
}

export interface ExhibitionSpace {
  _id: string;
  name: string;
  width: number;
  height: number;
  canvasSettings: {
    zoom: number;
    panX: number;
    panY: number;
  };
}

export interface ExhibitionHall {
  _id: string;
  name: string;
  spaceId: string;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  color: string;
  stallCount: number;
  availableStalls: number;
}

export interface Stall {
  _id: string;
  stallNumber: string;
  hallId: string;
  stallTypeId: string;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  // CRITICAL: Following demo-src pattern - dimensions for area calculation
  dimensions: {
    width: number;
    height: number;
    shapeType?: 'rectangle' | 'l-shape';
    lShape?: {
      rect1Width: number;
      rect1Height: number;
      rect2Width: number;
      rect2Height: number;
      orientation: string;
    };
  };
  ratePerSqm: number; // Rate per square meter for booking calculations
  basePrice: number;
  totalPrice: number;
  isBooked: boolean;
  bookedBy?: string;
  status: 'available' | 'booked' | 'blocked';
}

export interface StallType {
  _id: string;
  name: string;
  description: string;
  color: string;
  // Frontend expected properties
  basePrice?: number;
  dimensions?: {
    width: number;
    height: number;
  };
  // Backend actual properties
  defaultRate?: number;
  defaultSize?: {
    width: number;
    height: number;
  };
  // Additional backend properties
  category?: string;
  rateType?: string;
  includedAmenities?: string[];
  availableAmenities?: string[];
  minimumBookingDuration?: number;
  maximumBookingDuration?: number;
  isActive?: boolean;
  sortOrder?: number;
  createdBy?: string;
  updatedBy?: string;
}

export interface Layout {
  _id: string;
  exhibitionId: string;
  spaces: ExhibitionSpace[];
  halls: ExhibitionHall[];
  stalls: Stall[];
  version: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExhibitionWithLayout extends Exhibition {
  layout?: Layout;
  stallTypes: StallType[];
}

export interface ExhibitionListParams {
  page?: number;
  limit?: number;
  status?: 'draft' | 'published' | 'completed';
  isActive?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ExhibitionListResponse {
  exhibitions: Exhibition[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
} 