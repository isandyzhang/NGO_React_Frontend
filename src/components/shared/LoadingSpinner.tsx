// components/shared/LoadingSpinner.tsx
import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import { styled } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';
import { THEME_COLORS } from '../../styles/theme';

/**
 * 載入容器組件
 * 使用 Framer Motion 提供平滑的動畫效果
 */
const LoadingContainer = styled(motion.div)({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: THEME_COLORS.BACKGROUND_CARD,
  zIndex: 9999, // 確保載入畫面在最上層
});

/**
 * 載入動畫包裝器
 * 設定固定尺寸以確保動畫穩定性
 */
const LoadingWrapper = styled(Box)({
  width: '300px',
  height: '300px',
});

/**
 * 載入旋轉器組件 (LoadingSpinner)
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
 * {isLoading && <LoadingSpinner />}
 * ```
 */
const LoadingSpinner = () => {
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
            color: THEME_COLORS.PRIMARY,
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

export default LoadingSpinner;
