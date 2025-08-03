import { THEME_COLORS } from './theme';

/**
 * ===================================
 * 共用樣式定義 (Common Styles)
 * ===================================
 * 
 * 🎯 文件目的：
 * - 統一整個應用程式的視覺樣式
 * - 減少重複代碼，提高維護性
 * - 確保設計一致性和品牌統一
 * 
 * 📋 主要功能：
 * 1. 表單組件樣式 (Forms)
 * 2. 按鈕樣式 (Buttons) 
 * 3. 表格樣式 (Tables)
 * 4. 卡片樣式 (Cards)
 * 5. 狀態樣式 (Status)
 * 6. 動畫效果 (Animations)
 * 7. 響應式間距 (Responsive Spacing)
 * 
 * 🔧 使用方式：
 * import { commonStyles } from './commonStyles';
 * sx={{ ...commonStyles.primaryButton }}
 */

export const commonStyles = {
  // ===================================
  // 📝 表單相關樣式 (Form Styles)
  // ===================================
  // 用於統一所有表單組件的外觀和行為
  
  /** 表單區塊容器 - 用於包裹表單內容的主要容器 */
  formSection: {
    bgcolor: THEME_COLORS.BACKGROUND_CARD,
    borderRadius: 2,
    p: 3,
    mb: 3,
    border: `1px solid ${THEME_COLORS.BORDER_LIGHT}`,
  },
  
  /** 表單標題 - 用於表單區塊的主標題 */
  formHeader: {
    fontWeight: 600,
    color: THEME_COLORS.TEXT_PRIMARY,
    mb: 2,
  },
  
  /** 表單標籤 - 用於輸入框上方的標籤文字 */
  formLabel: {
    mb: 1,
    color: THEME_COLORS.TEXT_SECONDARY,
    fontWeight: 500,
  },
  
  /** 基礎輸入框 - 適用於 TextField 組件 */
  // 🔍 重點：邊框樣式由全局主題 (theme.ts) 統一管理
  formInput: {
    bgcolor: THEME_COLORS.BACKGROUND_PRIMARY,
  },
  
  /** 下拉選單 - 適用於 Select 組件 */
  // 🔍 重點：包含 disabled 狀態的特殊處理
  formSelect: {
    bgcolor: THEME_COLORS.BACKGROUND_PRIMARY,
    // 確保 disabled 狀態下的樣式
    '&.Mui-disabled': {
      bgcolor: THEME_COLORS.BACKGROUND_SECONDARY,
      '& .MuiOutlinedInput-root': {
        '& fieldset': {
          borderColor: `${THEME_COLORS.BORDER_LIGHT} !important`,
        },
      },
    },
  },
  
  /** 日期選擇器 - 適用於日期/時間輸入 */
  // 🔍 重點：使用等寬字體確保日期對齊，包含自定義圖示
  formDatePicker: {
    bgcolor: THEME_COLORS.BACKGROUND_PRIMARY,
    '& fieldset': { borderColor: THEME_COLORS.BORDER_LIGHT },
    '&:hover fieldset': { borderColor: THEME_COLORS.PRIMARY_HOVER },
    '&.Mui-focused fieldset': { borderColor: THEME_COLORS.PRIMARY_HOVER },
    '& .MuiInputBase-input': {
      fontSize: '1rem',
      fontWeight: 500,
      color: THEME_COLORS.TEXT_PRIMARY,
      fontFamily: 'monospace', // 等寬字體讓日期對齊更好看
    },
    '& .MuiInputAdornment-root': {
      color: THEME_COLORS.PRIMARY,
    },
    // 輔助文字樣式
    '& .MuiFormHelperText-root': {
      color: THEME_COLORS.TEXT_MUTED,
      fontSize: '0.75rem',
      fontStyle: 'italic',
      marginLeft: 0,
      marginTop: '6px',
    },
    // 自定義日期選擇器圖示 - 使用 SVG 圖示替換默認樣式
    '& input[type="date"]::-webkit-calendar-picker-indicator': {
      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='${THEME_COLORS.PRIMARY.replace('#', '%23')}'%3e%3cpath fill-rule='evenodd' d='M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z' clip-rule='evenodd'/%3e%3c/svg%3e")`,
      backgroundSize: '20px 20px',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      cursor: 'pointer',
      opacity: 0.8,
      transition: 'opacity 0.2s ease',
      '&:hover': {
        opacity: 1,
      },
    },
    // Focus 狀態增強 - 添加柔和的光暈效果
    '&.Mui-focused': {
      boxShadow: `0 0 0 2px ${THEME_COLORS.PRIMARY}20`, // 20% 透明度的主色光暈
    },
  },
  
  // ===================================
  // 🔘 按鈕樣式 (Button Styles)
  // ===================================
  // 統一所有按鈕的外觀，確保品牌一致性
  
  /** 主要按鈕 - 用於主要操作 (如提交、確認) */
  primaryButton: {
    bgcolor: THEME_COLORS.PRIMARY,
    color: 'white !important',
    fontSize: '1rem',
    fontWeight: 600,
    textTransform: 'none',
    borderRadius: 2,
    px: 3,
    py: 1.5,
    '&:hover': {
      bgcolor: THEME_COLORS.PRIMARY_DARK,
      color: 'white !important',
    },
    '&:disabled': {
      bgcolor: THEME_COLORS.DISABLED_BG,
      color: THEME_COLORS.DISABLED_TEXT,
    },
    '& .MuiButton-label': {
      color: 'white !important',
    },
  },

  /** 上傳按鈕 - 用於文件上傳操作 */
  uploadButton: {
    color: THEME_COLORS.PRIMARY,
    borderColor: THEME_COLORS.PRIMARY,
    textTransform: 'none',
    borderRadius: 2,
    '&:hover': {
      borderColor: THEME_COLORS.PRIMARY_HOVER,
      bgcolor: THEME_COLORS.PRIMARY_TRANSPARENT,
    },
  },

  /** 移除按鈕 - 用於刪除項目的小按鈕 */
  removeButton: {
    color: THEME_COLORS.TEXT_MUTED,
    textTransform: 'none',
    minWidth: 'auto',
    px: 1,
    borderRadius: 2,
    '&:hover': {
      color: THEME_COLORS.TEXT_SECONDARY,
      bgcolor: THEME_COLORS.BACKGROUND_SECONDARY,
    },
  },
  
  /** 危險按鈕 - 用於刪除、取消等危險操作 */
  dangerButton: {
    bgcolor: THEME_COLORS.ERROR,
    color: 'white !important',
    fontSize: '1rem',
    fontWeight: 600,
    textTransform: 'none',
    borderRadius: 2,
    px: 3,
    py: 1.5,
    '&:hover': {
      bgcolor: THEME_COLORS.ERROR_DARK,
      color: 'white !important',
    },
    '& .MuiButton-label': {
      color: 'white !important',
    },
  },
  
  /** 同意按鈕 - 用於批准、同意等正面操作 */
  approveButton: {
    bgcolor: THEME_COLORS.SUCCESS,
    color: 'white !important',
    fontSize: '1rem',
    fontWeight: 600,
    textTransform: 'none',
    borderRadius: 2,
    minWidth: 80,
    px: 3,
    py: 1.5,
    '&:hover': {
      bgcolor: THEME_COLORS.SUCCESS,
      color: 'white !important',
    },
    '&:disabled': {
      bgcolor: THEME_COLORS.DISABLED_BG,
      color: THEME_COLORS.DISABLED_TEXT,
    },
    '& .MuiButton-label': {
      color: 'white !important',
    },
  },

  /** 不同意按鈕 - 用於拒絕、不同意等否定操作 */
  rejectButton: {
    bgcolor: THEME_COLORS.ERROR,
    color: 'white !important',
    fontSize: '1rem',
    fontWeight: 600,
    textTransform: 'none',
    borderRadius: 2,
    minWidth: 80,
    px: 3,
    py: 1.5,
    '&:hover': {
      bgcolor: THEME_COLORS.ERROR,
      color: 'white !important',
    },
    '&:disabled': {
      bgcolor: THEME_COLORS.DISABLED_BG,
      color: THEME_COLORS.DISABLED_TEXT,
    },
    '& .MuiButton-label': {
      color: 'white !important',
    },
  },
  
  /** 次要按鈕 - 用於取消、返回等次要操作 */
  secondaryButton: {
    bgcolor: 'transparent',
    color: THEME_COLORS.TEXT_MUTED,
    border: `1px solid ${THEME_COLORS.BORDER_DEFAULT}`,
    textTransform: 'none',
    borderRadius: 2,
    px: 3,
    py: 1.5,
    '&:hover': {
      bgcolor: THEME_COLORS.BACKGROUND_SECONDARY,
      borderColor: THEME_COLORS.PRIMARY_DARK,
    },
  },
  
  // ===================================
  // 📊 表格樣式 (Table Styles)
  // ===================================
  // 用於數據表格的統一樣式
  
  /** 表格標題行 - 用於表格的 header */
  tableHeader: {
    bgcolor: THEME_COLORS.BACKGROUND_PRIMARY,
    fontWeight: 600,
    color: THEME_COLORS.TEXT_SECONDARY,
    borderBottom: `2px solid ${THEME_COLORS.BORDER_LIGHT}`,
  },
  
  /** 表格數據行 - 用於表格的數據單元格 */
  tableCell: {
    color: THEME_COLORS.TEXT_SECONDARY,
    borderBottom: `1px solid ${THEME_COLORS.BORDER_LIGHT}`,
  },
  
  /** 可編輯行 - 用於表格中正在編輯的行 */
  editableRow: {
    bgcolor: THEME_COLORS.BACKGROUND_PRIMARY,
    border: `1px solid ${THEME_COLORS.PRIMARY}`,
    borderLeft: `4px solid ${THEME_COLORS.PRIMARY}`, // 左側強調邊框
  },
  
  // ===================================
  // 🔍 搜尋相關樣式 (Search Styles)
  // ===================================
  
  /** 搜尋框 - 用於搜尋功能的輸入框 */
  searchBox: {
    color: THEME_COLORS.TEXT_MUTED,
    borderColor: THEME_COLORS.BORDER_DEFAULT,
    '&:hover': {
      borderColor: THEME_COLORS.PRIMARY_HOVER,
      bgcolor: THEME_COLORS.BACKGROUND_PRIMARY,
    },
  },
  
  // ===================================
  // 🏷️ 狀態標籤樣式 (Status Chip Styles)
  // ===================================
  // 用於顯示不同狀態的彩色標籤
  
  /** 狀態標籤顏色配置 */
  // 🔍 重點：每種狀態都有對應的背景色和文字色
  statusChip: {
    pending: { 
      bg: '#fff3e0', 
      color: '#ef6c00' 
    },
    approved: { 
      bg: THEME_COLORS.SUCCESS_LIGHT, 
      color: THEME_COLORS.SUCCESS 
    },
    rejected: { 
      bg: THEME_COLORS.ERROR_LIGHT, 
      color: THEME_COLORS.ERROR 
    },
    completed: { 
      bg: '#f3e5f5', 
      color: '#7b1fa2' 
    },
    collected: { 
      bg: '#e8f5e8', 
      color: '#2e7d32' 
    },
    pending_super: { 
      bg: '#fff3e0', 
      color: '#f57c00' 
    },
    upcoming: { 
      bg: '#e3f2fd', 
      color: '#1976d2' 
    },
    ongoing: { 
      bg: THEME_COLORS.SUCCESS_LIGHT, 
      color: THEME_COLORS.SUCCESS 
    },
    cancelled: { 
      bg: THEME_COLORS.ERROR_LIGHT, 
      color: THEME_COLORS.ERROR 
    },
    default: { 
      bg: THEME_COLORS.BACKGROUND_SECONDARY, 
      color: THEME_COLORS.TEXT_MUTED 
    },
  },
  
  // ===================================
  // 👤 用戶界面元素 (UI Elements)
  // ===================================
  
  /** 默認頭像 - 用於沒有照片時的頭像顯示 */
  defaultAvatar: {
    bgcolor: THEME_COLORS.BACKGROUND_SECONDARY,
    color: THEME_COLORS.TEXT_MUTED,
  },

  /** 照片上傳區域 - 用於照片上傳功能的容器 */
  photoUploadSection: {
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    pb: { xs: 2, sm: 3 },
    mb: { xs: 2, sm: 3 },
    borderBottom: `1px solid ${THEME_COLORS.BORDER_LIGHT}`,
  },

  // ===================================
  // 🃏 卡片樣式 (Card Styles)
  // ===================================
  // 用於統計卡片和信息展示卡片
  
  /** 統計卡片 - 用於儀表板的統計數據顯示 */
  // 🔍 重點：包含 hover 動畫效果，提升用戶體驗
  statsCard: {
    borderRadius: 2,
    p: 3,
    border: `1px solid ${THEME_COLORS.BORDER_LIGHT}`,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      transform: 'translateY(-2px)', // 向上浮動效果
    },
  },
  
  /** 卡片標題 - 用於卡片頂部的標題文字 */
  cardTitle: {
    fontWeight: 600,
    color: THEME_COLORS.TEXT_PRIMARY,
    mb: 1,
  },
  
  /** 卡片數值 - 用於顯示統計數字 */
  cardValue: {
    fontSize: '2rem',
    fontWeight: 700,
    color: THEME_COLORS.TEXT_PRIMARY,
  },
  
  /** 卡片標籤 - 用於卡片中的描述文字 */
  cardLabel: {
    fontSize: '0.875rem',
    color: THEME_COLORS.TEXT_MUTED,
  },

  // ===================================
  // 🎨 界面元素 (Interface Elements)
  // ===================================
  
  /** 分隔線文字 - 用於分隔內容的文字樣式 */
  separatorText: {
    color: THEME_COLORS.TEXT_MUTED,
  },
  
  /** 分頁標籤 - 用於 Tab 組件的樣式 */
  // 🔍 重點：包含選中狀態和 hover 效果
  tabPanel: {
    fontSize: '1rem',
    fontWeight: 500,
    color: THEME_COLORS.TEXT_MUTED,
    minHeight: 48,
    '&.Mui-selected': {
      backgroundColor: THEME_COLORS.PRIMARY,
      color: 'white',
    },
    '&:hover': {
      color: `${THEME_COLORS.PRIMARY} !important`,
      fontWeight: 600,
    },
    border: 'none',
    borderColor: THEME_COLORS.BORDER_LIGHT,
  },
  
  // ===================================
  // 📏 間距系統 (Spacing System)
  // ===================================
  // 統一的間距規範，確保布局一致性
  
  /** 響應式間距配置 */
  // 🔍 重點：提供不同層級的間距選項
  spacing: {
    section: { mb: 4 },     // 大區塊間距
    subsection: { mb: 3 },  // 子區塊間距
    element: { mb: 2 },     // 元素間距
    small: { mb: 1 },       // 小間距
  },
  
  // ===================================
  // 🎬 動畫效果 (Animation Effects)
  // ===================================
  // 提升用戶體驗的動畫效果
  
  /** 預定義動畫效果 */
  // 🔍 重點：對應 global.css 中定義的 @keyframes
  animations: {
    fadeIn: {
      animation: 'fadeInScale 0.3s ease-out',
    },
    slideIn: {
      animation: 'slideInRight 0.3s ease-out',
    },
    expandEdit: {
      animation: 'expandEditRow 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },

  // ===================================
  // 💬 對話框樣式 (Dialog Styles)
  // ===================================
  // 統一的對話框樣式，提供一致的用戶體驗
  
  /** 基礎對話框容器 */
  dialogContainer: {
    minHeight: '500px',
    borderRadius: 2,
  },
  
  /** 對話框標題 */
  dialogTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    pb: 1,
    fontWeight: 600,
    color: THEME_COLORS.TEXT_PRIMARY,
  },
  
  /** 對話框內容區域 */
  dialogContent: {
    pt: 2,
  },
  
  /** 對話框操作區域 */
  dialogActions: {
    p: 2,
    gap: 1,
    justifyContent: 'flex-end',
  },
  
  /** 比較對話框樣式 - 用於 AI 優化等比較功能 */
  comparisonDialog: {
    container: {
      minHeight: '500px',
      borderRadius: 2,
    },
    title: {
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      pb: 1,
      fontWeight: 600,
      color: THEME_COLORS.TEXT_PRIMARY,
    },
    content: {
      pt: 2,
    },
    actions: {
      p: 2,
      gap: 1,
      justifyContent: 'flex-end',
    },
    // 統計資訊區域
    statsContainer: {
      display: 'flex',
      gap: 2,
      mb: 3,
      flexWrap: 'wrap',
    },
    // 文字比較區域
    textComparison: {
      original: {
        container: {
          mb: 3,
        },
        title: {
          color: 'text.secondary',
          fontWeight: 600,
          mb: 1,
        },
        content: {
          p: 2,
          backgroundColor: 'grey.50',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'grey.200',
        },
        text: {
          whiteSpace: 'pre-wrap',
          lineHeight: 1.6,
        },
      },
      optimized: {
        container: {
          // 繼承 original 的 container 樣式
        },
        title: {
          color: THEME_COLORS.PRIMARY,
          fontWeight: 600,
          mb: 1,
        },
        content: {
          p: 2,
          backgroundColor: THEME_COLORS.PRIMARY_LIGHT_BG,
          borderRadius: 1,
          border: '1px solid',
          borderColor: THEME_COLORS.PRIMARY,
        },
        text: {
          whiteSpace: 'pre-wrap',
          lineHeight: 1.6,
        },
      },
    },
    // 分隔線
    divider: {
      my: 2,
    },
  },
  
  /** 確認對話框樣式 - 用於刪除確認等操作 */
  confirmDialog: {
    container: {
      borderRadius: 2,
    },
    title: {
      fontWeight: 600,
      color: THEME_COLORS.TEXT_PRIMARY,
      textAlign: 'center',
      pb: 1,
    },
    content: {
      pt: 1,
    },
    contentText: {
      mb: 2,
      textAlign: 'center',
      color: THEME_COLORS.TEXT_SECONDARY,
    },
    actions: {
      px: 3,
      pb: 3,
      gap: 1,
      justifyContent: 'center',
    },
  },
  
  /** 錯誤對話框樣式 - 用於錯誤訊息顯示 */
  errorDialog: {
    container: {
      borderRadius: 2,
    },
    title: {
      fontWeight: 600,
      color: THEME_COLORS.ERROR,
      display: 'flex',
      alignItems: 'center',
      gap: 1,
    },
    content: {
      pt: 1,
    },
    contentText: {
      mb: 1,
      color: THEME_COLORS.TEXT_SECONDARY,
    },
    actions: {
      px: 2,
      pb: 2,
      gap: 1,
      justifyContent: 'center',
    },
  },
  
  /** 資訊對話框樣式 - 用於一般資訊顯示 */
  infoDialog: {
    container: {
      borderRadius: 2,
    },
    title: {
      fontWeight: 600,
      color: THEME_COLORS.PRIMARY,
      display: 'flex',
      alignItems: 'center',
      gap: 1,
    },
    content: {
      pt: 2,
    },
    contentText: {
      mb: 2,
      color: THEME_COLORS.TEXT_SECONDARY,
    },
    actions: {
      p: 2,
      gap: 1,
      justifyContent: 'flex-end',
    },
  },
};

