import { createTheme } from '@mui/material/styles';

// 常用顏色常數，方便組件使用
export const THEME_COLORS = {
  // 主要顏色
  PRIMARY: '#4caf50',
  PRIMARY_LIGHT: '#60ad5e',
  PRIMARY_DARK: '#005005',
  PRIMARY_HOVER: '#2e7d32', // 統一的 hover 邊框顏色
  PRIMARY_LIGHT_BG: '#e8f5e8', // 淺綠色背景，用於hover狀態
  PRIMARY_TRANSPARENT: 'rgba(76, 175, 80, 0.1)', // 10% 透明度的主色
  
  // 常用文字顏色
  TEXT_PRIMARY: '#1f2937',
  TEXT_SECONDARY: '#374151',
  TEXT_MUTED: '#6b7280',
  TEXT_LIGHT: '#9ca3af',
  
  // 背景顏色
  BACKGROUND_PRIMARY: '#f9fafb',
  BACKGROUND_SECONDARY: '#f3f4f6',
  BACKGROUND_CARD: '#ffffff',
  BACKGROUND_UPLOAD: '#f9fafb', // 上傳區域背景色
  
  // 邊框顏色
  BORDER_LIGHT: '#e5e7eb',
  BORDER_DEFAULT: '#d1d5db',
  BORDER_DARK: '#9ca3af',
  BORDER_DASHED: '#d1d5db', // 虛線邊框顏色
  
  // 狀態顏色
  SUCCESS: '#4caf50',
  SUCCESS_LIGHT: '#f1f8e9',
  ERROR: '#f44336',
  ERROR_DARK: '#d32f2f', // 深紅色，用於 hover 效果
  ERROR_LIGHT: '#ffebee',
  WARNING: '#ff9800',
  INFO: '#2196f3',
  
  // 交互狀態顏色
  HOVER_LIGHT: '#f9fafb', // 淺色hover背景
  OVERLAY_DARK: 'rgba(0,0,0,0.6)', // 深色遮罩
  OVERLAY_DARK_HOVER: 'rgba(0,0,0,0.8)', // 深色遮罩hover
  
  // 禁用狀態顏色
  DISABLED_BG: '#f5f5f5', // 禁用背景
  DISABLED_TEXT: '#bdbdbd', // 禁用文字
} as const;

// 輔助函數：獲取主題顏色
export const getThemeColor = (colorKey: keyof typeof THEME_COLORS) => THEME_COLORS[colorKey];

/**
 * 擴展 Material-UI Theme 類型定義
 * 添加自定義的圖表色彩、字體樣式和色彩配置
 */
declare module '@mui/material/styles' {
  interface Theme {
    // 圖表專用色彩配置
    chart: {
      colors: string[]; // 基礎圖表色彩陣列
      primary: string[]; // 主要數據系列色彩
      secondary: string[]; // 次要數據系列色彩
      categorical: string[]; // 分類數據色彩
    };
    // 自定義字體樣式
    customTypography: {
      pageTitle: React.CSSProperties; // 頁面標題樣式
      cardTitle: React.CSSProperties; // 卡片標題樣式
      cardValue: React.CSSProperties; // 卡片數值樣式
      cardLabel: React.CSSProperties; // 卡片標籤樣式
      chartLabel: React.CSSProperties; // 圖表標籤樣式
      legendLabel: React.CSSProperties; // 圖例標籤樣式
      metricValue: React.CSSProperties; // 指標數值樣式
      changeIndicator: React.CSSProperties; // 變化指示器樣式
    };
    // 自定義色彩
    customColors: {
      changePositive: string; // 正向變化色彩（綠色）
      changeNegative: string; // 負向變化色彩（紅色）
      icon: string; // 圖示色彩
    };
  }

  interface ThemeOptions {
    chart?: {
      colors?: string[];
      primary?: string[];
      secondary?: string[];
      categorical?: string[];
    };
    customTypography?: {
      pageTitle?: React.CSSProperties;
      cardTitle?: React.CSSProperties;
      cardValue?: React.CSSProperties;
      cardLabel?: React.CSSProperties;
      chartLabel?: React.CSSProperties;
      legendLabel?: React.CSSProperties;
      metricValue?: React.CSSProperties;
      changeIndicator?: React.CSSProperties;
    };
    customColors?: {
      changePositive?: string;
      changeNegative?: string;
      icon?: string;
    };
  }
}

/**
 * 系統主題配置 (System Theme)
 * 
 * 這是整個案件管理系統的核心主題配置，定義了：
 * 
 * 1. 色彩系統：
 *    - 主色調：綠色系（#4caf50）- 代表希望和成長
 *    - 背景色：淺灰色系 - 提供專業和清潔的視覺感受
 *    - 文字色：深色系 - 確保良好的對比度和可讀性
 * 
 * 2. 字體系統：
 *    - 使用系統字體堆疊，確保跨平台一致性
 *    - 定義了多層級的字體大小和權重
 *    - 針對不同用途優化行高和字間距
 * 
 * 3. 圖表色彩：
 *    - 採用灰色系為主的色彩配置
 *    - 提供良好的視覺層次和數據辨識度
 *    - 支援多種圖表類型的色彩需求
 * 
 * 4. 自定義樣式：
 *    - 統一的間距和圓角設計
 *    - 一致的陰影和過渡效果
 *    - 響應式設計適配不同螢幕尺寸
 */
