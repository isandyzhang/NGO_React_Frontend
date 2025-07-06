// 環境變數配置
export const config = {
  // API 設定
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5264/api',
  requestTimeout: parseInt(import.meta.env.VITE_REQUEST_TIMEOUT || '10000'),
  
  // 應用程式資訊
  appName: import.meta.env.VITE_APP_NAME || 'NGO個案管理系統',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  appEnv: import.meta.env.VITE_APP_ENV || 'development',
  
  // 檔案上傳設定
  maxFileSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '5242880'), // 5MB
  allowedFileTypes: (import.meta.env.VITE_ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif').split(','),
  
  // 分頁設定
  defaultPageSize: parseInt(import.meta.env.VITE_DEFAULT_PAGE_SIZE || '10'),
  
  // 開發模式檢查
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

export default config; 