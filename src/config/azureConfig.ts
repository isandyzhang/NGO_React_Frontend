import { Configuration, PopupRequest, RedirectRequest } from '@azure/msal-browser';

/**
 * Azure AD MSAL 配置
 * 用於設定 Microsoft Authentication Library 的參數
 */
export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || '',
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID || 'common'}`,
    redirectUri: import.meta.env.VITE_AZURE_REDIRECT_URI || window.location.origin,
    postLogoutRedirectUri: import.meta.env.VITE_AZURE_LOGOUT_URI || window.location.origin,
    navigateToLoginRequestUrl: false, // 防止重導向循環
  },
  cache: {
    cacheLocation: 'localStorage', // 使用 localStorage 儲存快取
    storeAuthStateInCookie: false, // 不將狀態儲存在 cookie 中
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        console.log(`MSAL [${level}]: ${message}`);
      },
      logLevel: import.meta.env.DEV ? 3 : 1, // 開發模式詳細記錄
    },
    allowNativeBroker: false, // 禁用原生代理以避免重導向問題
  },
};

/**
 * Azure AD 登入請求配置
 */
export const loginRequest: RedirectRequest = {
  scopes: [
    'openid',
    'profile',
    'User.Read',
    'email',
  ],
  prompt: 'select_account', // 讓使用者選擇帳號
};

/**
 * Azure AD 彈出視窗登入請求配置
 */
export const popupLoginRequest: PopupRequest = {
  scopes: [
    'openid',
    'profile',
    'User.Read',
    'email',
  ],
  prompt: 'select_account',
};

/**
 * Azure AD 權限範圍
 */
export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
  graphMailEndpoint: 'https://graph.microsoft.com/v1.0/me/messages',
};

/**
 * 檢查 Azure AD 配置是否完整
 */
export const isAzureConfigured = (): boolean => {
  const clientId = import.meta.env.VITE_AZURE_CLIENT_ID;
  const tenantId = import.meta.env.VITE_AZURE_TENANT_ID;
  
  return !!(clientId && clientId.trim() !== '' && tenantId && tenantId.trim() !== '');
};

/**
 * Azure AD 錯誤類型
 */
export enum AzureErrorType {
  USER_CANCELLED = 'user_cancelled',
  POPUP_BLOCKED = 'popup_blocked',
  NETWORK_ERROR = 'network_error',
  CONFIGURATION_ERROR = 'configuration_error',
  HASH_EMPTY_ERROR = 'hash_empty_error',
  REDIRECT_ERROR = 'redirect_error',
  UNKNOWN_ERROR = 'unknown_error',
}

/**
 * 解析 Azure AD 錯誤
 */
export const parseAzureError = (error: any): { type: AzureErrorType; message: string } => {
  if (error?.errorCode === 'user_cancelled') {
    return {
      type: AzureErrorType.USER_CANCELLED,
      message: '使用者取消登入',
    };
  }

  if (error?.errorCode === 'hash_empty_error' || error?.message?.includes('hash_empty_error')) {
    return {
      type: AzureErrorType.HASH_EMPTY_ERROR,
      message: '重導向處理錯誤，請重新嘗試登入',
    };
  }
  
  if (error?.message?.includes('popup')) {
    return {
      type: AzureErrorType.POPUP_BLOCKED,
      message: '彈出視窗被阻擋，請允許彈出視窗後重試',
    };
  }
  
  if (error?.message?.includes('network')) {
    return {
      type: AzureErrorType.NETWORK_ERROR,
      message: '網路連線錯誤，請檢查網路後重試',
    };
  }
  
  if (error?.message?.includes('configuration')) {
    return {
      type: AzureErrorType.CONFIGURATION_ERROR,
      message: 'Azure AD 配置錯誤，請聯絡系統管理員',
    };
  }

  if (error?.message?.includes('redirect') || error?.errorCode?.includes('redirect')) {
    return {
      type: AzureErrorType.REDIRECT_ERROR,
      message: '重導向處理失敗，請重新嘗試',
    };
  }
  
  return {
    type: AzureErrorType.UNKNOWN_ERROR,
    message: error?.message || '登入時發生未知錯誤',
  };
};