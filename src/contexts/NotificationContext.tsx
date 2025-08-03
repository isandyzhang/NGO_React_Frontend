import React, { createContext, useContext, useCallback } from 'react';
import { useNotificationStatus } from '../hooks/useNotificationStatus';

interface NotificationContextType {
  counts: {
    pendingSupplyRequests: number;
    pendingSuperApproval: number;
    pendingBatchApproval: number;
    totalPending: number;
  };
  loading: boolean;
  refreshNotifications: () => void;
  hasSupplyNotifications: boolean;
  hasDistributionNotifications: boolean;
  hasTotalNotifications: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const notificationStatus = useNotificationStatus();

  const value: NotificationContextType = {
    ...notificationStatus,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    // 如果在NotificationProvider外部使用，拋出錯誤而不是回退
    // 因為這通常表示組件結構有問題
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;