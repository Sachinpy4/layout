'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Eye, EyeOff, Mail, Lock, User, Building, Phone, MapPin, UserPlus, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/auth.context';
import { useToast } from '../../hooks/use-toast';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';

// Step 1: Company & Contact Info
const step1Schema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  contactNumber: z.string().min(10, 'Contact number must be at least 10 digits'),
});

// Step 2: Address & Security
const step2Schema = z.object({
  address: z.string().min(10, 'Address must be at least 10 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
  onRegistrationSuccess: (email: string) => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({ 
  isOpen, 
  onClose, 
  onSwitchToLogin,
  onRegistrationSuccess
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const { toast } = useToast();

  // Form for Step 1
  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      companyName: '',
      name: '',
      email: '',
      contactNumber: '',
    },
  });

  // Form for Step 2
  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      address: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Reset forms when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setStep1Data(null);
      setShowPassword(false);
      setShowConfirmPassword(false);
      setIsSubmitting(false);
      step1Form.reset();
      step2Form.reset();
    }
  }, [isOpen, step1Form, step2Form]);

  // Handle Step 1 submission
  const handleStep1Submit = async (data: Step1Data) => {
    setStep1Data(data);
    setCurrentStep(2);
  };

  // Handle Step 2 submission (Final registration)
  const handleStep2Submit = async (data: Step2Data) => {
    if (!step1Data) return;
    
    try {
      setIsSubmitting(true);
      
      const registrationData = {
        companyName: step1Data.companyName,
        name: step1Data.name,
        email: step1Data.email,
        contactNumber: step1Data.contactNumber,
        address: data.address,
        password: data.password,
      };
      
      await register(registrationData);
      
      toast({
        title: 'Registration Successful!',
        description: 'Your account has been created successfully. Please wait for admin approval before you can login and book stalls.',
        variant: 'default',
      });
      
      onClose();
      onRegistrationSuccess(step1Data.email);
      
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Go back to previous step
  const handleBackStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="relative w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white">
          <CardHeader className="relative text-center">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isSubmitting}
            >
              <X className="h-4 w-4" />
            </button>
            
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-gradient-to-br from-green-500 to-blue-600 rounded-full mb-3">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
            
            <CardTitle className="text-xl font-bold text-gray-900">
              Join ExhibitBook
            </CardTitle>
            
            <CardDescription className="text-gray-600">
              {currentStep === 1 ? 'Enter your basic information' : 'Complete your registration'}
            </CardDescription>
            
            {/* Progress bar */}
            <div className="flex items-center justify-center mt-4 space-x-2">
              <div className={`h-2 w-8 rounded-full transition-colors ${
                currentStep >= 1 ? 'bg-blue-500' : 'bg-gray-200'
              }`} />
              <div className={`h-2 w-8 rounded-full transition-colors ${
                currentStep >= 2 ? 'bg-blue-500' : 'bg-gray-200'
              }`} />
            </div>
            
            <div className="text-xs text-gray-500 mt-2">
              Step {currentStep} of 2
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <Form {...step1Form}>
                <form onSubmit={step1Form.handleSubmit(handleStep1Submit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={step1Form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Contact Person
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                placeholder="Your name"
                                className="pl-9 h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                {...field}
                                disabled={isSubmitting}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={step1Form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Company Name
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                placeholder="Company name"
                                className="pl-9 h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                {...field}
                                disabled={isSubmitting}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={step1Form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              type="email"
                              placeholder="Enter your email"
                              className="pl-9 h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              {...field}
                              disabled={isSubmitting}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={step1Form.control}
                    name="contactNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Phone Number
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              type="tel"
                              placeholder="Enter your phone number"
                              className="pl-9 h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              {...field}
                              disabled={isSubmitting}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium"
                    disabled={isSubmitting}
                  >
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </form>
              </Form>
            )}

            {/* Step 2: Address & Security */}
            {currentStep === 2 && (
              <Form {...step2Form}>
                <form onSubmit={step2Form.handleSubmit(handleStep2Submit)} className="space-y-4">
                  <FormField
                    control={step2Form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Address
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <textarea
                              placeholder="Enter your complete address"
                              className="w-full pl-9 pt-2 pb-2 pr-3 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500 focus:ring-1 resize-none"
                              rows={3}
                              {...field}
                              disabled={isSubmitting}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={step2Form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Password
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Password"
                                className="pl-9 pr-9 h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                {...field}
                                disabled={isSubmitting}
                              />
                              <button
                                type="button"
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isSubmitting}
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={step2Form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Confirm Password
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="Confirm"
                                className="pl-9 pr-9 h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                {...field}
                                disabled={isSubmitting}
                              />
                              <button
                                type="button"
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                disabled={isSubmitting}
                              >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={handleBackStep}
                      disabled={isSubmitting}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                    
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Create Account
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
            
            {/* Footer */}
            <div className="text-center pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={onSwitchToLogin}
                  className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
                  disabled={isSubmitting}
                >
                  Sign in here
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 