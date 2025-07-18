'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, Plus, Minus, Info, Calculator } from 'lucide-react';
import { formatCurrency } from '@/utils/format';

interface AmenitiesStepProps {
  exhibition: any;
  selectedStalls: any[];
  formData: any;
  onNext: () => void;
  onPrev: () => void;
  onUpdateData: (data: any) => void;
}

interface BasicAmenity {
  name: string;
  type: string;
  description: string;
  perSqm: number;
  quantity: number;
  calculatedQuantity: number;
}

interface ExtraAmenity {
  id: string;
  name: string;
  type: string;
  description: string;
  rate: number;
  selected: boolean;
  quantity: number;
}

const AmenitiesStep: React.FC<AmenitiesStepProps> = ({
  exhibition,
  selectedStalls,
  formData,
  onNext,
  onPrev,
  onUpdateData
}) => {
  const [selectedExtraAmenities, setSelectedExtraAmenities] = useState<ExtraAmenity[]>([]);

  // Calculate total stall area
  const totalStallArea = useMemo(() => {
    return selectedStalls.reduce((total, stall) => {
      const area = stall.dimensions ? stall.dimensions.width * stall.dimensions.height : 0;
      return total + area;
    }, 0);
  }, [selectedStalls]);

  // Calculate basic amenities based on stall area
  const basicAmenities = useMemo((): BasicAmenity[] => {
    // Mock basic amenities since exhibition schema doesn't have them yet
    const mockBasicAmenities = [
      {
        name: 'Standard Table',
        type: 'furniture',
        description: 'Standard exhibition table',
        perSqm: 9, // 1 table per 9 sqm
        quantity: 1
      },
      {
        name: 'Standard Chair',
        type: 'furniture', 
        description: 'Standard exhibition chair',
        perSqm: 4.5, // 1 chair per 4.5 sqm
        quantity: 2
      },
      {
        name: 'Power Socket',
        type: 'facility',
        description: 'Standard power outlet',
        perSqm: 9, // 1 socket per 9 sqm
        quantity: 1
      }
    ];

    return mockBasicAmenities
      .map(amenity => {
        const calculatedQuantity = Math.floor(totalStallArea / amenity.perSqm) * amenity.quantity;
        return {
          ...amenity,
          calculatedQuantity
        };
      })
      .filter(amenity => amenity.calculatedQuantity > 0);
  }, [totalStallArea]);

  // Mock extra amenities (these would come from exhibition.amenities)
  const availableExtraAmenities = useMemo(() => [
    {
      id: '1',
      name: 'Premium Table',
      type: 'furniture',
      description: 'High-quality wooden exhibition table',
      rate: 500
    },
    {
      id: '2', 
      name: 'Additional Chairs',
      type: 'furniture',
      description: 'Extra chairs for your stall',
      rate: 100
    },
    {
      id: '3',
      name: 'LED Spotlight',
      type: 'lighting',
      description: 'Professional LED spotlight for product display',
      rate: 300
    },
    {
      id: '4',
      name: 'Carpet Flooring',
      type: 'flooring',
      description: 'Premium carpet flooring for your stall',
      rate: 200
    },
    {
      id: '5',
      name: 'WiFi Access',
      type: 'service',
      description: 'High-speed WiFi access for your stall',
      rate: 150
    }
  ], []);

  // Initialize selected amenities from form data
  useEffect(() => {
    if (formData.extraAmenities) {
      setSelectedExtraAmenities(formData.extraAmenities);
    }
  }, [formData.extraAmenities]);

  const handleExtraAmenityToggle = (amenityId: string) => {
    setSelectedExtraAmenities(prev => {
      const existingIndex = prev.findIndex(a => a.id === amenityId);
      
      if (existingIndex >= 0) {
        // Remove if already selected
        return prev.filter(a => a.id !== amenityId);
      } else {
        // Add if not selected
        const amenity = availableExtraAmenities.find(a => a.id === amenityId);
        if (amenity) {
          return [...prev, {
            ...amenity,
            selected: true,
            quantity: 1
          }];
        }
      }
      return prev;
    });
  };

  const handleQuantityChange = (amenityId: string, quantity: number) => {
    if (quantity < 1) return;
    
    setSelectedExtraAmenities(prev =>
      prev.map(amenity =>
        amenity.id === amenityId
          ? { ...amenity, quantity }
          : amenity
      )
    );
  };

  const calculateExtraAmenitiesTotal = () => {
    return selectedExtraAmenities.reduce((total, amenity) => {
      return total + (amenity.rate * amenity.quantity);
    }, 0);
  };

  const handleNext = () => {
    // Save amenities data
    const amenitiesData = {
      basicAmenities,
      extraAmenities: selectedExtraAmenities,
      extraAmenitiesTotal: calculateExtraAmenitiesTotal()
    };
    
    onUpdateData(amenitiesData);
    onNext();
  };

  const isAmenitySelected = (amenityId: string) => {
    return selectedExtraAmenities.some(a => a.id === amenityId);
  };

  const getSelectedAmenityQuantity = (amenityId: string) => {
    const amenity = selectedExtraAmenities.find(a => a.id === amenityId);
    return amenity ? amenity.quantity : 1;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Select Amenities</h2>
        <p className="text-muted-foreground">
          Choose additional services and amenities for your stalls
        </p>
      </div>

      {/* Basic Amenities - Included */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Included Amenities
            <Badge variant="secondary">No extra charge</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Info className="h-4 w-4" />
              <span>Calculated based on your total stall area: {totalStallArea.toFixed(1)} m²</span>
            </div>
          </div>

          {basicAmenities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {basicAmenities.map((amenity, index) => (
                <div key={index} className="border rounded-lg p-4 bg-green-50 dark:bg-green-950/20">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-medium">{amenity.name}</div>
                      <Badge variant="outline" className="text-xs mt-1">
                        {amenity.type}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">
                        {amenity.calculatedQuantity}x
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{amenity.description}</p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Included • {amenity.quantity} per {amenity.perSqm}m²
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No basic amenities calculated for your stall size</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Extra Amenities - Optional */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Additional Amenities
            <Badge variant="outline">Optional</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableExtraAmenities.map((amenity) => {
              const isSelected = isAmenitySelected(amenity.id);
              const quantity = getSelectedAmenityQuantity(amenity.id);
              
              return (
                <div
                  key={amenity.id}
                  className={`border rounded-lg p-4 transition-all ${
                    isSelected ? 'border-primary bg-primary/5' : 'hover:border-muted-foreground/20'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id={amenity.id}
                      checked={isSelected}
                      onCheckedChange={() => handleExtraAmenityToggle(amenity.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label htmlFor={amenity.id} className="cursor-pointer">
                        <div className="font-medium">{amenity.name}</div>
                        <Badge variant="outline" className="text-xs mt-1">
                          {amenity.type}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {amenity.description}
                        </p>
                        <div className="font-semibold text-primary mt-2">
                          {formatCurrency(amenity.rate)} each
                        </div>
                      </Label>
                      
                      {isSelected && (
                        <div className="mt-3 flex items-center space-x-2">
                          <Label htmlFor={`quantity-${amenity.id}`} className="text-sm font-medium">
                            Quantity:
                          </Label>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(amenity.id, quantity - 1)}
                              disabled={quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              id={`quantity-${amenity.id}`}
                              type="number"
                              value={quantity}
                              onChange={(e) => handleQuantityChange(amenity.id, parseInt(e.target.value) || 1)}
                              className="w-16 text-center"
                              min="1"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(amenity.id, quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="text-sm font-medium text-primary">
                            = {formatCurrency(amenity.rate * quantity)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Amenities Summary */}
      {selectedExtraAmenities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Additional Amenities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedExtraAmenities.map((amenity) => (
                <div key={amenity.id} className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{amenity.name}</span>
                    <span className="text-muted-foreground ml-2">× {amenity.quantity}</span>
                  </div>
                  <span className="font-medium">{formatCurrency(amenity.rate * amenity.quantity)}</span>
                </div>
              ))}
              
              <Separator />
              
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Additional Amenities Total</span>
                <span className="text-primary">{formatCurrency(calculateExtraAmenitiesTotal())}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} size="lg">
          Back to Stall Details
        </Button>
        <Button onClick={handleNext} size="lg" className="px-8">
          Continue to Review
        </Button>
      </div>
    </div>
  );
};

export default AmenitiesStep; 