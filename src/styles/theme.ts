/* ===================================
 * 主題配置文件 (Theme Configuration)
 * ===================================
 * 
 * 🎯 文件目的：
 * - 定義整個應用程式的視覺主題
 * - 統一 Material-UI 組件的外觀
 * - 提供一致的設計系統和色彩規範
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
 */

export const THEME_COLORS = {
  // ===================================
  // 🟢 主要顏色系統 (Primary Colors)
  // ===================================
  PRIMARY: '#4caf50',                    // 主綠色 - 品牌核心色
  PRIMARY_LIGHT: '#60ad5e',              // 淺綠色 - 輔助色調
  PRIMARY_DARK: '#005005',               // 深綠色 - 強調色
  PRIMARY_HOVER: '#2e7d32',              // hover 狀態色
  PRIMARY_LIGHT_BG: '#e8f5e8',           // 淺綠背景 - 用於 hover 和選中狀態
  PRIMARY_TRANSPARENT: 'rgba(76, 175, 80, 0.1)', // 10% 透明度
  
  // ===================================
  // 🔤 文字顏色系統 (Text Colors)
  // ===================================
  TEXT_PRIMARY: '#1f2937',               // 主要文字
  TEXT_SECONDARY: '#374151',             // 次要文字
  TEXT_MUTED: '#6b7280',                 // 弱化文字
  
  // ===================================
  // 🏠 背景顏色系統 (Background Colors)
  // ===================================
  BACKGROUND_PRIMARY: '#f9fafb',         // 主要背景
  BACKGROUND_SECONDARY: '#f3f4f6',       // 次要背景
  BACKGROUND_CARD: '#ffffff',            // 卡片背景
  BACKGROUND_UPLOAD: '#f9fafb',          // 上傳區域背景
  
  // ===================================
  // 📏 邊框顏色系統 (Border Colors)
  // ===================================
  BORDER_LIGHT: '#e5e7eb',              // 淺色邊框
  BORDER_DEFAULT: '#d1d5db',            // 默認邊框
  BORDER_DASHED: '#d1d5db',             // 虛線邊框
  
  // ===================================
  // 🚦 狀態顏色系統 (Status Colors)
  // ===================================
  SUCCESS: '#4caf50',                   // 成功色
  SUCCESS_LIGHT: '#f1f8e9',             // 淺成功色
  SUCCESS_DARK: '#2e7d32',              // 深成功色
  ERROR: '#f44336',                     // 錯誤色
  ERROR_DARK: '#d32f2f',                // 深錯誤色
  ERROR_LIGHT: '#ffebee',               // 淺錯誤色
  WARNING: '#ff9800',                   // 警告色
  INFO: '#2196f3',                      // 信息色
  
  // ===================================
  // 🖱️ 交互狀態顏色 (Interaction Colors)
  // ===================================
  HOVER_LIGHT: '#f9fafb',               // 淺色 hover 背景
  OVERLAY_DARK: 'rgba(0,0,0,0.6)',      // 深色遮罩
  OVERLAY_DARK_HOVER: 'rgba(0,0,0,0.8)', // 深色遮罩 hover
  
  // ===================================
  // 🚫 禁用狀態顏色 (Disabled Colors)
  // ===================================
  DISABLED_BG: '#f5f5f5',               // 禁用背景色
  DISABLED_TEXT: '#bdbdbd',             // 禁用文字色
  
  // ===================================
  // 📊 圖表專用顏色 (Chart Colors)
  // ===================================
  CHART_COLOR_1: '#4caf50',    // 主綠色
  CHART_COLOR_2: '#2196f3',    // 藍色
  CHART_COLOR_3: '#ff9800',    // 橙色
  CHART_COLOR_4: '#9c27b0',    // 紫色
  CHART_COLOR_5: '#009688',    // 青色
  CHART_COLOR_6: '#f44336',    // 紅色
  
  // ===================================
  // 👤 性別頭像顏色 (Avatar Colors by Gender)
  // ===================================
  MALE_AVATAR: '#1E90FF',    // 男生藍色
  FEMALE_AVATAR: '#FF4D40',  // 女生紅色
} as const;

