import { api } from '../shared/api';
import { 
  ParseCaseInfoRequest, 
  ParseCaseInfoResponse, 
  CaseInfoSchema,
  validateAIParsingResult,
  AI_PARSING_PROMPTS,
  normalizeAIParsingResult
} from '../../types/caseAI';

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
      
      const response = await api.post<OptimizeDescriptionResponse>('/ActivityAIOptimizer/optimize-description', {
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
      const response = await api.get<AIServiceStatusResponse>('/ActivityAIOptimizer/status');
      return response;
    } catch (error) {
      console.error('檢查 AI 服務狀態失敗:', error);
      return {
        isAvailable: false,
        message: '無法連接到 AI 服務',
        checkedAt: new Date().toISOString()
      };
    }
  },

  /**
   * 🚀 使用 Azure OpenAI 解析個案資訊
   * @param text 要解析的文字內容
   * @param useEnhancedParsing 是否使用增強解析模式
   * @returns 解析結果
   */
  parseCaseInfo: async (text: string, useEnhancedParsing: boolean = true): Promise<ParseCaseInfoResponse> => {
    try {
      console.log('🔍 開始 AI 個案資訊解析:', { 
        textLength: text.length, 
        useEnhancedParsing,
        preview: text.substring(0, 100) + '...'
      });
      
      const startTime = Date.now();
      
      const requestData: ParseCaseInfoRequest = {
        text: text.trim(),
        useEnhancedParsing
      };

      // TODO: 後端尚未實現 parse-case-info 端點，暫時返回錯誤
      // const response = await api.post<ParseCaseInfoResponse>('/AI/parse-case-info', requestData, {
      //   timeout: 45000 // 45秒超時，AI 語義理解比描述優化需要更多時間
      // });
      
      // 臨時實現：返回錯誤訊息
      throw new Error('AI 個案資訊解析功能尚未實現，請聯繫開發團隊');

      // 由於功能尚未實現，直接拋出錯誤
      throw new Error('AI 個案資訊解析功能尚未實現，請聯繫開發團隊');
    } catch (error: any) {
      console.error('❌ AI 個案資訊解析失敗:', error);
      
      // 詳細錯誤處理
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        return {
          success: false,
          message: 'AI 解析超時，請稍後再試或嘗試簡化文字內容',
          confidence: 0
        };
      }
      
      if (error.response?.status === 503) {
        return {
          success: false,
          message: 'AI 服務暫時無法使用，請稍後再試',
          confidence: 0
        };
      }
      
      if (error.response?.data?.message) {
        return {
          success: false,
          message: error.response.data.message,
          confidence: 0
        };
      }
      
      return {
        success: false,
        message: 'AI 解析失敗，請檢查文字內容或稍後再試',
        confidence: 0
      };
    }
  },

  /**
   * 批次解析多段文字
   * @param texts 文字陣列
   * @returns 批次解析結果
   */
  parseCaseInfoBatch: async (texts: string[]): Promise<ParseCaseInfoResponse[]> => {
    console.log('🔄 開始批次 AI 解析:', texts.length + ' 段文字');
    
    const results: ParseCaseInfoResponse[] = [];
    
    // 並行處理，但限制同時請求數量避免過載
    const batchSize = 3;
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const batchPromises = batch.map(text => aiService.parseCaseInfo(text));
      
      try {
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      } catch (error) {
        console.error('批次解析部分失敗:', error);
        // 為失敗的項目添加錯誤結果
        const failedResults = batch.map(() => ({
          success: false,
          message: '批次解析失敗',
          confidence: 0
        }));
        results.push(...failedResults);
      }
    }
    
    console.log('✅ 批次解析完成:', {
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    });
    
    return results;
  },

  /**
   * 測試 AI 解析功能
   * @returns 測試結果
   */
  testAIParsing: async (): Promise<{success: boolean; message: string; testResults: any}> => {
    const testCases = [
      "我是張小明，男生，生日1990年5月15日，身分證A123456789，手機0912345678，住台北市大安區",
      "李小美，女性，1985-03-20出生，ID：B987654321，電話：0987654321，地址：新北市板橋區文化路100號"
    ];

    try {
      const results = await aiService.parseCaseInfoBatch(testCases);
      
      return {
        success: true,
        message: 'AI 解析測試完成',
        testResults: results
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'AI 解析測試失敗: ' + error.message,
        testResults: []
      };
    }
  }
};