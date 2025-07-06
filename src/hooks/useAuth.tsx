import React, { createContext, useContext, useState, ReactNode } from 'react';
import { authService, WorkerInfo } from '../services/authService';

// 身份驗證上下文類型定義
interface AuthContextType {
  isAuthenticated: boolean; // 是否已登入
  worker: WorkerInfo | null; // 當前工作人員資訊
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>; // 登入功能
  logout: () => void; // 登出功能
  loading: boolean; // 載入狀態
}

// 創建身份驗證上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * 身份驗證提供者組件
 * 
 * 主要功能：
 * 1. 管理登入狀態 - 追蹤工作人員是否已登入
 * 2. 工作人員資訊管理 - 儲存和管理當前工作人員資料
 * 3. 登入功能 - 提供真實的API登入
 * 4. 登出功能 - 清除工作人員資訊和登入狀態
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // 身份驗證狀態
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
  
  // 當前工作人員資訊
  const [worker, setWorker] = useState<WorkerInfo | null>(authService.getCurrentWorker());
  
  // 載入狀態
  const [loading, setLoading] = useState(false);

  /**
   * 工作人員登入功能
   * @param email - 工作人員電子郵件
   * @param password - 工作人員密碼
   */
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await authService.login(email, password);
      
      if (result.success && result.worker) {
        setWorker(result.worker);
        setIsAuthenticated(true);
      }
      
      return result;
    } catch (error) {
      console.error('登入錯誤:', error);
      return {
        success: false,
        message: '登入過程中發生錯誤'
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 登出功能
   * 清除工作人員資訊和身份驗證狀態
   */
  const logout = () => {
    authService.logout();
    setWorker(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, worker, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * 身份驗證 Hook
 * 
 * 用於在組件中獲取身份驗證功能的自定義 Hook
 * 必須在 AuthProvider 包裹的組件內使用
 * 
 * @returns 身份驗證上下文物件
 * @throws 如果在 AuthProvider 外使用會拋出錯誤
 * 
 * 使用範例：
 * ```jsx
 * const { isAuthenticated, user, login, logout } = useAuth();
 * ```
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 