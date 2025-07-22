import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ActivityManagement from '../pages/ActivityManagement';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';

// Lazy loading 其他頁面，提升首次載入效能
const Dashboard = lazy(() => import('../pages/Dashboard'));
const CaseManagement = lazy(() => import('../pages/CaseManagement'));
const SuppliesManagement = lazy(() => import('../pages/SuppliesManagement'));
const CalendarManagement = lazy(() => import('../pages/CalendarManagement'));
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
 *    - /login - 登入頁面
 * 
 * 特色功能：
 * - 採用 MainLayout 統一版型設計
 * - 使用 React.Suspense 和 lazy loading 提升效能
 * - 所有路由都有 Loading 狀態處理
 * - 自動重導向處理
 */

// 全域載入組件包裝器
const PageWithSuspense = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingSpinner />}>
    {children}
  </Suspense>
);

// 路由配置
const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute><MainLayout /></ProtectedRoute>,
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
    ],
  },
  {
    path: '/login',
    element: <PageWithSuspense><Login /></PageWithSuspense>,
  },
], {
  future: {
    v7_startTransition: true,
  },
});

/**
 * 路由提供者組件
 */
const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter; 