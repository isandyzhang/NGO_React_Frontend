import { api } from './api';

/**
 * 活動資料介面
 */
export interface Activity {
  activityId: number;
  activityName: string;
  description: string;
  imageUrl?: string;
  location: string;
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
    } catch (error) {
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
  async createActivity(activityData: Omit<Activity, 'activityId' | 'currentParticipants'>): Promise<Activity> {
    try {
      const response = await api.post('/Activity', activityData);
      return response.data;
    } catch (error) {
      console.error('建立活動失敗:', error);
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
      return response.data;
    } catch (error) {
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
      return response.data;
    } catch (error) {
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
      return response;
    } catch (error) {
      console.error('取得活動分類失敗:', error);
      throw error;
    }
  }

  /**
   * 上傳圖片到 Azure Blob Storage
   */
  async uploadImage(formData: FormData): Promise<{ imageUrl: string }> {
    try {
      // 使用原生 fetch 來處理 FormData，避免 axios 自動設定 Content-Type
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5264/api';
      const token = localStorage.getItem('authToken');
      const uploadUrl = `${apiBaseUrl}/Activity/upload/image`;
      
      console.log('🚀 開始上傳圖片');
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
          const errorData = await response.json();
          console.log('❌ Error data:', errorData);
          errorMessage = errorData.message || errorData.title || errorMessage;
        } catch (parseError) {
          console.log('❌ 無法解析錯誤回應為 JSON:', parseError);
          const textError = await response.text();
          console.log('❌ Error text:', textError);
          errorMessage = textError || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('✅ 上傳成功:', result);
      return result;
    } catch (error: any) {
      console.error('💥 上傳圖片失敗:', error);
      console.error('💥 Error type:', typeof error);
      console.error('💥 Error message:', error.message);
      console.error('💥 Error stack:', error.stack);
      
      // 重新拋出錯誤，但確保有有意義的訊息
      throw new Error(error.message || '圖片上傳失敗：網路錯誤或伺服器無回應');
    }
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