export const theme = createTheme({
  // 基礎色彩配置
  palette: {
    primary: {
      main: '#4caf50', // 主綠色 - 代表成長和希望
      light: '#60ad5e', // 淺綠色
      dark: '#2e7d32', // 統一的 hover 顏色
    },
    secondary: {
      main: '#4caf50', // 次要色彩（與主色相同，保持一致性）
      light: '#80e27e', // 明亮綠色
      dark: '#087f23', // 深綠色
    },
    background: {
      default: '#f5f5f5', // 頁面背景 - 淺灰色，提供舒適的視覺體驗
      paper: '#ffffff', // 卡片背景 - 純白色，確保內容清晰
    },
    text: {
      primary: '#000000', // 主要文字色彩 - 黑色，確保最佳可讀性
      secondary: '#000000', // 次要文字色彩 - 黑色，保持一致性
    },
  },
  
  // 字體系統配置
  typography: {
    // 字體家族 - 優先使用系統字體，確保跨平台一致性
    fontFamily: [
      '-apple-system', // macOS 系統字體
      'BlinkMacSystemFont', // macOS 備用字體
      '"Segoe UI"', // Windows 系統字體
      'Roboto', // Android 系統字體
      '"Helvetica Neue"', // iOS 系統字體
      'Arial', // 通用字體
      'sans-serif', // 備用無襯線字體
    ].join(','),
    
    // 標題字體樣式
    h4: {
      fontWeight: 600,
      color: '#1a1a1a',
      fontSize: '2rem',
      letterSpacing: '-0.01em', // 緊湊字間距，提升專業感
    },
    h5: {
      fontWeight: 600,
      color: '#1a1a1a',
      fontSize: '1.5rem',
      letterSpacing: '-0.01em',
    },
    h6: {
      fontWeight: 600,
      color: '#1a1a1a',
      fontSize: '1.25rem',
      letterSpacing: '-0.005em',
    },
    
    // 內文字體樣式
    body1: {
      color: '#374151', // 中性灰色，平衡可讀性和視覺疲勞
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.6, // 寬鬆行高，提升閱讀體驗
    },
    body2: {
      color: '#6b7280', // 較淺灰色，用於次要資訊
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    
    // 子標題樣式
    subtitle1: {
      color: '#374151',
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    subtitle2: {
      color: '#6b7280',
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    
    // 說明文字樣式
    caption: {
      color: '#9ca3af', // 淺灰色，用於輔助資訊
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.4,
    },
  },
  
  // 圖表專用色彩配置
  chart: {
    // 主要圖表色票 - 灰色系漸變，提供專業的數據視覺化
    colors: [
      '#757575', // 中灰色 - 主要數據色彩
      '#9e9e9e', // 淺灰色 - 次要數據色彩
      '#bdbdbd', // 更淺灰色 - 輔助數據色彩
      '#e0e0e0', // 極淺灰色 - 背景數據色彩
      '#eeeeee', // 淡灰色 - 分隔線色彩
      '#f5f5f5', // 最淡灰色 - 背景色彩
    ],
    
    // 主要數據系列色票 - 用於重要的數據呈現
    primary: [
      '#424242', // 深灰色 - 最重要數據
      '#616161', // 中深灰色 - 重要數據
      '#757575', // 標準灰色 - 一般數據
      '#9e9e9e', // 淺灰色 - 次要數據
      '#bdbdbd', // 更淺灰色 - 輔助數據
    ],
    
    // 次要數據系列色票 - 用於對比和比較
    secondary: [
      '#212121', // 最深灰色 - 強調對比
      '#424242', // 深灰色 - 主要對比
      '#616161', // 中灰色 - 標準對比
      '#757575', // 亮灰色 - 輕微對比
      '#9e9e9e', // 淺灰色 - 背景對比
    ],
    
    // 分類數據色票 - 用於多類別數據的區分
    categorical: [
      '#90a4ae', // 藍灰色 - 第一類別
      '#a5b3bb', // 淺藍灰色 - 第二類別
      '#b0bec5', // 更淺藍灰色 - 第三類別
      '#cfd8dc', // 極淺藍灰色 - 第四類別
      '#78909c', // 中藍灰色 - 第五類別
      '#95a5a6', // 銀灰色 - 第六類別
      '#b4bcc2', // 淺銀灰色 - 第七類別
      '#d0d7de', // 極淺銀灰色 - 第八類別
      '#8d9db6', // 紫灰色 - 第九類別
      '#a8b5c8', // 淺紫灰色 - 第十類別
      '#c3cdd9', // 更淺紫灰色 - 第十一類別
      '#e2e8f0', // 極淺紫灰色 - 第十二類別
    ],
  },
  
  // 自定義字型樣式 - 針對特定使用場景優化
  customTypography: {
    // 頁面標題 (儀表板等主要頁面標題)
    pageTitle: {
      fontSize: '2rem',
      fontWeight: 700,
      color: '#111827',
      letterSpacing: '-0.025em', // 緊密字間距，增強視覺衝擊力
      lineHeight: 1.2, // 緊湊行高，適合大標題
    },
    
    // 卡片標題 (各種卡片的標題)
    cardTitle: {
      fontSize: '1.125rem',
      fontWeight: 600,
      color: '#1f2937',
      letterSpacing: '-0.01em',
      lineHeight: 1.3, // 平衡的行高，適合中等標題
    },
    
    // 卡片數值 (大數字顯示)
    cardValue: {
      fontSize: '2.25rem',
      fontWeight: 700,
      color: '#111827',
      letterSpacing: '-0.02em', // 緊密字間距，讓數字更突出
      lineHeight: 1.1,
    },
    
    // 卡片標籤 (小標籤文字)
    cardLabel: {
      fontSize: '0.875rem',
      fontWeight: 500,
      color: '#6b7280',
      letterSpacing: '0.01em',
      lineHeight: 1.4,
    },
    
    // 圖表標籤 (圖表中的文字)
    chartLabel: {
      fontSize: '0.875rem',
      fontWeight: 500,
      color: '#374151',
      letterSpacing: '0.005em',
      lineHeight: 1.4,
    },
    
    // 圖例標籤 (列表項目文字)
    legendLabel: {
      fontSize: '0.875rem',
      fontWeight: 400,
      color: '#4b5563',
      letterSpacing: '0.01em',
      lineHeight: 1.5,
    },
    
    // 指標數值 (中等數字顯示)
    metricValue: {
      fontSize: '1.125rem',
      fontWeight: 600,
      color: '#111827',
      letterSpacing: '-0.01em',
      lineHeight: 1.3,
    },
    
    // 變化指標 (百分比變化)
    changeIndicator: {
      fontSize: '0.75rem',
      fontWeight: 600,
      letterSpacing: '0.025em',
      lineHeight: 1.2,
    },
  },
  
  // 自定義顏色 - 全網站通用
  customColors: {
    changePositive: '#6b7280', // 正向變化顏色 - 深灰色
    changeNegative: '#9ca3af', // 負向變化顏色 - 中灰色
    icon: '#6b7280', // 圖示顏色 - 深灰色
  },
  
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontSize: '1rem',
          padding: '12px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': { 
              borderColor: THEME_COLORS.BORDER_LIGHT 
            },
            '&:hover fieldset': { 
              borderColor: THEME_COLORS.PRIMARY_HOVER 
            },
            '&.Mui-focused fieldset': { 
              borderColor: THEME_COLORS.PRIMARY_HOVER 
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': { 
              borderColor: THEME_COLORS.BORDER_LIGHT 
            },
            '&:hover fieldset': { 
              borderColor: `${THEME_COLORS.PRIMARY_HOVER} !important` 
            },
            '&.Mui-focused fieldset': { 
              borderColor: `${THEME_COLORS.PRIMARY_HOVER} !important` 
            },
            // Disabled 狀態樣式
            '&.Mui-disabled fieldset': {
              borderColor: `${THEME_COLORS.BORDER_LIGHT} !important`,
            },
          },
          // 額外的選擇器覆蓋，確保樣式生效
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: `${THEME_COLORS.PRIMARY_HOVER} !important`,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: `${THEME_COLORS.PRIMARY_HOVER} !important`,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& fieldset': { 
            borderColor: THEME_COLORS.BORDER_LIGHT 
          },
          '&:hover fieldset': { 
            borderColor: THEME_COLORS.PRIMARY_HOVER 
          },
          '&.Mui-focused fieldset': { 
            borderColor: THEME_COLORS.PRIMARY_HOVER 
          },
          // Disabled 狀態樣式
          '&.Mui-disabled': {
            '& fieldset': {
              borderColor: `${THEME_COLORS.BORDER_LIGHT} !important`,
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12, // 統一圓角
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', // 統一陰影
          transition: 'box-shadow 0.2s ease-in-out, transform 0.1s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)', // hover 陰影效果
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '20px', // 統一內邊距
          '&:last-child': {
            paddingBottom: '20px', // 保持底部間距一致
          },
        },
      },
    },
    MuiTypography: {
      defaultProps: {
        color: 'text.primary',
      },
      styleOverrides: {
        h4: {
          fontWeight: 600, // 統一標題字重
          letterSpacing: '-0.01em', // 字間距調整
        },
        h5: {
          fontWeight: 600,
          letterSpacing: '-0.01em',
        },
        h6: {
          fontWeight: 600,
          letterSpacing: '-0.01em',
        },
        body1: {
          fontSize: '0.95rem',
          lineHeight: 1.6,
        },
        body2: {
          fontSize: '0.875rem',
          lineHeight: 1.6,
          opacity: 0.8, // 次要文字稍微透明
        },
      },
    },
    MuiBreadcrumbs: {
      styleOverrides: {
        root: {
          color: '#000000',
        },
        li: {
          color: '#000000',
        },
      },
    },
  },
}); 