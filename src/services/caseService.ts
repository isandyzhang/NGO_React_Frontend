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
  birthDate: string;
  phone: string;
  address: string;
  status: 'active' | 'completed';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CaseSearchParams {
  searchType: string;
  searchContent: string;
  status?: 'active' | 'completed';
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
  // 創建新個案
  createCase: (caseData: CaseFormData): Promise<CaseRecord> => {
    return api.post<CaseRecord>('/cases', caseData);
  },

  // 獲取個案列表
  getCases: (params?: CaseSearchParams): Promise<CaseListResponse> => {
    return api.get<CaseListResponse>('/cases', params);
  },

  // 根據 ID 獲取個案詳情
  getCaseById: (id: number): Promise<CaseRecord> => {
    return api.get<CaseRecord>(`/cases/${id}`);
  },

  // 更新個案資料
  updateCase: (id: number, caseData: Partial<CaseFormData>): Promise<CaseRecord> => {
    return api.put<CaseRecord>(`/cases/${id}`, caseData);
  },

  // 刪除個案
  deleteCase: (id: number): Promise<void> => {
    return api.delete<void>(`/cases/${id}`);
  },

  // 搜尋個案
  searchCases: (params: CaseSearchParams): Promise<CaseListResponse> => {
    return api.get<CaseListResponse>('/cases/search', params);
  },

  // 上傳個案照片
  uploadCaseImage: (id: number, imageFile: File): Promise<{ imageUrl: string }> => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    return api.post<{ imageUrl: string }>(`/cases/${id}/image`, formData);
  },

  // 更新個案狀態
  updateCaseStatus: (id: number, status: 'active' | 'completed'): Promise<CaseRecord> => {
    return api.patch<CaseRecord>(`/cases/${id}/status`, { status });
  },

  // 獲取個案統計資料
  getCaseStatistics: (): Promise<{
    totalCases: number;
    activeCases: number;
    completedCases: number;
    newCasesThisMonth: number;
  }> => {
    return api.get('/cases/statistics');
  },
};

export default caseService; 