import React from 'react';
import { Box } from '@mui/material';

interface PageContainerProps {
  children: React.ReactNode;
  minHeight?: string;
}

/**
 * 頁面容器組件 (PageContainer)
 * 
 * 主要功能：
 * 1. 統一頁面布局結構
 * 2. 確保所有頁面有一致的最小高度
 * 3. 防止頁面切換時的跳動
 * 4. 提供響應式設計支援
 * 
 * 使用方式：
 * ```jsx
 * <PageContainer>
 *   <YourPageContent />
 * </PageContainer>
 * ```
 */
const PageContainer: React.FC<PageContainerProps> = ({ 
  children, 
  minHeight = 'calc(100vh - 48px)' // 預設最小高度：100vh - 主容器 padding (24px * 2)
}) => {
  return (
    <Box
      sx={{
        minHeight: minHeight,
        width: '100%',
        maxWidth: '100%', // 確保不會超出父容器
        position: 'relative',
        boxSizing: 'border-box',
        overflow: 'visible',
        display: 'flex',
        flexDirection: 'column',
        // 確保所有子元素也遵循寬度限制
        '& > *': {
          maxWidth: '100%',
          boxSizing: 'border-box'
        },
        // 確保表格和其他可能溢出的元素能正確處理
        '& .MuiTable-root': {
          width: '100%',
          maxWidth: '100%'
        },
        '& .MuiPaper-root': {
          maxWidth: '100%',
          boxSizing: 'border-box'
        }
      }}
    >
      {children}
    </Box>
  );
};

export default PageContainer; 