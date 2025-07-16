import { config } from '../config/env';
import { getCurrentEnvironmentConfig } from '../config/environment';

// 測試環境配置
export function testEnvironmentConfig() {
  console.log('=== 環境配置測試 ===');
  console.log('當前環境:', config.appEnv);
  console.log('API Base URL:', config.apiBaseUrl);
  console.log('域名:', window.location.hostname);
  console.log('完整URL:', window.location.href);
  
  const envConfig = getCurrentEnvironmentConfig();
  console.log('環境配置:', envConfig);
  
  // 驗證配置是否正確
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('✅ 本地環境 - 應該使用 localhost:5264');
    console.log('實際使用:', config.apiBaseUrl);
  } else {
    console.log('✅ 生產環境 - 應該使用 Azure URL');
    console.log('實際使用:', config.apiBaseUrl);
  }
  
  return {
    environment: config.appEnv,
    apiBaseUrl: config.apiBaseUrl,
    hostname: window.location.hostname
  };
}

// 在開發環境中自動執行測試
if (import.meta.env.DEV) {
  console.log('開發環境檢測 - 自動執行環境配置測試');
  setTimeout(() => {
    testEnvironmentConfig();
  }, 1000);
} 