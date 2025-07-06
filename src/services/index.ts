// 統一的服務入口文件
export { api } from './api';
export { caseService } from './caseService';
export { default as activityService } from './activityService';
export { default as registrationService } from './registrationService';
export * as calendarService from './calendarService';

// 類型定義統一導出
export type {
  // 個案管理相關類型
  CaseFormData,
  CaseRecord,
  CaseSearchParams,
  CaseListResponse,
} from './caseService';

export type {
  // 活動管理相關類型
  Activity,
  ActivityStatistics,
  ActivityListResponse,
} from './activityService';

export type {
  // 報名審核相關類型
  CaseRegistration,
  PublicRegistration,
} from './registrationService';

export type {
  // 行事曆相關類型
  CalendarEvent,
} from '../components/CalendarPage'; 