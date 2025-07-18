import { Booking, BookingQueryParams, BookingStatsResponse, UpdateBookingStatusData } from '../../../services/booking.service';

// Re-export service types
export type { Booking, BookingQueryParams, BookingStatsResponse, UpdateBookingStatusData };

// Local component props interfaces
export interface BookingHeaderProps {
  loading: boolean;
  statsLoading: boolean;
  onRefresh: () => void;
  onExport: () => void;
  onCreate: () => void;
}

export interface BookingStatsProps {
  stats: BookingStatsResponse['data'] | null;
  loading: boolean;
}

export interface BookingFiltersProps {
  searchText: string;
  statusFilter: string;
  paymentFilter: string;
  sourceFilter: string;
  exhibitionFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPaymentChange: (value: string) => void;
  onSourceChange: (value: string) => void;
  onExhibitionChange: (value: string) => void;
}

export interface BookingTableProps {
  bookings: Booking[];
  loading: boolean;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  onTableChange: (pagination: any) => void;
  onView: (booking: Booking) => void;
  onUpdateStatus: (booking: Booking) => void;
  onDelete: (booking: Booking) => void;
}

export interface BookingActionsProps {
  booking: Booking;
  onView: () => void;
  onUpdateStatus: () => void;
  onDelete: () => void;
}

export interface ViewBookingModalProps {
  booking: Booking | null;
  visible: boolean;
  onClose: () => void;
  onUpdateStatus: () => void;
}

export interface StatusUpdateModalProps {
  booking: Booking | null;
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: UpdateBookingStatusData) => Promise<void>;
}

// Hook return types
export interface UseBookingsReturn {
  bookings: Booking[];
  loading: boolean;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  searchText: string;
  statusFilter: string;
  paymentFilter: string;
  sourceFilter: string;
  exhibitionFilter: string;
  fetchBookings: (params?: BookingQueryParams) => Promise<void>;
  setSearchText: (value: string) => void;
  setStatusFilter: (value: string) => void;
  setPaymentFilter: (value: string) => void;
  setSourceFilter: (value: string) => void;
  setExhibitionFilter: (value: string) => void;
  setPagination: React.Dispatch<React.SetStateAction<{current: number; pageSize: number; total: number}>>;
}

export interface UseBookingStatsReturn {
  stats: BookingStatsResponse['data'] | null;
  loading: boolean;
  fetchStats: () => Promise<void>;
} 