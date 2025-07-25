import { api } from './api';

// Dashboard統計數據介面
export interface DashboardStats {
  totalCases: number;
  thisYearNewCases: number;
  casesGrowthPercentage: number;
  
  totalWorkers: number;
  thisYearNewWorkers: number;
  workersGrowthPercentage: number;
  
  totalActivities: number;
  monthlyCompletedActivities: number;
  
  // 為了向後相容保留
  totalUsers: number;
}

// 性別分佈介面
export interface GenderDistribution {
  gender: string;
  count: number;
}

// 個案城市分佈介面
export interface CaseDistribution {
  city: string;
  count: number;
}

// 個案縣市分佈介面 (用於地圖顯示)
export interface CountyDistribution {
  county: string;
  count: number;
}

// 困難類型分析介面
export interface DifficultyAnalysis {
  difficultyType: string;
  count: number;
}

// 近期活動介面
export interface RecentActivity {
  activityId: number;
  activityName: string;
  activityDate: string;
  status: string;
  location: string;
}

// Dashboard API 服務
export const dashboardService = {
  // 獲取Dashboard統計數據
  getStats: async (): Promise<DashboardStats> => {
    try {
      const response = await api.get<DashboardStats>('/Dashboard/stats');
      return response;
    } catch (error: any) {
      // 對於統計數據，404/204 表示沒有數據，返回默認值
      if (error.response?.status === 404 || error.response?.status === 204) {
        console.log('沒有找到統計資料，返回預設值');
        return {
          totalCases: 0,
          totalUsers: 0,
          totalActivities: 0,
          monthlyCompletedActivities: 0
        };
      }
      // 其他錯誤（網路錯誤、500錯誤等）才拋出異常
      console.error('獲取Dashboard統計數據失敗:', error);
      throw error;
    }
  },

  // 獲取性別分佈數據
  getGenderDistribution: async (): Promise<GenderDistribution[]> => {
    try {
      const response = await api.get<GenderDistribution[]>('/Dashboard/gender-distribution');
      return response || [];
    } catch (error: any) {
      // 區分真正的錯誤和空結果
      if (error.response?.status === 404 || error.response?.status === 204) {
        // 404 Not Found 或 204 No Content 表示沒有資料，返回空陣列
        console.log('沒有找到性別分佈資料，返回空陣列');
        return [];
      }
      // 其他錯誤（網路錯誤、500錯誤等）才拋出異常
      console.error('獲取性別分佈數據失敗:', error);
      throw error;
    }
  },

  // 獲取個案城市分佈數據
  getCaseDistribution: async (): Promise<CaseDistribution[]> => {
    try {
      const response = await api.get<CaseDistribution[]>('/Dashboard/case-distribution');
      return response || [];
    } catch (error: any) {
      // 區分真正的錯誤和空結果
      if (error.response?.status === 404 || error.response?.status === 204) {
        // 404 Not Found 或 204 No Content 表示沒有資料，返回空陣列
        console.log('沒有找到個案分佈資料，返回空陣列');
        return [];
      }
      // 其他錯誤（網路錯誤、500錯誤等）才拋出異常
      console.error('獲取個案分佈數據失敗:', error);
      throw error;
    }
  },

  // 獲取困難類型分析數據
  getDifficultyAnalysis: async (): Promise<DifficultyAnalysis[]> => {
    try {
      const response = await api.get<DifficultyAnalysis[]>('/Dashboard/difficulty-analysis');
      return response || [];
    } catch (error: any) {
      // 區分真正的錯誤和空結果
      if (error.response?.status === 404 || error.response?.status === 204) {
        // 404 Not Found 或 204 No Content 表示沒有資料，返回空陣列
        console.log('沒有找到困難分析資料，返回空陣列');
        return [];
      }
      // 其他錯誤（網路錯誤、500錯誤等）才拋出異常
      console.error('獲取困難分析數據失敗:', error);
      throw error;
    }
  },

  // 獲取用戶近期活動數據
  getRecentActivities: async (workerId: number): Promise<RecentActivity[]> => {
    try {
      const response = await api.get<RecentActivity[]>(`/Dashboard/recent-activities/${workerId}`);
      return response || [];
    } catch (error: any) {
      // 區分真正的錯誤和空結果
      if (error.response?.status === 404 || error.response?.status === 204) {
        // 404 Not Found 或 204 No Content 表示沒有資料，返回空陣列
        console.log('沒有找到近期活動資料，返回空陣列');
        return [];
      }
      // 其他錯誤（網路錯誤、500錯誤等）才拋出異常
      console.error('獲取近期活動數據失敗:', error);
      throw error;
    }
  },

  // 獲取個案縣市分佈數據 (用於地圖顯示)
  getCountyDistribution: async (): Promise<CountyDistribution[]> => {
    try {
      console.log('🌍 發送縣市分佈 API 請求...');
      const response = await api.get<CountyDistribution[]>('/Dashboard/county-distribution');
      console.log('✅ 縣市分佈 API 回應:', response);
      return response || [];
    } catch (error: any) {
      console.error('❌ 獲取縣市分佈數據失敗:', error);
      console.error('錯誤詳情:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      // 區分真正的錯誤和空結果
      if (error.response?.status === 404 || error.response?.status === 204) {
        console.log('📍 沒有找到縣市分佈資料，返回空陣列');
        return [];
      }
      
      throw error;
    }
  }
}; 