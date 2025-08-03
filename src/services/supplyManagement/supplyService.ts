import { api } from '../shared/api';

/**
 * 物資分類介面
 */
export interface SupplyCategory {
  id: number;
  name: string;
  description?: string;
}

/**
 * 物資項目介面
 */
export interface Supply {
  supplyId: number;
  name: string;
  categoryId: number;
  categoryName?: string;
  currentStock: number;
  unit: string;
  location: string;
  supplier: string;
  cost: number;
  supplyType: 'regular' | 'emergency';
  addedDate: string;
  expiryDate?: string;
  description?: string;
  imageUrl?: string;
  urgencyLevel?: 'high' | 'medium' | 'low';
  lastUsed?: string;
}

/**
 * 常駐物資需求介面
 */
export interface RegularSuppliesNeed {
  needId: number;
  caseId?: number;
  caseName?: string;
  assignedWorkerId?: number; // 管理社工ID
  supplyId?: number;
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  requestedBy: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'collected' | 'pending_super';
  estimatedCost: number;
  deliveryMethod?: '自取' | '宅配';
  pickupDate?: string;
  matched: boolean;
}

/**
 * 緊急物資需求介面 - 匹配後端 EmergencySupplyNeedResponse
 */
export interface EmergencySupplyNeed {
  emergencyNeedId: number;      // 對應後端 EmergencyNeedId
  itemName: string;             // 對應後端 ItemName
  category: string;             // 對應後端 Category
  quantity: number;             // 對應後端 Quantity
  collectedQuantity: number;    // 對應後端 CollectedQuantity
  unit: string;                 // 對應後端 Unit
  requestedBy: string;          // 對應後端 RequestedBy
  requestDate: string;          // 對應後端 RequestDate (DateTime -> string)
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'collected' | 'pending_super';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;          // 對應後端 Description
  imageUrl: string;             // 對應後端 ImageUrl
  caseName: string;             // 對應後端 CaseName
  caseId: string;               // 對應後端 CaseId
  matched: boolean;             // 對應後端 Matched
  emergencyReason: string;      // 對應後端 EmergencyReason
}

/**
 * 常駐物資配對介面
 */
export interface RegularSupplyMatch {
  regularMatchId: number;
  regularNeedId: number;
  supplyId: number;
  matchedByWorkerId: number;
  matchedByWorkerName?: string;
  matchDate: string;
  note?: string;
  status: 'matched' | 'delivered' | 'completed';
}

/**
 * 緊急物資配對介面
 */
export interface EmergencySupplyMatch {
  emergencyMatchId: number;
  emergencyNeedId: number;
  supplyId: number;
  matchedByWorkerId: number;
  matchedByWorkerName?: string;
  matchDate: string;
  note?: string;
  status: 'matched' | 'delivered' | 'completed';
}

/**
 * 個案訂單介面
 */
export interface CaseOrder {
  caseOrderId: number;
  caseId: number;
  caseName?: string;
  supplyId: number;
  supplyName?: string;
  quantity: number;
  orderTime: string;
  status: 'pending' | 'approved' | 'delivered' | 'completed';
}

/**
 * 用戶訂單介面
 */
export interface UserOrder {
  userOrderId: number;
  userId: number;
  userName?: string;
  orderDate: string;
  status: 'pending' | 'approved' | 'delivered' | 'completed';
  totalAmount: number;
}

/**
 * 用戶訂單詳情介面
 */
export interface UserOrderDetail {
  orderDetailId: number;
  userOrderId: number;
  supplyId: number;
  supplyName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

/**
 * 物資管理服務類別
 */
class SupplyService {
  /**
   * 取得所有物資分類
   */
  async getSupplyCategories(): Promise<SupplyCategory[]> {
    try {
      const response = await api.get<SupplyCategory[]>('/Supply/categories');
      return response || [];
    } catch (error: any) {
      // 區分真正的錯誤和空結果
      if (error.response?.status === 404 || error.response?.status === 204) {
        // 404 Not Found 或 204 No Content 表示沒有資料，返回空陣列
        console.log('沒有找到物資分類資料，返回空陣列');
        return [];
      }
      // 其他錯誤（網路錯誤、500錯誤等）才拋出異常
      console.error('取得物資分類失敗:', error);
      throw error;
    }
  }

