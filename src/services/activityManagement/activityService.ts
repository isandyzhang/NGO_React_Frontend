import { api } from '../shared/api';
import { config } from '../../config/env';

/**
 * 活動資料介面
 */
export interface Activity {
  activityId: number;
  activityName: string;
  description: string;
  imageUrl?: string;
  location: string;
  address?: string; // 新增：詳細地址欄位
  maxParticipants: number;
  currentParticipants: number;
  startDate: string;
  endDate: string;
  signupDeadline: string;
  workerId: number;
  targetAudience: string;
  category?: string;
  status: string;
  workerName?: string;
}

/**
 * 活動統計資料介面
 */
export interface ActivityStatistics {
  totalActivities: number;
  completedActivities: number;
  activeActivities: number;
  cancelledActivities: number;
}

/**
 * 活動列表回應介面
 */
export interface ActivityListResponse {
  activities: Activity[];
  totalCount: number;
}

/**
 * 活動列表分頁回應介面
 */
export interface ActivityListPagedResponse {
  data: Activity[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 活動分類選項介面
 */
export interface CategoryOption {
  value: string;
  label: string;
}

/**
 * 活動服務類別
 */
class ActivityService {
  /**
   * 取得所有活動
   */
  async getActivities(): Promise<ActivityListResponse> {
    try {
      console.log('正在呼叫 API: /Activity');
      const response = await api.get('/Activity');
      console.log('API 回應:', response);
      
      // 後端直接回傳陣列，api.get() 已經取了 response.data
      const activities = response || [];
      // 處理後的活動資料
      
      return {
        activities: activities,
        totalCount: activities.length || 0
      };
    } catch (error: any) {
      // 區分真正的錯誤和空結果
      if (error.response?.status === 404 || error.response?.status === 204) {
        // 404 Not Found 或 204 No Content 表示沒有資料，返回空結果
        console.log('沒有找到活動資料，返回空結果');
        return {
          activities: [],
          totalCount: 0
        };
      }
      // 其他錯誤（網路錯誤、500錯誤等）才拋出異常
      console.error('取得活動列表失敗:', error);
      throw error;
    }
  }

  /**
   * 取得單一活動
   */
  async getActivity(activityId: number): Promise<Activity> {
    try {
      const response = await api.get(`/Activity/${activityId}`);
      return response.data;
    } catch (error) {
      console.error('取得活動詳情失敗:', error);
      throw error;
    }
  }

  /**
   * 建立新活動
   */
  async createActivity(activityData: Omit<Activity, 'activityId' | 'currentParticipants' | 'workerId'>): Promise<Activity> {
    try {
      console.log('🚀 開始建立活動');
      console.log('📤 提交的活動資料:', activityData);
      
      // 檢查 token 是否存在
      const token = localStorage.getItem('authToken');
      console.log('🔐 JWT Token 狀態:', token ? '存在' : '不存在');
      if (token) {
        console.log('🔐 Token 前 20 字符:', token.substring(0, 20) + '...');
      }
      
      const response = await api.post('/Activity', activityData);
      console.log('✅ 活動建立成功:', response);
      return response.data;
    } catch (error: any) {
      console.error('❌ 建立活動失敗:', error);
      console.error('❌ 錯誤詳情:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      // 處理具體的錯誤類型
      if (error.response?.status === 401) {
        console.error('🚫 認證失敗 - JWT token 可能無效或過期');
        alert('認證失敗，請重新登入');
        // 清除無效的 token
        localStorage.removeItem('authToken');
        window.location.href = '/login';
        return Promise.reject(new Error('認證失敗，請重新登入'));
      }
      
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || '請求參數錯誤';
        console.error('📝 請求參數錯誤:', errorMessage);
        throw new Error(errorMessage);
      }
      
      if (error.response?.status === 500) {
        const errorMessage = error.response?.data?.message || '伺服器內部錯誤';
        console.error('🔥 伺服器錯誤:', errorMessage);
        throw new Error(errorMessage);
      }
      
      throw error;
    }
  }

  /**
   * 更新活動
   */
  async updateActivity(activityId: number, activityData: Partial<Activity>): Promise<Activity> {
    try {
      const response = await api.put(`/Activity/${activityId}`, activityData);
      return response.data;
    } catch (error) {
      console.error('更新活動失敗:', error);
      throw error;
    }
  }

  /**
   * 刪除活動
   */
  async deleteActivity(activityId: number): Promise<void> {
    try {
      await api.delete(`/Activity/${activityId}`);
    } catch (error) {
      console.error('刪除活動失敗:', error);
      throw error;
    }
  }

  /**
   * 取得活動統計資料
   */
  async getActivityStatistics(): Promise<ActivityStatistics> {
    try {
      const response = await api.get('/Activity/statistics');
      return response.data;
    } catch (error) {
      console.error('取得活動統計失敗:', error);
      throw error;
    }
  }

  /**
   * 搜尋活動
   */
  async searchActivities(query: string): Promise<ActivityListResponse> {
    try {
      const response = await api.get('/Activity/search', {
        params: { query }
      });
      return response.data;
    } catch (error) {
      console.error('搜尋活動失敗:', error);
      throw error;
    }
  }

  /**
   * 取得即將到來的活動
   */
  async getUpcomingActivities(limit: number = 5): Promise<Activity[]> {
    try {
      const response = await api.get('/Activity/upcoming', {
        params: { limit }
      });
      return response.data || [];
    } catch (error: any) {
      // 區分真正的錯誤和空結果
      if (error.response?.status === 404 || error.response?.status === 204) {
        // 404 Not Found 或 204 No Content 表示沒有資料，返回空陣列
        console.log('沒有找到即將到來的活動資料，返回空陣列');
        return [];
      }
      // 其他錯誤（網路錯誤、500錯誤等）才拋出異常
      console.error('取得即將到來活動失敗:', error);
      throw error;
    }
  }

  /**
   * 取得已完成的活動
   */
  async getCompletedActivities(): Promise<ActivityListResponse> {
    try {
      const response = await api.get('/Activity/completed');
      return response.data || { activities: [], totalCount: 0 };
    } catch (error: any) {
      // 區分真正的錯誤和空結果
      if (error.response?.status === 404 || error.response?.status === 204) {
        // 404 Not Found 或 204 No Content 表示沒有資料，返回空結果
        console.log('沒有找到已完成的活動資料，返回空結果');
        return { activities: [], totalCount: 0 };
      }
      // 其他錯誤（網路錯誤、500錯誤等）才拋出異常
      console.error('取得已完成活動失敗:', error);
      throw error;
    }
  }

  /**
   * 更新活動狀態
   */
  async updateActivityStatus(activityId: number, status: string): Promise<Activity> {
    try {
      const response = await api.patch(`/Activity/${activityId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('更新活動狀態失敗:', error);
      throw error;
    }
  }

  /**
   * 取得活動分類選項
   */
  async getCategories(): Promise<CategoryOption[]> {
    try {
      const response = await api.get<CategoryOption[]>('/Activity/categories');
      return response || [];
    } catch (error: any) {
      // 區分真正的錯誤和空結果
      if (error.response?.status === 404 || error.response?.status === 204) {
        // 404 Not Found 或 204 No Content 表示沒有資料，返回空陣列
        console.log('沒有找到活動分類資料，返回空陣列');
        return [];
      }
      // 其他錯誤（網路錯誤、500錯誤等）才拋出異常
      console.error('取得活動分類失敗:', error);
      throw error;
    }
  }

  /**
   * 測試 Azure Blob Storage 連接
   */
  async testAzureConnection(): Promise<{ success: boolean; message: string; containerName?: string; containerExists?: boolean }> {
    try {
      console.log('🧪 開始測試 Azure Blob Storage 連接');
      
      const apiBaseUrl = config.apiBaseUrl;
      const token = localStorage.getItem('authToken');
      const testUrl = `${apiBaseUrl}/Activity/test-azure-connection`;
      
      console.log('📡 測試 URL:', testUrl);
      
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      
      console.log('📊 測試回應狀態:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ 測試失敗:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('✅ 測試成功:', result);
      
      return result;
    } catch (error: any) {
      console.error('💥 Azure 連接測試失敗:', error);
      throw new Error(error.message || 'Azure 連接測試失敗');
    }
  }

  /**
   * 上傳圖片到 Azure Blob Storage (帶重試機制)
   */
  async uploadImage(formData: FormData, maxRetries: number = 2): Promise<{ imageUrl: string }> {
    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        console.log(`🚀 開始上傳圖片 (嘗試 ${attempt}/${maxRetries + 1})`);
        
        // 使用原生 fetch 來處理 FormData，避免 axios 自動設定 Content-Type
        const apiBaseUrl = config.apiBaseUrl;
        const token = localStorage.getItem('authToken');
        const uploadUrl = `${apiBaseUrl}/Activity/upload/image`;
        
        console.log('📡 API URL:', uploadUrl);
        console.log('🔐 Token exists:', !!token);
        console.log('📦 FormData keys:', Array.from(formData.keys()));
        
        // 為每次重試創建新的 AbortController
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 秒超時
        
        const response = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            ...(token && { 'Authorization': `Bearer ${token}` })
          },
          body: formData,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log('📈 Response status:', response.status);
        console.log('📊 Response ok:', response.ok);

        if (!response.ok) {
          let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          
          try {
            // 先讀取為文本，然後嘗試解析為 JSON，避免多次讀取 body
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
        console.log('✅ 上傳成功:', result);
        return result;
        
      } catch (error: any) {
        console.error(`💥 上傳圖片失敗 (嘗試 ${attempt}/${maxRetries + 1}):`, error);
        
        const isLastAttempt = attempt === maxRetries + 1;
        const isRetryableError = 
          error.name === 'AbortError' ||
          error.message?.includes('Body is disturbed') ||
          error.message?.includes('network') ||
          error.message?.includes('fetch');
        
        if (!isLastAttempt && isRetryableError) {
          console.log('⏳ 等待重試...');
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }
        
        // 最後一次嘗試失敗，拋出錯誤
        console.error('💥 Error type:', typeof error);
        console.error('💥 Error message:', error.message);
        console.error('💥 Error stack:', error.stack);
        
        throw new Error(error.message || '圖片上傳失敗：網路錯誤或伺服器無回應');
      }
    }
    
    // 理論上不會執行到這裡
    throw new Error('圖片上傳失敗：未知錯誤');
  }

  /**
   * 取得分頁活動
   */
  async getActivitiesPaged(
    page = 1, 
    pageSize = 10, 
    searchParams?: {
      content?: string;
      status?: string;
      audience?: string;
    }
  ): Promise<ActivityListPagedResponse> {
    try {
      const queryParams: any = { page, pageSize };
      
      // 添加搜尋參數
      if (searchParams?.content) {
        queryParams.content = searchParams.content;
      }
      if (searchParams?.status && searchParams.status !== 'all') {
        queryParams.status = searchParams.status;
      }
      if (searchParams?.audience && searchParams.audience !== 'all') {
        queryParams.audience = searchParams.audience;
      }
      
      // 發送查詢參數
      
      const response = await api.get<ActivityListPagedResponse>('/Activity/paged', {
        params: queryParams
      });
      return response;
    } catch (error) {
      console.error('取得分頁活動失敗:', error);
      throw error;
    }
  }
}

// 建立並匯出服務實例
const activityService = new ActivityService();
export default activityService; 