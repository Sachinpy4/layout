'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  User, 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  FileText, 
  CheckCircle2,
  Package,
  Calculator
} from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { Exhibition } from '@/types/exhibition';
import { BookingCalculations } from '@/types/booking';
import { calculateStallArea, formatStallDimensions } from '@/utils/stallUtils';
import { useAuth } from '@/contexts/auth.context';

interface ReviewStepProps {
  exhibition: Exhibition | null;
  selectedStalls: Array<{
    stallId: string;
    number: string;
    dimensions: {
      width: number;
      height: number;
      shapeType?: 'rectangle' | 'l-shape';
      lShape?: {
        rect1Width: number;
        rect1Height: number;
        rect2Width: number;
        rect2Height: number;
        orientation: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'horizontal' | 'vertical';
      };
    };
    ratePerSqm: number;
    stallType?: { name: string };
    stallTypeName?: string;
  }>;
  calculations: BookingCalculations | null;
  formData: {
    basicAmenities?: Array<{
      name: string;
      calculatedQuantity: number;
    }>;
    extraAmenities?: Array<{
      id: string;
      name: string;
      quantity: number;
      rate: number;
    }>;
    extraAmenitiesTotal?: number;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    customerAddress?: string;
    companyName?: string;
    customerGSTIN?: string;
    customerPAN?: string;
    notes?: string;
    specialRequirements?: string;
  };
  onPrev: () => void;
  onSubmit: (data: Record<string, any>) => void;
  isSubmitting: boolean;
}