  /**
   * 取得所有物資
   */
  async getSupplies(): Promise<Supply[]> {
    try {
      const response = await api.get<Supply[]>('/Supply');
      return response || [];
    } catch (error: any) {
      // 區分真正的錯誤和空結果
      if (error.response?.status === 404 || error.response?.status === 204) {
        // 404 Not Found 或 204 No Content 表示沒有資料，返回空陣列
        console.log('沒有找到物資資料，返回空陣列');
        return [];
      }
      // 其他錯誤（網路錯誤、500錯誤等）才拋出異常
      console.error('取得物資列表失敗:', error);
      throw error;
    }
  }

  /**
   * 根據ID取得物資
   */
  async getSupplyById(id: number): Promise<Supply> {
    try {
      const response = await api.get<Supply>(`/Supply/${id}`);
      return response;
    } catch (error) {
      console.error(`取得物資 ${id} 失敗:`, error);
      throw error;
    }
  }

  /**
   * 新增物資
   */
  async createSupply(supplyData: Partial<Supply>): Promise<Supply> {
    try {
      const response = await api.post<Supply>('/Supply', supplyData);
      return response;
    } catch (error) {
      console.error('新增物資失敗:', error);
      throw error;
    }
  }

  /**
   * 更新物資
   */
  async updateSupply(id: number, supplyData: Partial<Supply>): Promise<void> {
    try {
      // 轉換前端字段名到後端字段名，與後端 UpdateSupplyRequest 一致
      const updateData: any = {};
      
      if (supplyData.name !== undefined) updateData.Name = supplyData.name;
      if (supplyData.categoryId !== undefined) updateData.CategoryId = supplyData.categoryId;
      if (supplyData.currentStock !== undefined) updateData.Quantity = supplyData.currentStock;
      if (supplyData.cost !== undefined) updateData.Price = supplyData.cost;
      if (supplyData.description !== undefined) updateData.Description = supplyData.description;
      if (supplyData.supplyType !== undefined) updateData.SupplyType = supplyData.supplyType;
      if (supplyData.imageUrl !== undefined) updateData.ImageUrl = supplyData.imageUrl;
      
      await api.put<void>(`/Supply/${id}`, updateData);
    } catch (error) {
      console.error(`更新物資 ${id} 失敗:`, error);
      throw error;
    }
  }

  /**
   * 刪除物資
   */
  async deleteSupply(id: number): Promise<void> {
    try {
      await api.delete<void>(`/Supply/${id}`);
    } catch (error) {
      console.error(`刪除物資 ${id} 失敗:`, error);
      throw error;
    }
  }

  /**
   * 取得物資統計資料
   */
  async getSupplyStats(): Promise<{
    totalItems: number;
    lowStockItems: number;
    totalValue: number;
  }> {
    try {
      const response = await api.get<{
        totalItems: number;
        lowStockItems: number;
        totalValue: number;
      }>('/Supply/stats');
      return response;
    } catch (error) {
      console.error('取得物資統計失敗:', error);
      throw error;
    }
  }

  /**
   * 取得常駐物資需求
   */
  async getRegularSuppliesNeeds(workerId?: number): Promise<RegularSuppliesNeed[]> {
    try {
      const url = workerId 
        ? `/RegularSuppliesNeed?workerId=${workerId}`
        : '/RegularSuppliesNeed';
      const response = await api.get<RegularSuppliesNeed[]>(url);
      return response || [];
    } catch (error: any) {
      // 區分真正的錯誤和空結果
      if (error.response?.status === 404 || error.response?.status === 204) {
        // 404 Not Found 或 204 No Content 表示沒有資料，返回空陣列
        console.log('沒有找到常駐物資需求資料，返回空陣列');
        return [];
      }
      // 其他錯誤（網路錯誤、500錯誤等）才拋出異常
      console.error('取得常駐物資需求失敗:', error);
      throw error;
    }
  }

