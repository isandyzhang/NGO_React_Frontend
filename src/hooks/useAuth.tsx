import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthContextType, UnifiedUser, LoginResult, LoginMethod } from '../types/userTypes';
import { authService } from '../services/accountManagement/authService';
import { azureService } from '../services/accountManagement/azureService';

/**
 * 混合模式身份驗證上下文
 * 同時支援 Azure AD 和資料庫登入
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * 混合模式身份驗證提供者
 * 
 * 功能：
 * 1. 支援 Azure AD SSO 登入
 * 2. 支援資料庫帳號密碼登入
 * 3. 統一的登入狀態管理
 * 4. 自動檢測已存在的登入狀態
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // 身份驗證狀態
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UnifiedUser | null>(null);
  const [loading, setLoading] = useState(true); // 初始為 true，等待檢查登入狀態
  const [error, setError] = useState<string | null>(null);
  const [loginMethod, setLoginMethod] = useState<LoginMethod | undefined>(undefined);

  /**
   * 檢查現有登入狀態
   */
  const checkExistingAuth = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // 優先檢查 Azure AD 重導向結果（不管 localStorage 狀態）
      if (azureService.isEnabled()) {
        const redirectResult = await azureService.handleRedirectResult();
        if (redirectResult) {
          if (redirectResult.success && redirectResult.user) {
            setUser(redirectResult.user);
            setIsAuthenticated(true);
            setLoginMethod(LoginMethod.AZURE_AD);
            return; // Azure AD 登入成功，結束檢查
          } else if (!redirectResult.success) {
            // 只有在非 hash_empty_error 時才設定錯誤
            if (!redirectResult.message.includes('重導向處理錯誤')) {
              setError(redirectResult.message);
            }
          }
        }
      }

      // 檢查 localStorage 中的登入方式
      const storedLoginMethod = localStorage.getItem('loginMethod') as LoginMethod;
      const isAuth = localStorage.getItem('isAuthenticated') === 'true';

      if (!isAuth || !storedLoginMethod) {
        // 沒有登入狀態
        setIsAuthenticated(false);
        setUser(null);
        setLoginMethod(undefined);
        return;
      }

      if (storedLoginMethod === LoginMethod.DATABASE) {
        // 資料庫登入
        const worker = authService.getCurrentWorker();
        const isDbAuth = authService.isDatabaseAuthenticated();
        
        console.log('useAuth 檢查資料庫登入狀態:', {
          worker,
          isDbAuth,
          workerRole: worker?.role
        });
        
        if (worker && isDbAuth) {
          setUser(worker);
          setIsAuthenticated(true);
          setLoginMethod(LoginMethod.DATABASE);
          console.log('useAuth 恢復登入狀態成功，角色:', worker.role);
        } else {
          // 清理無效的登入狀態
          console.log('useAuth 清理無效登入狀態');
          authService.logoutDatabase();
          setIsAuthenticated(false);
          setUser(null);
          setLoginMethod(undefined);
        }
      } else if (storedLoginMethod === LoginMethod.AZURE_AD) {
        // Azure AD 登入
        if (azureService.isEnabled()) {
          const azureUser = azureService.getStoredAzureUser();
          if (azureUser && azureService.isAuthenticated()) {
            setUser(azureUser);
            setIsAuthenticated(true);
            setLoginMethod(LoginMethod.AZURE_AD);
          } else {
            // 清理無效的登入狀態
            await azureService.logout();
            setIsAuthenticated(false);
            setUser(null);
            setLoginMethod(undefined);
          }
        } else {
          // Azure AD 已停用，清理狀態
          setIsAuthenticated(false);
          setUser(null);
          setLoginMethod(undefined);
        }
      }
    } catch (error: any) {
      console.error('檢查登入狀態時發生錯誤:', error);
      setError('檢查登入狀態時發生錯誤');
      setIsAuthenticated(false);
      setUser(null);
      setLoginMethod(undefined);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 資料庫登入
   */
  const loginWithDatabase = async (email: string, password: string): Promise<LoginResult> => {
    setLoading(true);
    setError(null);

    try {
      const result = await authService.loginWithDatabase(email, password);

      if (result.success && result.user) {
        setUser(result.user);
        setIsAuthenticated(true);
        setLoginMethod(LoginMethod.DATABASE);
      } else {
        setError(result.message);
      }

      return result;
    } catch (error: any) {
      const errorMessage = '登入失敗，請稍後再試';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage,
        method: LoginMethod.DATABASE,
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Azure AD 登入
   */
  const loginWithAzure = async (): Promise<LoginResult> => {
    if (!azureService.isEnabled()) {
      const errorMessage = 'Azure AD 登入功能未啟用';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage,
        method: LoginMethod.AZURE_AD,
      };
    }

    setLoading(true);
    setError(null);

    try {
      const result = await azureService.login();

      if (result.success && result.user) {
        setUser(result.user);
        setIsAuthenticated(true);
        setLoginMethod(LoginMethod.AZURE_AD);
      } else {
        setError(result.message);
      }

      return result;
    } catch (error: any) {
      const errorMessage = 'Azure AD 登入失敗，請稍後再試';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage,
        method: LoginMethod.AZURE_AD,
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 通用登出
   */
  const logout = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const currentLoginMethod = loginMethod;
      
      if (currentLoginMethod === LoginMethod.DATABASE) {
        authService.logoutDatabase();
      } else if (currentLoginMethod === LoginMethod.AZURE_AD && azureService.isEnabled()) {
        // 先立即清除本地狀態，避免 Azure 登出重導向時狀態殘留
        setUser(null);
        setIsAuthenticated(false);
        setLoginMethod(undefined);
        
        // 然後執行 Azure 登出（會重導向）
        await azureService.logout();
        return; // Azure 登出會重導向，不需要繼續執行
      }

      // 清除狀態
      setUser(null);
      setIsAuthenticated(false);
      setLoginMethod(undefined);
    } catch (error: any) {
      console.error('登出時發生錯誤:', error);
      setError('登出時發生錯誤');
      
      // 即使有錯誤也清除本地狀態
      setUser(null);
      setIsAuthenticated(false);
      setLoginMethod(undefined);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 獲取存取令牌
   */
  const getAccessToken = async (): Promise<string | null> => {
    try {
      if (loginMethod === LoginMethod.AZURE_AD && azureService.isEnabled()) {
        return await azureService.getAccessToken();
      }
      
      // 資料庫登入目前不提供令牌
      return null;
    } catch (error: any) {
      console.error('獲取存取令牌失敗:', error);
      return null;
    }
  };

  /**
   * 檢查是否支援 Azure AD 登入
   */
  const isAzureEnabled = (): boolean => {
    return azureService.isEnabled();
  };

  /**
   * 組件掛載時檢查登入狀態
   */
  useEffect(() => {
    checkExistingAuth();
  }, []);

  const value: AuthContextType = {
    isAuthenticated,
    user,
    loading,
    error,
    loginMethod,
    loginWithDatabase,
    loginWithAzure,
    logout,
    getAccessToken,
    isAzureEnabled,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
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
 * const { isAuthenticated, user, loginWithDatabase, loginWithAzure, logout } = useAuth();
 * ```
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};