import { api } from './api';

// Dashboard統計數據介面
export interface DashboardStats {
  totalCases: number;
  totalUsers: number;
  totalActivities: number;
  monthlyCompletedActivities: number;
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
    } catch (error) {
      console.error('獲取Dashboard統計數據失敗:', error);
      throw error;
    }
  },

  // 獲取性別分佈數據
  getGenderDistribution: async (): Promise<GenderDistribution[]> => {
    try {
      const response = await api.get<GenderDistribution[]>('/Dashboard/gender-distribution');
      return response;
    } catch (error) {
      console.error('獲取性別分佈數據失敗:', error);
      throw error;
    }
  },

  // 獲取個案城市分佈數據
  getCaseDistribution: async (): Promise<CaseDistribution[]> => {
    try {
      const response = await api.get<CaseDistribution[]>('/Dashboard/case-distribution');
      return response;
    } catch (error) {
      console.error('獲取個案分佈數據失敗:', error);
      throw error;
    }
  },

  // 獲取困難類型分析數據
  getDifficultyAnalysis: async (): Promise<DifficultyAnalysis[]> => {
    try {
      const response = await api.get<DifficultyAnalysis[]>('/Dashboard/difficulty-analysis');
      return response;
    } catch (error) {
      console.error('獲取困難分析數據失敗:', error);
      throw error;
    }
  },

  // 獲取用戶近期活動數據
  getRecentActivities: async (workerId: number): Promise<RecentActivity[]> => {
    try {
      const response = await api.get<RecentActivity[]>(`/Dashboard/recent-activities/${workerId}`);
      return response;
    } catch (error) {
      console.error('獲取近期活動數據失敗:', error);
      throw error;
    }
  }
}; 