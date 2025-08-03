import { api } from '../shared/api';
import { config } from '../../config/env';

// 新架構的 API 回應格式
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
  timestamp: string;
}

export interface PagedApiResponse<T> {
  success: boolean;
  message: string;
  data?: T[];
  error?: any;
  timestamp: string;
  pageInfo: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// 新的 DTO 介面
export interface CaseDto {
  caseId: number;
  name: string;
  phone: string;
  identityNumber: string;
  birthday?: string;
  address: string;
  workerId: number;
  description?: string;
  createdAt: string;
  status: string;
  email?: string;
  gender?: string;
  profileImage?: string;
  city?: string;
  district?: string;
  detailAddress?: string;
  workerName?: string;
  speechToTextAudioUrl?: string;
}

export interface CreateCaseDto {
  name: string;
  phone: string;
  identityNumber: string;
  birthday?: Date;
  workerId?: number;
  description?: string;
  email?: string;
  gender?: string;
  profileImage?: string;
  city?: string;
  district?: string;
  detailAddress?: string;
  speechToTextAudioUrl?: string;
}

export interface UpdateCaseDto {
  name?: string;
  phone?: string;
  identityNumber?: string;
  birthday?: Date;
  description?: string;
  status?: string;
  email?: string;
  gender?: string;
  profileImage?: string;
  city?: string;
  district?: string;
  detailAddress?: string;
}

// 新架構的個案服務
export const caseNewService = {
  // 獲取所有個案（支援分頁和WorkerId過濾）
  getAllCases: async (page: number = 1, pageSize: number = 10, workerId?: number): Promise<{ data: CaseDto[]; pageInfo: any }> => {
    try {
      const params: any = { page, pageSize };
      if (workerId) {
        params.workerId = workerId;
      }
      
      const response = await api.get<PagedApiResponse<CaseDto>>('/casenew', params);
      
      if (response.success && response.data && response.pageInfo) {
        return {
          data: response.data,
          pageInfo: response.pageInfo
        };
      } else {
        console.warn('API 回應格式異常:', response);
        return {
          data: [],
          pageInfo: {
            page,
            pageSize,
            totalCount: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false
          }
        };
      }
    } catch (error: any) {
      console.error('獲取案例列表失敗:', error);
      
      // 如果是 404 或沒有資料，返回空結果
      if (error.response?.status === 404 || error.response?.status === 204) {
        return {
          data: [],
          pageInfo: {
            page,
            pageSize,
            totalCount: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false
          }
        };
      }
      
      throw error;
    }
  },

  // 根據 ID 獲取個案詳情
  getCaseById: async (id: number): Promise<CaseDto> => {
    try {
      const response = await api.get<ApiResponse<CaseDto>>(`/casenew/${id}`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || '獲取個案詳情失敗');
      }
    } catch (error: any) {
      console.error(`獲取案例 ${id} 失敗:`, error);
      throw error;
    }
  },

  // 搜尋個案
  searchCases: async (query?: string, page: number = 1, pageSize: number = 10, workerId?: number): Promise<{ data: CaseDto[]; pageInfo: any }> => {
    try {
      const params: any = { page, pageSize };
      if (query) params.query = query;
      if (workerId) params.workerId = workerId;
      
      const response = await api.get<PagedApiResponse<CaseDto>>('/casenew/search', params);
      
      if (response.success && response.data && response.pageInfo) {
        return {
          data: response.data,
          pageInfo: response.pageInfo
        };
      } else {
        return {
          data: [],
          pageInfo: {
            page,
            pageSize,
            totalCount: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false
          }
        };
      }
    } catch (error: any) {
      console.error('搜尋案例失敗:', error);
      
      // 如果是 404 或沒有資料，返回空結果
      if (error.response?.status === 404 || error.response?.status === 204) {
        return {
          data: [],
          pageInfo: {
            page,
            pageSize,
            totalCount: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false
          }
        };
      }
      
      throw error;
    }
  },

  // 上傳個案圖片
  uploadProfileImage: async (formData: FormData): Promise<string> => {
    try {
      const apiBaseUrl = config.apiBaseUrl;
      const token = localStorage.getItem('authToken');
      const uploadUrl = `${apiBaseUrl}/casenew/upload/profile-image`;
      
      console.log('🚀 開始上傳個案圖片 (新架構)');
      console.log('📡 API URL:', uploadUrl);
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse<string> = await response.json();
      
      if (result.success && result.data) {
        console.log('✅ 個案圖片上傳成功:', result.data);
        return result.data;
      } else {
        throw new Error(result.message || '上傳失敗');
      }
    } catch (error: any) {
      console.error('💥 上傳個案圖片失敗:', error);
      throw new Error(error.message || '個案圖片上傳失敗：網路錯誤或伺服器無回應');
    }
  },

  // 創建新個案
  createCase: async (caseData: CreateCaseDto): Promise<CaseDto> => {
    try {
      const response = await api.post<ApiResponse<CaseDto>>('/casenew', caseData);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || '創建案例失敗');
      }
    } catch (error: any) {
      console.error('創建案例失敗:', error);
      
      // 如果是 400 錯誤，可能包含詳細的驗證錯誤
      if (error.response?.status === 400 && error.response?.data) {
        const errorData = error.response.data;
        if (errorData.message) {
          throw new Error(errorData.message);
        }
        if (errorData.error) {
          throw new Error(JSON.stringify(errorData.error));
        }
      }
      
      throw error;
    }
  },

  // 更新個案資料
  updateCase: async (id: number, caseData: UpdateCaseDto): Promise<CaseDto> => {
    try {
      console.log('🚀 開始更新個案 (新架構):', id);
      console.log('📦 更新資料:', caseData);
      
      const response = await api.put<ApiResponse<CaseDto>>(`/casenew/${id}`, caseData);
      
      if (response.success && response.data) {
        console.log('✅ 更新成功:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || '更新案例失敗');
      }
    } catch (error: any) {
      console.error(`❌ 更新案例 ${id} 失敗:`, error);
      
      // 如果是 400 錯誤，解析詳細錯誤信息
      if (error.response?.status === 400 && error.response?.data) {
        const errorData = error.response.data;
        if (errorData.message) {
          throw new Error(errorData.message);
        }
        if (errorData.error) {
          throw new Error(JSON.stringify(errorData.error));
        }
      }
      
      throw error;
    }
  },

  // 刪除個案
  deleteCase: async (id: number): Promise<boolean> => {
    try {
      const response = await api.delete<ApiResponse<boolean>>(`/casenew/${id}`);
      
      if (response.success) {
        return response.data || true;
      } else {
        throw new Error(response.message || '刪除案例失敗');
      }
    } catch (error: any) {
      console.error(`刪除案例 ${id} 失敗:`, error);
      
      // 如果是 400 錯誤，可能是有相關資料無法刪除
      if (error.response?.status === 400 && error.response?.data) {
        const errorData = error.response.data;
        if (errorData.message) {
          throw new Error(errorData.message);
        }
        if (errorData.error && errorData.error.relatedData) {
          const relatedData = errorData.error.relatedData;
          throw new Error(`無法刪除個案，因為該個案還有以下相關資料：\n${relatedData.join('\n')}\n\n請先刪除這些相關資料後再刪除個案。`);
        }
      }
      
      throw error;
    }
  }
};

export default caseNewService;