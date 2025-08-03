import { api } from "../shared/api";

/**
 * 排程介面 - 匹配後端 Schedule 模型
 */
export interface Schedule {
  scheduleId: number;
  workerId: number;
  caseId?: number;
  description: string;
  startTime: string; // ISO 8601 格式
  endTime: string; // ISO 8601 格式
  priority: string; // 優先順序：高、中、低
  status: string; // 狀態：進行中、已完成、已取消

  // 關聯查詢可選欄位
  workerName?: string;
  caseName?: string;
  caseEmail?: string;
  eventType: string;
  eventName: string;
}

/**
 * 建立排程請求模型
 */
export interface CreateScheduleRequest {
  workerId: number;
  caseId?: number;
  description: string;
  startTime: string;
  endTime: string;
  priority?: string;
  status?: string;
  eventName?: string;
  eventType: string;
}

/**
 * 更新排程請求模型
 */
export interface UpdateScheduleRequest {
  caseId?: number;
  description?: string;
  startTime?: string;
  endTime?: string;
  priority?: string;
  status?: string;
  eventName?: string;
  eventType?: string; // 活動類型
}

/**
 * 排程詳細資訊 DTO
 */
export interface ScheduleDto {
  scheduleId: number;
  description?: string;
  startTime?: string;
  endTime?: string;
  priority?: string;
  status?: string;
  workerName?: string;
  caseEmail?: string;
  eventName?: string;
}

/**
 * 排程服務類別
 */
class ScheduleService {
  /**
   * 取得所有排程（主管權限）
   */
  async getAllSchedules(): Promise<Schedule[]> {
    try {
      const response = await api.get<Schedule[]>('/schedule');
      return response;
    } catch (error) {
      console.error('取得所有排程失敗:', error);
      throw error;
    }
  }

  /**
   * 根據工作者ID取得排程
   */
  async getSchedulesByWorker(workerId: number): Promise<Schedule[]> {
    try {
      const response = await api.get<Schedule[]>(
        `/schedule/select/${workerId}`
      );
      return response;
    } catch (error) {
      console.error(`取得工作者 ${workerId} 排程失敗:`, error);
      throw error;
    }
  }

  /**
   * 新增排程
   */
  async createSchedule(scheduleData: CreateScheduleRequest): Promise<Schedule> {
  try {
    const defaultData = {
      priority: "中",
      status: "進行中",
      ...scheduleData,
    };

    const responseData = await api.post<Schedule>("/schedule", defaultData);

    // 後端回傳的 schedule 資料

    if (!responseData || typeof responseData.scheduleId === "undefined") {
      console.error("❌ 回傳資料不含有效 scheduleId：", responseData);
      throw new Error("API 回傳的排程資料不完整");
    }

    return responseData;
  } catch (error) {
    console.error("❌ createSchedule 發生錯誤，送出資料如下：", scheduleData);
    throw error;
  }
}



  /**
   * 更新排程
   */
  async updateSchedule(
    id: number,
    scheduleData: UpdateScheduleRequest
  ): Promise<void> {
    try {
      await api.put<void>(`/schedule/${id}`, scheduleData);
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
      await api.delete<void>(`/schedule/${id}`);
    } catch (error) {
      console.error(`刪除排程 ${id} 失敗:`, error);
      throw error;
    }
  }

  /**
   * 將 Schedule 轉換為 CalendarEvent 格式
   */
  convertToCalendarEvent(schedule: Schedule): CalendarEvent {
    return {
      id: schedule.scheduleId.toString(),
      title: schedule.eventName,
      start: new Date(schedule.startTime),
      end: new Date(schedule.endTime),
      type: schedule.eventType as CalendarEvent["type"],
      description: schedule.description,
      priority: schedule.priority,
      status: schedule.status,
      workerId: schedule.workerId,
      caseId: schedule.caseId?.toString(), // 轉換為字符串類型
      workerName: schedule.workerName,
      caseName: schedule.caseName,
    };
  }

  /**
   * 將 CalendarEvent 轉換為 CreateScheduleRequest 格式
   */
  convertToCreateRequest(
    event: CalendarEvent,
    workerId: number
  ): CreateScheduleRequest {
    return {
      workerId,
      caseId: event.caseId ? parseInt(event.caseId) : undefined,
      description: event.description || "", // 改用 description 而非 title
      eventName: event.title || "", // 加上 eventName
      eventType: event.type, // 加上 eventType
      startTime: event.start.toISOString(),
      endTime: event.end.toISOString(),
      priority: event.priority || "中",
      status: event.status || "進行中",
    };
  }

  /**
   * 將 CalendarEvent 轉換為 UpdateScheduleRequest 格式
   */
  convertToUpdateRequest(event: CalendarEvent): UpdateScheduleRequest {
    return {
      caseId: event.caseId ? parseInt(event.caseId) : undefined,
      description: event.description,
      eventType: event.type,
      eventName: event.title,
      startTime: event.start.toISOString(),
      endTime: event.end.toISOString(),
      priority: event.priority,
      status: event.status,
    };
  }
}

// 行事曆事件介面（用於前端顯示）- 匹配 SchedulePage 組件的接口
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: "meeting" | "activity" | "case-visit" | "training" | "other";
  description?: string;
  participants?: string[];
  // 個案訪問相關欄位
  caseId?: string; // 與 SchedulePage 保持一致，使用 string 類型
  isNewCase?: boolean;
  caseInfo?: {
    name: string;
    phone: string;
    address: string;
  };
  supplyNeedsDeadline?: Date;
  // 後端相關欄位
  priority?: string;
  status?: string;
  workerId?: number;
  workerName?: string;
  caseName?: string;
  eventType?: string; // 活動類型
  eventName?: string; // 活動名稱
}

export const scheduleService = new ScheduleService();