  /**
   * 取得常駐物資需求統計
   */
  async getRegularSuppliesNeedStats(workerId?: number): Promise<{
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    totalEstimatedCost: number;
  }> {
    try {
      const url = workerId 
        ? `/RegularSuppliesNeed/stats?workerId=${workerId}`
        : '/RegularSuppliesNeed/stats';
      const response = await api.get<{
        totalRequests: number;
        pendingRequests: number;
        approvedRequests: number;
        rejectedRequests: number;
        totalEstimatedCost: number;
      }>(url);
      return response;
    } catch (error) {
      console.error('取得常駐物資需求統計失敗:', error);
      throw error;
    }
  }

  /**
   * 批准常駐物資需求
   */
  async approveRegularSuppliesNeed(id: number): Promise<void> {
    try {
      await api.post<void>(`/RegularSuppliesNeed/${id}/approve`);
    } catch (error) {
      console.error(`批准常駐物資需求 ${id} 失敗:`, error);
      throw error;
    }
  }

  /**
   * 拒絕常駐物資需求
   */
  async rejectRegularSuppliesNeed(id: number): Promise<void> {
    try {
      await api.post<void>(`/RegularSuppliesNeed/${id}/reject`);
    } catch (error) {
      console.error(`拒絕常駐物資需求 ${id} 失敗:`, error);
      throw error;
    }
  }

  /**
   * 員工確認常駐物資需求 (三級權限)
   */
  async confirmRegularSuppliesNeed(id: number): Promise<void> {
    try {
      await api.post<void>(`/RegularSuppliesNeed/${id}/confirm`);
    } catch (error) {
      console.error(`確認常駐物資需求 ${id} 失敗:`, error);
      throw error;
    }
  }

  /**
   * 主管批准常駐物資需求 (三級權限)
   */
  async supervisorApproveRegularSuppliesNeed(id: number): Promise<void> {
    try {
      await api.post<void>(`/RegularSuppliesNeed/${id}/supervisor-approve`);
    } catch (error) {
      console.error(`主管批准常駐物資需求 ${id} 失敗:`, error);
      throw error;
    }
  }

  /**
   * 主管拒絕常駐物資需求 (三級權限)
   */
  async supervisorRejectRegularSuppliesNeed(id: number): Promise<void> {
    try {
      await api.post<void>(`/RegularSuppliesNeed/${id}/supervisor-reject`);
    } catch (error) {
      console.error(`主管拒絕常駐物資需求 ${id} 失敗:`, error);
      throw error;
    }
  }

  /**
   * 標記常駐物資需求為已領取
   */
  async collectRegularSuppliesNeed(id: number, batchId?: number): Promise<void> {
    try {
      const payload = batchId ? { batchId } : undefined;
      await api.post<void>(`/RegularSuppliesNeed/${id}/collect`, payload);
    } catch (error) {
      console.error(`標記常駐物資需求 ${id} 為已領取失敗:`, error);
      throw error;
    }
  }

  /**
   * 根據批次ID取得分發詳情
   */
  async getBatchDistributionDetails(batchId: number): Promise<any[]> {
    try {
      console.log(`正在請求批次 ${batchId} 的分發詳情...`);
      const data = await api.get<any[]>(`/RegularSuppliesNeed/batch/${batchId}/details`);
      console.log('API 回應資料:', data);
      return data || [];
    } catch (error: any) {
      // 區分真正的錯誤和空結果
      if (error.response?.status === 404 || error.response?.status === 204) {
        // 404 Not Found 或 204 No Content 表示沒有資料，返回空陣列
        console.log(`批次 ${batchId} 沒有分發詳情資料，返回空陣列`);
        return [];
      }
      // 其他錯誤（網路錯誤、500錯誤等）才拋出異常
      console.error(`取得批次 ${batchId} 分發詳情失敗:`, error);
      throw error;
    }
  }

  /**
   * 刪除常駐物資需求
   */
  async deleteRegularSuppliesNeed(id: number): Promise<void> {
    try {
      await api.delete<void>(`/RegularSuppliesNeed/${id}`);
    } catch (error) {
      console.error(`刪除常駐物資需求 ${id} 失敗:`, error);
      throw error;
    }
  }

