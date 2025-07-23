import { api } from './api';

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
 * Azure 語音轉字幕服務
 */
export const speechService = {
  /**
   * 上傳音檔到 Azure Blob Storage
   */
  uploadAudio: async (audioFile: File, caseId?: number): Promise<AudioUploadResponse> => {
    try {
      console.log('speechService.uploadAudio 開始執行...');
      console.log('參數:', { fileName: audioFile.name, fileSize: audioFile.size, caseId });
      
      const formData = new FormData();
      formData.append('audioFile', audioFile);
      if (caseId) {
        formData.append('caseId', caseId.toString());
        console.log('已添加 caseId 到 FormData:', caseId);
      }

      console.log('FormData 內容:');
      for (const [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value);
      }

      console.log('發送 API 請求到 /Speech/upload-audio...');
      const response = await api.post<AudioUploadResponse>('/Speech/upload-audio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('API 回應成功:', response);
      return response;
    } catch (error) {
      console.error('音檔上傳失敗:', error);
      console.error('錯誤詳情:', {
        message: error instanceof Error ? error.message : '未知錯誤',
        response: (error as any)?.response?.data,
        status: (error as any)?.response?.status
      });
      throw new Error('音檔上傳失敗，請稍後再試');
    }
  },

  /**
   * 從 URL 進行語音轉文字
   */
  transcribeFromUrl: async (audioUrl: string): Promise<SpeechToTextResponse> => {
    try {
      const request: TranscribeFromUrlRequest = { audioUrl };
      const response = await api.post<SpeechToTextResponse>('/Speech/transcribe-from-url', request);
      return response;
    } catch (error) {
      console.error('從 URL 語音轉文字失敗:', error);
      throw new Error('語音轉文字失敗，請稍後再試');
    }
  },

  /**
   * 上傳音檔並轉換為文字
   */
  uploadAudioAndTranscribe: async (audioFile: File): Promise<SpeechToTextResponse> => {
    try {
      const formData = new FormData();
      formData.append('audioFile', audioFile);
      // 移除 language 參數，後端已固定使用 zh-TW

      const response = await api.post<SpeechToTextResponse>('/Speech/transcribe', formData, {
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

      const response = await api.post<SpeechToTextResponse>('/Speech/transcribe', formData, {
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

      mediaRecorder.onerror = (error) => {
        reject(error);
      };

      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    });
  },

  /**
   * 格式化錄音時間
   */
  formatDuration: (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}; 