// 輔助函數：獲取主題顏色
export const getThemeColor = (colorKey: keyof typeof THEME_COLORS) => THEME_COLORS[colorKey];

/* ===================================
 * 📝 TypeScript 類型擴展 (Type Extensions)
 * ===================================
 */

declare module '@mui/material/styles' {
  interface Theme {
    chart: {
      colors: string[];
      primary: string[];
      secondary: string[];
      categorical: string[];
      geographic: string[];
      trend: {
        positive: string;
        negative: string;
        neutral: string;
        baseline: string;
      };
      status: {
        active: string;
        pending: string;
        completed: string;
        cancelled: string;
        draft: string;
      };
    };
    customTypography: {
      pageTitle: React.CSSProperties;
      cardTitle: React.CSSProperties;
      cardValue: React.CSSProperties;
      cardLabel: React.CSSProperties;
      chartLabel: React.CSSProperties;
      legendLabel: React.CSSProperties;
      metricValue: React.CSSProperties;
      changeIndicator: React.CSSProperties;
      // Dashboard 專用字體
      dashboardTitle: React.CSSProperties;
      dashboardValue: React.CSSProperties;
      dashboardSubtitle: React.CSSProperties;
      dashboardTrend: React.CSSProperties;
    };
    customColors: {
      changePositive: string;
      changeNegative: string;
      icon: string;
    };
  }

