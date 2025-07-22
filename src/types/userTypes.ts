/**
 * 基本使用者介面
 */
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
  // 新增：登入來源標識
  loginSource?: 'database' | 'azure';
  // 新增：Azure AD 特有資訊
  azureObjectId?: string;
  tenantId?: string;
}

/**
 * 工作人員資訊（資料庫登入）
 */
export interface WorkerInfo {
  workerId: number;
  email: string;
  name: string;
  role: string;
  loginSource: 'database';
}

/**
 * Azure AD 使用者資訊
 */
export interface AzureUser {
  id: string;
  displayName: string;
  email: string;
  givenName?: string;
  surname?: string;
  userPrincipalName: string;
  tenantId: string;
  loginSource: 'azure';
}

/**
 * 統一的使用者資訊類型
 */
export type UnifiedUser = WorkerInfo | (AzureUser & { workerId?: number; role?: string });

/**
 * 登入方式
 */
export enum LoginMethod {
  DATABASE = 'database',
  AZURE_AD = 'azure',
}

/**
 * 登入結果
 */
export interface LoginResult {
  success: boolean;
  message: string;
  user?: UnifiedUser;
  method: LoginMethod;
}

/**
 * 身份驗證狀態
 */
export interface AuthState {
  isAuthenticated: boolean;
  user: UnifiedUser | null;
  loading: boolean;
  error: string | null;
  loginMethod?: LoginMethod;
}

/**
 * 身份驗證上下文類型（混合模式）
 */
export interface AuthContextType extends AuthState {
  // 資料庫登入
  loginWithDatabase: (email: string, password: string) => Promise<LoginResult>;
  
  // Azure AD 登入
  loginWithAzure: () => Promise<LoginResult>;
  
  // 通用登出
  logout: () => Promise<void>;
  
  // 獲取存取令牌
  getAccessToken: () => Promise<string | null>;
  
  // 檢查是否支援 Azure AD 登入
  isAzureEnabled: () => boolean;
} 