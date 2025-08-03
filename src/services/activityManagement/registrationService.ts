import { api } from '../shared/api';

/**
 * 個案報名資料介面
 */
export interface CaseRegistration {
  Id: number;
  CaseName: string;
  ActivityName: string;
  Status: string;
}

/**
 * 民眾報名資料介面
 */
export interface PublicRegistration {
  Id: number;
  UserId: number;
  UserName: string;
  ActivityName: string;
  NumberOfCompanions: number;
  Status: string;
}

/**
 * 報名審核服務類別
 */
class RegistrationService {
  /**
   * 取得所有個案報名
   */
  async getCaseRegistrations(): Promise<CaseRegistration[]> {
    try {
      const response = await api.get('/RegistrationReview/case');
      return response;
    } catch (error) {
      console.error('取得個案報名列表失敗:', error);
      throw error;
    }
  }

  /**
   * 取得所有民眾報名
   */
  async getPublicRegistrations(): Promise<PublicRegistration[]> {
    try {
      const response = await api.get('/RegistrationReview/user');
      return response;
    } catch (error) {
      console.error('取得民眾報名列表失敗:', error);
      throw error;
    }
  }

  /**
   * 取得所有用戶報名（別名方法）
   */
  async getUserRegistrations(): Promise<PublicRegistration[]> {
    return this.getPublicRegistrations();
  }

  /**
   * 更新個案報名狀態
   */
  async updateCaseRegistrationStatus(id: number, status: string): Promise<void> {
    try {
      await api.put(`/RegistrationReview/case/${id}/status`, { status });
    } catch (error) {
      console.error('更新個案報名狀態失敗:', error);
      throw error;
    }
  }

  /**
   * 更新民眾報名狀態
   */
  async updatePublicRegistrationStatus(id: number, status: string): Promise<void> {
    try {
      await api.put(`/RegistrationReview/user/${id}/status`, { status });
    } catch (error) {
      console.error('更新民眾報名狀態失敗:', error);
      throw error;
    }
  }
}

// 建立並匯出服務實例
const registrationService = new RegistrationService();
export default registrationService; 