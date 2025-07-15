import React from 'react';
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
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import {
  Add,
  Assessment,
  ExitToApp,
  Folder,
  Home,
  LocalShipping,
  CalendarToday,
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';

// 組件 Props 介面定義
interface SidebarProps {
  open?: boolean; // 控制側邊欄開關 (mobile 模式使用)
  onClose?: () => void; // 關閉側邊欄回調函數
}

// 側邊欄寬度常數
const drawerWidth = 300;

/**
 * 側邊欄導航組件 (Sidebar)
 * 
 * 主要功能：
 * 1. 系統導航 - 提供各頁面間的快速切換
 * 2. 使用者資訊顯示 - 顯示當前登入用戶的基本資訊
 * 3. 系統品牌展示 - 顯示系統 Logo 和名稱
 * 4. 登出功能 - 提供安全登出選項
 * 5. 響應式設計 - 在行動裝置上適當調整顯示方式
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
  const { worker, logout } = useAuth();

  // 導航選單項目配置
  const menuItems = [
    { text: '首頁', icon: <Home />, path: '/dashboard' },
    { text: '個案資料管理', icon: <Folder />, path: '/case-management' },
    { text: '活動管理', icon: <Add />, path: '/activity-management' },
    { text: '行事曆管理', icon: <CalendarToday />, path: '/calendar-management' },
    { text: '物資管理', icon: <LocalShipping />, path: '/supplies-management' },
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
          {worker ? worker.name.charAt(0) : 'U'}
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
            {worker ? worker.name : '未登入'}
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
            {worker ? worker.email : '請先登入'}
          </Typography>
          {worker && (
            <Typography 
              variant="caption" 
              sx={{ 
                color: theme.palette.primary.light,
                fontSize: '0.7rem',
                fontWeight: 500
              }}
            >
            </Typography>
          )}
        </Box>
      </Box>

      {/* 主要導航選單 */}
      <List sx={{ px: { xs: 2, md: 2.5 }, py: { xs: 3, md: 3.5 } }}>
        {menuItems.map((item) => (
          <ListItemButton
            component={Link}
            to={item.path}
            key={item.text}
            selected={location.pathname === item.path}
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
            }}>{item.icon}</ListItemIcon>
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
    </Drawer>
  );
};

export default Sidebar;
