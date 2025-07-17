import { api } from './api';

// 登入請求介面
export interface LoginRequest {
  email: string;
  password: string;
}

// 工作人員資訊介面
export interface WorkerInfo {
  workerId: number;
  email: string;
  name: string;
  role: string;
}

// 登入回應介面
export interface LoginResponse {
  success: boolean;
  message: string;
  worker?: WorkerInfo;
}

// Email驗證請求介面
export interface EmailVerificationRequest {
  email: string;
}

// Email驗證回應介面
export interface EmailVerificationResponse {
  success: boolean;
  message: string;
}

/**
 * 身份驗證服務
 * 提供登入、登出等身份驗證相關的API呼叫
 */
export const authService = {
  /**
   * 驗證Email是否存在
   * @param email 電子郵件
   * @returns 驗證結果
   */
  async verifyEmail(email: string): Promise<EmailVerificationResponse> {
    try {
      // 準備驗證請求資料
      const verificationRequest: EmailVerificationRequest = {
        email: email
      };
      
      // 呼叫後端Email驗證API
      const response = await api.post<EmailVerificationResponse>('/Auth/verify-email', verificationRequest);
      
      return response;
    } catch (error) {
      console.error('Email驗證失敗:', error);
      return {
        success: false,
        message: '驗證過程中發生錯誤，請稍後再試'
      };
    }
  },

  /**
   * 工作人員登入 (使用真實數據庫)
   * @param email 電子郵件
   * @param password 密碼
   * @returns 登入結果
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      // 準備登入請求資料
      const loginRequest: LoginRequest = {
        email: email,
        password: password
      };
      
      // 呼叫後端登入API
      const response = await api.post<LoginResponse>('/Auth/login', loginRequest);
      
      // 檢查登入結果
      if (response.success && response.worker) {
        // 儲存工作人員資訊到本地儲存
        localStorage.setItem('workerInfo', JSON.stringify(response.worker));
        localStorage.setItem('isAuthenticated', 'true');
        
        console.log('登入成功:', response.worker);
        
        return {
          success: true,
          message: response.message,
          worker: response.worker
        };
      } else {
        // 登入失敗
        return {
          success: false,
          message: response.message || '登入失敗'
        };
      }
    } catch (error: any) {
      console.error('登入失敗:', error);
      
      // 回傳錯誤訊息
      return {
        success: false,
        message: '登入失敗，請檢查網路連接或稍後再試'
      };
    }
  },

  /**
   * 登出
   */
  logout(): void {
    // 清除本地儲存的認證資訊
    localStorage.removeItem('workerInfo');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('authToken');
  },

  /**
   * 取得當前登入的工作人員資訊
   * @returns 工作人員資訊或null
   */
  getCurrentWorker(): WorkerInfo | null {
    const workerInfo = localStorage.getItem('workerInfo');
    return workerInfo ? JSON.parse(workerInfo) : null;
  },

  /**
   * 檢查是否已登入
   * @returns 是否已登入
   */
  isAuthenticated(): boolean {
    return localStorage.getItem('isAuthenticated') === 'true';
  },

  /**
   * 取得所有工作人員列表
   * @returns 工作人員列表
   */
  async getWorkers(): Promise<WorkerInfo[]> {
    try {
      return await api.get<WorkerInfo[]>('/Auth/workers');
    } catch (error: any) {
      console.error('取得工作人員列表失敗:', error);
      throw error;
    }
  },

  /**
   * 取得工作人員詳細資料（包含密碼，僅用於測試）
   * @returns 工作人員詳細資料
   */
  async getWorkersDetail(): Promise<any[]> {
    try {
      return await api.get<any[]>('/Auth/workers-detail');
    } catch (error: any) {
      console.error('取得工作人員詳細資料失敗:', error);
      throw error;
    }
  }
};

export default authService; 