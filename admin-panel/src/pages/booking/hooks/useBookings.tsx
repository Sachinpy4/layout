import { useState, useEffect } from 'react';
import { message } from 'antd';
import bookingService from '../../../services/booking.service';
import { Booking, BookingQueryParams, UseBookingsReturn } from '../types';

export const useBookings = (): UseBookingsReturn => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [paymentFilter, setPaymentFilter] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<string>('');
  const [exhibitionFilter, setExhibitionFilter] = useState<string>('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Fetch bookings from API
  const fetchBookings = async (params: BookingQueryParams = {}) => {
    try {
      setLoading(true);
      const queryParams: BookingQueryParams = {
        page: pagination.current,
        limit: pagination.pageSize,
        search: searchText || undefined,
        status: statusFilter as any || undefined,
        paymentStatus: paymentFilter as any || undefined,
        bookingSource: sourceFilter as any || undefined,
        exhibitionId: exhibitionFilter || undefined,
        ...params
      };

      const response = await bookingService.getBookings(queryParams);
      setBookings(response.data.bookings);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination.total,
        current: response.data.pagination.page,
      }));
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchBookings();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPagination(prev => ({ ...prev, current: 1 }));
      fetchBookings({ page: 1 });
    }, 500); // Debounce search
    
    return () => clearTimeout(timeoutId);
  }, [searchText, statusFilter, paymentFilter, sourceFilter, exhibitionFilter]);

  return {
    bookings,
    loading,
    pagination,
    searchText,
    statusFilter,
    paymentFilter,
    sourceFilter,
    exhibitionFilter,
    fetchBookings,
    setSearchText,
    setStatusFilter,
    setPaymentFilter,
    setSourceFilter,
    setExhibitionFilter,
    setPagination,
  };
}; 