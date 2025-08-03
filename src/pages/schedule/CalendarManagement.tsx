import React, { useState, useEffect } from "react";
import { Box, Alert, Snackbar } from "@mui/material";
import { Event } from "@mui/icons-material";
import PageHeader from "../../components/shared/PageHeader";
import PageContainer from "../../components/shared/PageContainer";
import CalendarComponent from "../../components/SchedulePage";
import { scheduleService, CalendarEvent } from "../../services/schedule/scheduleService";
import { authService } from "../../services/accountManagement/authService";

/**
 * 行事曆管理頁面組件
 *
 * 主要功能：
 * 1. 行程安排 - 規劃日常工作時程和重要會議
 * 2. 事件提醒 - 設定重要事件的提醒通知
 * 3. 日程管理 - 管理個案訪問、志工培訓等各種活動
 * 4. 月/週/日視圖 - 提供不同時間維度的行程檢視
 * 5. 團隊協作 - 支援多人共享行程和協作功能
 *
 * 實作功能：
 * - 完整的日曆顯示和互動
 * - 新增、編輯、刪除事件
 * - 模擬資料庫的 CRUD 操作
 * - 事件類型分類和視覺區分
 * - 中文本地化顯示
 */
const schedule: React.FC = () => {
  // 事件資料狀態
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  // 提示訊息狀態
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  /**
   * 從資料庫載入事件資料
   */
  const loadEventsFromDatabase = async () => {
    try {
      // 從登入狀態獲取當前工作人員ID
      const currentWorker = authService.getCurrentWorker();
      if (!currentWorker) {
        showSnackbar("未找到登入工作人員資訊，請重新登入", "error");
        return;
      }
      
      const workerId = currentWorker.workerId;
      const userRole = currentWorker.role;
      console.log(`載入工作人員 ${currentWorker.name} (ID: ${workerId}, 角色: ${userRole}) 的行程資料`);
      
      // 根據角色決定載入範圍
      let schedules;
      if (userRole === 'admin') {
        // 只有管理員可以看到所有行程
        console.log('管理員權限：載入所有工作人員的行程');
        schedules = await scheduleService.getAllSchedules();
      } else {
        // 員工和主管都只能看到自己的行程
        console.log(`${userRole === 'supervisor' ? '主管' : '員工'}權限：只載入自己的行程 (WorkerId: ${workerId})`);
        schedules = await scheduleService.getSchedulesByWorker(workerId);
      }
      const calendarEvents = schedules.map((schedule) =>
        scheduleService.convertToCalendarEvent(schedule)
      );
      setEvents(calendarEvents);
      
      if (schedules.length === 0) {
        showSnackbar("目前沒有行程資料", "info");
      } else {
        showSnackbar(`已載入 ${schedules.length} 筆行事曆資料`, "success");
      }
    } catch (error) {
      console.error("載入事件失敗:", error);
      // 如果是 404 錯誤，表示該使用者沒有行程資料
      if (error instanceof Error && error.message.includes('404')) {
        setEvents([]);
        showSnackbar("目前沒有行程資料", "info");
      } else {
        showSnackbar("載入事件失敗，請稍後再試", "error");
      }
    }
  };

  /**
   * 顯示提示訊息
   */
  const showSnackbar = (
    message: string,
    severity: "success" | "error" | "info"
  ) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  /**
   * 新增事件到資料庫
   */
  const handleEventCreate = async (eventData: Omit<CalendarEvent, "id">) => {
    try {
      const currentWorker = authService.getCurrentWorker();
      if (!currentWorker) {
        showSnackbar("未找到登入工作人員資訊，請重新登入", "error");
        return;
      }
      const workerId = currentWorker.workerId;
      const createRequest = scheduleService.convertToCreateRequest(
        eventData as CalendarEvent,
        workerId
      );
      const newSchedule = await scheduleService.createSchedule(createRequest);

      if (!newSchedule) {
        throw new Error("❌ 無法取得新 schedule 資料");
      }

      const newEvent = scheduleService.convertToCalendarEvent(newSchedule);
      setEvents((prevEvents) => [...prevEvents, newEvent]);
      showSnackbar(`成功新增事件：${newEvent.title}`, "success");
    } catch (error) {
      console.error("新增事件失敗:", error);
      showSnackbar("新增事件失敗，請稍後再試", "error");
    }
  };

  /**
   * 更新事件到資料庫
   */
  const handleEventUpdate = async (updatedEvent: CalendarEvent) => {
    try {
      // Updating event
      const updateRequest =
        scheduleService.convertToUpdateRequest(updatedEvent);
      await scheduleService.updateSchedule(
        parseInt(updatedEvent.id),
        updateRequest
      );
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === updatedEvent.id ? updatedEvent : event
        )
      );
      showSnackbar(`成功更新事件：${updatedEvent.title}`, "success");
    } catch (error) {
      console.error("更新事件失敗:", error);
      showSnackbar("更新事件失敗，請稍後再試", "error");
    }
  };

  /**
   * 從資料庫刪除事件
   */
  const handleEventDelete = async (eventId: string) => {
    try {
      const eventToDelete = events.find((event) => event.id === eventId);
      await scheduleService.deleteSchedule(parseInt(eventId));

      setEvents((prevEvents) =>
        prevEvents.filter((event) => event.id !== eventId)
      );
      showSnackbar(`成功刪除事件：${eventToDelete?.title || ""}`, "success");
    } catch (error) {
      console.error("刪除事件失敗:", error);
      showSnackbar("刪除事件失敗，請稍後再試", "error");
    }
  };

  /**
   * 組件載入時從資料庫載入事件
   */
  useEffect(() => {
    loadEventsFromDatabase();
  }, []);

  return (
    <PageContainer>
      {/* 統一的頁面頭部組件 */}
      <PageHeader
        breadcrumbs={[
          { label: "行事曆管理", icon: <Event sx={{ fontSize: 16 }} /> },
        ]}
      />

      {/* 主要內容區域 */}
      <Box sx={{ mt: 2, height: "calc(100vh - 200px)", minHeight: 600 }}>
        <CalendarComponent
          events={events}
          onEventCreate={handleEventCreate}
          onEventUpdate={handleEventUpdate}
          onEventDelete={handleEventDelete}
        />
      </Box>

      {/* 操作結果提示訊息 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default schedule;
