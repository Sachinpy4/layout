'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth.context';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireApproval?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireApproval = true 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Not authenticated, redirect to home page with auth parameter (modal will handle login)
        router.push('/?auth=login' as any);
        return;
      }

      if (requireApproval && user && !user.isApproved) {
        // Authenticated but not approved, redirect to pending page
        router.push('/auth/pending' as any);
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, requireApproval, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render children (will be redirected)
  if (!isAuthenticated) {
    return null;
  }

  // If approval required but user not approved, don't render children
  if (requireApproval && user && !user.isApproved) {
    return null;
  }

  // All checks passed, render the protected content
  return <>{children}</>;
}; 