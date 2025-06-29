// components/shared/LoadingOverlay.tsx
import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import { styled } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '@mui/material/styles';

/**
 * 載入容器組件
 * 使用 Framer Motion 提供平滑的動畫效果
 */
const LoadingContainer = styled(motion.div)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: theme.palette.background.paper,
  zIndex: 9999, // 確保載入畫面在最上層
}));

/**
 * 載入動畫包裝器
 * 設定固定尺寸以確保動畫穩定性
 */
const LoadingWrapper = styled(Box)({
  width: '300px',
  height: '300px',
});

/**
 * 載入覆蓋層組件 (LoadingOverlay)
 * 
 * 主要功能：
 * 1. 全屏載入遮罩 - 覆蓋整個螢幕，防止用戶操作
 * 2. 載入動畫 - 顯示旋轉的載入指示器
 * 3. 平滑過渡 - 使用 Framer Motion 提供優雅的淡入效果
 * 4. 主題整合 - 使用系統主題色彩和背景
 * 
 * 設計特色：
 * - 固定位置覆蓋，確保不受頁面滾動影響
 * - 最高 z-index 確保顯示在所有內容之上
 * - 居中對齊的載入動畫，提供良好的視覺平衡
 * - 響應式設計適配不同螢幕尺寸
 * 
 * 使用場景：
 * - 初始應用載入
 * - 頁面切換過渡
 * - 大量數據處理時的等待畫面
 * - API 請求期間的用戶反饋
 * 
 * 使用範例：
 * ```jsx
 * {isLoading && <LoadingOverlay />}
 * ```
 */
const LoadingOverlay = () => {
  const theme = useTheme();
  
  return (
    <LoadingContainer 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <LoadingWrapper>
        <CircularProgress 
          size={80} 
          sx={{ 
            color: theme.palette.primary.main,
            // 可選：添加脈衝動畫效果
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%': { opacity: 1 },
              '50%': { opacity: 0.7 },
              '100%': { opacity: 1 },
            }
          }} 
        />
      </LoadingWrapper>
    </LoadingContainer>
  );
};

export default LoadingOverlay;
