import { useState, useEffect } from 'react';
import bookingService from '../../../services/booking.service';
import { BookingStatsResponse, UseBookingStatsReturn } from '../types';

export const useBookingStats = (): UseBookingStatsReturn => {
  const [stats, setStats] = useState<BookingStatsResponse['data'] | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch booking statistics
  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getBookingStats();
      setStats(response.data);
    } catch (error: any) {
      console.error('Failed to fetch stats:', error.message);
      // Don't show error for stats as it's not critical
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    fetchStats,
  };
}; 