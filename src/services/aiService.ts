import { api } from './api';

export interface OptimizeDescriptionRequest {
  description: string;
}

export interface OptimizeDescriptionResponse {
  originalDescription: string;
  optimizedDescription: string;
  originalLength: number;
  optimizedLength: number;
  optimizedAt: string;
}

export interface AIServiceStatusResponse {
  isAvailable: boolean;
  message: string;
  checkedAt: string;
}

/**
 * AI 優化服務
 */
export const aiService = {
  /**
   * 優化活動描述
   */
  optimizeDescription: async (description: string): Promise<OptimizeDescriptionResponse> => {
    try {
      console.log('發送 AI 優化請求:', { description: description.substring(0, 50) + '...' });
      
      const response = await api.post<OptimizeDescriptionResponse>('/AI/optimize-description', {
        description: description.trim()
      }, {
        timeout: 30000, // AI 處理可能需要較長時間，設為 30 秒
      });

      console.log('AI 優化成功:', {
        originalLength: response.originalLength,
        optimizedLength: response.optimizedLength
      });

      return response;
    } catch (error: any) {
      console.error('AI 優化失敗:', error);
      console.error('錯誤詳情:', error.response?.data);
      
      // 提供更詳細的錯誤訊息
      if (error.response?.status === 503) {
        throw new Error('AI 服務暫時無法使用，請稍後再試');
      }
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('AI 處理超時，請稍後再試');
      }
      
      throw new Error('AI 優化失敗，請稍後再試');
    }
  },

  /**
   * 檢查 AI 服務狀態
   */
  checkServiceStatus: async (): Promise<AIServiceStatusResponse> => {
    try {
      const response = await api.get<AIServiceStatusResponse>('/AI/status');
      return response;
    } catch (error) {
      console.error('檢查 AI 服務狀態失敗:', error);
      return {
        isAvailable: false,
        message: '無法連接到 AI 服務',
        checkedAt: new Date().toISOString()
      };
    }
  }
};