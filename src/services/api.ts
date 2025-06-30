import axios from 'axios';
import { config } from '../config/env';

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
 * 2. 記錄 API 請求資訊（開發除錯用）
 * 3. 統一處理請求前的數據處理
 */
apiClient.interceptors.request.use(
  (config: any) => {
    // 從本地儲存獲取身份驗證令牌
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 開發環境下記錄請求資訊
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error: any) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

/**
 * 響應攔截器 (Response Interceptor)
 * 
 * 功能：
 * 1. 統一處理 API 響應
 * 2. 自動處理身份驗證失效（401 錯誤）
 * 3. 記錄響應資訊和錯誤
 * 4. 提供統一的錯誤處理機制
 */
apiClient.interceptors.response.use(
  (response: any) => {
    // 開發環境下記錄響應資訊
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error: any) => {
    console.error('Response Error:', error);
    
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
 * 提供統一的 HTTP 請求方法，封裝 Axios 操作：
 * 
 * 支援的 HTTP 方法：
 * - GET: 獲取資料
 * - POST: 創建新資料
 * - PUT: 更新完整資料
 * - PATCH: 部分更新資料
 * - DELETE: 刪除資料
 * 
 * 特色：
 * - TypeScript 泛型支援，提供型別安全
 * - 自動處理 JSON 序列化/反序列化
 * - 統一的錯誤處理
 * - 自動添加身份驗證標頭
 * 
 * 使用範例：
 * ```typescript
 * // 獲取用戶列表
 * const users = await api.get<User[]>('/users');
 * 
 * // 創建新用戶
 * const newUser = await api.post<User>('/users', userData);
 * 
 * // 更新用戶資料
 * const updatedUser = await api.put<User>(`/users/${id}`, userData);
 * ```
 */
export const api = {
  // GET 請求 - 獲取資料
  get: <T>(url: string, params?: any) => 
    apiClient.get(url, { params }).then((response: any) => response.data),
  
  // POST 請求 - 創建新資料
  post: <T>(url: string, data?: any) => 
    apiClient.post(url, data).then((response: any) => response.data),
  
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