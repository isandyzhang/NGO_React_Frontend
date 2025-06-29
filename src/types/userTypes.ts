export interface User {
  id: string | number;
  displayName?: string;
  username?: string;
  email: string;
  fullName?: string;
  roles?: string[];
  role?: 'admin' | 'manager' | 'staff';
  department?: string;
  avatar?: string;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
} 