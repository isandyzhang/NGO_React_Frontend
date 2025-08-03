// 統一的服務入口文件 - 優化版本
// 按功能模組分割，實施懶加載

// 核心API服務
export { api } from './shared/api';

// 身份驗證相關服務
export { authService } from './accountManagement/authService';
export { azureService } from './accountManagement/azureService';

// 個案管理相關服務
export { caseService } from './caseManagement/caseService';
export { caseSpeechService } from './caseManagement/caseSpeechService';

// 活動管理相關服務
export { default as activityService } from './activityManagement/activityService';
export { default as registrationService } from './activityManagement/registrationService';
export { aiService as activityAIService } from './activityManagement/activityAIService';
export { default as activityImageService } from './activityManagement/activityImageService';

// 排程管理相關服務
export * as calendarService from './schedule/calendarService';
export { scheduleService } from './schedule/scheduleService';

// 物資管理相關服務
export { supplyService } from './supplyManagement/supplyService';
export { default as distributionBatchService } from './supplyManagement/distributionBatchService';
export { emergencySupplyNeedService } from './supplyManagement/emergencySupplyNeedService';

// 帳號管理相關服務
export { accountService } from './accountManagement/accountService';

// 其他服務
export { newsService } from './shared/newsService';

// 類型定義統一導出 - 按模組分類
export type {
  // 個案管理相關類型
  CaseFormData,
  CaseRecord,
  CaseSearchParams,
  CaseListResponse,
} from './caseManagement/caseService';

export type {
  // 活動管理相關類型
  Activity,
  ActivityStatistics,
  ActivityListResponse,
} from './activityManagement/activityService';

export type {
  // 報名審核相關類型
  CaseRegistration,
  PublicRegistration,
} from './activityManagement/registrationService';

export type {
  // 排程管理相关类型
  Schedule,
  CalendarEvent,
} from './schedule/scheduleService';

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
} from './supplyManagement/supplyService';

export type {
  // 新聞管理相關類型
  News,
} from './shared/newsService';

export type {
  // 分發批次相關類型
  DistributionBatch,
  DistributionBatchDetail,
  DistributionMatch,
  CreateDistributionBatchRequest,
  ApproveDistributionBatchRequest,
} from './supplyManagement/distributionBatchService';

export type {
  // 帳號管理相關類型
  Account,
  CreateAccountRequest,
  UpdateAccountRequest,
} from './accountManagement/accountService';

// 懶加載服務函數
export const lazyServices = {
  // 按需載入的服務
  caseManagement: () => import('./caseManagement/caseService'),
  activityManagement: () => import('./activityManagement/activityService'),
  suppliesManagement: () => import('./supplyManagement/supplyService'),
  dashboard: () => import('./dashboard/dashboardService'),
  schedule: () => import('./schedule/scheduleService'),
  account: () => import('./accountManagement/accountService'),
} as const; 