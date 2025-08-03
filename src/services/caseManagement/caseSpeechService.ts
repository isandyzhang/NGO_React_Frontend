import { api } from '../shared/api';

export interface SpeechToTextRequest {
  audioFile?: File;
  audioData?: string; // base64 encoded audio data
  language?: string;
}

export interface SpeechToTextResponse {
  text: string;
  confidence: number;
  duration: number;
  audioUrl?: string;
}

export interface AudioUploadResponse {
  audioUrl: string;
  fileName: string;
  fileSize: number;
  uploadTime: string;
}

export interface TranscribeFromUrlRequest {
  audioUrl: string;
}

export interface AudioRecordingState {
  isRecording: boolean;
  duration: number;
  audioBlob: Blob | null;
}

/**
 * 語音轉文字服務
 * 
 * 提供語音檔案上傳、語音轉文字等功能
 */
export const caseSpeechService = {
  /**
   * 上傳音檔並轉換為文字
   */
  uploadAudioAndTranscribe: async (audioFile: File): Promise<SpeechToTextResponse> => {
    try {
      const formData = new FormData();
      formData.append('audioFile', audioFile);
      // 移除 language 參數，後端已固定使用 zh-TW

      const response = await api.post<SpeechToTextResponse>('/CaseSpeechToText/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 語音轉文字需要更長時間，設為 60 秒
      });

      return response;
    } catch (error: any) {
      console.error('語音轉文字失敗:', error);
      console.error('錯誤詳情:', error.response?.data);
      
      // 提供更詳細的錯誤訊息
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error('語音轉文字失敗，請稍後再試');
    }
  },

  /**
   * 直接錄音並轉換為文字
   */
  recordAndTranscribe: async (audioBlob: Blob): Promise<SpeechToTextResponse> => {
    try {
      const formData = new FormData();
      formData.append('audioFile', audioBlob, 'recording.wav');
      // 移除 language 參數，後端已固定使用 zh-TW

      const response = await api.post<SpeechToTextResponse>('/CaseSpeechToText/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 語音轉文字需要更長時間，設為 60 秒
      });

      return response;
    } catch (error: any) {
      console.error('錄音轉文字失敗:', error);
      console.error('錯誤詳情:', error.response?.data);
      
      // 提供更詳細的錯誤訊息
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error('錄音轉文字失敗，請稍後再試');
    }
  },

  /**
   * 上傳音檔到 Azure Blob Storage
   */
  uploadAudio: async (audioFile: File, caseId?: number): Promise<AudioUploadResponse> => {
    try {
      const formData = new FormData();
      formData.append('audioFile', audioFile);
      if (caseId) {
        formData.append('caseId', caseId.toString());
      }

      const response = await api.post<AudioUploadResponse>('/CaseSpeechToText/upload-audio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 上傳需要較長時間
      });

      return response;
    } catch (error: any) {
      console.error('音檔上傳失敗:', error);
      console.error('錯誤詳情:', error.response?.data);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error('音檔上傳失敗，請稍後再試');
    }
  },

  /**
   * 從 URL 進行語音轉文字
   */
  transcribeFromUrl: async (audioUrl: string): Promise<SpeechToTextResponse> => {
    try {
      const request: TranscribeFromUrlRequest = { audioUrl };

      const response = await api.post<SpeechToTextResponse>('/CaseSpeechToText/transcribe-from-url', request, {
        timeout: 60000, // 語音轉文字需要更長時間
      });

      return response;
    } catch (error: any) {
      console.error('從 URL 語音轉文字失敗:', error);
      console.error('錯誤詳情:', error.response?.data);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error('從 URL 語音轉文字失敗，請稍後再試');
    }
  },

  /**
   * 測試 Azure Speech Service 連線
   */
  testConnection: async (): Promise<any> => {
    try {
      const response = await api.get('/CaseSpeechToText/test-connection');
      return response;
    } catch (error: any) {
      console.error('連線測試失敗:', error);
      throw new Error('連線測試失敗，請檢查服務設定');
    }
  },

  /**
   * 測試 Azure Blob Storage 連線
   */
  testBlobStorage: async (): Promise<any> => {
    try {
      const response = await api.get('/CaseSpeechToText/test-blob-storage');
      return response;
    } catch (error: any) {
      console.error('Blob Storage 測試失敗:', error);
      throw new Error('Blob Storage 測試失敗，請檢查設定');
    }
  },

  /**
   * 檢查瀏覽器是否支援錄音
   */
  isRecordingSupported: (): boolean => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  },

  /**
   * 開始錄音
   */
  startRecording: async (): Promise<MediaRecorder> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        } 
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      return mediaRecorder;
    } catch (error) {
      console.error('無法開始錄音:', error);
      throw new Error('無法開始錄音，請檢查麥克風權限');
    }
  },

  /**
   * 停止錄音
   */
  stopRecording: (mediaRecorder: MediaRecorder): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        resolve(audioBlob);
      };

      mediaRecorder.onerror = (event) => {
        reject(new Error('錄音過程中發生錯誤'));
      };

      mediaRecorder.stop();
    });
  },

  /**
   * 將 Blob 轉換為 File 物件
   */
  blobToFile: (blob: Blob, fileName: string): File => {
    return new File([blob], fileName, { type: blob.type });
  },

  /**
   * 將音檔轉換為 Base64 字串
   */
  blobToBase64: (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // 移除 data:audio/webm;base64, 前綴
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  },

  /**
   * 檢查音檔格式是否支援
   */
  isAudioFormatSupported: (file: File): boolean => {
    const supportedTypes = [
      'audio/wav',
      'audio/mp3',
      'audio/m4a',
      'audio/webm',
      'audio/ogg'
    ];
    
    return supportedTypes.includes(file.type);
  },

  /**
   * 檢查音檔大小是否在限制內
   */
  isAudioSizeValid: (file: File, maxSizeMB: number = 25): boolean => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }
};

export default caseSpeechService; 