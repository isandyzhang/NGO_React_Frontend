import { api } from '../shared/api';

export interface EmergencySupplyNeed {
  emergencyNeedId: number;
  caseId: number;
  workerId: number;
  supplyName: string;
  quantity: number;
  collectedQuantity: number;
  description?: string;
  priority?: string;
  status?: string;
  createdDate?: string;
  updatedDate?: string;
  imageUrl?: string;
  caseName?: string;
  workerName?: string;
}

export interface CreateEmergencySupplyNeedRequest {
  caseId: number;
  workerId: number;
  supplyName: string;
  quantity: number;
  description?: string;
  priority?: string;
  imageUrl?: string;
}

export interface UpdateEmergencySupplyNeedRequest {
  supplyName?: string;
  quantity?: number;
  collectedQuantity?: number;
  description?: string;
  priority?: string;
  status?: string;
  imageUrl?: string;
}

export const emergencySupplyNeedService = {
  // 獲取所有緊急物資需求
  getAll: async (): Promise<EmergencySupplyNeed[]> => {
    const data = await api.get('/EmergencySupplyNeed');
    return data;
  },

  // 根據 ID 獲取特定緊急物資需求
  getById: async (id: number): Promise<EmergencySupplyNeed> => {
    const data = await api.get(`/EmergencySupplyNeed/${id}`);
    return data;
  },

  // 建立新的緊急物資需求
  create: async (data: CreateEmergencySupplyNeedRequest): Promise<EmergencySupplyNeed> => {
    const result = await api.post('/EmergencySupplyNeed', data);
    return result;
  },

  // 更新緊急物資需求
  update: async (id: number, data: UpdateEmergencySupplyNeedRequest): Promise<void> => {
    await api.put(`/EmergencySupplyNeed/${id}`, data);
  },

  // 刪除緊急物資需求
  delete: async (id: number): Promise<void> => {
    await api.delete(`/EmergencySupplyNeed/${id}`);
  },

  // 上傳圖片
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const result = await api.post('/EmergencySupplyNeed/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return result.imageUrl;
  },
}; 