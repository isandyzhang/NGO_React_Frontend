import { api } from './api';
import { WorkerInfo, LoginResult, LoginMethod } from '../types/userTypes';

// 登入請求介面
export interface LoginRequest {
  email: string;
  password: string;
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
  async loginWithDatabase(email: string, password: string): Promise<LoginResult> {
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
        // 標記為資料庫登入
        const worker: WorkerInfo = {
          ...response.worker,
          loginSource: 'database',
        };
        
        // 儲存工作人員資訊到本地儲存
        localStorage.setItem('workerInfo', JSON.stringify(worker));
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('loginMethod', 'database');
        
        console.log('資料庫登入成功:', worker);
        
        return {
          success: true,
          message: response.message,
          user: worker,
          method: LoginMethod.DATABASE,
        };
      } else {
        // 登入失敗
        return {
          success: false,
          message: response.message || '登入失敗',
          method: LoginMethod.DATABASE,
        };
      }
    } catch (error: any) {
      console.error('資料庫登入失敗:', error);
      
      // 回傳錯誤訊息
      return {
        success: false,
        message: '登入失敗，請檢查網路連接或稍後再試',
        method: LoginMethod.DATABASE,
      };
    }
  },

  /**
   * 登出（僅清除資料庫相關資訊）
   */
  logoutDatabase(): void {
    const loginMethod = localStorage.getItem('loginMethod');
    if (loginMethod === 'database') {
      localStorage.removeItem('workerInfo');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('loginMethod');
      localStorage.removeItem('authToken');
    }
  },

  /**
   * 取得當前登入的工作人員資訊（僅資料庫登入）
   * @returns 工作人員資訊或null
   */
  getCurrentWorker(): WorkerInfo | null {
    const loginMethod = localStorage.getItem('loginMethod');
    if (loginMethod !== 'database') {
      return null;
    }
    
    const workerInfo = localStorage.getItem('workerInfo');
    return workerInfo ? JSON.parse(workerInfo) : null;
  },

  /**
   * 檢查是否已透過資料庫登入
   * @returns 是否已登入
   */
  isDatabaseAuthenticated(): boolean {
    const loginMethod = localStorage.getItem('loginMethod');
    const isAuth = localStorage.getItem('isAuthenticated');
    return loginMethod === 'database' && isAuth === 'true';
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