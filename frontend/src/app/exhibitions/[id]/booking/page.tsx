'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, CheckCircle2, ClipboardList, Package, FileText } from 'lucide-react';
import { Exhibition } from '@/types/exhibition';
import { useBooking } from '@/contexts/BookingContext';
import { ExhibitionService } from '@/services/exhibition.service';
import { toast } from '@/hooks/use-toast';
import StallDetailsStep from './steps/StallDetailsStep';
import AmenitiesStep from './steps/AmenitiesStep';
import ReviewStep from './steps/ReviewStep';

export default function BookingPage() {
  return (
    <ProtectedRoute requireApproval={true}>
      <BookingContent />
    </ProtectedRoute>
  );
}

function BookingContent() {
  const params = useParams();
  const router = useRouter();
  const { 
    selectedStalls, 
    calculations, 
    setCurrentBooking, 
    setSelectedStalls,
    submitBooking, 
    isSubmitting 
  } = useBooking();

  const [exhibition, setExhibition] = useState<Exhibition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const [formChanged, setFormChanged] = useState(false);

  const exhibitionId = params.id as string;
  const totalSteps = 3;

  const steps = [
    {
      id: 'stall-details',
      title: 'Stall Details',
      description: 'Review your selected stalls',
      icon: ClipboardList,
    },
    {
      id: 'amenities',
      title: 'Amenities',
      description: 'Select additional services',
      icon: Package,
    },
    {
      id: 'review',
      title: 'Review & Submit',
      description: 'Confirm your booking',
      icon: FileText,
    },
  ];

  useEffect(() => {
    const fetchExhibition = async () => {
      try {
        setLoading(true);
        const data = await ExhibitionService.getExhibitionById(exhibitionId);
        setExhibition(data);
        
        // Set exhibition in booking context
        setCurrentBooking({ exhibitionId: exhibitionId });
      } catch (err: any) {
        setError(err.message || 'Failed to load exhibition');
      } finally {
        setLoading(false);
      }
    };

    fetchExhibition();
  }, [exhibitionId]);

  const handleBackToLayout = () => {
    if (formChanged) {
      const confirmLeave = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmLeave) return;
    }
    router.push(`/exhibitions/${exhibitionId}/layout` as any);
  };

  // ADDED: Function to remove a stall from selected stalls
  const handleRemoveStall = (stallId: string) => {
    const updatedStalls = selectedStalls.filter(stall => stall.stallId !== stallId);
    setSelectedStalls(updatedStalls, exhibition);
  };

  const handleNextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    // Allow clicking on previous steps only
    if (stepIndex < currentStep) {
      setCurrentStep(stepIndex);
    }
  };

  const updateFormData = (stepData: any) => {
    setFormData((prev: any) => ({ ...prev, ...stepData }));
    setFormChanged(true);
  };

  const handleSubmitBooking = async (finalData: any) => {
    try {
      const completeFormData = { ...formData, ...finalData };
      await submitBooking(completeFormData);
      toast({
        title: 'Booking Submitted Successfully!',
        description: 'Your booking has been submitted for review.',
      });
    } catch (error: any) {
      toast({
        title: 'Booking Failed',
        description: error.message || 'Failed to submit booking. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !exhibition) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertDescription>
              {error || 'Exhibition not found'}
            </AlertDescription>
          </Alert>
          <Button 
            onClick={() => router.push('/exhibitions')} 
            className="mt-4"
            variant="outline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Exhibitions
          </Button>
        </div>
      </div>
    );
  }

  if (selectedStalls.length === 0 && currentStep === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Alert>
            <AlertDescription>
              No stalls selected. Please go back to the layout to select stalls.
            </AlertDescription>
          </Alert>
          <Button 
            onClick={handleBackToLayout}
            className="mt-4"
            variant="outline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Layout
          </Button>
        </div>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <StallDetailsStep
            exhibition={exhibition}
            selectedStalls={selectedStalls}
            calculations={calculations}
            formData={formData}
            onNext={handleNextStep}
            onUpdateData={updateFormData}
            onRemoveStall={handleRemoveStall}
          />
        );
      case 1:
        return (
          <AmenitiesStep
            exhibition={exhibition}
            selectedStalls={selectedStalls}
            formData={formData}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
            onUpdateData={updateFormData}
          />
        );
      case 2:
        return (
          <ReviewStep
            exhibition={exhibition}
            selectedStalls={selectedStalls}
            calculations={calculations}
            formData={formData}
            onPrev={handlePrevStep}
            onSubmit={handleSubmitBooking}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={handleBackToLayout}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Layout
          </Button>

          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Complete Your Booking</h1>
            <p className="text-muted-foreground mb-6">
              {exhibition.name}
            </p>

            {/* Step Navigation */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center space-x-4">
                {steps.map((step, index) => {
                  const StepIcon = step.icon;
                  const isActive = index === currentStep;
                  const isCompleted = index < currentStep;
                  const isClickable = index < currentStep;

                  return (
                    <div key={step.id} className="flex items-center">
                      <div
                        className={`flex flex-col items-center ${isClickable ? 'cursor-pointer' : ''}`}
                        onClick={() => handleStepClick(index)}
                      >
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors ${
                            isCompleted
                              ? 'bg-primary text-primary-foreground'
                              : isActive
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-6 w-6" />
                          ) : (
                            <StepIcon className="h-6 w-6" />
                          )}
                        </div>
                        <div className="text-center">
                          <div className={`font-medium text-sm ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                            {step.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {step.description}
                          </div>
                        </div>
                      </div>
                      {index < steps.length - 1 && (
                        <div
                          className={`w-16 h-px mx-4 ${
                            index < currentStep ? 'bg-primary' : 'bg-muted'
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-muted rounded-full h-2 mb-8">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[600px]">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
} 