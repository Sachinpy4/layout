// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'vendor' | 'customer';
  avatar?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  updatedAt: string;
}

// Stall types
export interface Stall {
  id: string;
  name: string;
  description: string;
  location: string;
  size: string;
  price: number;
  images: string[];
  amenities: string[];
  availability: 'available' | 'booked' | 'maintenance';
  category: string;
  createdAt: string;
  updatedAt: string;
}

// Booking types
export interface Booking {
  id: string;
  stallId: string;
  userId: string;
  exhibitionId: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: string;
  updatedAt: string;
}

// Exhibition types
export interface Exhibition {
  id: string;
  _id?: string; // For MongoDB compatibility
  
  // Basic Information
  name: string;
  description: string;
  venue: string;
  startDate: string;
  endDate: string;
  registrationDeadline?: string;
  status: 'draft' | 'published' | 'completed';
  isActive: boolean;
  createdBy: string;
  invoicePrefix?: string;
  slug?: string;
  
  // Layout dimensions
  dimensions?: {
    width: number;
    height: number;
  };
  
  // Stall rates configuration
  stallRates?: Array<{
    stallTypeId: string;
    rate: number;
  }>;
  
  // Tax and Discount Configuration
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
  theme?: string;

  // Company Details
  companyName?: string;
  companyContactNo?: string;
  companyEmail?: string;
  companyAddress?: string;
  companyWebsite?: string;
  companyPAN?: string;
  companyGST?: string;
  companySAC?: string;
  companyCIN?: string;
  termsAndConditions?: string;
  piInstructions?: string;

  // Bank Details
  bankName?: string;
  bankBranch?: string;
  bankIFSC?: string;
  bankAccountName?: string;
  bankAccount?: string;

  // Header settings
  headerTitle?: string;
  headerSubtitle?: string;
  headerDescription?: string;
  headerLogo?: string;
  sponsorLogos?: string[];

  // Footer settings
  footerText?: string;
  footerLogo?: string;
  contactEmail?: string;
  contactPhone?: string;
  footerLinks?: Array<{
    label: string;
    url: string;
  }>;

  // Amenities settings
  amenities?: Array<{
    type: 'facility' | 'service' | 'equipment' | 'other';
    name: string;
    description: string;
    rate: number;
  }>;

  // Basic amenities included with stall booking
  basicAmenities?: Array<{
    type: 'facility' | 'service' | 'equipment' | 'other';
    name: string;
    description: string;
    perSqm: number;
    quantity: number;
  }>;

  specialRequirements?: string;
  
  // Legacy fields for backward compatibility
  totalStalls?: number;
  bookedStalls?: number;
  bannerImage?: string;
  organizerId?: string;
  createdAt: string;
  updatedAt: string;
}

// Stall Type interface
export interface StallType {
  id: string;
  _id?: string;
  name: string;
  description: string;
  category: string;
  defaultRate: number;
  createdAt: string;
  updatedAt: string;
}

// Dashboard stats
export interface DashboardStats {
  totalUsers: number;
  totalStalls: number;
  totalBookings: number;
  totalRevenue: number;
  activeExhibitions: number;
  monthlyRevenue: number[];
  recentBookings: Booking[];
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface CreateUserForm {
  name: string;
  email: string;
  password: string;
  role: string;
  phone?: string;
}

export interface CreateStallForm {
  name: string;
  description: string;
  location: string;
  size: string;
  price: number;
  category: string;
  amenities: string[];
}

export interface CreateExhibitionForm {
  // Basic Information
  name: string;
  description: string;
  venue: string;
  startDate: string;
  endDate: string;
  registrationDeadline?: string;
  status: 'draft' | 'published' | 'completed';
  isActive: boolean;
  invoicePrefix?: string;
  
  // Layout dimensions
  dimensions?: {
    width: number;
    height: number;
  };
  
  // Stall rates configuration
  stallRates?: Array<{
    stallTypeId: string;
    rate: number;
  }>;
  
  // Tax and Discount Configuration
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

  // Company Details
  companyName?: string;
  companyContactNo?: string;
  companyEmail?: string;
  companyAddress?: string;
  companyWebsite?: string;
  companyPAN?: string;
  companyGST?: string;
  companySAC?: string;
  companyCIN?: string;
  termsAndConditions?: string;
  piInstructions?: string;

  // Bank Details
  bankName?: string;
  bankBranch?: string;
  bankIFSC?: string;
  bankAccountName?: string;
  bankAccount?: string;

  // Header settings
  headerTitle?: string;
  headerSubtitle?: string;
  headerDescription?: string;
  headerLogo?: string;
  sponsorLogos?: string[];

  // Footer settings
  footerText?: string;
  footerLogo?: string;
  contactEmail?: string;
  contactPhone?: string;
  footerLinks?: Array<{
    label: string;
    url: string;
  }>;

  // Amenities settings
  amenities?: Array<{
    type: 'facility' | 'service' | 'equipment' | 'other';
    name: string;
    description: string;
    rate: number;
  }>;

  basicAmenities?: Array<{
    type: 'facility' | 'service' | 'equipment' | 'other';
    name: string;
    description: string;
    perSqm: number;
    quantity: number;
  }>;

  specialRequirements?: string;
} 