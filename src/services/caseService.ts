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

// 後端 API 對應的介面
export interface CreateCaseRequest {
  name: string;
  phone: string;
  identityNumber: string;
  birthday?: string;
  address: string;
  description: string;
  email: string;
  gender: string;
  profileImage?: string;
  city: string;
  district: string;
  detailAddress: string;
}

export interface CaseResponse {
  caseId: number;
  name: string;
  phone: string;
  identityNumber: string;
  birthday?: string;
  address: string;
  workerId: number;
  description: string;
  createdAt: string;
  status: string;
  email: string;
  gender: string;
  profileImage?: string;
  city: string;
  district: string;
  detailAddress: string;
  workerName?: string;
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

export interface PagedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// 個案管理 API 服務
export const caseService = {
  // 獲取所有個案（支援分頁）
  getAllCases: async (page: number = 1, pageSize: number = 10): Promise<PagedResponse<CaseResponse>> => {
    try {
      const response = await api.get<PagedResponse<CaseResponse>>('/Case', { page, pageSize });
      return response;
    } catch (error) {
      console.error('獲取案例列表失敗:', error);
      throw error;
    }
  },

  // 根據 ID 獲取個案詳情
  getCaseById: async (id: number): Promise<CaseResponse> => {
    try {
      const response = await api.get<CaseResponse>(`/Case/${id}`);
      return response;
    } catch (error) {
      console.error(`獲取案例 ${id} 失敗:`, error);
      throw error;
    }
  },

  // 搜尋個案
  searchCases: async (params: CaseSearchParams): Promise<{ data: CaseResponse[]; total: number; page: number; pageSize: number; totalPages: number }> => {
    try {
      const response = await api.get<{ data: CaseResponse[]; total: number; page: number; pageSize: number; totalPages: number }>('/Case/search', params);
      return response;
    } catch (error) {
      console.error('搜尋案例失敗:', error);
      throw error;
    }
  },

  // 創建新個案
  createCase: async (caseData: CreateCaseRequest): Promise<CaseResponse> => {
    try {
      const response = await api.post<CaseResponse>('/Case', caseData);
      return response;
    } catch (error) {
      console.error('創建案例失敗:', error);
      throw error;
    }
  },

  // 更新個案資料
  updateCase: async (id: number, caseData: Partial<CreateCaseRequest>): Promise<void> => {
    try {
      await api.put<void>(`/Case/${id}`, caseData);
    } catch (error) {
      console.error(`更新案例 ${id} 失敗:`, error);
      throw error;
    }
  },

  // 刪除個案
  deleteCase: async (id: number): Promise<void> => {
    try {
      await api.delete<void>(`/Case/${id}`);
    } catch (error) {
      console.error(`刪除案例 ${id} 失敗:`, error);
      throw error;
    }
  },


};

export default caseService; 