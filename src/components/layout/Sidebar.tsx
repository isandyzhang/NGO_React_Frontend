import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Avatar,
  useTheme,
  useMediaQuery,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { useNotificationContext } from '../../contexts/NotificationContext';
import NotificationBadge from '../shared/NotificationBadge';
import { UnifiedUser, LoginMethod } from '../../types/userTypes';
import {
  Add,
  Assessment,
  ExitToApp,
  Folder,
  Home,
  LocalShipping,
  CalendarToday,
  SupervisorAccount,
  Settings,
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import ChangePasswordDialog from '../shared/ChangePasswordDialog';
import { preloadByAction } from '../../utils/preloadManager';

// 組件 Props 介面定義
interface SidebarProps {
  open?: boolean; // 控制側邊欄開關 (mobile 模式使用)
  onClose?: () => void; // 關閉側邊欄回調函數
}

// 側邊欄寬度常數
const drawerWidth = 300;

/**
 * 輔助函數：獲取用戶顯示名稱
 */
const getUserDisplayName = (user: UnifiedUser): string => {
  if (user.loginSource === 'azure') {
    return user.displayName || user.email;
  } else {
    return user.name || user.email;
  }
};

/**
 * 輔助函數：獲取用戶電子郵件
 */
const getUserEmail = (user: UnifiedUser): string => {
  return user.email;
};

/**
 * 輔助函數：獲取用戶角色顯示文字
 */
const getUserRole = (user: UnifiedUser): string => {
  if (user.loginSource === 'database' && user.role) {
    const roleMap: { [key: string]: string } = {
      'admin': '管理員',
      'supervisor': '主管',
      'staff': '員工',
    };
    return roleMap[user.role] || user.role;
  } else if (user.loginSource === 'azure' && user.role) {
    const roleMap: { [key: string]: string } = {
      'admin': '管理員',
      'supervisor': '主管', 
      'staff': '員工',
    };
    return roleMap[user.role] || '使用者';
  }
  return '使用者';
};

/**
 * 輔助函數：獲取登入來源顯示文字
 */
const getLoginSourceText = (loginMethod?: LoginMethod): string => {
  if (loginMethod === LoginMethod.AZURE_AD) {
    return 'Azure AD';
  } else if (loginMethod === LoginMethod.DATABASE) {
    return '本地帳戶';
  }
  return '';
};

/**
 * 側邊欄導航組件 (Sidebar)
 * 
 * 主要功能：
 * 1. 系統導航 - 提供各頁面間的快速切換
 * 2. 使用者資訊顯示 - 顯示當前登入用戶的基本資訊
 * 3. 系統品牌展示 - 顯示系統 Logo 和名稱
 * 4. 登出功能 - 提供安全登出選項
 * 5. 響應式設計 - 在行動裝置上適當調整顯示方式
 * 6. 預加載優化 - 懸停時預加載相關頁面
 * 
 * 特色：
 * - 深色主題設計，提供專業視覺效果
 * - 當前頁面高亮顯示，提供清晰的導航指示
 * - 圓角設計和過渡動畫，提升使用者體驗
 * - 支援桌面版和行動版不同的顯示模式
 */
const Sidebar: React.FC<SidebarProps> = ({ open = true, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  const { user, logout, loginMethod } = useAuth();
  const { counts, hasSupplyNotifications, hasDistributionNotifications } = useNotificationContext();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  // 用戶權限檢查
  const userRole = user?.role as 'staff' | 'supervisor' | 'admin' || 'staff';
  const canAccessAccountManagement = userRole === 'supervisor' || userRole === 'admin';

  // 處理密碼變更
  const handlePasswordChange = async (currentPassword: string, newPassword: string) => {
    if (!user || !('workerId' in user)) {
      throw new Error('用戶資訊不完整');
    }

    try {
      // 呼叫密碼變更API
      const authService = (await import('../../services/accountManagement/authService')).default;
      await authService.changePassword(user.workerId, currentPassword, newPassword);
    } catch (error) {
      throw error;
    }
  };

  // 導航選單項目配置
  const menuItems = [
    { text: '首頁', icon: <Home />, path: '/dashboard' },
    { text: '個案資料管理', icon: <Folder />, path: '/case-management' },
    { text: '活動管理', icon: <Add />, path: '/activity-management' },
    { text: '行事曆管理', icon: <CalendarToday />, path: '/calendar-management' },
    { text: '物資管理', icon: <LocalShipping />, path: '/supplies-management' },
    // 只有主管和管理員能看到帳號管理
    ...(canAccessAccountManagement ? [{ text: '帳號管理', icon: <SupervisorAccount />, path: '/account-management' }] : []),
  ];

  return (
    <Drawer
    variant={isMobile ? 'temporary' : 'permanent'}
    open={isMobile ? open : true}
    onClose={isMobile ? onClose : undefined}
    sx={{
      width: drawerWidth,
      flexShrink: 0,
      '& .MuiDrawer-paper': {
        width: drawerWidth,
        background: theme.palette.grey[900],
        color: 'common.white',
        borderRight: 'none',
        borderRadius: isMobile ? '0' : '15px',
        boxSizing: 'border-box',
        display: 'flex',
        margin: isMobile ? '0' : '24px',
        marginRight: isMobile ? '0' : '24px',
        flexDirection: 'column',
        height: isMobile ? '100vh' : 'calc(100vh - 48px)',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1300,
      },
    }}
  >
  
      {/* 系統 Logo 和品牌名稱區塊 */}
      <Box sx={{ p: { xs: 3, md: 3.5 }, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 600, 
            display: 'flex', 
            alignItems: 'center', 
            gap: { xs: 1, md: 1.5 }, // 平板增加間距
            color: 'common.white',
            fontSize: { md: '1.4rem' } // 平板略微增加字體大小
          }}
        >
          <Assessment sx={{ fontSize: { xs: 28, md: 32 }, color: 'common.white' }} />
          恩舉NGO管理系統
        </Typography>
      </Box>

      {/* 當前使用者資訊顯示區塊 */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Avatar 
          sx={{ 
            width: 40, 
            height: 40, 
            bgcolor: theme.palette.primary.main,
            fontSize: '1rem',
            fontWeight: 'bold'
          }}
        >
          {user ? getUserDisplayName(user).charAt(0) : 'U'}
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: 'common.white',
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {user ? getUserDisplayName(user) : '未登入'}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'rgba(255,255,255,0.7)',
              fontSize: '0.75rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {user ? getUserEmail(user) : '請先登入'}
          </Typography>
          {user && (
            <Typography 
              variant="caption" 
              sx={{ 
                color: theme.palette.primary.light,
                fontSize: '0.7rem',
                fontWeight: 500
              }}
            >
              {getLoginSourceText(loginMethod)} • {getUserRole(user)}
            </Typography>
          )}
        </Box>
        {/* 設定齒輪圖示 - 只有本地帳戶才顯示 */}
        {user && loginMethod === LoginMethod.DATABASE && (
          <Tooltip title="變更密碼">
            <IconButton
              onClick={() => setChangePasswordOpen(true)}
              sx={{
                color: 'rgba(255,255,255,0.7)',
                '&:hover': {
                  color: 'common.white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              <Settings />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* 主要導航選單 */}
      <List sx={{ px: { xs: 2, md: 2.5 }, py: { xs: 3, md: 3.5 } }}>
        {menuItems.map((item) => (
          <ListItemButton
            component={Link}
            to={item.path}
            key={item.text}
            selected={location.pathname === item.path}
            onMouseEnter={() => {
              // 根據路徑觸發預加載
              const actionMap: Record<string, string> = {
                '/dashboard': 'hover-dashboard',
                '/case-management': 'hover-case',
                '/activity-management': 'hover-activity',
                '/supplies-management': 'hover-supplies',
                '/calendar-management': 'hover-calendar',
                '/account-management': 'hover-account',
              };
              const action = actionMap[item.path];
              if (action) {
                preloadByAction(action);
              }
            }}
            sx={{
              borderRadius: '12px',
              mb: { xs: 1, md: 1.5 }, // 平板增加間距
              py: { xs: 1, md: 1.5 }, // 平板增加垂直內邊距
              px: { xs: 2, md: 2.5 }, // 平板增加水平內邊距
              color: 'common.white',
              bgcolor: location.pathname === item.path ? 'rgba(255,255,255,0.1)' : 'transparent',
              minHeight: { md: '52px' }, // 平板增加最小高度
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.05)',
              },
              transition: 'all 0.2s',
            }}
          >
            <ListItemIcon sx={{ 
              color: 'common.white', 
              minWidth: { xs: '40px', md: '44px' }, // 平板增加圖標區域
              '& .MuiSvgIcon-root': {
                fontSize: { xs: 20, md: 22 } // 平板增加圖標大小
              }
            }}>
              {item.text === '物資管理' ? (
                <NotificationBadge 
                  showBadge={counts.totalPending > 0}
                  size="small"
                >
                  {item.icon}
                </NotificationBadge>
              ) : (
                item.icon
              )}
            </ListItemIcon>
            <ListItemText 
              primary={
                <Typography
                  sx={{
                    fontSize: { xs: '1rem', md: '1.05rem' }, // 平板略微增加字體大小
                    fontWeight: location.pathname === item.path ? 600 : 400,
                    color: 'common.white'
                  }}
                >
                  {item.text}
                </Typography>
              }
            />
          </ListItemButton>
        ))}
      </List>

      {/* 底部登出功能區塊 */}
      <Box mt="auto">
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
        <List sx={{ p: 2 }}>
          <ListItemButton
            onClick={logout}
            sx={{
              borderRadius: '12px',
              color: 'common.white',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.05)',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'common.white', minWidth: '40px' }}>
              <ExitToApp />
            </ListItemIcon>
            <ListItemText 
              primary={
                <Typography
                  sx={{
                    fontSize: '0.95rem',
                    color: 'common.white'
                  }}
                >
                  登出
                </Typography>
              }
            />
          </ListItemButton>
        </List>
      </Box>

      {/* 變更密碼對話框 */}
      <ChangePasswordDialog
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
        onPasswordChange={handlePasswordChange}
      />
    </Drawer>
  );
};

export default Sidebar;
