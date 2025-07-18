'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Header } from "../components/layout/Header"
import { AuthManager } from "../components/auth/AuthManager"
import { CalendarIcon, MapPinIcon, UsersIcon } from "lucide-react"

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Book Your Exhibition Stall
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Discover and reserve the perfect stall for your business at upcoming exhibitions. 
              Simple booking process, secure payments, and instant confirmations.
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                size="lg" 
                className="px-8"
                onClick={openRegisterModal}
              >
                Get Started
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8"
                onClick={openLoginModal}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Our Platform?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CalendarIcon className="h-10 w-10 text-blue-600 mb-4" />
                <CardTitle>Easy Booking</CardTitle>
                <CardDescription>
                  Book your stall in just a few clicks with our intuitive interface
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Our streamlined booking process makes it simple to find and reserve 
                  the perfect stall for your exhibition needs.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <MapPinIcon className="h-10 w-10 text-green-600 mb-4" />
                <CardTitle>Prime Locations</CardTitle>
                <CardDescription>
                  Access to premium exhibition venues and strategic stall positions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Choose from a variety of well-positioned stalls at top exhibition 
                  venues to maximize your business exposure.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <UsersIcon className="h-10 w-10 text-purple-600 mb-4" />
                <CardTitle>24/7 Support</CardTitle>
                <CardDescription>
                  Get assistance whenever you need it with our dedicated support team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Our customer support team is available around the clock to help 
                  you with any questions or concerns.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gray-900 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of exhibitors who trust our platform
            </p>
            <Button 
              size="lg" 
              className="px-8"
              onClick={openRegisterModal}
            >
              Sign Up Now
            </Button>
          </div>
        </div>
      </div>

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="h-12 w-3/4 bg-gray-200 rounded animate-pulse mb-6 mx-auto"></div>
          <div className="h-6 w-full bg-gray-200 rounded animate-pulse mb-4"></div>
          <div className="h-6 w-2/3 bg-gray-200 rounded animate-pulse mb-8 mx-auto"></div>
          <div className="flex gap-4 justify-center">
            <div className="h-12 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-12 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
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