  interface ThemeOptions {
    chart?: {
      colors?: string[];
      primary?: string[];
      secondary?: string[];
      categorical?: string[];
      geographic?: string[];
      trend?: {
        positive?: string;
        negative?: string;
        neutral?: string;
        baseline?: string;
      };
      status?: {
        active?: string;
        pending?: string;
        completed?: string;
        cancelled?: string;
        draft?: string;
      };
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
      // Dashboard 專用字體
      dashboardTitle?: React.CSSProperties;
      dashboardValue?: React.CSSProperties;
      dashboardSubtitle?: React.CSSProperties;
      dashboardTrend?: React.CSSProperties;
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
 */

export const theme = createTheme({
  // ===================================
  // 🎨 基礎色彩配置 (Base Color Configuration)
  // ===================================
  palette: {
    primary: {
      main: '#4caf50',
      light: '#60ad5e',
      dark: '#2e7d32',
    },
    secondary: {
      main: '#4caf50',
      light: '#80e27e',
      dark: '#087f23',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#000000',
      secondary: '#000000',
    },
  },
  
  // ===================================
  // 🔤 字體系統配置 (Typography System)
  // ===================================
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    
    h4: {
      fontWeight: 600,
      color: '#1a1a1a',
      fontSize: '2rem',
      letterSpacing: '-0.01em',
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
    
    body1: {
      color: '#374151',
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.6,
    },
    body2: {
      color: '#6b7280',
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
  },

  // ===================================
  // 📊 圖表色彩配置 (Chart Colors)
  // ===================================
  chart: {
    colors: [
      THEME_COLORS.CHART_COLOR_1,
      THEME_COLORS.CHART_COLOR_2,
      THEME_COLORS.CHART_COLOR_3,
      THEME_COLORS.CHART_COLOR_4,
      THEME_COLORS.CHART_COLOR_5,
      THEME_COLORS.CHART_COLOR_6,
    ],
    
    primary: [
      THEME_COLORS.CHART_COLOR_1,
      THEME_COLORS.CHART_COLOR_2,
      THEME_COLORS.CHART_COLOR_3,
    ],
    
    secondary: [
      THEME_COLORS.CHART_COLOR_4,
      THEME_COLORS.CHART_COLOR_5,
      THEME_COLORS.CHART_COLOR_6,
    ],
    
    categorical: [
      THEME_COLORS.CHART_COLOR_1,
      THEME_COLORS.CHART_COLOR_2,
      THEME_COLORS.CHART_COLOR_3,
      THEME_COLORS.CHART_COLOR_4,
      THEME_COLORS.CHART_COLOR_5,
      THEME_COLORS.CHART_COLOR_6,
    ],
    
    geographic: [
      '#e3f2fd',
      '#bbdefb',
      '#90caf9',
      '#64b5f6',
      '#42a5f5',
      '#2196f3',
    ],
    
    status: {
      active: THEME_COLORS.SUCCESS,
      pending: THEME_COLORS.WARNING,
      completed: THEME_COLORS.SUCCESS,
      cancelled: THEME_COLORS.ERROR,
      draft: '#9e9e9e',
    },
    
    trend: {
      positive: THEME_COLORS.SUCCESS,
      negative: THEME_COLORS.ERROR,
      neutral: '#9e9e9e',
      baseline: '#e0e0e0',
    },
  },

  // ===================================
  // 🎨 自定義字體樣式 (Custom Typography)
  // ===================================
  customTypography: {
    pageTitle: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#111827',
      letterSpacing: '-0.025em',
      lineHeight: 1.1,
    },
    
    cardTitle: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#1f2937',
      letterSpacing: '-0.01em',
      lineHeight: 1.3,
    },
    
    cardValue: {
      fontSize: '2.25rem',
      fontWeight: 700,
      color: '#111827',
      letterSpacing: '-0.02em',
      lineHeight: 1.1,
    },
    
    cardLabel: {
      fontSize: '0.875rem',
      fontWeight: 500,
      color: '#6b7280',
      letterSpacing: '0.01em',
      lineHeight: 1.4,
    },
    
    chartLabel: {
      fontSize: '0.875rem',
      fontWeight: 500,
      color: '#374151',
      letterSpacing: '0.005em',
      lineHeight: 1.4,
    },
    
    legendLabel: {
      fontSize: '0.875rem',
      fontWeight: 400,
      color: '#4b5563',
      letterSpacing: '0.01em',
      lineHeight: 1.5,
    },
    
    metricValue: {
      fontSize: '1.125rem',
      fontWeight: 600,
      color: '#111827',
      letterSpacing: '-0.01em',
      lineHeight: 1.3,
    },
    
    changeIndicator: {
      fontSize: '0.75rem',
      fontWeight: 600,
      letterSpacing: '0.025em',
      lineHeight: 1.2,
    },
    
    // Dashboard 專用字體樣式
    dashboardTitle: {
      fontSize: '1.125rem',
      fontWeight: 600,
      color: '#666666',
      letterSpacing: '0.02em',
      lineHeight: 1.3,
    },
    
    dashboardValue: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#333333',
      letterSpacing: '-0.02em',
      lineHeight: 1.1,
    },
    
    dashboardSubtitle: {
      fontSize: '0.875rem',
      fontWeight: 400,
      color: '#999999',
      letterSpacing: '0.01em',
      lineHeight: 1.4,
    },
    
    dashboardTrend: {
      fontSize: '0.75rem',
      fontWeight: 600,
      letterSpacing: '0.025em',
      lineHeight: 1.2,
    },
  },
  
  // ===================================
  // 🎨 自定義顏色 (Custom Colors)
  // ===================================
  customColors: {
    changePositive: '#6b7280',
    changeNegative: '#9ca3af',
    icon: '#6b7280',
  },
  
  // ===================================
  // 🧩 組件樣式覆蓋 (Component Overrides)
  // ===================================
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontSize: '1rem',
          padding: '12px',
          '&:focus, &:focus-visible, &:active': {
            outline: 'none !important',
            boxShadow: 'none !important',
          },
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
            '&.Mui-disabled fieldset': {
              borderColor: `${THEME_COLORS.BORDER_LIGHT} !important`,
            },
          },
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
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          transition: 'box-shadow 0.2s ease-in-out, transform 0.1s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
    
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '20px',
          '&:last-child': {
            paddingBottom: '20px',
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
          fontWeight: 600,
          letterSpacing: '-0.01em',
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
          opacity: 0.8,
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