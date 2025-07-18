import api, { apiRequest } from '@/lib/api';
import { User, LoginCredentials, RegisterData, AuthResponse } from '@/types/auth';

export class AuthService {
  // Storage keys
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly USER_KEY = 'user_data';

  // Login user (exhibitor authentication)
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('AuthService: Making API call to login-flexible...');
      console.log('🔍 Frontend Login Debug:', {
        identifier: credentials.email,
        passwordLength: credentials.password.length,
        isEmail: credentials.email.includes('@')
      });
      
      // Use the new flexible login endpoint that accepts email or phone
      const response = await apiRequest<any>(() =>
        api.post('/exhibitors/login-flexible', {
          identifier: credentials.email, // This can be email or phone
          password: credentials.password
        })
      );

      console.log('AuthService: API response received:', { success: response.success, error: response.error });

      if (response.success && response.data) {
        // Handle exhibitor login response format
        const exhibitorData = response.data;
        const token = exhibitorData.access_token;
        const exhibitor = exhibitorData.exhibitor;
        
        // Transform exhibitor to User format for frontend compatibility
        const user: User = {
          id: exhibitor._id || exhibitor.id,
          email: exhibitor.email,
          name: exhibitor.contactPerson,
          companyName: exhibitor.companyName,
          contactNumber: exhibitor.phone || '',
          address: exhibitor.address || '',
          isApproved: exhibitor.status === 'approved',
          role: 'exhibitor' as const,
          createdAt: exhibitor.createdAt || '',
          updatedAt: exhibitor.updatedAt || '',
        };

        const authResponse: AuthResponse = {
          access_token: token,
          user: user,
        };

        // Store token and user data
        this.setToken(token);
        this.setUser(user);
        return authResponse;
      }

      console.log('AuthService: Login failed - API returned error:', response.error);
      // Use the specific error message from backend (includes approval status messages)
      throw new Error(response.error || 'Login failed');
    } catch (error: any) {
      console.log('AuthService: Exception during login:', error.message);
      
      // Handle specific error messages from backend
      if (error.response?.data?.message) {
        console.log('AuthService: Using backend error message:', error.response.data.message);
        throw new Error(error.response.data.message);
      }
      
      // Handle API wrapper errors that contain backend messages
      if (error.message && error.message !== 'Invalid email/phone or password. Please check your credentials and try again.') {
        console.log('AuthService: Using API error message:', error.message);
        throw new Error(error.message);
      }
      
      // Only use generic message as last resort
      console.log('AuthService: Using generic error message');
      throw new Error('Invalid email/phone or password. Please check your credentials and try again.');
    }
  }

  // Register new exhibitor
  static async register(data: RegisterData): Promise<User> {
    try {
      // Transform frontend data to match exhibitor registration DTO
      const exhibitorData = {
        companyName: data.companyName,
        contactPerson: data.name,
        email: data.email,
        phone: data.contactNumber,
        password: data.password,
        address: data.address,
      };

      const response = await apiRequest<any>(() =>
        api.post('/exhibitors/register', exhibitorData)
      );

      if (response.success && response.data) {
        // Transform response to User format
        const exhibitor = response.data;
        const user: User = {
          id: exhibitor._id || exhibitor.id,
          email: exhibitor.email,
          name: exhibitor.contactPerson,
          companyName: exhibitor.companyName,
          contactNumber: exhibitor.phone || '',
          address: exhibitor.address || '',
          isApproved: exhibitor.status === 'approved',
          role: 'exhibitor' as const,
          createdAt: exhibitor.createdAt || '',
          updatedAt: exhibitor.updatedAt || '',
        };

        return user;
      }

      throw new Error(response.error || 'Registration failed');
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Registration failed. Please try again.');
    }
  }

  // Get current user (exhibitor profile)
  static async getCurrentUser(): Promise<User | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const response = await apiRequest<any>(() =>
        api.get('/exhibitors/profile')
      );

      if (response.success && response.data) {
        // Transform exhibitor to User format
        const exhibitor = response.data;
        const user: User = {
          id: exhibitor._id || exhibitor.id,
          email: exhibitor.email,
          name: exhibitor.contactPerson,
          companyName: exhibitor.companyName,
          contactNumber: exhibitor.phone || '',
          address: exhibitor.address || '',
          isApproved: exhibitor.status === 'approved',
          role: 'exhibitor' as const,
          createdAt: exhibitor.createdAt || '',
          updatedAt: exhibitor.updatedAt || '',
        };
        this.setUser(user);
        return user;
      }
    } catch (error) {
      // Token might be invalid, remove it
      this.logout();
    }

    return null;
  }

  // Token management
  static setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  // User data management
  static setUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  static getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem(this.USER_KEY);
      if (userData) {
        try {
          return JSON.parse(userData);
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem(this.USER_KEY);
        }
      }
    }
    return null;
  }

  // Logout
  static logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return this.getToken() !== null && this.getUser() !== null;
  }
} 