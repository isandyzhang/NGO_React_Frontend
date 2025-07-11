import { api } from './api';

/**
 * 排程介面
 */
export interface Schedule {
  scheduleId: number;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  workerId: number;
  workerName?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  category?: string;
  attendees?: string[];
  notes?: string;
}

/**
 * 排程服務類別
 */
class ScheduleService {
  /**
   * 取得所有排程
   */
  async getSchedules(): Promise<Schedule[]> {
    try {
      const response = await api.get<Schedule[]>('/Schedule');
      return response;
    } catch (error) {
      console.error('取得排程列表失敗:', error);
      throw error;
    }
  }

  /**
   * 根據ID取得排程
   */
  async getScheduleById(id: number): Promise<Schedule> {
    try {
      const response = await api.get<Schedule>(`/Schedule/${id}`);
      return response;
    } catch (error) {
      console.error(`取得排程 ${id} 失敗:`, error);
      throw error;
    }
  }

  /**
   * 根據工作者ID取得排程
   */
  async getSchedulesByWorker(workerId: number): Promise<Schedule[]> {
    try {
      const response = await api.get<Schedule[]>(`/Schedule/worker/${workerId}`);
      return response;
    } catch (error) {
      console.error(`取得工作者 ${workerId} 排程失敗:`, error);
      throw error;
    }
  }

  /**
   * 根據日期範圍取得排程
   */
  async getSchedulesByDateRange(startDate: string, endDate: string): Promise<Schedule[]> {
    try {
      const response = await api.get<Schedule[]>('/Schedule/range', {
        startDate,
        endDate
      });
      return response;
    } catch (error) {
      console.error('取得日期範圍排程失敗:', error);
      throw error;
    }
  }

  /**
   * 新增排程
   */
  async createSchedule(scheduleData: Partial<Schedule>): Promise<Schedule> {
    try {
      const response = await api.post<Schedule>('/Schedule', scheduleData);
      return response;
    } catch (error) {
      console.error('新增排程失敗:', error);
      throw error;
    }
  }

  /**
   * 更新排程
   */
  async updateSchedule(id: number, scheduleData: Partial<Schedule>): Promise<void> {
    try {
      await api.put<void>(`/Schedule/${id}`, scheduleData);
    } catch (error) {
      console.error(`更新排程 ${id} 失敗:`, error);
      throw error;
    }
  }

  /**
   * 刪除排程
   */
  async deleteSchedule(id: number): Promise<void> {
    try {
      await api.delete<void>(`/Schedule/${id}`);
    } catch (error) {
      console.error(`刪除排程 ${id} 失敗:`, error);
      throw error;
    }
  }

  /**
   * 更新排程狀態
   */
  async updateScheduleStatus(id: number, status: Schedule['status']): Promise<void> {
    try {
      await api.patch<void>(`/Schedule/${id}/status`, { status });
    } catch (error) {
      console.error(`更新排程狀態 ${id} 失敗:`, error);
      throw error;
    }
  }
}

export const scheduleService = new ScheduleService(); 