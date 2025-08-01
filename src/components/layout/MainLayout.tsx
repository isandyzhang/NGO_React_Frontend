import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useTheme, useMediaQuery, IconButton, AppBar, Toolbar, Typography } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import Sidebar from './Sidebar';

/**
 * 主要布局組件 (MainLayout)
 * 
 * 這是應用程式的主要布局容器，負責：
 * 
 * 1. 整體布局結構：
 *    - 左側：導航側邊欄 (Sidebar)
 *    - 右側：主要內容區域 (main content)
 * 
 * 2. 身份驗證整合：
 *    - 獲取登出功能並傳遞給側邊欄
 *    - 確保只有已登入用戶才能存取
 * 
 * 3. 響應式設計：
 *    - 適配不同螢幕尺寸
 *    - 在行動裝置上調整布局
 * 
 * 4. 主題整合：
 *    - 使用系統主題色彩
 *    - 確保整體視覺一致性
 * 
 * 使用方式：
 * - 包裹在 ProtectedRoute 中確保身份驗證
 * - 使用 React Router 的 Outlet 渲染子頁面
 */
const MainLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // 控制行動版側邊欄開關
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };
  
  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: theme.palette.background.default,
      width: '100%',
      position: 'relative',
    }}>
      {/* 行動版 AppBar - 只在小螢幕顯示 */}
      {isMobile && (
        <AppBar 
          position="fixed" 
          sx={{ 
            bgcolor: 'white',
            color: 'black',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            zIndex: theme.zIndex.drawer + 1,
          }}
        >
          <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <IconButton
              edge="start"
              aria-label="open drawer"
              onClick={handleSidebarToggle}
              sx={{ 
                mr: 2,
                color: theme.palette.grey[700],
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.04)'
                }
              }}
            >
              <MenuIcon />
            </IconButton>
            
            {/* Logo 區域 */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              flex: 1,
              justifyContent: 'center',
              mr: 6 // 平衡左側按鈕的空間
            }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700,
                  color: theme.palette.primary.main,
                  fontSize: '1.1rem',
                  letterSpacing: '0.5px'
                }}
              >
                NGO檔案管理系統
              </Typography>
            </Box>
          </Toolbar>
        </AppBar>
      )}
      
      {/* 左側導航側邊欄 */}
      <Sidebar 
        open={sidebarOpen}
        onClose={handleSidebarClose}
      />
      
      {/* 右側主要內容區域 */}
      <Box
        component="main"
        sx={{
          marginLeft: isMobile ? 0 : '324px', // 調整為正確的 sidebar 佔用空間 (300px + 24px margin)
          marginTop: isMobile ? '64px' : 0, // 行動版需要留出 AppBar 空間
          px: { 
            xs: 1.5, // 手機版：12px
            sm: 2,   // 小平板：16px
            md: 2.5, // 平板版：20px
            lg: 3,   // 大螢幕：24px
            xl: 4    // 超大螢幕：32px
          },  
          py: { xs: 2, sm: 2.5, md: 3.5, lg: 3 }, // 響應式垂直padding，平板增加間距
          bgcolor: theme.palette.background.default,
          minHeight: isMobile ? 'calc(100vh - 64px)' : '100vh',
          width: isMobile ? '100%' : 'calc(100vw - 324px)', // 調整為正確寬度
          maxWidth: '100%', // 確保不會超出視窗
          boxSizing: 'border-box',
          position: 'relative',
          overflow: 'hidden', // 改為 hidden 防止不必要的滾動條
          // 確保內容在小螢幕上不會被裁切
          '& > *': {
            maxWidth: '100%',
            boxSizing: 'border-box'
          }
        }}
      >
        {/* React Router Outlet - 渲染對應的頁面組件 */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout; 