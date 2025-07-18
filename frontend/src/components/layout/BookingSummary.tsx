'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useBooking } from '@/contexts/BookingContext';
import { useAuth } from '@/contexts/auth.context';
import { AuthManager } from '@/components/auth/AuthManager';
import { calculateStallArea } from '@/utils/stallUtils';
import { 
  CreditCard, 
  LogIn, 
  X, 
  MapPin, 
  Package, 
  Calculator,
  IndianRupee
} from 'lucide-react';

interface BookingSummaryProps {
  selectedStalls: any[];
  bookingCalculation: any;
  exhibitionId: string;
  exhibition?: any; // CRITICAL ADDITION: Exhibition config for proper pricing
  onRemoveStall: (stallId: string) => void;
  onClearSelection: () => void;
}

export function BookingSummary({
  selectedStalls,
  bookingCalculation,
  exhibitionId,
  exhibition,
  onRemoveStall,
  onClearSelection,
}: BookingSummaryProps) {
  const router = useRouter();
  const { setSelectedStalls, setCurrentBooking, calculations } = useBooking();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleProceedToBooking = () => {
    if (selectedStalls.length === 0) {
      toast({
        title: 'No Stalls Selected',
        description: 'Please select at least one stall to proceed with booking.',
        variant: 'destructive',
      });
      return;
    }

    if (!isAuthenticated) {
      // Open login modal instead of redirecting
      setIsAuthModalOpen(true);
      return;
    }

    if (!user?.isApproved) {
      toast({
        title: 'Account Pending Approval',
        description: 'Your account is pending approval. Please wait for admin approval to book stalls.',
        variant: 'destructive',
      });
      return;
    }

    // Convert to booking context format with proper calculation structure (following demo-src pattern)
    const bookingStalls = selectedStalls.map(stall => ({
      stallId: stall._id,
      number: stall.stallNumber,
      dimensions: stall.dimensions || { width: 1, height: 1, shapeType: 'rectangle' as const },
      ratePerSqm: stall.ratePerSqm || 0, // Use rate per sqm for proper calculation
      stallType: stall.stallType || { name: stall.stallTypeName || 'Standard Stall' },
      stallTypeName: stall.stallTypeName || stall.stallType?.name || 'Standard Stall'
    }));

    // Update booking context with exhibition config for proper pricing
    setSelectedStalls(bookingStalls, exhibition);
    setCurrentBooking({ exhibitionId });

    // Navigate to booking page
    router.push(`/exhibitions/${exhibitionId}/booking`);
  };

  const handleAuthModalClose = () => {
    setIsAuthModalOpen(false);
  };

  const getBookingButtonContent = () => {
    if (!isAuthenticated) {
      return (
        <>
          <LogIn className="mr-2 h-4 w-4" />
          Sign In to Book Stalls
        </>
      );
    }

    if (!user?.isApproved) {
      return (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          Account Pending Approval
        </>
      );
    }

    return (
      <>
        <CreditCard className="mr-2 h-4 w-4" />
        Book Selected Stalls
      </>
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (selectedStalls.length === 0) {
    return (
      <Card className="sticky top-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Booking Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <MapPin className="h-12 w-12 mx-auto" />
            </div>
            <p className="text-gray-600 mb-2">No stalls selected</p>
            <p className="text-sm text-gray-500">
              Select stalls from the layout to see your booking summary
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="sticky top-4">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Booking Summary
            </span>
            <Badge variant="secondary">
              {selectedStalls.length} stall{selectedStalls.length > 1 ? 's' : ''}
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Selected Stalls List */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700">Selected Stalls</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {selectedStalls.map((stall) => {
                // Calculate area using demo-src pattern
                const area = calculateStallArea(stall.dimensions);
                const calculatedPrice = stall.ratePerSqm * area;
                const dimensionText = stall.dimensions?.shapeType === 'l-shape' 
                  ? 'L-Shape' 
                  : `${stall.dimensions?.width || 0}m × ${stall.dimensions?.height || 0}m`;
                
                return (
                  <div
                    key={stall._id}
                    className="flex items-center justify-between bg-gray-50 p-2 rounded"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-sm font-medium">
                          Stall {stall.stallNumber}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 ml-5">
                        {dimensionText} = {area.toFixed(2)} m²
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {formatPrice(calculatedPrice)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveStall(stall._id)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pricing Breakdown */}
          {calculations && calculations.totalBaseAmount > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-700 flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Price Breakdown
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Total Base Amount:</span>
                  <span>{formatPrice(calculations.totalBaseAmount)}</span>
                </div>
                
                {/* Show discounts if any */}
                {calculations.appliedDiscounts && calculations.appliedDiscounts.length > 0 && (
                  calculations.appliedDiscounts.map((discount, index) => (
                    <div key={index} className="flex justify-between text-green-600">
                      <span>{discount.name} ({discount.type === 'percentage' ? `${discount.value}%` : `₹${discount.value}`}):</span>
                      <span>-{formatPrice(discount.amount)}</span>
                    </div>
                  ))
                )}
                
                {/* Show amount after discount if there are discounts */}
                {calculations.totalDiscountAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Amount after Discount:</span>
                    <span>{formatPrice(calculations.totalAmountAfterDiscount)}</span>
                  </div>
                )}
                
                {/* Show taxes */}
                {calculations.taxes && calculations.taxes.length > 0 && (
                  calculations.taxes.map((tax, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{tax.name} ({tax.rate}%):</span>
                      <span>₹{formatPrice(tax.amount)}</span>
                    </div>
                  ))
                )}
                
                <div className="border-t pt-1 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total Amount (incl. Taxes):</span>
                    <span className="text-blue-600">{formatPrice(calculations.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-4">
            <Button
              onClick={handleProceedToBooking}
              className="w-full"
              disabled={!isAuthenticated && !user?.isApproved}
            >
              {getBookingButtonContent()}
            </Button>
            
            <Button
              variant="outline"
              onClick={onClearSelection}
              className="w-full"
            >
              Clear Selection
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Auth Manager */}
      <AuthManager 
        isOpen={isAuthModalOpen}
        onClose={handleAuthModalClose}
        initialMode="login"
      />
    </>
  );
} 