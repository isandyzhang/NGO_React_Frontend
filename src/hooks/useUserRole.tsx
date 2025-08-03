import { useState, useEffect } from 'react';
import { authService } from '../services/accountManagement/authService';

export interface UserRole {
  isStaff: boolean;
  isSupervisor: boolean;
  workerId: number | null;
  workerName: string | null;
}

export const useUserRole = (): UserRole => {
  const [userRole, setUserRole] = useState<UserRole>({
    isStaff: false,
    isSupervisor: false,
    workerId: null,
    workerName: null,
  });

  useEffect(() => {
    const checkUserRole = () => {
      const currentWorker = authService.getCurrentWorker();
      
      if (currentWorker) {
        // 假設 role 欄位存在於 worker 資料中
        // 您可以根據實際的角色判斷邏輯調整
        const role = currentWorker.role || 'staff'; // 預設為 staff
        
        setUserRole({
          isStaff: role === 'staff' || role === 'supervisor',
          isSupervisor: role === 'supervisor',
          workerId: currentWorker.workerId,
          workerName: currentWorker.name,
        });
      } else {
        setUserRole({
          isStaff: false,
          isSupervisor: false,
          workerId: null,
          workerName: null,
        });
      }
    };

    checkUserRole();
  }, []);

  return userRole;
}; 