import { authService, WorkerInfo } from './authService';
import { api } from './api';

/**
 * 權限角色類型
 */
export type UserRole = 'staff' | 'supervisor' | 'admin';

/**
 * 權限操作類型
 */
export type PermissionAction = 'view' | 'approve' | 'reject' | 'distribute' | 'supervise';

/**
 * 擴展的工作人員資訊（包含權限）
 */
export interface ExtendedWorkerInfo extends WorkerInfo {
  role: UserRole;
  assignedCases: number[];
  permissions: string[];
}

/**
 * 權限檢查結果
 */
export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
}

/**
 * 權限服務類
 */
class PermissionService {
  private currentUser: ExtendedWorkerInfo | null = null;

  /**
   * 初始化權限服務
   */
  async initialize(): Promise<void> {
    try {
      const basicWorker = authService.getCurrentWorker();
      
      if (!basicWorker) {
        this.currentUser = null;
        return;
      }

      // 從後端獲取完整的用戶權限資訊
      // 暫時使用模擬數據，後續可以從後端 API 獲取
      this.currentUser = await this.loadUserPermissions(basicWorker);
    } catch (error) {
      console.error('初始化權限服務失敗:', error);
      this.currentUser = null;
    }
  }

  /**
   * 載入用戶權限資訊（整合後端 API）
   */
  private async loadUserPermissions(basicWorker: WorkerInfo): Promise<ExtendedWorkerInfo> {
    try {
      // 從後端 API 獲取用戶的可存取案例列表
      // 這裡可以調用後端 API 獲取真實的權限資訊
      
      // 根據後端返回的角色資訊設定權限
      let role: UserRole;
      
      // 角色字串標準化處理
      const normalizedRole = basicWorker.role?.toLowerCase();
      switch (normalizedRole) {
        case 'staff':
          role = 'staff';
          break;
        case 'supervisor':
          role = 'supervisor';
          break;
        case 'admin':
          role = 'admin';
          break;
        default:
          console.warn('⚠️ 未知的角色類型，設定為 staff:', basicWorker.role);
          role = 'staff';
      }
      
      // 模擬從後端獲取可存取的案例 ID
      // 在真實環境中，這裡會調用後端 API
      const mockAssignedCases = await this.getMockAssignedCases(basicWorker.workerId, role);
      
      // 根據角色設定權限
      const permissions = this.getPermissionsByRole(role);
      
      return {
        ...basicWorker,
        role,
        assignedCases: mockAssignedCases,
        permissions
      };
    } catch (error) {
      console.error('載入用戶權限資訊失敗:', error);
      
      // 失敗時返回預設權限
      return {
        ...basicWorker,
        role: 'staff',
        assignedCases: [],
        permissions: ['view']
      };
    }
  }

  /**
   * 模擬獲取可存取的案例列表
   */
  private async getMockAssignedCases(workerId: number, role: UserRole): Promise<number[]> {
    // 在真實環境中，這裡會調用後端 API
    // 例如： await api.get(`/Worker/${workerId}/accessible-cases`)
    
    // 管理員和主管都可以存取所有案例（單一公司環境）
    if (role === 'admin' || role === 'supervisor') {
      return [1, 2, 3, 4, 5, 6];
    }
    
    // 根據 workerId 模擬不同的案例分配
    const mockCaseAssignments: { [key: number]: number[] } = {
      1: [1, 2, 3], // 員工A管理 1,2,3 號案例
      2: [4, 5, 6], // 員工B管理 4,5,6 號案例
      3: [1, 2, 3, 4, 5, 6], // 主管管理所有案例
    };
    
    return mockCaseAssignments[workerId] || [];
  }

  /**
   * 根據角色獲取權限列表
   */
  private getPermissionsByRole(role: UserRole): string[] {
    switch (role) {
      case 'admin':
        return ['view', 'approve', 'reject', 'distribute', 'supervise'];
      case 'supervisor':
        return ['view', 'approve', 'reject', 'distribute', 'supervise'];
      case 'staff':
        return ['view', 'approve', 'reject'];
      default:
        return ['view'];
    }
  }

