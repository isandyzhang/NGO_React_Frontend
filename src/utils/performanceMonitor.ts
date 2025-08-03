/**
 * 性能監控工具
 * 
 * 提供應用程式性能監控功能，包括：
 * 1. Chunk載入時間追蹤
 * 2. 組件渲染性能分析
 * 3. 資源載入優化建議
 * 4. 用戶體驗指標收集
 */

interface PerformanceMetrics {
  chunkLoadTime: number;
  componentRenderTime: number;
  totalLoadTime: number;
  timestamp: number;
  path: string;
  chunkName?: string;
}

interface ChunkInfo {
  name: string;
  size: number;
  loadTime: number;
  loadCount: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private chunkInfo: Map<string, ChunkInfo> = new Map();
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  /**
   * 初始化性能觀察器
   */
  private initializeObservers() {
    // 監控資源載入
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'resource') {
            this.handleResourceLoad(entry as PerformanceResourceTiming);
          }
        });
      });

      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(resourceObserver);

      // 監控導航
      const navigationObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            this.handleNavigation(entry as PerformanceNavigationTiming);
          }
        });
      });

      navigationObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navigationObserver);
    }
  }

  /**
   * 處理資源載入事件
   */
  private handleResourceLoad(entry: PerformanceResourceTiming) {
    const url = entry.name;
    const loadTime = entry.loadEventEnd - entry.loadEventStart;
    
    // 檢查是否為JavaScript chunk
    if (url.includes('.js') && url.includes('chunk')) {
      const chunkName = this.extractChunkName(url);
      if (chunkName) {
        this.recordChunkLoad(chunkName, loadTime, entry.transferSize || 0);
      }
    }
  }

  /**
   * 處理導航事件
   */
  private handleNavigation(entry: PerformanceNavigationTiming) {
    const loadTime = entry.loadEventEnd - entry.loadEventStart;
    this.recordMetric({
      chunkLoadTime: 0,
      componentRenderTime: 0,
      totalLoadTime: loadTime,
      timestamp: Date.now(),
      path: window.location.pathname,
    });
  }

  /**
   * 提取chunk名稱
   */
  private extractChunkName(url: string): string | null {
    const match = url.match(/chunk-([a-zA-Z0-9-]+)/);
    return match ? match[1] : null;
  }

  /**
   * 記錄chunk載入資訊
   */
  private recordChunkLoad(name: string, loadTime: number, size: number) {
    const existing = this.chunkInfo.get(name);
    if (existing) {
      existing.loadCount++;
      existing.loadTime = (existing.loadTime + loadTime) / 2; // 平均載入時間
      existing.size = size;
    } else {
      this.chunkInfo.set(name, {
        name,
        loadTime,
        size,
        loadCount: 1,
      });
    }

    console.log(`Chunk載入: ${name}, 時間: ${loadTime}ms, 大小: ${size}bytes`);
  }

  /**
   * 記錄性能指標
   */
  recordMetric(metric: PerformanceMetrics) {
    this.metrics.push(metric);
    
    // 保持最近的1000條記錄
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  /**
   * 記錄組件渲染時間
   */
  recordComponentRender(componentName: string, renderTime: number, path: string) {
    this.recordMetric({
      chunkLoadTime: 0,
      componentRenderTime: renderTime,
      totalLoadTime: renderTime,
      timestamp: Date.now(),
      path,
      chunkName: componentName,
    });
  }

  /**
   * 獲取性能報告
   */
  getPerformanceReport() {
    const now = Date.now();
    const last24Hours = this.metrics.filter(m => now - m.timestamp < 24 * 60 * 60 * 1000);
    
    const avgLoadTime = last24Hours.length > 0 
      ? last24Hours.reduce((sum, m) => sum + m.totalLoadTime, 0) / last24Hours.length 
      : 0;

    const avgRenderTime = last24Hours.length > 0
      ? last24Hours.reduce((sum, m) => sum + m.componentRenderTime, 0) / last24Hours.length
      : 0;

    const chunkStats = Array.from(this.chunkInfo.values()).map(chunk => ({
      name: chunk.name,
      averageLoadTime: chunk.loadTime,
      loadCount: chunk.loadCount,
      size: chunk.size,
      sizeKB: Math.round(chunk.size / 1024),
    }));

    return {
      summary: {
        totalMetrics: this.metrics.length,
        last24HoursMetrics: last24Hours.length,
        averageLoadTime: Math.round(avgLoadTime),
        averageRenderTime: Math.round(avgRenderTime),
      },
      chunks: chunkStats.sort((a, b) => b.loadCount - a.loadCount),
      recommendations: this.generateRecommendations(avgLoadTime, avgRenderTime, chunkStats),
    };
  }

  /**
   * 生成優化建議
   */
  private generateRecommendations(
    avgLoadTime: number, 
    avgRenderTime: number, 
    chunkStats: any[]
  ): string[] {
    const recommendations: string[] = [];

    if (avgLoadTime > 2000) {
      recommendations.push('平均載入時間超過2秒，建議檢查網路連接和伺服器響應時間');
    }

    if (avgRenderTime > 100) {
      recommendations.push('組件渲染時間較長，建議優化組件邏輯或實施虛擬化');
    }

    const largeChunks = chunkStats.filter(chunk => chunk.sizeKB > 500);
    if (largeChunks.length > 0) {
      recommendations.push(`發現${largeChunks.length}個大型chunk，建議進一步分割: ${largeChunks.map(c => c.name).join(', ')}`);
    }

    const frequentlyLoaded = chunkStats.filter(chunk => chunk.loadCount > 10);
    if (frequentlyLoaded.length > 0) {
      recommendations.push(`以下chunk載入頻繁，建議預加載: ${frequentlyLoaded.map(c => c.name).join(', ')}`);
    }

    return recommendations;
  }

  /**
   * 清理資源
   */
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// 創建全域性能監控實例
export const performanceMonitor = new PerformanceMonitor();

// 便捷函數
export const recordComponentRender = (componentName: string, renderTime: number, path: string) => {
  performanceMonitor.recordComponentRender(componentName, renderTime, path);
};

export const getPerformanceReport = () => {
  return performanceMonitor.getPerformanceReport();
};

// React組件性能監控HOC
export function withPerformanceMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) {
  return React.forwardRef<any, P>((props, ref) => {
    const startTime = performance.now();
    const location = useLocation();

    useEffect(() => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      recordComponentRender(componentName, renderTime, location.pathname);
    });

    return <WrappedComponent {...props} ref={ref} />;
  });
} 