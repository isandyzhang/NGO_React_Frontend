/**
 * 預加載管理器
 * 
 * 提供智能的組件和服務預加載功能，根據用戶行為和路由預測需要載入的資源
 */

interface PreloadConfig {
  priority: 'high' | 'medium' | 'low';
  delay: number;
  condition?: () => boolean;
}

class PreloadManager {
  private preloadQueue: Map<string, () => Promise<any>> = new Map();
  private loadedModules: Set<string> = new Set();
  private configs: Map<string, PreloadConfig> = new Map();

  /**
   * 註冊預加載項目
   * @param key - 唯一標識
   * @param importFunc - 導入函數
   * @param config - 預加載配置
   */
  register(
    key: string, 
    importFunc: () => Promise<any>, 
    config: PreloadConfig = { priority: 'medium', delay: 0 }
  ) {
    this.preloadQueue.set(key, importFunc);
    this.configs.set(key, config);
  }

  /**
   * 執行預加載
   * @param key - 預加載項目標識
   */
  async preload(key: string): Promise<void> {
    if (this.loadedModules.has(key)) {
      return; // 已經載入過
    }

    const importFunc = this.preloadQueue.get(key);
    const config = this.configs.get(key);

    if (!importFunc || !config) {
      console.warn(`預加載項目 ${key} 未找到`);
      return;
    }

    // 檢查條件
    if (config.condition && !config.condition()) {
      return;
    }

    try {
      // 根據優先級設置延遲
      const delay = config.delay || this.getDelayByPriority(config.priority);
      
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      await importFunc();
      this.loadedModules.add(key);
      console.log(`預加載成功: ${key}`);
    } catch (error) {
      console.warn(`預加載失敗: ${key}`, error);
    }
  }

  /**
   * 批量預加載
   * @param keys - 預加載項目標識陣列
   */
  async preloadBatch(keys: string[]): Promise<void> {
    const promises = keys.map(key => this.preload(key));
    await Promise.allSettled(promises);
  }

  /**
   * 根據路由預測預加載
   * @param currentPath - 當前路徑
   */
  predictAndPreload(currentPath: string): void {
    const predictions = this.getPredictions(currentPath);
    predictions.forEach(prediction => {
      this.preload(prediction.key);
    });
  }

  /**
   * 根據用戶行為預測預加載
   * @param userAction - 用戶行為
   */
  preloadByUserAction(userAction: string): void {
    const actionMap: Record<string, string[]> = {
      'hover-dashboard': ['dashboard', 'statistics'],
      'hover-case': ['case-management', 'case-form'],
      'hover-activity': ['activity-management', 'activity-form'],
      'hover-supplies': ['supplies-management', 'inventory'],
      'hover-calendar': ['calendar-management', 'schedule'],
      'hover-account': ['account-management', 'user-list'],
    };

    const keys = actionMap[userAction] || [];
    keys.forEach(key => this.preload(key));
  }

  /**
   * 清理已載入的模組記錄
   */
  clearLoadedModules(): void {
    this.loadedModules.clear();
  }

  /**
   * 獲取載入狀態
   */
  getLoadedModules(): string[] {
    return Array.from(this.loadedModules);
  }

  /**
   * 根據優先級獲取延遲時間
   */
  private getDelayByPriority(priority: string): number {
    switch (priority) {
      case 'high': return 0;
      case 'medium': return 1000;
      case 'low': return 3000;
      default: return 1000;
    }
  }

  /**
   * 根據路徑獲取預測的預加載項目
   */
  private getPredictions(currentPath: string): Array<{ key: string; priority: string }> {
    const predictions: Array<{ key: string; priority: string }> = [];

    if (currentPath.includes('dashboard')) {
      predictions.push({ key: 'statistics', priority: 'medium' });
      predictions.push({ key: 'charts', priority: 'low' });
    }

    if (currentPath.includes('case-management')) {
      predictions.push({ key: 'case-form', priority: 'medium' });
      predictions.push({ key: 'case-search', priority: 'low' });
    }

    if (currentPath.includes('activity-management')) {
      predictions.push({ key: 'activity-form', priority: 'medium' });
      predictions.push({ key: 'registration-review', priority: 'low' });
    }

    if (currentPath.includes('supplies-management')) {
      predictions.push({ key: 'inventory', priority: 'medium' });
      predictions.push({ key: 'distribution', priority: 'low' });
    }

    if (currentPath.includes('calendar-management')) {
      predictions.push({ key: 'schedule', priority: 'medium' });
      predictions.push({ key: 'calendar-events', priority: 'low' });
    }

    if (currentPath.includes('account-management')) {
      predictions.push({ key: 'user-list', priority: 'medium' });
      predictions.push({ key: 'user-form', priority: 'low' });
    }

    return predictions;
  }
}

// 創建全域預加載管理器實例
export const preloadManager = new PreloadManager();

// 預設預加載配置
export const defaultPreloadConfigs = {
  // 高優先級 - 立即載入
  high: { priority: 'high' as const, delay: 0 },
  // 中優先級 - 1秒後載入
  medium: { priority: 'medium' as const, delay: 1000 },
  // 低優先級 - 3秒後載入
  low: { priority: 'low' as const, delay: 3000 },
};

// 導出便捷函數
export const registerPreload = (
  key: string, 
  importFunc: () => Promise<any>, 
  config?: PreloadConfig
) => preloadManager.register(key, importFunc, config);

export const preloadModule = (key: string) => preloadManager.preload(key);
export const preloadModules = (keys: string[]) => preloadManager.preloadBatch(keys);
export const predictPreload = (path: string) => preloadManager.predictAndPreload(path);
export const preloadByAction = (action: string) => preloadManager.preloadByUserAction(action); 