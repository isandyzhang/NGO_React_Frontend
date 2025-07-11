/**
 * 表單驗證工具函數
 * 提供統一的驗證功能，避免重複代碼
 */

/**
 * 驗證台灣身分證字號格式
 * @param idNumber - 身分證字號
 * @returns 是否有效
 */
export const validateIdNumber = (idNumber: string): boolean => {
  if (!idNumber) return false;
  const idRegex = /^[A-Z][0-9]{9}$/;
  return idRegex.test(idNumber);
};

/**
 * 驗證台灣手機號碼格式
 * @param phone - 手機號碼
 * @returns 是否有效
 */
export const validatePhone = (phone: string): boolean => {
  if (!phone) return false;
  const phoneRegex = /^09[0-9]{8}$/;
  return phoneRegex.test(phone);
};

/**
 * 驗證Email格式
 * @param email - Email地址
 * @returns 是否有效
 */
export const validateEmail = (email: string): boolean => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 驗證必填欄位
 * @param value - 欄位值
 * @returns 是否有效（非空）
 */
export const validateRequired = (value: string | null | undefined): boolean => {
  return value !== null && value !== undefined && value.trim() !== '';
};

/**
 * 驗證字串長度
 * @param value - 要驗證的字串
 * @param minLength - 最小長度
 * @param maxLength - 最大長度
 * @returns 是否有效
 */
export const validateLength = (
  value: string, 
  minLength: number = 0, 
  maxLength: number = Infinity
): boolean => {
  if (!value) return minLength === 0;
  return value.length >= minLength && value.length <= maxLength;
};

/**
 * 驗證數字範圍
 * @param value - 數字值
 * @param min - 最小值
 * @param max - 最大值
 * @returns 是否有效
 */
export const validateNumberRange = (
  value: number, 
  min: number = -Infinity, 
  max: number = Infinity
): boolean => {
  return !isNaN(value) && value >= min && value <= max;
};

/**
 * 驗證日期
 * @param date - 日期對象或字串
 * @returns 是否為有效日期
 */
export const validateDate = (date: Date | string | null | undefined): boolean => {
  if (!date) return false;
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return !isNaN(dateObj.getTime());
};

/**
 * 組合驗證結果
 * @param validations - 驗證函數陣列
 * @returns 所有驗證是否都通過
 */
export const validateAll = (...validations: boolean[]): boolean => {
  return validations.every(validation => validation === true);
};

/**
 * 驗證錯誤訊息對應
 */
export const ValidationMessages = {
  required: '此欄位為必填',
  invalidIdNumber: '請輸入有效的身分證字號格式（例：A123456789）',
  invalidPhone: '請輸入有效的手機號碼格式（例：0912345678）',
  invalidEmail: '請輸入有效的Email格式',
  invalidDate: '請選擇有效的日期',
  tooShort: (min: number) => `最少需要 ${min} 個字元`,
  tooLong: (max: number) => `最多只能 ${max} 個字元`,
  outOfRange: (min: number, max: number) => `數值必須在 ${min} 到 ${max} 之間`,
} as const; 