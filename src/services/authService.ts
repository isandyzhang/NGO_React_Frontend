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
}

// 登入回應介面
export interface LoginResponse {
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
   * 工作人員登入 (測試模式 - 不需要真實後端)
   * @param email 電子郵件
   * @param password 密碼
   * @returns 登入結果
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      // 模擬 API 延遲
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模擬登入成功，創建測試工作人員資訊
      const mockWorker: WorkerInfo = {
        workerId: 1,
        email: email || 'worker@ngo.org',
        name: '測試工作人員'
      };
      
      // 儲存工作人員資訊到本地儲存
      localStorage.setItem('workerInfo', JSON.stringify(mockWorker));
        localStorage.setItem('isAuthenticated', 'true');
      
      return {
        success: true,
        message: '登入成功',
        worker: mockWorker
      };
    } catch (error: any) {
      console.error('登入失敗:', error);
      
      // 回傳錯誤訊息
      return {
        success: false,
        message: '登入失敗，請稍後再試'
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
   * 取得所有工作人員列表（測試用）
   * @returns 工作人員列表
   */
  async getWorkers(): Promise<WorkerInfo[]> {
    try {
      return await api.get<WorkerInfo[]>('/Auth/workers');
    } catch (error: any) {
      console.error('取得工作人員列表失敗:', error);
      throw error;
    }
  }
};

export default authService; 