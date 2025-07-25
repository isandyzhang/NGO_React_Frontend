import { useState, useEffect, useCallback } from 'react';
import registrationService, { PendingRegistrationCount } from '../services/registrationService';

/**
 * 報名審核通知 Hook
 * 用於獲取和管理待審核報名數量的狀態
 */
export const useRegistrationNotification = () => {
  const [counts, setCounts] = useState<PendingRegistrationCount>({
    pendingCaseRegistrations: 0,
    pendingUserRegistrations: 0,
    totalPendingRegistrations: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 獲取待審核報名數量
  const fetchPendingCounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await registrationService.getPendingCount();
      setCounts(data);
      
      console.log('📊 報名審核通知數據更新:', data);
    } catch (err: any) {
      const errorMessage = err.message || '獲取待審核報名數量失敗';
      console.error('❌ 獲取報名審核通知失敗:', err);
      setError(errorMessage);
      
      // 發生錯誤時設為默認值
      setCounts({
        pendingCaseRegistrations: 0,
        pendingUserRegistrations: 0,
        totalPendingRegistrations: 0
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始化載入和定期更新
  useEffect(() => {
    fetchPendingCounts();
    
    // 每30秒自動刷新一次通知數據
    const interval = setInterval(fetchPendingCounts, 30000);
    
    return () => clearInterval(interval);
  }, [fetchPendingCounts]);

  // 手動刷新通知
  const refreshNotifications = useCallback(() => {
    fetchPendingCounts();
  }, [fetchPendingCounts]);

  // 計算各種通知狀態
  const hasRegistrationNotifications = counts.totalPendingRegistrations > 0;
  const hasCaseRegistrationNotifications = counts.pendingCaseRegistrations > 0;
  const hasUserRegistrationNotifications = counts.pendingUserRegistrations > 0;

  return {
    counts,
    loading,
    error,
    refreshNotifications,
    hasRegistrationNotifications,
    hasCaseRegistrationNotifications,
    hasUserRegistrationNotifications
  };
};