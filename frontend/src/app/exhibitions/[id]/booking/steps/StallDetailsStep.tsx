'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, X, MapPin, Ruler, Package, Building } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { Exhibition } from '@/types/exhibition';
import { BookingCalculations, StallCalculation } from '@/types/booking';

interface StallDetailsStepProps {
  exhibition: Exhibition | null;
  selectedStalls: Array<{
    stallId: string;
    number: string;
    dimensions: {
      width: number;
      height: number;
      shapeType?: 'rectangle' | 'l-shape';
    };
    ratePerSqm: number;
    stallType?: { name: string };
    stallTypeName?: string;
  }>;
  calculations: BookingCalculations | null;
  formData: Record<string, any>;
  onNext: () => void;
  onUpdateData: (data: Record<string, any>) => void;
  onRemoveStall?: (stallId: string) => void; // ADDED: Function to remove stall
}

const StallDetailsStep: React.FC<StallDetailsStepProps> = ({
  exhibition,
  selectedStalls,
  calculations,
  formData,
  onNext,
  onUpdateData,
  onRemoveStall
}) => {
  const handleRemoveStall = (stallId: string) => {
    if (onRemoveStall) {
      onRemoveStall(stallId);
    } else {
      console.warn('onRemoveStall prop not provided - cannot remove stall');
    }
  };

  const calculateStallArea = (stall: any) => {
    if (!stall.dimensions) return 0;
    const { width, height, shapeType } = stall.dimensions;
    
    if (shapeType === 'l-shape' && stall.dimensions.lShape) {
      const { rect1Width, rect1Height, rect2Width, rect2Height } = stall.dimensions.lShape;
      return (rect1Width * rect1Height) + (rect2Width * rect2Height);
    }
    
    return width * height;
  };

  const formatDimensions = (stall: any) => {
    if (!stall.dimensions) return 'N/A';
    const { width, height, shapeType } = stall.dimensions;
    
    if (shapeType === 'l-shape') {
      return 'L-Shape';
    }
    
    return `${width}m × ${height}m`;
  };

  const getStallTypeName = (stall: any) => {
    // Try to get stall type name from different possible sources
    return stall.stallType?.name || stall.stallTypeName || 'Standard Stall';
  };

  // Get stall calculation from calculations prop if available, fallback to manual calculation
  const getStallCalculation = (stall: any) => {
    // Try to find the stall in the calculations first
    if (calculations?.stalls) {
      const stallCalc = calculations.stalls.find(s => s.stallId === stall.stallId);
      if (stallCalc) {
        return {
          area: stallCalc.area,
          baseAmount: stallCalc.baseAmount,
          ratePerSqm: stallCalc.ratePerSqm
        };
      }
    }
    
    // Fallback to manual calculation
    const area = calculateStallArea(stall);
    const baseAmount = area * (stall.ratePerSqm || 0);
    return {
      area,
      baseAmount,
      ratePerSqm: stall.ratePerSqm || 0
    };
  };

  // Handle empty state
  if (!selectedStalls || selectedStalls.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Your Selected Stalls</h2>
          <p className="text-muted-foreground">
            Review your selected stalls. You can remove a stall by clicking the remove button.
          </p>
        </div>

        <Card>
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Stalls Selected</h3>
              <p>Please go back to the layout to select stalls for booking.</p>
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="mt-4"
              >
                Back to Layout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Your Selected Stalls</h2>
        <p className="text-muted-foreground">
          Review your selected stalls. You can remove a stall by clicking the remove button.
        </p>
      </div>

      {selectedStalls.length > 0 && (
        <>
          {/* Selected Stalls Summary Table */}
          <Card>
            <CardHeader>
              <CardTitle>Selected Stalls Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-semibold">Stall Number</th>
                      <th className="text-left p-3 font-semibold">Stall Type</th>
                      <th className="text-left p-3 font-semibold">Dimensions</th>
                      <th className="text-left p-3 font-semibold">Area (sqm)</th>
                      <th className="text-left p-3 font-semibold">Rate/sq.m</th>
                      <th className="text-left p-3 font-semibold">Base Amount</th>
                      <th className="text-center p-3 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedStalls.map((stall) => {
                        const { area, baseAmount, ratePerSqm } = getStallCalculation(stall);
                        
                        // Debug log to see stall data structure
                        if (process.env.NODE_ENV === 'development') {
                          console.log('Stall data in details step:', {
                            stallId: stall.stallId,
                            number: stall.number,
                            stallType: stall.stallType,
                            stallTypeName: stall.stallTypeName,
                            dimensions: stall.dimensions,
                            ratePerSqm,
                            area,
                            baseAmount
                          });
                        }
                        
                        return (
                          <tr key={stall.stallId} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-medium">{stall.number}</td>
                            <td className="p-3">{getStallTypeName(stall)}</td>
                            <td className="p-3">{formatDimensions(stall)}</td>
                            <td className="p-3">{area.toFixed(2)}</td>
                            <td className="p-3">{formatCurrency(ratePerSqm)}</td>
                            <td className="p-3 font-semibold">{formatCurrency(baseAmount)}</td>
                            <td className="p-3 text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveStall(stall.stallId)}
                                className="text-muted-foreground hover:text-destructive"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 font-semibold bg-gray-50">
                      <td colSpan={5} className="p-3 text-right">Total Base Amount</td>
                      <td className="p-3">{formatCurrency(calculations?.totalBaseAmount || 0)}</td>
                      <td className="p-3"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Breakdown */}
          {calculations && (
            <Card>
              <CardHeader>
                <CardTitle>Pricing Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Base Amount:</span>
                    <span className="font-semibold">{formatCurrency(calculations.totalBaseAmount)}</span>
                  </div>
                  
                  {/* Show discounts */}
                  {calculations.appliedDiscounts && calculations.appliedDiscounts.length > 0 && (
                    calculations.appliedDiscounts.map((discount: any, index: number) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-green-600">
                          {discount.name} ({discount.type === 'percentage' ? `${discount.value}%` : formatCurrency(discount.value)}):
                        </span>
                        <span className="text-green-600">-{formatCurrency(discount.amount)}</span>
                      </div>
                    ))
                  )}
                  
                  {/* Show amount after discount if there are discounts */}
                  {calculations.totalDiscountAmount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Amount after Discount:</span>
                      <span className="font-semibold">{formatCurrency(calculations.totalAmountAfterDiscount)}</span>
                    </div>
                  )}
                  
                  {/* Show taxes */}
                  {calculations.taxes && calculations.taxes.length > 0 && (
                    calculations.taxes.map((tax: any, index: number) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">{tax.name} ({tax.rate}%):</span>
                        <span>₹{formatCurrency(tax.amount)}</span>
                      </div>
                    ))
                  )}
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total Amount (incl. Taxes):</span>
                    <span className="text-primary">{formatCurrency(calculations.totalAmount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Continue Button */}
          <div className="flex justify-center">
            <Button
              onClick={onNext}
              size="lg"
              disabled={selectedStalls.length === 0}
              className="min-w-40"
            >
              Continue to Amenities
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default StallDetailsStep; 