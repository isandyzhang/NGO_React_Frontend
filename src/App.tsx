import { ThemeProvider } from '@mui/material';
import { theme } from './styles/theme';
import { AuthProvider } from './hooks/useAuth';
import { NotificationProvider } from './contexts/NotificationContext';
import AppRouter from './routes';

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
 * 3. 路由管理 (AppRouter)：
 *    - 處理應用程式的頁面導航和路由配置
 *    - 根據 URL 路徑渲染對應的頁面組件
 * 
 * 組件層級結構：
 * App (主組件)
 *  └── ThemeProvider (主題)
 *      └── AuthProvider (身份驗證)
 *          └── AppRouter (路由)
 *              └── 各個頁面組件 (Login, Dashboard, etc.)
 */
function App() {
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
