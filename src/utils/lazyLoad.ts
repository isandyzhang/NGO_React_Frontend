import React, { ComponentType, lazy, Suspense } from 'react';
import LoadingSpinner from '../components/shared/LoadingSpinner';

/**
 * 懶加載工具函數
 * 
 * 提供統一的組件懶加載功能，包含：
 * 1. 錯誤邊界處理
 * 2. 載入狀態管理
 * 3. 重試機制
 * 4. 預加載功能
 */

// 錯誤邊界組件
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ComponentType }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('組件載入錯誤:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ? <this.props.fallback /> : (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center',
          color: '#666'
        }}>
          組件載入失敗，請重新整理頁面
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * 創建懶加載組件
 * @param importFunc - 動態導入函數
 * @param fallback - 載入中的組件
 * @returns 懶加載組件
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback: React.ComponentType = LoadingSpinner
): React.ComponentType<React.ComponentProps<T>> {
  const LazyComponent = lazy(importFunc);
  
  return React.forwardRef<any, React.ComponentProps<T>>((props, ref) => (
    <ErrorBoundary>
      <Suspense fallback={<fallback />}>
        <LazyComponent {...props} ref={ref} />
      </Suspense>
    </ErrorBoundary>
  ));
}

/**
 * 預加載組件
 * @param importFunc - 動態導入函數
 */
export function preloadComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
): void {
  // 在背景預加載組件
  importFunc().catch(error => {
    console.warn('預加載組件失敗:', error);
  });
}

/**
 * 批量預加載組件
 * @param components - 組件導入函數陣列
 */
export function preloadComponents<T extends ComponentType<any>>(
  components: Array<() => Promise<{ default: T }>>
): void {
  components.forEach(component => preloadComponent(component));
}

/**
 * 帶重試機制的懶加載組件
 * @param importFunc - 動態導入函數
 * @param retries - 重試次數
 * @param fallback - 載入中的組件
 * @returns 懶加載組件
 */
export function createRetryLazyComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  retries: number = 3,
  fallback: React.ComponentType = LoadingSpinner
): React.ComponentType<React.ComponentProps<T>> {
  const retryImport = async (): Promise<{ default: T }> => {
    for (let i = 0; i < retries; i++) {
      try {
        return await importFunc();
      } catch (error) {
        if (i === retries - 1) throw error;
        // 等待一段時間後重試
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    throw new Error('組件載入失敗');
  };

  return createLazyComponent(retryImport, fallback);
}

/**
 * 條件懶加載組件
 * @param condition - 載入條件
 * @param importFunc - 動態導入函數
 * @param fallback - 載入中的組件
 * @returns 條件懶加載組件
 */
export function createConditionalLazyComponent<T extends ComponentType<any>>(
  condition: () => boolean,
  importFunc: () => Promise<{ default: T }>,
  fallback: React.ComponentType = LoadingSpinner
): React.ComponentType<React.ComponentProps<T>> {
  return React.forwardRef<any, React.ComponentProps<T>>((props, ref) => {
    if (!condition()) {
      return <fallback />;
    }

    const LazyComponent = createLazyComponent(importFunc, fallback);
    return <LazyComponent {...props} ref={ref} />;
  });
} 