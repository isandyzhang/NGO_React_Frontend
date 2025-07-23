/**
 * 日期格式化工具函數
 * 提供統一的日期格式化功能，避免重複代碼
 */

/**
 * 格式化日期為顯示格式 (yyyy-mm-dd)
 * @param dateString - 日期字符串或Date對象
 * @param options - 格式化選項
 * @returns 格式化後的日期字符串
 */
export const formatDate = (
  dateString: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }
): string => {
  if (!dateString) return '';
  
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) return '';
    
    // 使用 yyyy-mm-dd 格式
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('日期格式化失敗:', error);
    return '';
  }
};

/**
 * 格式化日期為中文顯示格式
 * @param dateString - 日期字符串或Date對象
 * @param options - 格式化選項
 * @returns 格式化後的中文日期字符串
 */
export const formatDateChinese = (
  dateString: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): string => {
  if (!dateString) return '';
  
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) return '';
    
    return date.toLocaleDateString('zh-TW', options);
  } catch (error) {
    console.error('日期格式化失敗:', error);
    return '';
  }
};

/**
 * 格式化日期為輸入框格式 (YYYY-MM-DD)
 * @param dateString - 日期字符串或Date對象
 * @returns YYYY-MM-DD 格式的日期字符串
 */
export const formatDateForInput = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return '';
  
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) return '';
    
    // 使用本地時間而不是 UTC 時間，避免時區問題
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('日期格式化失敗:', error);
    return '';
  }
};

/**
 * 格式化日期時間為完整顯示格式
 * @param dateString - 日期字符串或Date對象
 * @returns 格式化後的日期時間字符串
 */
export const formatDateTime = (dateString: string | Date | null | undefined): string => {
  return formatDate(dateString, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * 檢查日期是否為今天
 * @param date - 要檢查的日期
 * @returns 是否為今天
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

/**
 * 檢查日期是否為明天
 * @param date - 要檢查的日期
 * @returns 是否為明天
 */
export const isTomorrow = (date: Date): boolean => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return date.toDateString() === tomorrow.toDateString();
};

/**
 * 獲取相對日期描述
 * @param date - 日期
 * @returns 相對日期描述（今天、明天或格式化日期）
 */
export const getRelativeDateLabel = (date: Date): string => {
  if (isToday(date)) return '今天';
  if (isTomorrow(date)) return '明天';
  return formatDate(date);
}; 