  /**
   * 獲取當前用戶資訊
   */
  getCurrentUser(): ExtendedWorkerInfo | null {
    return this.currentUser;
  }

  /**
   * 獲取當前用戶角色
   */
  getCurrentUserRole(): UserRole | null {
    return this.currentUser?.role || null;
  }


  /**
   * 檢查用戶是否可以查看特定案例
   */
  canViewCase(caseId: number): PermissionCheckResult {
    if (!this.currentUser) {
      return { allowed: false, reason: '用戶未登入' };
    }

    const userRole = this.getCurrentUserRole();
    
    // 管理員和主管都可以查看所有案例（單一公司環境）
    if (userRole === 'admin' || userRole === 'supervisor') {
      return { allowed: true };
    }

    // 員工只能查看指派給他們的案例
    if (userRole === 'staff') {
      if (this.currentUser.assignedCases.includes(caseId)) {
        return { allowed: true };
      }
      return { allowed: false, reason: '您無權查看此案例' };
    }

    return { allowed: false, reason: '未知的用戶角色' };
  }

  /**
   * 檢查用戶是否可以對特定案例執行操作
   */
  canPerformAction(action: PermissionAction, caseId?: number): PermissionCheckResult {
    if (!this.currentUser) {
      return { allowed: false, reason: '用戶未登入' };
    }

    const userRole = this.getCurrentUserRole();
    
    // 檢查用戶是否有該操作的權限
    if (!this.currentUser.permissions.includes(action)) {
      return { allowed: false, reason: `您沒有 ${action} 權限` };
    }

    // 如果涉及特定案例，檢查案例存取權限
    if (caseId !== undefined) {
      const caseViewResult = this.canViewCase(caseId);
      if (!caseViewResult.allowed) {
        return caseViewResult;
      }
    }

    // 根據操作類型進行進一步檢查
    switch (action) {
      case 'supervise':
        if (userRole !== 'supervisor' && userRole !== 'admin') {
          return { allowed: false, reason: '僅主管和管理員可以執行審核操作' };
        }
        break;
      
      case 'distribute':
        if (userRole !== 'supervisor' && userRole !== 'admin') {
          return { allowed: false, reason: '僅主管和管理員可以執行分發操作' };
        }
        break;
    }

    return { allowed: true };
  }

  /**
   * 過濾用戶可以查看的資料
   */
  filterDataByPermission<T extends { caseId?: number }>(data: T[]): T[] {
    if (!this.currentUser) {
      return [];
    }

    const userRole = this.getCurrentUserRole();
    
    // 管理員和主管都可以查看所有資料（單一公司環境）
    if (userRole === 'admin' || userRole === 'supervisor') {
      return data;
    }

    // 過濾用戶可以查看的資料
    return data.filter(item => {
      if (item.caseId === undefined) {
        return true; // 如果沒有 caseId，假設可以查看
      }
      
      const checkResult = this.canViewCase(item.caseId);
      return checkResult.allowed;
    });
  }

  /**
   * 獲取用戶負責的案例列表
   */
  getAssignedCases(): number[] {
    return this.currentUser?.assignedCases || [];
  }

}

// 創建權限服務實例
export const permissionService = new PermissionService();

// 導出權限檢查的便利函數
export const checkPermission = (action: PermissionAction, caseId?: number): PermissionCheckResult => {
  return permissionService.canPerformAction(action, caseId);
};

export const canViewCase = (caseId: number): boolean => {
  return permissionService.canViewCase(caseId).allowed;
};

export const filterByPermission = <T extends { caseId?: number }>(data: T[]): T[] => {
  return permissionService.filterDataByPermission(data);
};

export default permissionService;