// ===================================
// 🔧 輔助函數 (Helper Functions)
// ===================================

/**
 * 狀態樣式獲取函數
 * @param status 狀態字符串
 * @returns 對應的狀態樣式
 */
export const getStatusStyle = (status: string) => {
  return commonStyles.statusChip[status as keyof typeof commonStyles.statusChip] || 
         commonStyles.statusChip.default;
};

/**
 * 表單驗證樣式函數 - TextField 專用
 * 🔍 重點：只處理錯誤狀態，正常樣式由全局主題提供
 * @param hasError 是否有錯誤
 * @returns 驗證樣式對象
 */
export const getValidationStyle = (hasError: boolean) => ({
  ...commonStyles.formInput,
  ...(hasError && {
    '& fieldset': { 
      borderColor: THEME_COLORS.ERROR 
    },
    '&:hover fieldset': { 
      borderColor: THEME_COLORS.ERROR_DARK 
    },
    '&.Mui-focused fieldset': { 
      borderColor: THEME_COLORS.ERROR 
    },
  }),
});

/**
 * Select 組件驗證樣式函數
 * 🔍 重點：包含多層選擇器確保樣式生效
 * @param hasError 是否有錯誤
 * @returns Select 驗證樣式對象
 */
export const getSelectValidationStyle = (hasError: boolean) => ({
  ...commonStyles.formSelect,
  ...(hasError && {
    '& .MuiOutlinedInput-root': {
      '& fieldset': { 
        borderColor: THEME_COLORS.ERROR 
      },
      '&:hover fieldset': { 
        borderColor: `${THEME_COLORS.ERROR_DARK} !important` 
      },
      '&.Mui-focused fieldset': { 
        borderColor: `${THEME_COLORS.ERROR} !important` 
      },
    },
    // 額外的選擇器覆蓋，確保樣式生效
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: `${THEME_COLORS.ERROR_DARK} !important`,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: `${THEME_COLORS.ERROR} !important`,
    },
  }),
});