  /**
   * 取得緊急物資需求
   */
  async getEmergencySupplyNeeds(): Promise<EmergencySupplyNeed[]> {
    try {
      console.log('正在請求緊急物資需求資料...');
      const response = await api.get<EmergencySupplyNeed[]>('/EmergencySupplyNeed');
      console.log('緊急物資需求 API 回應:', response);
      
      // 處理空回應
      if (!response || response.length === 0) {
        console.log('沒有緊急物資需求資料，返回空陣列');
        return [];
      }
      
      // 處理日期格式轉換
      const processedResponse = response.map(item => ({
        ...item,
        requestDate: typeof item.requestDate === 'string' 
          ? item.requestDate 
          : new Date(item.requestDate).toISOString()
      }));
      
      return processedResponse;
    } catch (error: any) {
      // 區分真正的錯誤和空結果
      if (error.response?.status === 404 || error.response?.status === 204) {
        // 404 Not Found 或 204 No Content 表示沒有資料，返回空陣列
        console.log('沒有找到緊急物資需求資料，返回空陣列');
        return [];
      }
      // 其他錯誤（網路錯誤、500錯誤等）才拋出異常
      console.error('取得緊急物資需求失敗:', error);
      throw error;
    }
  }

  /**
   * 取得緊急物資需求統計 - 匹配後端 EmergencySupplyNeedStatistics
   */
  async getEmergencySupplyNeedStats(): Promise<{
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    completedRequests: number;
    highPriorityRequests: number;
    totalQuantity: number;
    collectedQuantity: number;
  }> {
    try {
      console.log('正在請求緊急物資需求統計...');
      const response = await api.get('/EmergencySupplyNeed/statistics');
      console.log('緊急物資需求統計 API 回應:', response);
      return response;
    } catch (error) {
      console.error('取得緊急物資需求統計失敗:', error);
      // 返回預設值，匹配後端結構
      return {
        totalRequests: 0,
        pendingRequests: 0,
        approvedRequests: 0,
        rejectedRequests: 0,
        completedRequests: 0,
        highPriorityRequests: 0,
        totalQuantity: 0,
        collectedQuantity: 0
      };
    }
  }

  /**
   * 批准緊急物資需求
   */
  async approveEmergencySupplyNeed(id: number): Promise<void> {
    try {
      await api.put<void>(`/EmergencySupplyNeed/${id}/approve`);
    } catch (error) {
      console.error(`批准緊急物資需求 ${id} 失敗:`, error);
      throw error;
    }
  }

  /**
   * 拒絕緊急物資需求
   */
  async rejectEmergencySupplyNeed(id: number): Promise<void> {
    try {
      await api.put<void>(`/EmergencySupplyNeed/${id}/reject`);
    } catch (error) {
      console.error(`拒絕緊急物資需求 ${id} 失敗:`, error);
      throw error;
    }
  }

  /**
   * 刪除緊急物資需求
   */
  async deleteEmergencySupplyNeed(id: number): Promise<void> {
    try {
      await api.delete<void>(`/EmergencySupplyNeed/${id}`);
    } catch (error) {
      console.error(`刪除緊急物資需求 ${id} 失敗:`, error);
      throw error;
    }
  }

  /**
   * 新增緊急物資需求
   */
  async createEmergencySupplyNeed(needData: Partial<EmergencySupplyNeed>): Promise<EmergencySupplyNeed> {
    try {
      const response = await api.post<EmergencySupplyNeed>('/EmergencySupplyNeed', needData);
      return response;
    } catch (error) {
      console.error('新增緊急物資需求失敗:', error);
      throw error;
    }
  }

  /**
   * 新增常駐物資需求
   */
  async createRegularSupplyNeed(needData: Partial<RegularSuppliesNeed>): Promise<RegularSuppliesNeed> {
    try {
      const response = await api.post<RegularSuppliesNeed>('/RegularSuppliesNeed', needData);
      return response;
    } catch (error) {
      console.error('新增常駐物資需求失敗:', error);
      throw error;
    }
  }

