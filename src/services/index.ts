// 統一的服務入口文件
export { api } from './api';
export { authService } from './authService';
export { caseService } from './caseService';
export { default as activityService } from './activityService';
export { default as registrationService } from './registrationService';
export * as calendarService from './calendarService';
export { supplyService } from './supplyService';
export { newsService } from './newsService';
export { scheduleService } from './scheduleService';
export { default as distributionBatchService } from './distributionBatchService';

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
  // 排程管理相关类型
  Schedule,
  CalendarEvent,
} from './scheduleService';

export type {
  // 物資管理相關類型
  Supply,
  SupplyCategory,
  RegularSuppliesNeed,
  EmergencySupplyNeed,
  RegularSupplyMatch,
  EmergencySupplyMatch,
  CaseOrder,
  UserOrder,
  UserOrderDetail,
} from './supplyService';

export type {
  // 新聞管理相關類型
  News,
} from './newsService';

export type {
  // 分發批次相關類型
  DistributionBatch,
  DistributionBatchDetail,
  DistributionMatch,
  CreateDistributionBatchRequest,
  ApproveDistributionBatchRequest,
} from './distributionBatchService'; 