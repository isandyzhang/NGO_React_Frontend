/**
 * 預加載註冊文件
 * 
 * 統一管理所有需要預加載的組件和服務，提供集中化的配置管理
 */

import { registerPreload, defaultPreloadConfigs } from './preloadManager';

/**
 * 註冊所有預加載項目
 */
export function registerAllPreloads() {
  // 頁面組件預加載
  registerPreload(
    'dashboard',
    () => import('../pages/Dashboard'),
    defaultPreloadConfigs.medium
  );

  registerPreload(
    'case-management',
    () => import('../pages/CaseManagement'),
    defaultPreloadConfigs.medium
  );

  registerPreload(
    'activity-management',
    () => import('../pages/ActivityManagement'),
    defaultPreloadConfigs.medium
  );

  registerPreload(
    'supplies-management',
    () => import('../pages/SuppliesManagement'),
    defaultPreloadConfigs.medium
  );

  registerPreload(
    'calendar-management',
    () => import('../pages/schedule/CalendarManagement'),
    defaultPreloadConfigs.medium
  );

  registerPreload(
    'account-management',
    () => import('../pages/AccountManagement'),
    defaultPreloadConfigs.medium
  );

  registerPreload(
    'login',
    () => import('../pages/Login'),
    defaultPreloadConfigs.high
  );

  // 子組件預加載
  registerPreload(
    'case-form',
    () => import('../components/CaseManagementPage/AddCaseTab'),
    defaultPreloadConfigs.low
  );

  registerPreload(
    'case-search',
    () => import('../components/CaseManagementPage/SearchEditCaseTab'),
    defaultPreloadConfigs.low
  );

  registerPreload(
    'activity-form',
    () => import('../components/ActivityManagementPage/NewActivityForm'),
    defaultPreloadConfigs.low
  );

  registerPreload(
    'registration-review',
    () => import('../components/ActivityManagementPage/RegistrationReviewMain'),
    defaultPreloadConfigs.low
  );

  registerPreload(
    'inventory',
    () => import('../components/SuppliesManagementPage/InventoryTab'),
    defaultPreloadConfigs.low
  );

  registerPreload(
    'distribution',
    () => import('../components/SuppliesManagementPage/DistributionTab'),
    defaultPreloadConfigs.low
  );

  registerPreload(
    'schedule',
    () => import('../components/SchedulePage/index'),
    defaultPreloadConfigs.low
  );

  registerPreload(
    'user-list',
    () => import('../components/AccountManagement/EditAccountDialog'),
    defaultPreloadConfigs.low
  );

  registerPreload(
    'user-form',
    () => import('../components/AccountManagement/AddAccountDialog'),
    defaultPreloadConfigs.low
  );

  // 服務預加載
  registerPreload(
    'statistics',
    () => import('../services/dashboard/dashboardService'),
    defaultPreloadConfigs.low
  );

  registerPreload(
    'charts',
    () => import('../components/shared/RegionChart'),
    defaultPreloadConfigs.low
  );

  registerPreload(
    'calendar-events',
    () => import('../services/schedule/scheduleService'),
    defaultPreloadConfigs.low
  );

  // 工具組件預加載
  registerPreload(
    'loading-spinner',
    () => import('../components/shared/LoadingSpinner'),
    defaultPreloadConfigs.high
  );

  registerPreload(
    'notification-badge',
    () => import('../components/shared/NotificationBadge'),
    defaultPreloadConfigs.high
  );

  registerPreload(
    'page-header',
    () => import('../components/shared/PageHeader'),
    defaultPreloadConfigs.high
  );

  registerPreload(
    'page-container',
    () => import('../components/shared/PageContainer'),
    defaultPreloadConfigs.high
  );
}

/**
 * 獲取預加載配置
 */
export const preloadConfigs = {
  // 高優先級 - 核心組件
  core: {
    'loading-spinner': defaultPreloadConfigs.high,
    'notification-badge': defaultPreloadConfigs.high,
    'page-header': defaultPreloadConfigs.high,
    'page-container': defaultPreloadConfigs.high,
    'login': defaultPreloadConfigs.high,
  },

  // 中優先級 - 主要頁面
  pages: {
    'dashboard': defaultPreloadConfigs.medium,
    'case-management': defaultPreloadConfigs.medium,
    'activity-management': defaultPreloadConfigs.medium,
    'supplies-management': defaultPreloadConfigs.medium,
    'calendar-management': defaultPreloadConfigs.medium,
    'account-management': defaultPreloadConfigs.medium,
  },

  // 低優先級 - 子組件和服務
  components: {
    'case-form': defaultPreloadConfigs.low,
    'case-search': defaultPreloadConfigs.low,
    'activity-form': defaultPreloadConfigs.low,
    'registration-review': defaultPreloadConfigs.low,
    'inventory': defaultPreloadConfigs.low,
    'distribution': defaultPreloadConfigs.low,
    'schedule': defaultPreloadConfigs.low,
    'user-list': defaultPreloadConfigs.low,
    'user-form': defaultPreloadConfigs.low,
    'statistics': defaultPreloadConfigs.low,
    'charts': defaultPreloadConfigs.low,
    'calendar-events': defaultPreloadConfigs.low,
  },
};

/**
 * 根據用戶角色獲取預加載項目
 */
export function getPreloadItemsByRole(userRole?: string): string[] {
  const baseItems = [
    'loading-spinner',
    'notification-badge',
    'page-header',
    'page-container',
    'dashboard',
    'case-management',
    'activity-management',
    'supplies-management',
    'calendar-management',
  ];

  // 管理員和主管可以訪問帳號管理
  if (userRole === 'admin' || userRole === 'supervisor') {
    baseItems.push('account-management', 'user-list', 'user-form');
  }

  return baseItems;
}

/**
 * 根據路徑獲取相關預加載項目
 */
export function getPreloadItemsByPath(path: string): string[] {
  const pathMap: Record<string, string[]> = {
    '/dashboard': ['statistics', 'charts'],
    '/case-management': ['case-form', 'case-search'],
    '/activity-management': ['activity-form', 'registration-review'],
    '/supplies-management': ['inventory', 'distribution'],
    '/calendar-management': ['schedule', 'calendar-events'],
    '/account-management': ['user-list', 'user-form'],
  };

  return pathMap[path] || [];
} 