  /**
   * 取得常駐物資配對
   */
  async getRegularSupplyMatches(): Promise<RegularSupplyMatch[]> {
    try {
      const response = await api.get<RegularSupplyMatch[]>('/RegularSupplyMatch');
      return response || [];
    } catch (error: any) {
      // 區分真正的錯誤和空結果
      if (error.response?.status === 404 || error.response?.status === 204) {
        // 404 Not Found 或 204 No Content 表示沒有資料，返回空陣列
        console.log('沒有找到常駐物資配對資料，返回空陣列');
        return [];
      }
      // 其他錯誤（網路錯誤、500錯誤等）才拋出異常
      console.error('取得常駐物資配對失敗:', error);
      throw error;
    }
  }

  /**
   * 取得緊急物資配對
   */
  async getEmergencySupplyMatches(): Promise<EmergencySupplyMatch[]> {
    try {
      const response = await api.get<EmergencySupplyMatch[]>('/EmergencySupplyMatch');
      return response || [];
    } catch (error: any) {
      // 區分真正的錯誤和空結果
      if (error.response?.status === 404 || error.response?.status === 204) {
        // 404 Not Found 或 204 No Content 表示沒有資料，返回空陣列
        console.log('沒有找到緊急物資配對資料，返回空陣列');
        return [];
      }
      // 其他錯誤（網路錯誤、500錯誤等）才拋出異常
      console.error('取得緊急物資配對失敗:', error);
      throw error;
    }
  }

  /**
   * 新增常駐物資配對
   */
  async createRegularSupplyMatch(matchData: Partial<RegularSupplyMatch>): Promise<RegularSupplyMatch> {
    try {
      const response = await api.post<RegularSupplyMatch>('/RegularSupplyMatch', matchData);
      return response;
    } catch (error) {
      console.error('新增常駐物資配對失敗:', error);
      throw error;
    }
  }

  /**
   * 新增緊急物資配對
   */
  async createEmergencySupplyMatch(matchData: Partial<EmergencySupplyMatch>): Promise<EmergencySupplyMatch> {
    try {
      const response = await api.post<EmergencySupplyMatch>('/EmergencySupplyMatch', matchData);
      return response;
    } catch (error) {
      console.error('新增緊急物資配對失敗:', error);
      throw error;
    }
  }

  /**
   * 取得個案訂單
   */
  async getCaseOrders(): Promise<CaseOrder[]> {
    try {
      const response = await api.get<CaseOrder[]>('/CaseOrder');
      return response || [];
    } catch (error: any) {
      // 區分真正的錯誤和空結果
      if (error.response?.status === 404 || error.response?.status === 204) {
        // 404 Not Found 或 204 No Content 表示沒有資料，返回空陣列
        console.log('沒有找到個案訂單資料，返回空陣列');
        return [];
      }
      // 其他錯誤（網路錯誤、500錯誤等）才拋出異常
      console.error('取得個案訂單失敗:', error);
      throw error;
    }
  }

  /**
   * 取得用戶訂單
   */
  async getUserOrders(): Promise<UserOrder[]> {
    try {
      const response = await api.get<UserOrder[]>('/UserOrder');
      return response || [];
    } catch (error: any) {
      // 區分真正的錯誤和空結果
      if (error.response?.status === 404 || error.response?.status === 204) {
        // 404 Not Found 或 204 No Content 表示沒有資料，返回空陣列
        console.log('沒有找到用戶訂單資料，返回空陣列');
        return [];
      }
      // 其他錯誤（網路錯誤、500錯誤等）才拋出異常
      console.error('取得用戶訂單失敗:', error);
      throw error;
    }
  }

  /**
   * 取得用戶訂單詳情
   */
  async getUserOrderDetails(orderId: number): Promise<UserOrderDetail[]> {
    try {
      const response = await api.get<UserOrderDetail[]>(`/UserOrderDetail/${orderId}`);
      return response;
    } catch (error) {
      console.error(`取得用戶訂單詳情 ${orderId} 失敗:`, error);
      throw error;
    }
  }
}

export const supplyService = new SupplyService(); 