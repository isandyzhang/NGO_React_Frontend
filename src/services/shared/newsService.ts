import { api } from '../shared/api';

/**
 * 新聞介面
 */
export interface News {
  newsId: number;
  title: string;
  content: string;
  publishDate: string;
  author: string;
  status: 'draft' | 'published' | 'archived';
  imageUrl?: string;
  category?: string;
  tags?: string[];
}

/**
 * 新聞服務類別
 */
class NewsService {
  /**
   * 取得所有新聞
   */
  async getNews(): Promise<News[]> {
    try {
      const response = await api.get<News[]>('/News');
      return response;
    } catch (error) {
      console.error('取得新聞列表失敗:', error);
      throw error;
    }
  }

  /**
   * 根據ID取得新聞
   */
  async getNewsById(id: number): Promise<News> {
    try {
      const response = await api.get<News>(`/News/${id}`);
      return response;
    } catch (error) {
      console.error(`取得新聞 ${id} 失敗:`, error);
      throw error;
    }
  }

  /**
   * 新增新聞
   */
  async createNews(newsData: Partial<News>): Promise<News> {
    try {
      const response = await api.post<News>('/News', newsData);
      return response;
    } catch (error) {
      console.error('新增新聞失敗:', error);
      throw error;
    }
  }

  /**
   * 更新新聞
   */
  async updateNews(id: number, newsData: Partial<News>): Promise<void> {
    try {
      await api.put<void>(`/News/${id}`, newsData);
    } catch (error) {
      console.error(`更新新聞 ${id} 失敗:`, error);
      throw error;
    }
  }

  /**
   * 刪除新聞
   */
  async deleteNews(id: number): Promise<void> {
    try {
      await api.delete<void>(`/News/${id}`);
    } catch (error) {
      console.error(`刪除新聞 ${id} 失敗:`, error);
      throw error;
    }
  }

  /**
   * 取得已發布的新聞
   */
  async getPublishedNews(): Promise<News[]> {
    try {
      const response = await api.get<News[]>('/News/published');
      return response;
    } catch (error) {
      console.error('取得已發布新聞失敗:', error);
      throw error;
    }
  }
}

export const newsService = new NewsService(); 