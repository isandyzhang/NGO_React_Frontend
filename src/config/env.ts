import { getCurrentEnvironmentConfig } from './environment';

// 環境變數配置
const envConfig = getCurrentEnvironmentConfig();

export const config = {
  // API 設定
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || envConfig.apiBaseUrl,
  requestTimeout: parseInt(import.meta.env.VITE_REQUEST_TIMEOUT || '10000'),
  
  // 應用程式資訊
  appName: import.meta.env.VITE_APP_NAME || 'NGO個案管理系統',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  appEnv: import.meta.env.VITE_APP_ENV || envConfig.appEnv,
  
  // Azure AD 設定（混合模式登入）
  azure: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || '',
    tenantId: import.meta.env.VITE_AZURE_TENANT_ID || '',
    redirectUri: import.meta.env.VITE_AZURE_REDIRECT_URI || window.location.origin,
    logoutUri: import.meta.env.VITE_AZURE_LOGOUT_URI || `${window.location.origin}/login`,
    enableAzureLogin: import.meta.env.VITE_ENABLE_AZURE_LOGIN === 'true',
    usePopupLogin: import.meta.env.VITE_USE_POPUP_LOGIN === 'true',
    debugMode: import.meta.env.VITE_DEBUG_AZURE === 'true',
  },
  
  // 檔案上傳設定
  maxFileSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '5242880'), // 5MB
  allowedFileTypes: (import.meta.env.VITE_ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif').split(','),
  
  // 分頁設定
  defaultPageSize: parseInt(import.meta.env.VITE_DEFAULT_PAGE_SIZE || '10'),
  
  // Google Maps API 設定
  googleMaps: {
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyDVg1dKKWpQDri4sQW0oSsXZYPRltzQV-A',
    libraries: ['places', 'geometry'],
    defaultCenter: { lat: 25.0330, lng: 121.5654 }, // 台北市中心
    defaultZoom: 12,
  },
  
  // 開發模式檢查
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

export default config; 