const ReviewStep: React.FC<ReviewStepProps> = ({
  exhibition,
  selectedStalls,
  calculations,
  formData,
  onPrev,
  onSubmit,
  isSubmitting
}) => {
  const { user } = useAuth();
  
  const [customerData, setCustomerData] = useState({
    customerName: formData.customerName || user?.name || '',
    customerEmail: formData.customerEmail || user?.email || '',
    customerPhone: formData.customerPhone || user?.contactNumber || '',
    customerAddress: formData.customerAddress || user?.address || '',
    companyName: formData.companyName || user?.companyName || '',
    customerGSTIN: formData.customerGSTIN || '',
    customerPAN: formData.customerPAN || '',
    notes: formData.notes || '',
    specialRequirements: formData.specialRequirements || '',
  });

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Debug the checkbox state changes
  const handleTermsChange = (checked: boolean) => {
    console.log('Terms checkbox changed:', checked);
    setTermsAccepted(checked);
    // Clear terms error when checkbox is checked
    if (checked && errors.terms) {
      setErrors(prev => ({ ...prev, terms: '' }));
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setCustomerData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Full name validation
    if (!customerData.customerName.trim()) {
      newErrors.customerName = 'Full name is required';
    } else if (customerData.customerName.trim().length < 2) {
      newErrors.customerName = 'Full name must be at least 2 characters';
    }

    // Email validation
    if (!customerData.customerEmail.trim()) {
      newErrors.customerEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.customerEmail)) {
      newErrors.customerEmail = 'Please enter a valid email address';
    }

    // Phone validation (Indian phone numbers)
    if (!customerData.customerPhone.trim()) {
      newErrors.customerPhone = 'Phone number is required';
    } else {
      const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
      const cleanPhone = customerData.customerPhone.replace(/[\s\-\(\)]/g, '');
      if (!phoneRegex.test(cleanPhone)) {
        newErrors.customerPhone = 'Please enter a valid Indian phone number (10 digits starting with 6-9)';
      }
    }

    // Address validation
    if (!customerData.customerAddress.trim()) {
      newErrors.customerAddress = 'Address is required';
    } else if (customerData.customerAddress.trim().length < 10) {
      newErrors.customerAddress = 'Please enter a complete address (minimum 10 characters)';
    }

    // Company name validation
    if (!customerData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    } else if (customerData.companyName.trim().length < 2) {
      newErrors.companyName = 'Company name must be at least 2 characters';
    }

    // GSTIN validation (optional but must be valid if provided)
    if (customerData.customerGSTIN && customerData.customerGSTIN.trim()) {
      const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstinRegex.test(customerData.customerGSTIN.trim())) {
        newErrors.customerGSTIN = 'Please enter a valid GSTIN (15 characters)';
      }
    }

    // PAN validation (optional but must be valid if provided)
    if (customerData.customerPAN && customerData.customerPAN.trim()) {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(customerData.customerPAN.trim())) {
        newErrors.customerPAN = 'Please enter a valid PAN (e.g., ABCDE1234F)';
      }
    }

    // Terms and conditions validation
    if (!termsAccepted) {
      newErrors.terms = 'You must accept the terms and conditions to proceed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTotalArea = () => {
    // Use calculations prop if available (more accurate)
    if (calculations?.stalls) {
      return calculations.stalls.reduce((total, stall) => total + stall.area, 0);
    }
    
    // Fallback to manual calculation with L-shape support
    return selectedStalls.reduce((total, stall) => {
      const area = calculateStallArea(stall.dimensions);
      return total + area;
    }, 0);
  };

  const calculateGrandTotal = () => {
    const stallsTotal = calculations?.totalAmount || 0;
    const amenitiesTotal = formData.extraAmenitiesTotal || 0;
    return stallsTotal + amenitiesTotal;
  };

  const handleSubmit = () => {
    console.log('Submit button clicked. Terms accepted:', termsAccepted);
    console.log('Form validation result:', validateForm());
    
    if (!validateForm()) {
      console.log('Form validation failed. Errors:', errors);
      return;
    }

    const finalBookingData = {
      ...customerData,
      exhibitionId: exhibition?._id,
      stallIds: selectedStalls.map(stall => stall.stallId),
      amount: calculateGrandTotal(),
      calculations: {
        ...calculations,
        amenitiesTotal: formData.extraAmenitiesTotal || 0,
        grandTotal: calculateGrandTotal()
      },
      basicAmenities: formData.basicAmenities || [],
      extraAmenities: formData.extraAmenities || [],
      bookingSource: 'public'
    };

    console.log('Submitting booking data:', finalBookingData);
    onSubmit(finalBookingData);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Review & Submit Booking</h2>
        <p className="text-muted-foreground">
          Please review your booking details and provide your information
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Information Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">Full Name *</Label>
                  <Input
                    id="customerName"
                    value={customerData.customerName}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                    placeholder="Enter your full name"
                    className={errors.customerName ? 'border-destructive' : ''}
                  />
                  {errors.customerName && (
                    <p className="text-sm text-destructive mt-1">{errors.customerName}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={customerData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    placeholder="Enter your company name"
                    className={errors.companyName ? 'border-destructive' : ''}
                  />
                  {errors.companyName && (
                    <p className="text-sm text-destructive mt-1">{errors.companyName}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="customerEmail">Email Address *</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={customerData.customerEmail}
                    onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                    placeholder="Enter your email"
                    className={errors.customerEmail ? 'border-destructive' : ''}
                  />
                  {errors.customerEmail && (
                    <p className="text-sm text-destructive mt-1">{errors.customerEmail}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="customerPhone">Phone Number *</Label>
                  <Input
                    id="customerPhone"
                    value={customerData.customerPhone}
                    onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                    placeholder="Enter your phone number"
                    className={errors.customerPhone ? 'border-destructive' : ''}
                  />
                  {errors.customerPhone && (
                    <p className="text-sm text-destructive mt-1">{errors.customerPhone}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="customerAddress">Address *</Label>
                <Textarea
                  id="customerAddress"
                  value={customerData.customerAddress}
                  onChange={(e) => handleInputChange('customerAddress', e.target.value)}
                  placeholder="Enter your complete address"
                  className={errors.customerAddress ? 'border-destructive' : ''}
                />
                {errors.customerAddress && (
                  <p className="text-sm text-destructive mt-1">{errors.customerAddress}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerGSTIN">GSTIN (Optional)</Label>
                  <Input
                    id="customerGSTIN"
                    value={customerData.customerGSTIN}
                    onChange={(e) => handleInputChange('customerGSTIN', e.target.value.toUpperCase())}
                    placeholder="Enter GSTIN (e.g., 27ABCDE1234F1Z5)"
                    className={errors.customerGSTIN ? 'border-destructive' : ''}
                  />
                  {errors.customerGSTIN && (
                    <p className="text-sm text-destructive mt-1">{errors.customerGSTIN}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="customerPAN">PAN Number (Optional)</Label>
                  <Input
                    id="customerPAN"
                    value={customerData.customerPAN}
                    onChange={(e) => handleInputChange('customerPAN', e.target.value.toUpperCase())}
                    placeholder="Enter PAN (e.g., ABCDE1234F)"
                    className={errors.customerPAN ? 'border-destructive' : ''}
                  />
                  {errors.customerPAN && (
                    <p className="text-sm text-destructive mt-1">{errors.customerPAN}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={customerData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Any additional notes or comments"
                />
              </div>

              <div>
                <Label htmlFor="specialRequirements">Special Requirements (Optional)</Label>
                <Textarea
                  id="specialRequirements"
                  value={customerData.specialRequirements}
                  onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
                  placeholder="Any special requirements for your stall"
                />
              </div>

              {/* Terms & Conditions */}
              <div className="pt-4 border-t">
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Terms & Conditions
                  </h4>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <p>• Your booking will be submitted for admin approval</p>
                    <p>• Payment instructions will be provided after approval</p>
                    <p>• Booking confirmation will be sent via email</p>
                    <p>• Cancellation policy applies as per terms</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={handleTermsChange}
                  />
                  <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                    I accept the terms and conditions and confirm that all information provided is accurate
                  </Label>
                </div>
                {errors.terms && (
                  <p className="text-sm text-destructive mt-1">{errors.terms}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Summary Sidebar */}
        <div className="space-y-6">
          {/* Exhibition Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Exhibition Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Exhibition:</span>
                  <p className="font-medium">{exhibition?.name || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Venue:</span>
                  <p className="font-medium">{exhibition?.venue || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Dates:</span>
                  <p className="font-medium">
                    {exhibition?.startDate && exhibition?.endDate
                      ? `${new Date(exhibition.startDate).toLocaleDateString()} - ${new Date(exhibition.endDate).toLocaleDateString()}`
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stall Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Selected Stalls ({selectedStalls.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Individual Stall Details */}
                <div className="space-y-2">
                  {selectedStalls.map((stall) => {
                    const area = calculateStallArea(stall.dimensions);
                    const baseAmount = area * stall.ratePerSqm;
                    const stallTypeName = stall.stallType?.name || stall.stallTypeName || 'Standard Stall';
                    
                    return (
                      <div key={stall.stallId} className="p-2 border rounded-lg bg-muted/30">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{stall.number}</Badge>
                              <span className="text-sm font-medium">{stallTypeName}</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {formatStallDimensions(stall.dimensions)} = {area.toFixed(2)} m²
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Rate: {formatCurrency(stall.ratePerSqm)}/m²
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{formatCurrency(baseAmount)}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <Separator />
                
                {/* Summary Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Area:</span>
                    <span className="font-medium">{calculateTotalArea().toFixed(1)} m²</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                    <span>Stalls Subtotal:</span>
                    <span>{formatCurrency(calculations?.totalBaseAmount || 0)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Amenities Summary */}
          {((formData.basicAmenities?.length ?? 0) > 0 || (formData.extraAmenities?.length ?? 0) > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Amenities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(formData.basicAmenities?.length ?? 0) > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2">Included Amenities</div>
                      {formData.basicAmenities?.map((amenity, index: number) => (
                        <div key={index} className="text-xs text-muted-foreground">
                          {amenity.name} × {amenity.calculatedQuantity}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {(formData.extraAmenities?.length ?? 0) > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2">Additional Amenities</div>
                      {formData.extraAmenities?.map((amenity) => (
                        <div key={amenity.id} className="flex justify-between text-xs">
                          <span>{amenity.name} × {amenity.quantity}</span>
                          <span className="font-medium">
                            {formatCurrency(amenity.rate * amenity.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pricing Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Pricing Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Stalls Subtotal:</span>
                  <span>{formatCurrency(calculations?.totalBaseAmount || 0)}</span>
                </div>
                
                {/* Show applied discounts */}
                {calculations?.appliedDiscounts && calculations.appliedDiscounts.length > 0 && (
                  calculations.appliedDiscounts.map((discount, index: number) => (
                    <div key={index} className="flex justify-between text-sm text-green-600">
                      <span>{discount.name} ({discount.type === 'percentage' ? `${discount.value}%` : formatCurrency(discount.value)}):</span>
                      <span>-{formatCurrency(discount.amount)}</span>
                    </div>
                  ))
                )}
                
                {/* Show amount after discount if there are discounts */}
                {(calculations?.totalDiscountAmount ?? 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Amount after Discount:</span>
                    <span className="font-medium">{formatCurrency(calculations?.totalAmountAfterDiscount || 0)}</span>
                  </div>
                )}
                
                {calculations?.taxes?.map((tax, index: number) => (
                  <div key={index} className="flex justify-between text-sm text-muted-foreground">
                    <span>{tax.name} ({tax.rate}%):</span>
                    <span>+{formatCurrency(tax.amount)}</span>
                  </div>
                ))}
                
                <div className="flex justify-between text-sm">
                  <span>Stalls Total:</span>
                  <span className="font-medium">{formatCurrency(calculations?.totalAmount || 0)}</span>
                </div>
                
                {(formData.extraAmenitiesTotal ?? 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Additional Amenities:</span>
                    <span className="font-medium">+{formatCurrency(formData.extraAmenitiesTotal ?? 0)}</span>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex justify-between text-lg font-semibold">
                  <span>Grand Total:</span>
                  <span className="text-primary">{formatCurrency(calculateGrandTotal())}</span>
                </div>
              </div>
            </CardContent>
          </Card>


        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} size="lg" disabled={isSubmitting}>
          Back to Amenities
        </Button>
        <Button 
          onClick={handleSubmit} 
          size="lg" 
          className="px-8"
          disabled={isSubmitting || !termsAccepted}
        >
          {isSubmitting ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
              Submitting...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Submit Booking
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ReviewStep; 