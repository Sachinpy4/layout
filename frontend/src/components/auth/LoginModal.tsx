'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react';
import { useAuth } from '../../contexts/auth.context';
import { useToast } from '../../hooks/use-toast';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';

// Login validation schema
const loginSchema = z.object({
  email: z.string().min(1, 'Please enter your email or phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
  prefilledEmail?: string;
}

export const LoginModal: React.FC<LoginModalProps> = ({ 
  isOpen, 
  onClose, 
  onSwitchToRegister,
  prefilledEmail = '' 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  // Form setup
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      form.reset({
        email: prefilledEmail,
        password: '',
      });
      setShowPassword(false);
      setIsSubmitting(false);
    }
  }, [isOpen, form, prefilledEmail]);

  // Handle form submission
  const handleSubmit = async (data: LoginFormData) => {
    console.log('🚀 LoginModal: Form submitted without page refresh!', { email: data.email });
    
    try {
      setIsSubmitting(true);
      console.log('LoginModal: Attempting login...');
      await login(data);
      
      // Success - show success toast
      toast({
        title: "Login Successful",
        description: "Welcome back! You have been successfully logged in.",
      });
      
      // Close modal and reset form
      onClose();
      form.reset();
      setShowPassword(false);
      
    } catch (error) {
      console.error('LoginModal: Login failed:', error);
      console.log('LoginModal: Form staying active for retry - no page refresh!');
      
      // AuthContext already handles showing the error toast with the backend message
      // The backend sends specific messages for different approval statuses:
      // - "Your account is pending approval. Please wait for admin approval to login and book stalls."
      // - "Your account has been rejected. Please contact admin for more information."  
      // - "Your account has been suspended. Please contact admin for more information."
      // - "Invalid credentials" for wrong email/password
      console.log('LoginModal: Error message from backend:', error instanceof Error ? error.message : 'Unknown error');
      
      // Form stays active for retry
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

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto">
        <Card className="shadow-2xl border-0 bg-white">
          <CardHeader className="relative pb-4">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors z-10"
              disabled={isSubmitting}
            >
              <X className="h-4 w-4" />
            </button>
            
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
                <LogIn className="h-8 w-8 text-white" />
              </div>
              
              <CardTitle className="text-2xl font-bold text-gray-900">
                Welcome Back
              </CardTitle>
              
              <CardDescription className="text-gray-600">
                Sign in to your exhibitor account to manage your bookings
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <Form {...form}>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  form.handleSubmit(handleSubmit)(e);
                }}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-gray-700">
                        <Mail className="h-4 w-4" />
                        Email or Phone
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Enter your email or phone"
                          className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          {...field}
                          disabled={isSubmitting}
                          autoComplete="username"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-gray-700">
                        <Lock className="h-4 w-4" />
                        Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            className="h-12 pr-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            {...field}
                            disabled={isSubmitting}
                            autoComplete="current-password"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isSubmitting}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold transition-all duration-200 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>
            </Form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={onSwitchToRegister}
                  className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
                  disabled={isSubmitting}
                >
                  Sign up here
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 