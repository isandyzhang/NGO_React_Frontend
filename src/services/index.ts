// 統一的服務入口文件
export { api } from './api';
export { caseService } from './caseService';
export { eventService } from './eventService';
export { authService } from './authService';
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
  EventFormData,
  EventRecord,
  EventSearchParams,
  EventListResponse,
  RegistrationRecord,
  RegistrationSearchParams,
  RegistrationListResponse,
} from './eventService';

export type {
  // 認證相關類型
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ChangePasswordRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
} from './authService';

export type {
  // 行事曆相關類型
  CalendarEvent,
} from '../components/CalendarPage'; 