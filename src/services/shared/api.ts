import axios from 'axios';
import { config } from '../../config/env';

// API 基礎配置
const API_BASE_URL = config.apiBaseUrl;

/**
 * 創建 Axios 實例
 * 配置統一的 API 請求設定，包括基礎 URL、超時時間和預設標頭
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: config.requestTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 請求攔截器 (Request Interceptor)
 * 
 * 功能：
 * 1. 自動添加身份驗證令牌到請求標頭
 * 2. 統一處理請求前的數據處理
 */
apiClient.interceptors.request.use(
  (config: any) => {
    // 從本地儲存獲取身份驗證令牌
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

/**
 * 響應攔截器 (Response Interceptor)
 * 
 * 功能：
 * 1. 統一處理 API 響應
 * 2. 自動處理身份驗證失效（401 錯誤）
 * 3. 提供統一的錯誤處理機制
 */
apiClient.interceptors.response.use(
  (response: any) => {
    return response;
  },
  (error: any) => {
    // 處理身份驗證失效
    if (error.response?.status === 401) {
      // 清除過期的令牌並重導向到登入頁
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

/**
 * API 服務物件 (API Service)
 * 
 * 提供統一的 HTTP 請求方法，封裝 Axios 操作
 */
export const api = {
  // GET 請求 - 獲取資料
  get: <T>(url: string, params?: any) => {
    // 確保中文參數正確編碼
    const config: any = {};
    if (params) {
      // 手動構建查詢字串，確保中文正確編碼
      const queryString = Object.keys(params)
        .filter(key => params[key] !== undefined && params[key] !== null && params[key] !== '')
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
      
      if (queryString) {
        url = `${url}?${queryString}`;
      }
    }
    return apiClient.get(url).then((response: any) => response.data);
  },
  
  // POST 請求 - 創建新資料
  post: <T>(url: string, data?: any, config?: any) => 
    apiClient.post(url, data, config).then((response: any) => response.data),
  
  // PUT 請求 - 完整更新資料
  put: <T>(url: string, data?: any) => 
    apiClient.put(url, data).then((response: any) => response.data),
  
  // DELETE 請求 - 刪除資料
  delete: <T>(url: string) => 
    apiClient.delete(url).then((response: any) => response.data),
  
  // PATCH 請求 - 部分更新資料
  patch: <T>(url: string, data?: any) => 
    apiClient.patch(url, data).then((response: any) => response.data),
};

export default apiClient; 