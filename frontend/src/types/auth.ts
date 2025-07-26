export interface User {
  id: string;
  email: string;
  name: string;
  companyName: string;
  contactNumber: string;
  address: string;
  city?: string;
  state?: string;
  pinCode?: string;
  website?: string;
  panNumber?: string;
  gstNumber?: string;
  isApproved: boolean;
  role: 'exhibitor' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string; // Can be email address or phone number
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  companyName: string;
  contactNumber: string;
  address: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  setUser?: (user: User) => void;
} 