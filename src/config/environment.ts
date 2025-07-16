// 環境配置文件
export const environments = {
  development: {
    apiBaseUrl: 'http://localhost:5264/api',
    appEnv: 'development',
  },
  production: {
    apiBaseUrl: 'https://ngobackend-fagef3gxbsfadtct.eastasia-01.azurewebsites.net/api',
    appEnv: 'production',
  }
};

// 根據環境變量或域名自動判斷環境
export function getEnvironment() {
  // 檢查是否有環境變量設定
  const envVar = import.meta.env.VITE_APP_ENV;
  if (envVar) {
    return envVar;
  }
  
  // 根據域名自動判斷
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'development';
  }
  
  return 'production';
}

// 獲取當前環境配置
export function getCurrentEnvironmentConfig() {
  const env = getEnvironment();
  return environments[env as keyof typeof environments] || environments.development;
} 