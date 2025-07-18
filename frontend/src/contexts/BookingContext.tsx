'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { bookingService } from '@/services/booking.service';
import { 
  BookingContextType, 
  BookingContextState, 
  BookingFormData, 
  CreateBookingDto,
  BookingCalculations
} from '@/types/booking';
import { useAuth } from '@/contexts/auth.context';

// Initial state
const initialState: BookingContextState = {
  currentBooking: null,
  selectedStalls: [],
  calculations: null,
  isSubmitting: false,
};

// Actions
type BookingAction =
  | { type: 'SET_SELECTED_STALLS'; payload: BookingContextState['selectedStalls'] }
  | { type: 'UPDATE_CALCULATIONS'; payload: BookingCalculations }
  | { type: 'SET_CURRENT_BOOKING'; payload: Partial<CreateBookingDto> }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'CLEAR_BOOKING' };

// Reducer
function bookingReducer(state: BookingContextState, action: BookingAction): BookingContextState {
  switch (action.type) {
    case 'SET_SELECTED_STALLS':
      return {
        ...state,
        selectedStalls: action.payload,
      };
    case 'UPDATE_CALCULATIONS':
      return {
        ...state,
        calculations: action.payload,
      };
    case 'SET_CURRENT_BOOKING':
      return {
        ...state,
        currentBooking: action.payload,
      };
    case 'SET_SUBMITTING':
      return {
        ...state,
        isSubmitting: action.payload,
      };
    case 'CLEAR_BOOKING':
      return initialState;
    default:
      return state;
  }
}

// Context
const BookingContext = createContext<BookingContextType | undefined>(undefined);

// Provider
export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(bookingReducer, initialState);
  const { user } = useAuth();
  const router = useRouter();

  // Actions
  const setSelectedStalls = (stalls: BookingContextState['selectedStalls'], exhibition?: any) => {
    dispatch({ type: 'SET_SELECTED_STALLS', payload: stalls });
    
    // Automatically calculate pricing when stalls change
    if (stalls.length > 0) {
      const calculations = bookingService.calculateBookingAmounts(stalls, exhibition);
      dispatch({ type: 'UPDATE_CALCULATIONS', payload: calculations });
    } else {
      dispatch({ type: 'UPDATE_CALCULATIONS', payload: null as any });
    }
  };

  const updateCalculations = (calculations: BookingCalculations) => {
    dispatch({ type: 'UPDATE_CALCULATIONS', payload: calculations });
  };

  const setCurrentBooking = (booking: Partial<CreateBookingDto>) => {
    dispatch({ type: 'SET_CURRENT_BOOKING', payload: booking });
  };

  const clearBooking = () => {
    dispatch({ type: 'CLEAR_BOOKING' });
  };

  const submitBooking = async (formData: BookingFormData) => {
    console.log('BookingContext: submitBooking called with data:', formData);
    console.log('BookingContext: User:', user);
    console.log('BookingContext: State:', state);
    
    if (!user?.id) {
      console.error('BookingContext: User not authenticated');
      throw new Error('User not authenticated');
    }

    if (!state.calculations || state.selectedStalls.length === 0) {
      console.error('BookingContext: No stalls selected or calculations missing', {
        calculations: state.calculations,
        selectedStalls: state.selectedStalls
      });
      throw new Error('No stalls selected or calculations missing');
    }

    if (!state.currentBooking?.exhibitionId) {
      console.error('BookingContext: Exhibition ID missing', state.currentBooking);
      throw new Error('Exhibition ID missing');
    }

    dispatch({ type: 'SET_SUBMITTING', payload: true });

    try {
      // Filter out any extra fields that aren't in the DTO
      const createBookingData: CreateBookingDto = {
        exhibitionId: state.currentBooking.exhibitionId,
        stallIds: state.selectedStalls.map(stall => stall.stallId),
        exhibitorId: user.id, // Use user ID as exhibitor ID
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        customerAddress: formData.customerAddress,
        customerGSTIN: formData.customerGSTIN,
        customerPAN: formData.customerPAN,
        companyName: formData.companyName,
        amount: state.calculations.totalAmount,
        basicAmenities: formData.basicAmenities || [],
        extraAmenities: formData.extraAmenities || [],
        calculations: state.calculations,
        bookingSource: 'public',
        notes: formData.notes,
        specialRequirements: formData.specialRequirements,
      };

      console.log('BookingContext: Sending booking data to service:', createBookingData);
      const booking = await bookingService.createBooking(createBookingData);
      console.log('BookingContext: Booking created successfully:', booking);

      toast({
        title: 'Booking Created Successfully!',
        description: `Your booking has been submitted for approval. Booking ID: ${booking.invoiceNumber || booking.id}`,
      });

      // Clear the booking state
      clearBooking();

      // Redirect to booking confirmation page
      router.push(`/bookings/${booking.id}` as any);

      return booking;
    } catch (error: any) {
      console.error('BookingContext: Booking creation failed:', error);
      toast({
        title: 'Booking Failed',
        description: error.message || 'Failed to create booking. Please try again.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  };

  const contextValue: BookingContextType = {
    ...state,
    setSelectedStalls,
    updateCalculations,
    setCurrentBooking,
    clearBooking,
    submitBooking,
  };

  return (
    <BookingContext.Provider value={contextValue}>
      {children}
    </BookingContext.Provider>
  );
}

// Hook
export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
} 