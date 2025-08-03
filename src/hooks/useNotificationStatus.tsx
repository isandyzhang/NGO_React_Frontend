import { useState, useEffect } from 'react';
import { supplyService, distributionBatchService } from '../services';
import { useAuth } from './useAuth';

interface NotificationCounts {
  pendingSupplyRequests: number;
  pendingSuperApproval: number;
  pendingBatchApproval: number;
  totalPending: number;
}

export const useNotificationStatus = () => {
  const { user, isAuthenticated } = useAuth();
  const [counts, setCounts] = useState<NotificationCounts>({
    pendingSupplyRequests: 0,
    pendingSuperApproval: 0,
    pendingBatchApproval: 0,
    totalPending: 0
  });
  const [loading, setLoading] = useState(false);

  const loadNotificationCounts = async () => {
    // 如果用戶未登入，不執行API調用
    if (!isAuthenticated || !user) {
      setCounts({
        pendingSupplyRequests: 0,
        pendingSuperApproval: 0,
        pendingBatchApproval: 0,
        totalPending: 0
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // 根據用戶角色決定是否傳遞workerId
      const userRole = user?.role as 'staff' | 'supervisor' | 'admin' || 'staff';
      const workerId = (userRole === 'staff' && user?.workerId) ? user.workerId : undefined;

      const [
        regularSupplyNeeds,
        distributionBatches
      ] = await Promise.all([
        supplyService.getRegularSuppliesNeeds(workerId),
        distributionBatchService.getDistributionBatches(workerId)
      ]);

      // 計算待審核的物資申請
      const pendingRequests = regularSupplyNeeds.filter(need => need.status === 'pending').length;
      
      // 計算等待主管審核的申請
      const pendingSuperRequests = regularSupplyNeeds.filter(need => need.status === 'pending_super').length;
      
      // 計算等待批准的分發批次 (只有主管和管理員可以看到)
      const pendingBatches = (userRole === 'supervisor' || userRole === 'admin') 
        ? distributionBatches.filter(batch => batch.status === 'pending').length 
        : 0;

      const newCounts = {
        pendingSupplyRequests: pendingRequests,
        pendingSuperApproval: pendingSuperRequests,
        pendingBatchApproval: pendingBatches,
        totalPending: pendingRequests + pendingSuperRequests + pendingBatches
      };

      setCounts(newCounts);
    } catch (error) {
      console.error('載入通知狀態失敗:', error);
      // 發生錯誤時重置為初始狀態
      setCounts({
        pendingSupplyRequests: 0,
        pendingSuperApproval: 0,
        pendingBatchApproval: 0,
        totalPending: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotificationCounts();
  }, [user, isAuthenticated]);

  // 提供刷新功能，讓其他組件可以手動更新通知狀態
  const refreshNotifications = () => {
    loadNotificationCounts();
  };

  return {
    counts,
    loading,
    refreshNotifications,
    // 便捷的判斷方法
    hasSupplyNotifications: counts.pendingSupplyRequests > 0 || counts.pendingSuperApproval > 0,
    hasDistributionNotifications: counts.pendingBatchApproval > 0,
    hasTotalNotifications: counts.totalPending > 0
  };
};

export default useNotificationStatus;