/**
 * 日期選擇器驗證樣式函數
 * 🔍 重點：包含光暈效果和輔助文字樣式
 * @param hasError 是否有錯誤
 * @returns 日期選擇器驗證樣式對象
 */
export const getDatePickerValidationStyle = (hasError: boolean) => ({
  ...commonStyles.formDatePicker,
  ...(hasError && {
    '& fieldset': { 
      borderColor: THEME_COLORS.ERROR 
    },
    '&:hover fieldset': { 
      borderColor: THEME_COLORS.ERROR_DARK 
    },
    '&.Mui-focused fieldset': { 
      borderColor: THEME_COLORS.ERROR 
    },
    // 輔助文字在錯誤狀態時的樣式
    '& .MuiFormHelperText-root': {
      color: THEME_COLORS.ERROR,
      fontSize: '0.75rem',
      fontStyle: 'italic',
      marginLeft: 0,
      marginTop: '6px',
    },
    // 錯誤狀態時的光暈效果
    '&.Mui-focused': {
      boxShadow: `0 0 0 2px ${THEME_COLORS.ERROR}20`,
    },
  }),
});

/**
 * 響應式間距輔助函數
 * 🔍 重點：根據螢幕尺寸自動調整間距大小
 * @param size 間距大小等級
 * @returns 響應式間距對象
 */
