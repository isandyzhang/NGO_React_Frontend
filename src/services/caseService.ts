import { api } from './api';
import { config } from '../config/env';

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

  /**
   * 上傳個案圖片到 Azure Blob Storage
   */
  uploadProfileImage: async (formData: FormData): Promise<{ imageUrl: string }> => {
    try {
      const apiBaseUrl = config.apiBaseUrl;
      const token = localStorage.getItem('authToken');
      const uploadUrl = `${apiBaseUrl}/Case/upload/profile-image`;
      
      console.log('🚀 開始上傳個案圖片');
      console.log('📡 API URL:', uploadUrl);
      console.log('🔐 Token exists:', !!token);
      console.log('📦 FormData keys:', Array.from(formData.keys()));
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: formData
      });

      console.log('📈 Response status:', response.status);
      console.log('📊 Response ok:', response.ok);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          // 先讀取為文本，再嘗試解析為 JSON
          const responseText = await response.text();
          console.log('❌ Response text:', responseText);
          
          if (responseText) {
            try {
              const errorData = JSON.parse(responseText);
              console.log('❌ Error data:', errorData);
              errorMessage = errorData.message || errorData.title || errorMessage;
            } catch (jsonError) {
              console.log('❌ 無法解析為 JSON，使用原始文本:', jsonError);
              errorMessage = responseText || errorMessage;
            }
          }
        } catch (readError) {
          console.log('❌ 無法讀取錯誤回應:', readError);
        }
        
        throw new Error(errorMessage);
      }

      try {
        const responseText = await response.text();
        console.log('✅ Response text:', responseText);
        
        const result = JSON.parse(responseText);
        console.log('✅ 個案圖片上傳成功:', result);
        return result;
      } catch (parseError) {
        console.error('💥 無法解析成功響應為 JSON:', parseError);
        throw new Error('伺服器回應格式錯誤');
      }
    } catch (error: any) {
      console.error('💥 上傳個案圖片失敗:', error);
      console.error('💥 Error type:', typeof error);
      console.error('💥 Error message:', error.message);
      console.error('💥 Error stack:', error.stack);
      
      // 重新拋出錯誤，但確保有有意義的訊息
      throw new Error(error.message || '個案圖片上傳失敗：網路錯誤或伺服器無回應');
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