import React, { createContext, useContext, useState, useCallback } from 'react';
import { AuthContextType, User, LoginMethod } from '../types/userTypes';

// 創建身份驗證上下文，初始值為 null
const AuthContext = createContext<AuthContextType | null>(null);

/**
 * 自定義 Hook：用於在組件中獲取身份驗證上下文
 * 必須在 AuthProvider 包裹的組件內使用，否則會拋出錯誤
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * 身份驗證提供者組件
 * 負責管理整個應用程式的身份驗證狀態和相關功能
 * 包括登入、登出、用戶資訊管理等
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 身份驗證狀態：預設為未登入，需要先登入
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // 用戶資訊狀態：可以是 User 物件或 null
  const [user, setUser] = useState<User | null>(null);
  
  // 載入狀態：用於顯示載入指示器
  const [loading, setLoading] = useState(false);
  
  // 錯誤狀態：儲存身份驗證過程中的錯誤訊息
  const [error, setError] = useState<string | null>(null);

  /**
   * 登入功能
   * 目前使用模擬資料，未來將整合 Azure AD 身份驗證
   */
  const login = useCallback(async () => {
    try {
      setLoading(true);
      setError(null); // 清除之前的錯誤
      
      // TODO: 實作真正的 Azure AD 登入邏輯
      // 目前使用預設工作者資料
      const mockUser: User = {
        id: '1',
        displayName: '社工',
        email: 'worker@ngo.org',
        roles: ['user'],
      };
      
      // 設定用戶資訊和登入狀態
      setUser(mockUser);
      setIsAuthenticated(true);
    } catch (err) {
      // 處理登入錯誤
      setError(err instanceof Error ? err.message : 'Login failed');
      setIsAuthenticated(false);
    } finally {
      // 無論成功或失敗都停止載入狀態
      setLoading(false);
    }
  }, []);

  /**
   * 登出功能
   * 清除用戶資訊和身份驗證狀態
   */
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      setError(null); // 清除之前的錯誤
      
      // TODO: 實作真正的 Azure AD 登出邏輯
      // 清除用戶資訊和登入狀態
      setUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      // 處理登出錯誤
      setError(err instanceof Error ? err.message : 'Logout failed');
    } finally {
      // 無論成功或失敗都停止載入狀態
      setLoading(false);
    }
  }, []);

  /**
   * 獲取存取令牌
   * 用於 API 呼叫時的身份驗證
   * 目前回傳模擬令牌，未來將從 Azure AD 獲取真實令牌
   */
  const getAccessToken = useCallback(async () => {
    try {
      // TODO: 實作真正的令牌獲取邏輯
      // 從 Azure AD 獲取有效的存取令牌
      return 'mock-token';
    } catch (err) {
      console.error('Failed to get access token:', err);
      return null;
    }
  }, []);

  // 組織所有身份驗證相關的狀態和功能
  const value: AuthContextType = {
    isAuthenticated,    // 是否已登入
    user,              // 用戶資訊
    loading,           // 載入狀態
    error,             // 錯誤訊息
    loginMethod: LoginMethod.DATABASE, // 預設登入方式
    loginWithDatabase: async (email: string, password: string) => {
      // TODO: 實作資料庫登入
      await login();
      return { success: true, message: '登入成功', method: LoginMethod.DATABASE };
    },
    loginWithAzure: async () => {
      // TODO: 實作 Azure AD 登入
      await login();
      return { success: true, message: 'Azure 登入成功', method: LoginMethod.AZURE_AD };
    },
    logout,            // 登出功能
    getAccessToken,    // 獲取令牌功能
    isAzureEnabled: () => false, // 暫時停用 Azure AD
  };

  // 提供身份驗證上下文給所有子組件
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 