export const getResponsiveSpacing = (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl') => {
  const spacingMap = {
    xs: { xs: 1, sm: 1, md: 2 },   // 最小間距
    sm: { xs: 1, sm: 2, md: 2 },   // 小間距
    md: { xs: 2, sm: 2, md: 3 },   // 中等間距
    lg: { xs: 2, sm: 3, md: 4 },   // 大間距
    xl: { xs: 3, sm: 4, md: 5 },   // 最大間距
  };
  return spacingMap[size];
};

// ===================================
// 🔘 按鈕組件 (Button Components)
// ===================================

/**
 * 按鈕類型定義
 */
export type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'danger' 
  | 'approve' 
  | 'reject' 
  | 'upload' 
  | 'remove';

/**
 * 根據按鈕類型獲取對應的樣式
 * @param variant 按鈕類型
 * @returns 對應的樣式對象
 */
export const getButtonStyle = (variant: ButtonVariant) => {
  switch (variant) {
    case 'primary':
      return commonStyles.primaryButton;
    case 'secondary':
      return commonStyles.secondaryButton;
    case 'danger':
      return commonStyles.dangerButton;
    case 'approve':
      return commonStyles.approveButton;
    case 'reject':
      return commonStyles.rejectButton;
    case 'upload':
      return commonStyles.uploadButton;
    case 'remove':
      return commonStyles.removeButton;
    default:
      return commonStyles.primaryButton;
  }
};

