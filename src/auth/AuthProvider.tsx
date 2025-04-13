import React, { createContext, useContext, useState, useCallback } from 'react';
import { AuthContextType, User } from '../types/userTypes';

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async () => {
    try {
      setLoading(true);
      // TODO: Implement actual Azure AD login
      const mockUser: User = {
        id: '1',
        displayName: 'Test User',
        email: 'test@example.com',
        roles: ['user'],
      };
      setUser(mockUser);
      setIsAuthenticated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      // TODO: Implement actual Azure AD logout
      setUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const getAccessToken = useCallback(async () => {
    // TODO: Implement actual token acquisition
    return 'mock-token';
  }, []);

  const value = {
    isAuthenticated,
    user,
    loading,
    error,
    login,
    logout,
    getAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 