'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, LoginCredentials, RegisterData, AuthContextType } from '@/types/auth';
import { AuthService } from '@/services/auth.service';
import { useToast } from '@/hooks/use-toast';

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check if user is authenticated
  const isAuthenticated = !!user && !!token;

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = AuthService.getToken();
        const storedUser = AuthService.getUser();

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
          
          // Validate token with server
          const currentUser = await AuthService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
          } else {
            // Token is invalid, clear auth state
            setToken(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid auth state
        AuthService.logout();
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('AuthContext: Starting login process...');
      const authResponse = await AuthService.login(credentials);
      
      setToken(authResponse.access_token);
      setUser(authResponse.user);
      console.log('AuthContext: Login successful!');
      
      // Success toast will be handled by LoginModal component
      // to avoid duplicate messages
    } catch (error: any) {
      console.log('AuthContext: Login failed, showing error toast...');
      const errorMessage = error.message || 'Login failed. Please try again.';
      
      // Customize toast title based on error message content
      let toastTitle = "Login Failed";
      if (errorMessage.includes('pending approval')) {
        toastTitle = "Account Pending Approval";
      } else if (errorMessage.includes('rejected')) {
        toastTitle = "Account Rejected";
      } else if (errorMessage.includes('suspended')) {
        toastTitle = "Account Suspended";
      } else if (errorMessage.includes('deactivated')) {
        toastTitle = "Account Deactivated";
      }
      
      toast({
        title: toastTitle,
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (data: RegisterData): Promise<void> => {
    try {
      setIsLoading(true);
      await AuthService.register(data);
      
      // Success toast will be handled by RegisterModal component
      // to avoid duplicate messages
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed. Please try again.';
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = (): void => {
    AuthService.logout();
    setToken(null);
    setUser(null);
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  // Context value
  const contextValue: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    setUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 