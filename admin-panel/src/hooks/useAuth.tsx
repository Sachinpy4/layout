import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { App } from 'antd';
import authService, { User, LoginCredentials } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { message } = App.useApp();

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        const currentUser = await authService.initializeAuth();
        setUser(currentUser);
      } catch (error) {
        console.error('Auth initialization failed:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);
      
      if (response.success) {
        setUser(response.data.user);
        message.success('Login successful! Welcome back.');
      }
    } catch (error: any) {
      message.error(error.message || 'Login failed. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      console.log('useAuth: Starting logout...')
      
      // Call the auth service logout (handles backend API + localStorage clearing)
      await authService.logout();
      
      console.log('useAuth: Auth service logout completed')
      
      // Clear user state
      setUser(null);
      
      console.log('useAuth: User state cleared')
      message.success('Logged out successfully');
    } catch (error: any) {
      console.error('useAuth logout error:', error);
      
      // Even if logout API fails, clear user state
      setUser(null);
      
      // Force clear any remaining auth data (fallback only)
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin_refresh_token');
      localStorage.removeItem('admin_user');
      
      console.log('useAuth: Forced cleanup due to error')
      message.error('Logout failed, but local data cleared');
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permission: string): boolean => {
    return authService.hasPermission(permission);
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const currentUser = await authService.getProfile();
      setUser(currentUser);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // If refresh fails, user might need to login again
      setUser(null);
    }
  };

  const isAuthenticated = !!user && authService.isAuthenticated();

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    hasPermission,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth; 