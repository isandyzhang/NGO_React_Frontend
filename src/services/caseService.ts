import { api } from './api';

// 個案相關的 API 接口
export interface CaseFormData {
  // 基本資訊
  name: string;
  birthDate: string;
  idNumber: string;
  gender: 'male' | 'female' | 'other';
  
  // 居住地
  city: string;
  district: string;
  detailAddress: string;
  
  // 學校
  schoolType: string;
  schoolDistrict: string;
  
  // 聯絡人
  contactName: string;
  relationship: string;
  phoneRegion: string;
  phoneNumber: string;
  mobilePhone: string;
  email: string;
  
  // 家庭特殊身分
  specialStatus: {
    lowIncome: boolean;
    singleParent: boolean;
    newResident: boolean;
    indigenous: boolean;
    disabled: boolean;
    other: string;
  };
  
  // 大頭貼
  profileImage?: string;
}

export interface CaseRecord {
  id: number;
  name: string;
  gender: string;
  birthDate: string;
  idNumber: string;
  phone: string;
  city: string;
  district: string;
  address: string;
  email: string;
  caseDifficulty: string;
  createdAt: string;
  avatar?: string;
}

export interface CaseSearchParams {
  query?: string;
  page?: number;
  pageSize?: number;
}

export interface CaseListResponse {
  data: CaseRecord[];
  total: number;
  page: number;
  pageSize: number;
}

// 個案管理 API 服務
export const caseService = {
  // 獲取所有個案
  getAllCases: async (): Promise<CaseRecord[]> => {
    try {
      return await api.get<CaseRecord[]>('/cases');
    } catch (error) {
      console.error('獲取案例列表失敗:', error);
      throw error;
    }
  },

  // 根據 ID 獲取個案詳情
  getCaseById: async (id: number): Promise<CaseRecord> => {
    try {
      return await api.get<CaseRecord>(`/cases/${id}`);
    } catch (error) {
      console.error(`獲取案例 ${id} 失敗:`, error);
      throw error;
    }
  },

  // 搜尋個案
  searchCases: async (params: CaseSearchParams): Promise<CaseRecord[]> => {
    try {
      return await api.get<CaseRecord[]>('/cases/search', params);
    } catch (error) {
      console.error('搜尋案例失敗:', error);
      throw error;
    }
  },

  // 創建新個案
  createCase: async (caseData: Omit<CaseRecord, 'id' | 'createdAt'>): Promise<CaseRecord> => {
    try {
      return await api.post<CaseRecord>('/cases', caseData);
    } catch (error) {
      console.error('創建案例失敗:', error);
      throw error;
    }
  },

  // 更新個案資料
  updateCase: async (id: number, caseData: Partial<CaseRecord>): Promise<void> => {
    try {
      await api.put<void>(`/cases/${id}`, { ...caseData, id });
    } catch (error) {
      console.error(`更新案例 ${id} 失敗:`, error);
      throw error;
    }
  },

  // 刪除個案
  deleteCase: async (id: number): Promise<void> => {
    try {
      await api.delete<void>(`/cases/${id}`);
    } catch (error) {
      console.error(`刪除案例 ${id} 失敗:`, error);
      throw error;
    }
  },
};

export default caseService; 