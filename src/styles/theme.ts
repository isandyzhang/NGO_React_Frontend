/* ===================================
 * 主題配置文件 (Theme Configuration)
 * ===================================
 * 
 * 🎯 文件目的：
 * - 定義整個應用程式的視覺主題
 * - 統一 Material-UI 組件的外觀
 * - 提供一致的設計系統和色彩規範
 * - 支援自定義組件樣式和圖表配色
 * 
 * 📋 主要功能：
 * 1. 顏色常數定義 (Color Constants)
 * 2. TypeScript 類型擴展 (Type Extensions)
 * 3. MUI 主題配置 (MUI Theme Config)
 * 4. 組件樣式覆蓋 (Component Overrides)
 * 5. 自定義字體系統 (Custom Typography)
 * 6. 圖表色彩配置 (Chart Colors)
 * 
 * 🔧 使用方式：
 * import { theme, THEME_COLORS } from './theme';
 * <ThemeProvider theme={theme}>
 */

import { createTheme } from '@mui/material/styles';

/* ===================================
 * 🎨 主題顏色常數 (Theme Color Constants)
 * ===================================
 * 統一管理整個應用程式的顏色配置
 * 🔍 重點：這些顏色會在 global.css 和 commonStyles.ts 中被引用
 */

// 常用顏色常數，方便組件使用
export const THEME_COLORS = {
  // ===================================
  // 🟢 主要顏色系統 (Primary Colors)
  // ===================================
  // 綠色系 - 代表成長、希望和生命力
  PRIMARY: '#4caf50',                    // 主綠色 - 品牌核心色
  PRIMARY_LIGHT: '#60ad5e',              // 淺綠色 - 輔助色調
  PRIMARY_DARK: '#005005',               // 深綠色 - 強調色
  PRIMARY_HOVER: '#2e7d32',              // hover 狀態色 - 統一的交互反饋
  PRIMARY_LIGHT_BG: '#e8f5e8',           // 淺綠背景 - 用於 hover 和選中狀態
  PRIMARY_TRANSPARENT: 'rgba(76, 175, 80, 0.1)', // 10% 透明度 - 用於遮罩和背景
  
  // ===================================
  // 🔤 文字顏色系統 (Text Colors)
  // ===================================
  // 層次化的文字顏色，確保良好的視覺層次
  TEXT_PRIMARY: '#1f2937',               // 主要文字 - 最高對比度
  TEXT_SECONDARY: '#374151',             // 次要文字 - 中等對比度
  TEXT_MUTED: '#6b7280',                 // 弱化文字 - 較低對比度，用於輔助信息
  TEXT_LIGHT: '#9ca3af',                 // 淺色文字 - 最低對比度，用於佔位符
  
  // ===================================
  // 🏠 背景顏色系統 (Background Colors)
  // ===================================
  // 多層次的背景色，創造視覺深度
  BACKGROUND_PRIMARY: '#f9fafb',         // 主要背景 - 頁面基礎色
  BACKGROUND_SECONDARY: '#f3f4f6',       // 次要背景 - 區塊分隔色
  BACKGROUND_CARD: '#ffffff',            // 卡片背景 - 內容容器色
  BACKGROUND_UPLOAD: '#f9fafb',          // 上傳區域背景 - 特殊功能區色
  
  // ===================================
  // 📏 邊框顏色系統 (Border Colors)
  // ===================================
  // 細緻的邊框色階，提供清晰的視覺分隔
  BORDER_LIGHT: '#e5e7eb',              // 淺色邊框 - 輕微分隔
  BORDER_DEFAULT: '#d1d5db',            // 默認邊框 - 標準分隔
  BORDER_DARK: '#9ca3af',               // 深色邊框 - 強調分隔
  BORDER_DASHED: '#d1d5db',             // 虛線邊框 - 特殊狀態標示
  
  // ===================================
  // 🚦 狀態顏色系統 (Status Colors)
  // ===================================
  // 語義化的狀態色彩，提供直觀的視覺反饋
  SUCCESS: '#4caf50',                   // 成功色 - 綠色系，與主色保持一致
  SUCCESS_LIGHT: '#f1f8e9',             // 淺成功色 - 用於背景高亮
  ERROR: '#f44336',                     // 錯誤色 - 紅色系，警示作用
  ERROR_DARK: '#d32f2f',                // 深錯誤色 - 用於 hover 效果
  ERROR_LIGHT: '#ffebee',               // 淺錯誤色 - 用於背景提示
  WARNING: '#ff9800',                   // 警告色 - 橙色系，注意提醒
  INFO: '#2196f3',                      // 信息色 - 藍色系，中性提示
  
  // ===================================
  // 🖱️ 交互狀態顏色 (Interaction Colors)
  // ===================================
  // 用戶交互時的視覺反饋色彩
  HOVER_LIGHT: '#f9fafb',               // 淺色 hover 背景
  OVERLAY_DARK: 'rgba(0,0,0,0.6)',      // 深色遮罩 - 模態框背景
  OVERLAY_DARK_HOVER: 'rgba(0,0,0,0.8)', // 深色遮罩 hover - 加強效果
  
  // ===================================
  // 🚫 禁用狀態顏色 (Disabled Colors)
  // ===================================
  // 不可用狀態的視覺表現
  DISABLED_BG: '#f5f5f5',               // 禁用背景色
  DISABLED_TEXT: '#bdbdbd',             // 禁用文字色
} as const;

