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
      console.log('處理後的活動資料:', activities);
      
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
}

// 建立並匯出服務實例
const activityService = new ActivityService();
export default activityService; 