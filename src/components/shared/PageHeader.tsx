import React from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  InputAdornment,
  useTheme 
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { THEME_COLORS } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import PageBreadcrumbs from './PageBreadcrumbs';

// 麵包屑項目介面定義
interface BreadcrumbItem {
  label: string; // 顯示文字
  href?: string; // 連結路徑（可選）
  icon?: React.ReactNode; // 圖示（可選）
}

// 組件 Props 介面定義
interface PageHeaderProps {
  title?: string; // 頁面標題（可選）
  breadcrumbs: BreadcrumbItem[]; // 麵包屑導航項目
  showTitle?: boolean; // 是否顯示標題（預設為 false）
  showSearch?: boolean; // 是否顯示搜尋功能
  searchPlaceholder?: string; // 搜尋欄位佔位符文字
  onSearchChange?: (value: string) => void; // 搜尋內容變更處理函數
  searchValue?: string; // 搜尋欄位值
  rightContent?: React.ReactNode; // 右側自定義內容
}

/**
 * 頁面頭部組件 (PageHeader)
 * 
 * 主要功能：
 * 1. 統一的頁面標題顯示 - 提供一致的頁面標題樣式
 * 2. 麵包屑導航 - 顯示當前頁面在系統中的位置層級
 * 3. 搜尋功能 - 可選的搜尋欄位，支援即時搜尋
 * 4. 自定義右側內容 - 可放置額外的按鈕、資訊等元素
 * 5. 響應式設計 - 適配不同螢幕尺寸的顯示方式
 * 
 * 設計特色：
 * - 簡潔的視覺設計，不干擾頁面主要內容
 * - 彈性的配置選項，可根據頁面需求調整
 * - 一致的間距和字體，維持整體設計風格
 * - 支援圖示和文字的麵包屑導航
 * 
 * 使用範例：
 * ```jsx
 * <PageHeader
 *   title="儀表板"
 *   breadcrumbs={[{ label: '首頁', icon: <HomeIcon /> }]}
 *   showSearch={true}
 *   searchPlaceholder="搜尋..."
 *   onSearchChange={handleSearch}
 * />
 * ```
 */
const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  breadcrumbs,
  showTitle = false,
  showSearch = false,
  searchPlaceholder = "Search",
  onSearchChange,
  searchValue = "",
  rightContent
}) => {
  const theme = useTheme();

  return (
    <Box>
      {/* 頂部導航和功能區域 */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 1, sm: 2, md: 2.5 }, // 平板增加間距
        py: { md: 0.5 } // 平板增加垂直內邊距
      }}>
        {/* 左側：麵包屑導航區域 */}
        <Box sx={{ flex: 1, minWidth: 0, width: { xs: '100%', sm: 'auto' } }}>
          <PageBreadcrumbs items={breadcrumbs} />
        </Box>

        {/* 右側：搜尋功能和自定義內容區域 */}
        {(showSearch || rightContent) && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            flexShrink: 0,
            width: { xs: '100%', sm: 'auto' },
            gap: { xs: 2, md: 2.5 }, // 平板增加間距
            minHeight: { md: '48px' } // 平板增加最小高度
          }}>
            {/* 自定義右側內容（如按鈕、資訊等） */}
            {rightContent}
            
            {/* 搜尋輸入欄位 */}
            {showSearch && (
              <TextField
                placeholder={searchPlaceholder}
                size="small"
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                sx={{
                  width: { xs: '100%', sm: 250 },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: THEME_COLORS.BACKGROUND_PRIMARY,
                    '&:hover': {
                      backgroundColor: THEME_COLORS.BACKGROUND_SECONDARY,
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'white',
                    }
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: THEME_COLORS.TEXT_LIGHT, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          </Box>
        )}
      </Box>

      {/* 頁面主標題 */}
      {showTitle && title && (
        <Typography variant="h6" sx={{ 
          fontWeight: 600, 
          color: THEME_COLORS.TEXT_PRIMARY,
          mb: 0.5 
        }}>
          {title}
        </Typography>
      )}
    </Box>
  );
};

export default PageHeader; 