// 輔助函數：獲取主題顏色
export const getThemeColor = (colorKey: keyof typeof THEME_COLORS) => THEME_COLORS[colorKey];

/* ===================================
 * 📝 TypeScript 類型擴展 (Type Extensions)
 * ===================================
 * 擴展 Material-UI 的 Theme 類型，添加自定義屬性
 * 🔍 重點：這些類型定義確保 TypeScript 的類型安全
 */

/**
 * 擴展 Material-UI Theme 類型定義
 * 添加自定義的圖表色彩、字體樣式和色彩配置
 */
declare module '@mui/material/styles' {
  interface Theme {
    // 📊 圖表專用色彩配置
    chart: {
      colors: string[];        // 基礎圖表色彩陣列 - 用於數據視覺化
      primary: string[];       // 主要數據系列色彩 - 重要數據展示
      secondary: string[];     // 次要數據系列色彩 - 輔助數據展示
      categorical: string[];   // 分類數據色彩 - 不同類別區分
    };
    // 🔤 自定義字體樣式
    customTypography: {
      pageTitle: React.CSSProperties;      // 頁面標題樣式 - 最高層級標題
      cardTitle: React.CSSProperties;      // 卡片標題樣式 - 組件標題
      cardValue: React.CSSProperties;      // 卡片數值樣式 - 統計數字顯示
      cardLabel: React.CSSProperties;      // 卡片標籤樣式 - 描述文字
      chartLabel: React.CSSProperties;     // 圖表標籤樣式 - 圖表文字
      legendLabel: React.CSSProperties;    // 圖例標籤樣式 - 圖例說明
      metricValue: React.CSSProperties;    // 指標數值樣式 - 關鍵指標
      changeIndicator: React.CSSProperties; // 變化指示器樣式 - 趨勢顯示
    };
    // 🎨 自定義色彩
    customColors: {
      changePositive: string;  // 正向變化色彩（上升趨勢）
      changeNegative: string;  // 負向變化色彩（下降趨勢）
      icon: string;           // 圖示色彩（統一的圖標顏色）
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

/* ===================================
 * 🎨 系統主題配置 (System Theme Configuration)
 * ===================================
 * 
 * 這是整個案件管理系統的核心主題配置，定義了：
 * 
 * 🎯 設計理念：
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
  // ===================================
  // 🎨 基礎色彩配置 (Base Color Configuration)
  // ===================================
  palette: {
    primary: {
      main: '#4caf50',         // 主綠色 - 代表成長和希望
      light: '#60ad5e',        // 淺綠色 - 輔助色調
      dark: '#2e7d32',         // 統一的 hover 顏色 - 交互反饋
    },
    secondary: {
      main: '#4caf50',         // 次要色彩（與主色相同，保持一致性）
      light: '#80e27e',        // 明亮綠色 - 高亮效果
      dark: '#087f23',         // 深綠色 - 強調效果
    },
    background: {
      default: '#f5f5f5',      // 頁面背景 - 淺灰色，提供舒適的視覺體驗
      paper: '#ffffff',        // 卡片背景 - 純白色，確保內容清晰
    },
    text: {
      primary: '#000000',      // 主要文字色彩 - 黑色，確保最佳可讀性
      secondary: '#000000',    // 次要文字色彩 - 黑色，保持一致性
    },
  },
  
  // ===================================
  // 🔤 字體系統配置 (Typography System)
  // ===================================
  typography: {
    // 字體家族 - 優先使用系統字體，確保跨平台一致性
    fontFamily: [
      '-apple-system',         // macOS 系統字體
      'BlinkMacSystemFont',    // macOS 備用字體
      '"Segoe UI"',           // Windows 系統字體
      'Roboto',               // Android 系統字體
      '"Helvetica Neue"',     // iOS 系統字體
      'Arial',                // 通用字體
      'sans-serif',           // 備用無襯線字體
    ].join(','),
    
    // ===================================
    // 📰 標題字體樣式 (Heading Styles)
    // ===================================
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
    
    // ===================================
    // 📄 內文字體樣式 (Body Text Styles)
    // ===================================
    body1: {
      color: '#374151',        // 中性灰色，平衡可讀性和視覺疲勞
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.6,         // 寬鬆行高，提升閱讀體驗
    },
    body2: {
      color: '#6b7280',        // 較淺灰色，用於次要資訊
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
  },

  // ===================================
  // 📊 圖表色彩配置 (Chart Color Configuration)
  // ===================================
  // 🔍 重點：採用灰色系主調，確保數據的專業性和可讀性
  chart: {
    // 基礎圖表色彩 - 用於一般數據視覺化
    colors: [
      '#6b7280',  // 深灰色 - 主要數據
      '#9ca3af',  // 中灰色 - 次要數據
      '#d1d5db',  // 淺灰色 - 輔助數據
      '#374151',  // 深灰色變體 - 對比數據
      '#f3f4f6',  // 極淺灰 - 背景數據
    ],
    // 主要數據系列 - 用於重要指標展示
    primary: [
      '#4caf50',  // 主綠色 - 核心指標
      '#60ad5e',  // 淺綠色 - 相關指標
      '#2e7d32',  // 深綠色 - 對比指標
    ],
    // 次要數據系列 - 用於輔助信息
    secondary: [
      '#9ca3af',  // 中灰色
      '#6b7280',  // 深灰色
      '#d1d5db',  // 淺灰色
    ],
    // 分類數據色彩 - 用於不同類別區分
    categorical: [
      '#6b7280',  // 類別 A
      '#9ca3af',  // 類別 B
      '#374151',  // 類別 C
      '#d1d5db',  // 類別 D
    ],
  },

  // ===================================
  // 🎨 自定義字體樣式 (Custom Typography)
  // ===================================
  // 針對特定用途優化的字體樣式
  customTypography: {
    // 頁面標題 (最高層級)
    pageTitle: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#111827',
      letterSpacing: '-0.025em', // 超緊密字間距，突出重要性
      lineHeight: 1.1,
    },
    
    // 卡片標題 (組件層級)
    cardTitle: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#1f2937',
      letterSpacing: '-0.01em',
      lineHeight: 1.3,
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
  
  // ===================================
  // 🎨 自定義顏色 (Custom Colors)
  // ===================================
  // 全網站通用的語義化顏色
  customColors: {
    changePositive: '#6b7280', // 正向變化顏色 - 深灰色（保持中性）
    changeNegative: '#9ca3af', // 負向變化顏色 - 中灰色（保持中性）
    icon: '#6b7280',          // 圖示顏色 - 深灰色（統一性）
  },
  
  // ===================================
  // 🧩 組件樣式覆蓋 (Component Overrides)
  // ===================================
  // 針對 Material-UI 組件的全域樣式定制
  components: {
    // ===================================
    // 🔘 按鈕組件 (Button Components)
    // ===================================
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,                    // 統一圓角
          textTransform: 'none',              // 不轉換大小寫
          fontSize: '1rem',                   // 統一字體大小
          padding: '12px',                    // 統一內邊距
          // Focus 狀態移除 - 提升視覺體驗
          '&:focus, &:focus-visible, &:active': {
            outline: 'none !important',
            boxShadow: 'none !important',
          },
        },
      },
    },
    
    // ===================================
    // 📝 表單組件 (Form Components)
    // ===================================
    
    /** TextField 輸入框樣式 */
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
    
    /** Select 下拉選單樣式 */
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
    
    /** OutlinedInput 輸入框樣式 */
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
    
    // ===================================
    // 🃏 卡片組件 (Card Components)
    // ===================================
    
    /** Card 卡片樣式 */
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,       // 統一圓角
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', // 統一陰影
          transition: 'box-shadow 0.2s ease-in-out, transform 0.1s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)', // hover 陰影效果
          },
        },
      },
    },
    
    /** CardContent 卡片內容樣式 */
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '20px',        // 統一內邊距
          '&:last-child': {
            paddingBottom: '20px', // 保持底部間距一致
          },
        },
      },
    },
    
    // ===================================
    // 🔤 文字組件 (Typography Components)
    // ===================================
    
    /** Typography 文字樣式 */
    MuiTypography: {
      defaultProps: {
        color: 'text.primary',
      },
      styleOverrides: {
        h4: {
          fontWeight: 600,        // 統一標題字重
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
          opacity: 0.8,           // 次要文字稍微透明
        },
      },
    },
    
    // ===================================
    // 🧭 導航組件 (Navigation Components)
    // ===================================
    
    /** Breadcrumbs 麵包屑導航樣式 */
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
    
    // ===================================
    // 📑 分頁組件 (Tab Components)
    // ===================================
    
    /** Tab 分頁按鈕樣式 */
    // MUI 分頁按鈕和 Tab 移除 focus 框線
    // 🔍 重點：移除點擊時的框線，提升視覺體驗
    MuiTab: {
      styleOverrides: {
        root: {
          '&:focus, &:focus-visible, &:active': {
            outline: 'none !important',
            boxShadow: 'none !important',
          },
        },
      },
    },
    
    /** ButtonBase 基礎按鈕樣式 */
    MuiButtonBase: {
      styleOverrides: {
        root: {
          '&:focus, &:focus-visible, &:active': {
            outline: 'none !important',
            boxShadow: 'none !important',
          },
        },
      },
    },
  },
}); 