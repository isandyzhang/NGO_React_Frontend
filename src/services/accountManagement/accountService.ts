import { api } from '../shared/api';

/**
 * 帳號資料介面
 */
export interface Account {
  id: number;
  name: string;
  email: string;
  role: 'staff' | 'supervisor' | 'admin';
  loginSource: 'database' | 'azure';
  status: 'active' | 'inactive';
  createdAt: string;
  workerId?: number;
  phone?: string;
}

/**
 * 建立帳號請求介面
 */
export interface CreateAccountRequest {
  name: string;
  email: string;
  password?: string; // 本地帳戶需要密碼
  role: 'staff' | 'supervisor' | 'admin';
  loginSource: 'database' | 'azure';
  phone?: string;
}

/**
 * 更新帳號請求介面
 */
export interface UpdateAccountRequest {
  name?: string;
  email?: string;
  role?: 'staff' | 'supervisor' | 'admin';
  status?: 'active' | 'inactive';
  phone?: string;
}

/**
 * 帳號管理服務類
 */
class AccountService {
  /**
   * 取得所有帳號
   */
  async getAccounts(): Promise<Account[]> {
    try {
      const response = await api.get<Account[]>('/Account');
      return response || [];
    } catch (error: any) {
      // 區分真正的錯誤和空結果
      if (error.response?.status === 404 || error.response?.status === 204) {
        console.log('沒有找到帳號資料，返回空陣列');
        return [];
      }
      console.error('取得帳號列表失敗:', error);
      throw error;
    }
  }

  /**
   * 根據ID取得單一帳號
   */
  async getAccountById(id: number): Promise<Account> {
    try {
      const response = await api.get<Account>(`/Account/${id}`);
      return response;
    } catch (error) {
      console.error(`取得帳號 ${id} 失敗:`, error);
      throw error;
    }
  }

  /**
   * 建立新帳號
   */
  async createAccount(accountData: CreateAccountRequest): Promise<Account> {
    try {
      const response = await api.post<Account>('/Account', accountData);
      return response;
    } catch (error) {
      console.error('建立帳號失敗:', error);
      throw error;
    }
  }

  /**
   * 更新帳號資料
   */
  async updateAccount(id: number, accountData: UpdateAccountRequest): Promise<Account> {
    try {
      const response = await api.put<Account>(`/Account/${id}`, accountData);
      return response;
    } catch (error) {
      console.error(`更新帳號 ${id} 失敗:`, error);
      throw error;
    }
  }

  /**
   * 刪除帳號
   */
  async deleteAccount(id: number): Promise<void> {
    try {
      await api.delete<void>(`/Account/${id}`);
    } catch (error) {
      console.error(`刪除帳號 ${id} 失敗:`, error);
      throw error;
    }
  }

  /**
   * 啟用帳號
   */
  async activateAccount(id: number): Promise<Account> {
    try {
      const response = await api.patch<Account>(`/Account/${id}/activate`);
      return response;
    } catch (error) {
      console.error(`啟用帳號 ${id} 失敗:`, error);
      throw error;
    }
  }

  /**
   * 停用帳號
   */
  async deactivateAccount(id: number): Promise<Account> {
    try {
      const response = await api.patch<Account>(`/Account/${id}/deactivate`);
      return response;
    } catch (error) {
      console.error(`停用帳號 ${id} 失敗:`, error);
      throw error;
    }
  }

  /**
   * 重置密碼 (僅限本地帳戶)
   */
  async resetPassword(id: number, newPassword: string): Promise<void> {
    try {
      await api.patch<void>(`/Account/${id}/reset-password`, { newPassword });
    } catch (error) {
      console.error(`重置帳號 ${id} 密碼失敗:`, error);
      throw error;
    }
  }

  /**
   * 檢查電子信箱是否已被使用
   */
  async checkEmailExists(email: string): Promise<boolean> {
    try {
      const response = await api.get<{ exists: boolean }>(`/Account/check-email?email=${encodeURIComponent(email)}`);
      return response.exists;
    } catch (error) {
      console.error('檢查電子信箱失敗:', error);
      throw error;
    }
  }

  /**
   * 取得帳號統計資料
   */
  async getAccountStats(): Promise<{
    totalAccounts: number;
    activeAccounts: number;
    inactiveAccounts: number;
    adminCount: number;
    supervisorCount: number;
    staffCount: number;
    azureAccounts: number;
    localAccounts: number;
  }> {
    try {
      const response = await api.get('/Account/stats');
      return response;
    } catch (error: any) {
      // 如果沒有統計資料，返回預設值
      if (error.response?.status === 404 || error.response?.status === 204) {
        console.log('沒有找到帳號統計資料，返回預設值');
        return {
          totalAccounts: 0,
          activeAccounts: 0,
          inactiveAccounts: 0,
          adminCount: 0,
          supervisorCount: 0,
          staffCount: 0,
          azureAccounts: 0,
          localAccounts: 0,
        };
      }
      console.error('取得帳號統計失敗:', error);
      throw error;
    }
  }
}

// 導出服務實例
export const accountService = new AccountService();
export default accountService;