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

// 後端 API 對應的介面（注意：欄位名稱需符合 C# PascalCase 格式）
export interface CreateCaseRequest {
  Name: string;
  Phone: string;
  IdentityNumber: string;
  Birthday?: Date;
  WorkerId?: number;
  Description: string;
  Email: string;
  Gender: string;
  ProfileImage?: string;
  City: string;
  District: string;
  DetailAddress: string;
  SpeechToTextAudioUrl?: string;
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
  speechToTextAudioUrl?: string;
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
  workerId?: number;
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

// 統一 API 回應格式
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
  timestamp: string;
}

// 個案管理 API 服務
export const caseService = {
  // 獲取所有個案（支援分頁和WorkerId過濾）
  getAllCases: async (page: number = 1, pageSize: number = 10, workerId?: number): Promise<PagedResponse<CaseResponse>> => {
    try {
      const params: any = { page, pageSize };
      if (workerId) {
        params.workerId = workerId;
      }
      const response = await api.get<ApiResponse<PagedResponse<CaseResponse>>>('/case-new', params);
      return response.data || { data: [], page, pageSize, totalCount: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false };
    } catch (error: any) {
      // 區分真正的錯誤和空結果
      if (error.response?.status === 404 || error.response?.status === 204) {
        // 404 Not Found 或 204 No Content 表示沒有資料，返回空結果
        console.log('沒有找到案例資料，返回空結果');
        return {
          data: [],
          totalCount: 0,
          page: page,
          pageSize: pageSize,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false
        };
      }
      // 其他錯誤（網路錯誤、500錯誤等）才拋出異常
      console.error('獲取案例列表失敗:', error);
      throw error;
    }
  },

  // 根據 ID 獲取個案詳情
  getCaseById: async (id: number): Promise<CaseResponse> => {
    try {
      const response = await api.get<ApiResponse<CaseResponse>>(`/case-new/${id}`);
      return response.data!;
    } catch (error) {
      console.error(`獲取案例 ${id} 失敗:`, error);
      throw error;
    }
  },

  // 搜尋個案
  searchCases: async (params: CaseSearchParams): Promise<{ data: CaseResponse[]; total: number; page: number; pageSize: number; totalPages: number }> => {
    try {
      const response = await api.get<ApiResponse<PagedResponse<CaseResponse>>>('/case-new/search', params);
      const pageData = response.data!;
      return {
        data: pageData.data,
        total: pageData.totalCount,
        page: pageData.page,
        pageSize: pageData.pageSize,
        totalPages: pageData.totalPages
      };
    } catch (error: any) {
      // 區分真正的錯誤和空結果
      if (error.response?.status === 404 || error.response?.status === 204) {
        // 404 Not Found 或 204 No Content 表示沒有資料，返回空結果
        console.log('沒有找到搜尋結果，返回空結果');
        return {
          data: [],
          total: 0,
          page: params.page || 1,
          pageSize: params.pageSize || 10,
          totalPages: 0
        };
      }
      // 其他錯誤（網路錯誤、500錯誤等）才拋出異常
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
      const uploadUrl = `${apiBaseUrl}/case-new/upload/profile-image`;
      
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

      const result = await response.json();
      console.log('✅ 個案圖片上傳成功:', result);
      // 如果是統一 API 格式，則返回 data 中的內容
      if (result.success && result.data) {
        return result.data;
      }
      return result;
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
      const response = await api.post<ApiResponse<CaseResponse>>('/case-new', caseData);
      return response.data!;
    } catch (error) {
      console.error('創建案例失敗:', error);
      throw error;
    }
  },

  // 更新個案資料
  updateCase: async (id: number, caseData: Partial<CreateCaseRequest>): Promise<void> => {
    try {
      await api.put<ApiResponse<any>>(`/case-new/${id}`, caseData);
    } catch (error) {
      console.error(`更新案例 ${id} 失敗:`, error);
      throw error;
    }
  },

  // 刪除個案
  deleteCase: async (id: number): Promise<void> => {
    try {
      await api.delete<ApiResponse<any>>(`/case-new/${id}`);
    } catch (error) {
      console.error(`刪除案例 ${id} 失敗:`, error);
      throw error;
    }
  },


};

export default caseService; 