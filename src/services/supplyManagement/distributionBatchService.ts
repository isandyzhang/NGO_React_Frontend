import { api } from '../shared/api';

// 分发批次接口
export interface DistributionBatch {
  distributionBatchId: number;
  distributionDate: string;
  caseCount: number;
  totalSupplyItems: number;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  createdAt: string;
  approvedAt?: string;
  notes?: string;
  createdByWorker: string;
  approvedByWorker?: string;
  matchCount: number;
}

export interface DistributionBatchDetail extends DistributionBatch {
  matches: DistributionMatch[];
}

export interface DistributionMatch {
  regularMatchId: number;
  matchedQuantity: number;
  matchDate: string;
  note?: string;
  caseName: string;
  supplyName: string;
  requestedQuantity: number;
  requestedDate: string;
}

export interface CreateDistributionBatchRequest {
  distributionDate: string;
  caseCount: number;
  totalSupplyItems: number;
  createdByWorkerId: number;
  notes?: string;
  matchIds?: number[];
}

export interface ApproveDistributionBatchRequest {
  approvedByWorkerId: number;
}

export interface RejectDistributionBatchRequest {
  rejectedByWorkerId: number;
  rejectReason?: string;
}

const distributionBatchService = {
  // 获取所有分发批次 (根據權限過濾)
  async getDistributionBatches(workerId?: number): Promise<DistributionBatch[]> {
    const url = workerId 
      ? `/RegularDistributionBatch?workerId=${workerId}`
      : '/RegularDistributionBatch';
    const response = await api.get<DistributionBatch[]>(url);
    return response;
  },

  // 获取特定批次的详细信息
  async getDistributionBatch(id: number): Promise<DistributionBatchDetail> {
    const response = await api.get<DistributionBatchDetail>(`/RegularDistributionBatch/${id}`);
    return response;
  },

  // 创建新的分发批次
  async createDistributionBatch(data: CreateDistributionBatchRequest): Promise<{ id: number }> {
    const response = await api.post<{ id: number }>('/RegularDistributionBatch', data);
    return response;
  },

  // 批准分发批次
  async approveDistributionBatch(id: number, data: ApproveDistributionBatchRequest): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(`/RegularDistributionBatch/${id}/approve`, data);
    return response;
  },

  // 拒絕分發批次
  async rejectDistributionBatch(id: number, data: RejectDistributionBatchRequest): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(`/RegularDistributionBatch/${id}/reject`, data);
    return response;
  },

  // 删除分发批次
  async deleteDistributionBatch(id: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/RegularDistributionBatch/${id}`);
    return response;
  },
};

export default distributionBatchService; 