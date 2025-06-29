import React, { createContext, useContext, useState, ReactNode } from 'react';

// 身份驗證上下文類型定義
interface AuthContextType {
  isAuthenticated: boolean; // 是否已登入
  user: any | null; // 當前用戶資訊
  login: (username: string, password: string) => Promise<void>; // 登入功能
  azureLogin: () => Promise<void>; // Azure SSO 登入功能
  logout: () => void; // 登出功能
}

// 創建身份驗證上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * ⚠️ 注意：此檔案與 auth/AuthProvider.tsx 功能重複
 * 
 * 建議事項：
 * 1. 統一使用 auth/AuthProvider.tsx 中的實作
 * 2. 此檔案可以考慮移除或重構為純 hook
 * 3. 避免在同一專案中維護兩套身份驗證邏輯
 */

/**
 * 身份驗證提供者組件
 * 
 * 主要功能：
 * 1. 管理登入狀態 - 追蹤用戶是否已登入
 * 2. 用戶資訊管理 - 儲存和管理當前用戶資料
 * 3. 登入功能 - 提供傳統帳密登入和 Azure SSO 登入
 * 4. 登出功能 - 清除用戶資訊和登入狀態
 * 
 * 目前狀態：
 * - 使用模擬資料進行測試
 * - 預設為已登入狀態（開發方便）
 * - 等待整合真實的身份驗證 API
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // 身份驗證狀態（預設為已登入，方便開發測試）
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  
  // 當前用戶資訊（使用模擬資料）
  const [user, setUser] = useState<any>({
    id: '1',
    displayName: 'Test User',
    email: 'test@example.com',
    roles: ['user'],
  });

  /**
   * 傳統帳號密碼登入功能
   * @param username - 使用者帳號
   * @param password - 使用者密碼
   */
  const login = async (username: string, password: string) => {
    // 模擬 API 呼叫延遲
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUser({ username });
    setIsAuthenticated(true);
  };

  /**
   * Azure Active Directory 單一登入功能
   * 提供企業級的身份驗證服務
   */
  const azureLogin = async () => {
    // 模擬 Azure SSO 登入流程
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUser({ username: 'azure_user' });
    setIsAuthenticated(true);
  };

  /**
   * 登出功能
   * 清除用戶資訊和身份驗證狀態
   */
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, azureLogin, logout }}>
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