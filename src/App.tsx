import { ThemeProvider } from '@mui/material';
import { theme } from './styles/theme';
import { AuthProvider } from './hooks/useAuth';
import { NotificationProvider } from './contexts/NotificationContext';
import AppRouter from './routes';
import { useEffect } from 'react';
import { registerAllPreloads } from './utils/preloadRegistry';

/**
 * 應用程式主要組件 (App Component)
 * 
 * 這是整個 React 應用程式的根組件，負責：
 * 
 * 1. 主題提供 (ThemeProvider)：
 *    - 將自定義的 Material-UI 主題套用到整個應用程式
 *    - 確保所有組件都能使用統一的設計風格和顏色配置
 * 
 * 2. 身份驗證提供 (AuthProvider)：
 *    - 管理整個應用程式的身份驗證狀態
 *    - 提供登入、登出、用戶資訊等功能給所有子組件
 * 
 * 3. 通知提供 (NotificationProvider)：
 *    - 管理應用程式的通知狀態
 *    - 提供通知計數和刷新功能
 * 
 * 4. 路由管理 (AppRouter)：
 *    - 處理應用程式的頁面導航和路由配置
 *    - 根據 URL 路徑渲染對應的頁面組件
 * 
 * 5. 預加載優化：
 *    - 初始化預加載系統
 *    - 監聽路由變更並預測性載入相關組件
 * 
 * 組件層級結構：
 * App (主組件)
 *  └── ThemeProvider (主題)
 *      └── AuthProvider (身份驗證)
 *          └── NotificationProvider (通知)
 *              └── AppRouter (路由)
 *                  └── 各個頁面組件 (Login, Dashboard, etc.)
 */

function App() {
  useEffect(() => {
    // 初始化預加載系統
    registerAllPreloads();
    console.log('預加載系統已初始化');
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <NotificationProvider>
          <AppRouter />
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