/**
 * 根據按鈕類型獲取對應的 Material-UI variant
 * @param variant 按鈕類型
 * @returns Material-UI variant
 */
export const getButtonVariant = (variant: ButtonVariant): 'contained' | 'outlined' | 'text' => {
  switch (variant) {
    case 'primary':
    case 'danger':
    case 'approve':
    case 'reject':
      return 'contained';
    case 'secondary':
    case 'upload':
    case 'remove':
      return 'outlined';
    default:
      return 'contained';
  }
};

// ===================================
// 💬 對話框輔助函數 (Dialog Helper Functions)
// ===================================

/**
 * 對話框類型定義
 */
export type DialogType = 'comparison' | 'confirm' | 'error' | 'info';

/**
 * 根據對話框類型獲取對應的樣式
 * @param type 對話框類型
 * @returns 對應的樣式對象
 */
export const getDialogStyle = (type: DialogType) => {
  switch (type) {
    case 'comparison':
      return commonStyles.comparisonDialog;
    case 'confirm':
      return commonStyles.confirmDialog;
    case 'error':
      return commonStyles.errorDialog;
    case 'info':
      return commonStyles.infoDialog;
    default:
      return commonStyles.infoDialog;
  }
};

/**
 * 獲取對話框 PaperProps 樣式
 * @param type 對話框類型
 * @returns PaperProps 樣式對象
 */
export const getDialogPaperProps = (type: DialogType) => ({
  sx: getDialogStyle(type).container
});

/**
 * 獲取對話框標題樣式
 * @param type 對話框類型
 * @returns 標題樣式對象
 */
export const getDialogTitleStyle = (type: DialogType) => ({
  sx: getDialogStyle(type).title
});

/**
 * 獲取對話框內容樣式
 * @param type 對話框類型
 * @returns 內容樣式對象
 */
export const getDialogContentStyle = (type: DialogType) => ({
  sx: getDialogStyle(type).content
});

/**
 * 獲取對話框操作區域樣式
 * @param type 對話框類型
 * @returns 操作區域樣式對象
 */
export const getDialogActionsStyle = (type: DialogType) => ({
  sx: getDialogStyle(type).actions
});

export default commonStyles; 