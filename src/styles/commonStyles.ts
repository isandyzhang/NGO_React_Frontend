import { THEME_COLORS } from './theme';

/**
 * 共用樣式定義
 * 
 * 這個檔案包含了整個應用程式中常用的樣式模式，
 * 幫助保持樣式的一致性並減少重複代碼。
 */

export const commonStyles = {
  // 表單相關樣式
  formSection: {
    bgcolor: THEME_COLORS.BACKGROUND_CARD,
    borderRadius: 2,
    p: 3,
    mb: 3,
    border: `1px solid ${THEME_COLORS.BORDER_LIGHT}`,
  },
  
  formHeader: {
    fontWeight: 600,
    color: THEME_COLORS.TEXT_PRIMARY,
    mb: 2,
  },
  
  formLabel: {
    mb: 1,
    color: THEME_COLORS.TEXT_SECONDARY,
    fontWeight: 500,
  },
  
  // 表單輸入框樣式 - 邊框樣式由全局主題提供，這裡只定義額外樣式
  formInput: {
    bgcolor: THEME_COLORS.BACKGROUND_PRIMARY,
  },
  
  // Select 組件專用樣式 - 邊框樣式由全局主題提供，這裡只定義額外樣式  
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
  
  // 日期選擇器專用樣式
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
    // 日期選擇器圖示樣式
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
    // Focus 狀態增強
    '&.Mui-focused': {
      boxShadow: `0 0 0 2px ${THEME_COLORS.PRIMARY}20`, // 20% 透明度的主色光暈
    },
  },
  
  // 按鈕樣式
  primaryButton: {
    bgcolor: THEME_COLORS.PRIMARY,
    color: 'white !important',
    fontSize: '1rem',
    fontWeight: 600,
    '&:hover': {
      bgcolor: THEME_COLORS.PRIMARY_DARK,
      color: 'white !important',
    },
    '&:disabled': {
      bgcolor: THEME_COLORS.DISABLED_BG,
      color: THEME_COLORS.DISABLED_TEXT,
    },
  },

  uploadButton: {
    color: THEME_COLORS.PRIMARY,
    borderColor: THEME_COLORS.PRIMARY,
    '&:hover': {
      borderColor: THEME_COLORS.PRIMARY_HOVER,
      bgcolor: THEME_COLORS.PRIMARY_TRANSPARENT,
    },
  },

  removeButton: {
    color: THEME_COLORS.TEXT_MUTED,
    textTransform: 'lowercase',
    minWidth: 'auto',
    px: 1,
    '&:hover': {
      color: THEME_COLORS.TEXT_SECONDARY,
      bgcolor: THEME_COLORS.BACKGROUND_SECONDARY,
    },
  },
  
  dangerButton: {
    bgcolor: THEME_COLORS.ERROR,
    color: 'white !important',
    fontSize: '1rem',
    fontWeight: 600,
    '&:hover': {
      bgcolor: THEME_COLORS.ERROR_DARK,
      color: 'white !important',
    },
  },
  
  secondaryButton: {
    bgcolor: 'transparent',
    color: THEME_COLORS.TEXT_MUTED,
    border: `1px solid ${THEME_COLORS.BORDER_DEFAULT}`,
    '&:hover': {
      bgcolor: THEME_COLORS.BACKGROUND_SECONDARY,
      borderColor: THEME_COLORS.PRIMARY_DARK,
    },
  },
  
  // 表格樣式
  tableHeader: {
    bgcolor: THEME_COLORS.BACKGROUND_PRIMARY,
    fontWeight: 600,
    color: THEME_COLORS.TEXT_SECONDARY,
    borderBottom: `2px solid ${THEME_COLORS.BORDER_LIGHT}`,
  },
  
  tableCell: {
    color: THEME_COLORS.TEXT_SECONDARY,
    borderBottom: `1px solid ${THEME_COLORS.BORDER_LIGHT}`,
  },
  
  editableRow: {
    bgcolor: THEME_COLORS.BACKGROUND_PRIMARY,
    border: `1px solid ${THEME_COLORS.PRIMARY}`,
    borderLeft: `4px solid ${THEME_COLORS.PRIMARY}`,
  },
  
  // 搜尋框樣式
  searchBox: {
    color: THEME_COLORS.TEXT_MUTED,
    borderColor: THEME_COLORS.BORDER_DEFAULT,
    '&:hover': {
      borderColor: THEME_COLORS.PRIMARY_HOVER,
      bgcolor: THEME_COLORS.BACKGROUND_PRIMARY,
    },
  },
  
  // 狀態標籤樣式
  statusChip: {
    upcoming: { 
      bg: '#e3f2fd', 
      color: '#1976d2' 
    },
    ongoing: { 
      bg: THEME_COLORS.SUCCESS_LIGHT, 
      color: THEME_COLORS.SUCCESS 
    },
    completed: { 
      bg: '#f3e5f5', 
      color: '#7b1fa2' 
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
  
  // 頭像樣式
  defaultAvatar: {
    bgcolor: THEME_COLORS.BACKGROUND_SECONDARY,
    color: THEME_COLORS.TEXT_MUTED,
  },

  // 照片上傳區域樣式
  photoUploadSection: {
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    pb: { xs: 2, sm: 3 },
    mb: { xs: 2, sm: 3 },
    borderBottom: `1px solid ${THEME_COLORS.BORDER_LIGHT}`,
  },

  // 卡片樣式
  statsCard: {
    borderRadius: 2,
    p: 3,
    border: `1px solid ${THEME_COLORS.BORDER_LIGHT}`,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      transform: 'translateY(-2px)',
    },
  },
  
  cardTitle: {
    fontWeight: 600,
    color: THEME_COLORS.TEXT_PRIMARY,
    mb: 1,
  },
  
  cardValue: {
    fontSize: '2rem',
    fontWeight: 700,
    color: THEME_COLORS.TEXT_PRIMARY,
  },
  
  cardLabel: {
    fontSize: '0.875rem',
    color: THEME_COLORS.TEXT_MUTED,
  },

  // 分隔線文字樣式
  separatorText: {
    color: THEME_COLORS.TEXT_MUTED,
  },
  
  // 分頁標籤樣式
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
  
  // 通用間距
  spacing: {
    section: { mb: 4 },
    subsection: { mb: 3 },
    element: { mb: 2 },
    small: { mb: 1 },
  },
  
  // 動畫效果
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
};

/**
 * 狀態相關的樣式輔助函數
 */
export const getStatusStyle = (status: string) => {
  return commonStyles.statusChip[status as keyof typeof commonStyles.statusChip] || 
         commonStyles.statusChip.default;
};

/**
 * 表單驗證樣式 - 只處理錯誤狀態，正常樣式由全局主題提供
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
 * Select 組件表單驗證樣式 - 只處理錯誤狀態，正常樣式由全局主題提供
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
 * 日期選擇器表單驗證樣式 - 只處理錯誤狀態，正常樣式由基礎樣式提供
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
 */
export const getResponsiveSpacing = (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl') => {
  const spacingMap = {
    xs: { xs: 1, sm: 1, md: 2 },
    sm: { xs: 1, sm: 2, md: 2 },
    md: { xs: 2, sm: 2, md: 3 },
    lg: { xs: 2, sm: 3, md: 4 },
    xl: { xs: 3, sm: 4, md: 5 },
  };
  return spacingMap[size];
};

export default commonStyles; 