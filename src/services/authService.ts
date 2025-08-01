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
  role: string; // 員工角色：staff, supervisor, admin
  loginSource: 'database'; // 資料庫登入來源
}

// 登入回應介面
export interface LoginResponse {
  success: boolean;
  message: string;
  worker?: WorkerInfo;
}

// Email驗證回應介面
export interface EmailVerificationResponse {
  success: boolean;
  message: string;
  worker?: WorkerInfo;
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
      const response = await api.get(`/Worker/by-email/${encodeURIComponent(email)}`);
      
      if (response) {
        return {
          success: true,
          message: "帳號驗證成功",
          worker: {
            ...response,
            loginSource: 'database' as const
          } as WorkerInfo
        };
      } else {
        return {
          success: false,
          message: "找不到對應的工作人員帳號"
        };
      }
    } catch (error: any) {
      console.error('Email驗證失敗:', error);
      
      // 處理 404 錯誤（找不到帳號）
      if (error.response && error.response.status === 404) {
        return {
          success: false,
          message: "找不到對應的工作人員帳號，請檢查Email是否正確"
        };
      }
      
      // 處理其他API錯誤
      if (error.response && error.response.data) {
        return {
          success: false,
          message: error.response.data.message || 'Email驗證失敗，請稍後再試'
        };
      }
      
      return {
        success: false,
        message: 'Email驗證失敗，請稍後再試'
      };
    }
  },

  /**
   * 工作人員登入 - 透過後端API驗證
   * @param email 電子郵件
   * @param password 密碼
   * @returns 登入結果
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      // 呼叫後端登入API
      const response = await api.post('/Worker/login', {
        email,
        password
      });
      
      if (response.success) {
        // 為 worker 資料加入 loginSource 屬性
        const workerWithSource = {
          ...response.worker,
          loginSource: 'database' as const
        } as WorkerInfo;
        
        // 儲存工作人員資訊到本地儲存
        localStorage.setItem('workerInfo', JSON.stringify(workerWithSource));
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('loginMethod', 'database');
        
        console.log('登入成功，工作人員資訊:', workerWithSource);
        console.log('用戶角色:', workerWithSource?.role);
        
        return {
          success: true,
          message: response.message,
          worker: workerWithSource
        };
      } else {
        return {
          success: false,
          message: response.message
        };
      }
    } catch (error: any) {
      console.error('登入失敗:', error);
      
      // 處理API錯誤
      if (error.response && error.response.data) {
        return {
          success: false,
          message: error.response.data.message || '登入失敗，請稍後再試'
        };
      }
      
      // 回傳錯誤訊息
      return {
        success: false,
        message: '登入失敗，請稍後再試'
      };
    }
  },

  /**
   * 資料庫登入 (與 login 方法相同，提供向後兼容)
   * @param email 電子郵件
   * @param password 密碼
   * @returns 登入結果
   */
  async loginWithDatabase(email: string, password: string): Promise<any> {
    try {
      const result = await this.login(email, password);
      
      // 轉換格式以符合 LoginResult 介面
      if (result.success && result.worker) {
        // 確保 loginMethod 已正確設置
        localStorage.setItem('loginMethod', 'database');
        
        const user = {
          ...result.worker,
          loginSource: 'database'
        } as any;
        
        console.log('loginWithDatabase 成功，用戶資訊:', user);
        console.log('用戶角色:', user.role);
        
        return {
          success: true,
          message: result.message,
          user: user,
          method: 'database'
        };
      } else {
        return {
          success: false,
          message: result.message,
          method: 'database'
        };
      }
    } catch (error) {
      console.error('資料庫登入失敗:', error);
      return {
        success: false,
        message: '登入失敗，請稍後再試',
        method: 'database'
      };
    }
  },

  /**
   * 根據email查詢工作人員資訊 (透過API)
   * @param email 電子郵件
   * @returns 工作人員資訊或null
   */
  async getWorkerByEmail(email: string): Promise<WorkerInfo | null> {
    try {
      const response = await api.get(`/Worker/by-email/${encodeURIComponent(email)}`);
      if (response) {
        return {
          ...response,
          loginSource: 'database' as const
        } as WorkerInfo;
      }
      return null;
    } catch (error) {
      console.error('查詢工作人員資訊失敗:', error);
      return null;
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
    localStorage.removeItem('loginMethod');
    
    console.log('登出完成，已清除所有本地儲存資料');
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
   * 檢查資料庫登入狀態
   * @returns 是否已透過資料庫登入
   */
  isDatabaseAuthenticated(): boolean {
    const workerInfo = localStorage.getItem('workerInfo');
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    return isAuthenticated && workerInfo !== null;
  },

  /**
   * 資料庫登出
   */
  logoutDatabase(): void {
    // 清除資料庫登入相關的本地儲存
    localStorage.removeItem('workerInfo');
    localStorage.removeItem('isAuthenticated');
    
    console.log('資料庫登出完成');
  },

  /**
   * 取得所有工作人員列表
   * @returns 工作人員列表
   */
  async getWorkers(): Promise<WorkerInfo[]> {
    try {
      const workers = await api.get<WorkerInfo[]>('/Worker');
      // 為每個 worker 加入 loginSource 屬性
      return workers.map(worker => ({
        ...worker,
        loginSource: 'database' as const
      })) as WorkerInfo[];
    } catch (error: any) {
      console.error('取得工作人員列表失敗:', error);
      throw error;
    }
  }
};

export default authService; 