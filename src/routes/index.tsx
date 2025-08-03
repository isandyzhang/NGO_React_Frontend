import React, { Suspense, lazy, useEffect } from 'react';
import { createBrowserRouter, RouterProvider, useLocation } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import { getPreloadItemsByPath } from '../utils/preloadRegistry';
import { predictPreload } from '../utils/preloadManager';

// 使用更細緻的懶加載，按功能模組分割
// 儀表板模組
const Dashboard = lazy(() => import('../pages/Dashboard'));

// 個案管理模組
const CaseManagement = lazy(() => import('../pages/CaseManagement'));

// 活動管理模組
const ActivityManagement = lazy(() => import('../pages/ActivityManagement'));

// 物資管理模組
const SuppliesManagement = lazy(() => import('../pages/SuppliesManagement'));

// 行事曆管理模組
const CalendarManagement = lazy(() => import('../pages/schedule/CalendarManagement'));

// 帳號管理模組
const AccountManagement = lazy(() => import('../pages/AccountManagement'));

// 登入模組
const Login = lazy(() => import('../pages/Login'));

/**
 * 路由設定 (Routes Configuration)
 * 
 * 定義整個應用程式的路由結構，採用 React Router v6 的 createBrowserRouter API
 * 提供類型安全的路由配置和更好的效能
 * 
 * 主要路由結構：
 *    - / - 首頁重導至 dashboard
 *    - /dashboard - 儀表板頁面
 *    - /case-management - 個案管理頁面
 *    - /activity-management - 活動管理頁面
 *    - /supplies-management - 物資管理頁面
 *    - /calendar-management - 行事曆管理頁面
 *    - /account-management - 帳號管理頁面
 *    - /login - 登入頁面
 * 
 * 特色功能：
 * - 採用 MainLayout 統一版型設計
 * - 使用 React.Suspense 和懶加載提升效能
 * - 所有路由都有 Loading 狀態處理
 * - 自動重導向處理
 * - 實施預加載策略優化用戶體驗
 */

// 全域載入組件包裝器，添加預加載功能
const PageWithSuspense = ({ 
  children, 
  preloadComponent 
}: { 
  children: React.ReactNode;
  preloadComponent?: () => void;
}) => {
  React.useEffect(() => {
    // 預加載相關組件
    if (preloadComponent) {
      const timer = setTimeout(preloadComponent, 1000); // 1秒後預加載
      return () => clearTimeout(timer);
    }
  }, [preloadComponent]);

  return (
    <Suspense fallback={<LoadingSpinner />}>
      {children}
    </Suspense>
  );
};

/**
 * 路由監聽組件 - 在Router上下文中監聽路由變化
 */
const RouteChangeListener: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // 路由變更時觸發預加載預測
    predictPreload(location.pathname);
    
    // 獲取當前路徑相關的預加載項目
    const relatedItems = getPreloadItemsByPath(location.pathname);
    console.log(`路由變更到: ${location.pathname}, 預加載項目:`, relatedItems);
  }, [location.pathname]);

  return null;
};

// 增強版MainLayout，包含路由監聽功能
const EnhancedMainLayout: React.FC = () => {
  return (
    <>
      <RouteChangeListener />
      <MainLayout />
    </>
  );
};

// 路由配置
const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute><EnhancedMainLayout /></ProtectedRoute>,
    children: [
      {
        index: true,
        element: <PageWithSuspense><Dashboard /></PageWithSuspense>,
      },
      {
        path: 'dashboard',
        element: <PageWithSuspense><Dashboard /></PageWithSuspense>,
      },
      {
        path: 'case-management',
        element: <PageWithSuspense><CaseManagement /></PageWithSuspense>,
      },
      {
        path: 'activity-management',
        element: <PageWithSuspense><ActivityManagement /></PageWithSuspense>,
      },
      {
        path: 'supplies-management',
        element: <PageWithSuspense><SuppliesManagement /></PageWithSuspense>,
      },
      {
        path: 'calendar-management',
        element: <PageWithSuspense><CalendarManagement /></PageWithSuspense>,
      },
      {
        path: 'account-management',
        element: <PageWithSuspense><AccountManagement /></PageWithSuspense>,
      },
    ],
  },
  {
    path: '/login',
    element: <PageWithSuspense><Login /></PageWithSuspense>,
  },
]);

/**
 * 路由提供者組件
 */
const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter; 