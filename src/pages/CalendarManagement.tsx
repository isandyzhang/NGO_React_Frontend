import React, { useState, useEffect } from "react";
import { Box, Alert, Snackbar, Tabs, Tab, Typography } from "@mui/material";
import { Event } from "@mui/icons-material";
import PageHeader from "../components/shared/PageHeader";
import PageContainer from "../components/shared/PageContainer";
import CalendarComponent from "../components/CalendarPage";
import { scheduleService, CalendarEvent } from "../services/scheduleService";

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
const CalendarManagement: React.FC = () => {
  // 標籤頁狀態
  const [tabValue, setTabValue] = useState(0);

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
      // 使用測試端點載入所有排程，或使用特定工作者ID
      const workerId = 1; // 這裡可以從用戶狀態中獲取
      const schedules = await scheduleService.getSchedulesByWorker(workerId);
      const calendarEvents = schedules.map((schedule) =>
        scheduleService.convertToCalendarEvent(schedule)
      );
      setEvents(calendarEvents);
      showSnackbar("已載入行事曆資料", "success");
    } catch (error) {
      console.error("載入事件失敗:", error);
      showSnackbar("載入事件失敗，請稍後再試", "error");
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
      const workerId = 1; // 這裡可以從用戶狀態中獲取
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

      {/* 標籤頁導航 */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          aria-label="行事曆管理標籤頁"
        >
          <Tab icon={<Event />} label="行事曆" iconPosition="start" />
        </Tabs>
      </Box>

      {/* 主要內容區域 */}
      <Box sx={{ mt: 2, height: "calc(100vh - 280px)", minHeight: 600 }}>
        {tabValue === 0 && (
          <CalendarComponent
            events={events}
            onEventCreate={handleEventCreate}
            onEventUpdate={handleEventUpdate}
            onEventDelete={handleEventDelete}
          />
        )}
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

export default CalendarManagement;
