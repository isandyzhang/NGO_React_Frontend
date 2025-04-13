import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  azureLogin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const auth = localStorage.getItem('isAuthenticated');
    return auth === 'true';
  });
  const navigate = useNavigate();

  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (username: string, password: string) => {
    // 模擬 API 調用
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (username && password) {
          setIsAuthenticated(true);
          localStorage.setItem('isAuthenticated', 'true');
          navigate('/dashboard');
          resolve();
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 1000);
    });
  };

  const azureLogin = async () => {
    // 模擬 Azure SSO 登入
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        try {
          setIsAuthenticated(true);
          localStorage.setItem('isAuthenticated', 'true');
          navigate('/dashboard');
          resolve();
        } catch (error) {
          reject(error);
        }
      }, 1000);
    });
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, azureLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 