'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Header } from "../components/layout/Header"
import { Footer } from "../components/layout/Footer"
import { AuthManager } from "../components/auth/AuthManager"
import { 
  CalendarIcon, 
  MapPinIcon, 
  UsersIcon, 
  LayoutDashboardIcon,
  PaintBucketIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  BarChart3Icon,
  ArrowRightIcon,
  CheckCircleIcon,
  StarIcon,
  TrendingUpIcon
} from "lucide-react"

// Component that uses useSearchParams
function HomePageContent() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('register');
  const searchParams = useSearchParams();

  // Auto-open login modal if redirected from protected route
  useEffect(() => {
    const authAction = searchParams.get('auth');
    if (authAction === 'login') {
      setAuthModalMode('login');
      setIsAuthModalOpen(true);
    } else if (authAction === 'register') {
      setAuthModalMode('register');
      setIsAuthModalOpen(true);
    }
  }, [searchParams]);

  const openRegisterModal = () => {
    setAuthModalMode('register');
    setIsAuthModalOpen(true);
  };

  const openLoginModal = () => {
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <>
      {/* Header - Outside gradient */}
      <Header />
      
      {/* Hero Section with ExpoTrack Gradient */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 relative overflow-hidden pt-16 min-h-[90vh]">
        
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black bg-opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 py-24">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Content */}
              <div className="text-white">
                <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                  <StarIcon className="h-4 w-4 mr-2 text-yellow-400" />
                  <span className="text-sm font-medium">Complete Exhibition Management System</span>
                </div>
                
                <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                  <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                    ExpoTrack
                  </span>
                  <br />
                  <span className="text-3xl lg:text-4xl font-semibold text-blue-100">
                    Exhibition Management Platform
                  </span>
                </h1>
                
                <p className="text-xl text-blue-100 mb-8 leading-relaxed max-w-2xl">
                  The complete solution for managing exhibitions, stall bookings, and layout design. 
                  Powerful admin tools, intuitive public booking, and advanced canvas-based layout designer.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Button 
                    size="lg" 
                    className="px-8 py-4 bg-white text-blue-700 hover:bg-blue-50 font-semibold text-lg"
                    onClick={openRegisterModal}
                  >
                    Try Demo
                    <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-blue-700 font-semibold text-lg bg-transparent"
                  >
                    View Pricing
                  </Button>
                </div>
                
                {/* Trust Indicators */}
                <div className="flex items-center space-x-6 text-blue-100">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 mr-2 text-green-400" />
                    <span>Enterprise Ready</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 mr-2 text-green-400" />
                    <span>24/7 Support</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 mr-2 text-green-400" />
                    <span>Cloud & On-Premise</span>
                  </div>
                </div>
              </div>
              
              {/* Right Column - Product Preview */}
              <div className="relative">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                  <div className="bg-gradient-to-br from-white to-gray-100 rounded-xl p-6 shadow-2xl">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="h-3 w-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded"></div>
                        <div className="flex space-x-1">
                          <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                          <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                          <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                          <LayoutDashboardIcon className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                          <PaintBucketIcon className="h-8 w-8 text-purple-600" />
                        </div>
                        <div className="h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                          <BarChart3Icon className="h-8 w-8 text-green-600" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 bg-gray-200 rounded w-full"></div>
                        <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Exhibitions
            </h2>
            <p className="text-xl text-gray-600">
              ExpoTrack provides a complete suite of tools for exhibition organizers and exhibitors
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Admin Panel */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <LayoutDashboardIcon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">Powerful Admin Panel</CardTitle>
                <CardDescription>
                  Complete exhibition management with user roles, permissions, and analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                    User & role management
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                    Exhibition creation & settings
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                    Booking management & approvals
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Layout Designer */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <PaintBucketIcon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">Advanced Layout Designer</CardTitle>
                <CardDescription>
                  Canvas-based layout designer with drag-and-drop functionality
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                    Konva-powered canvas editor
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                    Real-time layout updates
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                    Multi-hall support
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Public Booking */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-4">
                  <CalendarIcon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">Public Booking Interface</CardTitle>
                <CardDescription>
                  Intuitive booking system for exhibitors with real-time availability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                    Interactive stall selection
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                    Real-time pricing & availability
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                    Secure payment processing
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Payment System */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center mb-4">
                  <CreditCardIcon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">Payment Management</CardTitle>
                <CardDescription>
                  Integrated payment processing with invoicing and reporting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                    Multiple payment gateways
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                    Automated invoicing
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                    Financial reporting
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Security */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center mb-4">
                  <ShieldCheckIcon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">Enterprise Security</CardTitle>
                <CardDescription>
                  JWT authentication, role-based access, and data protection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                    JWT token authentication
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                    Role-based permissions
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                    Data encryption & backup
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Analytics */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3Icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">Analytics & Reporting</CardTitle>
                <CardDescription>
                  Comprehensive insights and reporting for better decision making
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                    Booking analytics
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                    Revenue tracking
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                    Exhibitor insights
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Technology Stack */}
      <div className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Built with Modern Technology
            </h2>
            <p className="text-xl text-gray-600">
              ExpoTrack is built using the latest technologies for performance, security, and scalability
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <span className="text-white font-bold text-lg">React</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Next.js 15</h3>
              <p className="text-gray-600 text-sm">Modern React framework with App Router</p>
            </div>
            
            <div className="p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <span className="text-white font-bold text-lg">Node</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">NestJS</h3>
              <p className="text-gray-600 text-sm">Enterprise-grade Node.js framework</p>
            </div>
            
            <div className="p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <span className="text-white font-bold text-lg">DB</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">MongoDB</h3>
              <p className="text-gray-600 text-sm">Flexible NoSQL database</p>
            </div>
            
            <div className="p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <span className="text-white font-bold text-lg">2D</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Konva.js</h3>
              <p className="text-gray-600 text-sm">High-performance canvas library</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Ready to Transform Your Exhibition Management?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join leading exhibition organizers who trust ExpoTrack for their event management needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="px-8 py-4 bg-white text-blue-700 hover:bg-blue-50 font-semibold text-lg"
                onClick={openRegisterModal}
              >
                Start Free Trial
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-blue-700 font-semibold text-lg bg-transparent"
              >
                Schedule Demo
              </Button>
            </div>
            
            <div className="mt-12 grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold mb-2">500+</div>
                <div className="text-blue-100">Exhibitions Managed</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">10K+</div>
                <div className="text-blue-100">Stalls Booked</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">99.9%</div>
                <div className="text-blue-100">Uptime Guarantee</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Auth Manager */}
      <AuthManager 
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        initialMode={authModalMode}
      />
    </>
  )
}

// Loading fallback component
function LoadingFallback() {
  return (
    <>
      <Header />
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 pt-16 min-h-[90vh]">
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-white">
                <div className="h-8 w-3/4 bg-white/20 rounded animate-pulse mb-6"></div>
                <div className="h-16 w-full bg-white/20 rounded animate-pulse mb-6"></div>
                <div className="h-6 w-full bg-white/10 rounded animate-pulse mb-4"></div>
                <div className="h-6 w-2/3 bg-white/10 rounded animate-pulse mb-8"></div>
                <div className="flex gap-4">
                  <div className="h-12 w-32 bg-white/20 rounded animate-pulse"></div>
                  <div className="h-12 w-32 bg-white/10 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="bg-white/10 rounded-2xl p-8 animate-pulse">
                <div className="h-64 bg-white/20 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

// Main export with Suspense boundary
export default function HomePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <HomePageContent />
    </Suspense>
  );
} 