import { api } from './api';

/**
 * 物資分類介面
 */
export interface SupplyCategory {
  categoryId: number;
  categoryName: string;
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
  urgencyLevel?: 'high' | 'medium' | 'low';
  lastUsed?: string;
}

/**
 * 常駐物資需求介面
 */
export interface RegularSuppliesNeed {
  needId: number;
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  requestedBy: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  estimatedCost: number;
  caseName?: string;
  caseId?: string;
  deliveryMethod?: '自取' | '宅配';
  matched: boolean;
}

/**
 * 緊急物資需求介面
 */
export interface EmergencySupplyNeed {
  emergencyNeedId: number;
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  urgency: 'low' | 'medium' | 'high';
  requestedBy: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  estimatedCost: number;
  caseName: string;
  caseId: string;
  matched: boolean;
  emergencyReason: string;
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
      const response = await api.get<SupplyCategory[]>('/SupplyCategory');
      return response;
    } catch (error) {
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
      return response;
    } catch (error) {
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
      await api.put<void>(`/Supply/${id}`, supplyData);
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
   * 取得常駐物資需求
   */
  async getRegularSuppliesNeeds(): Promise<RegularSuppliesNeed[]> {
    try {
      const response = await api.get<RegularSuppliesNeed[]>('/RegularSuppliesNeed');
      return response;
    } catch (error) {
      console.error('取得常駐物資需求失敗:', error);
      throw error;
    }
  }

  /**
   * 取得緊急物資需求
   */
  async getEmergencySupplyNeeds(): Promise<EmergencySupplyNeed[]> {
    try {
      const response = await api.get<EmergencySupplyNeed[]>('/EmergencySupplyNeed');
      return response;
    } catch (error) {
      console.error('取得緊急物資需求失敗:', error);
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
   * 取得常駐物資配對
   */
  async getRegularSupplyMatches(): Promise<RegularSupplyMatch[]> {
    try {
      const response = await api.get<RegularSupplyMatch[]>('/RegularSupplyMatch');
      return response;
    } catch (error) {
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
      return response;
    } catch (error) {
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
      return response;
    } catch (error) {
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
      return response;
    } catch (error) {
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