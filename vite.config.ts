import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // 代碼分割配置
    rollupOptions: {
      output: {
        // 手動控制chunk分割
        manualChunks: {
          // React核心庫
          'react-vendor': ['react', 'react-dom'],
          // Material-UI相關
          'mui-vendor': [
            '@mui/material',
            '@mui/icons-material',
            '@mui/x-charts',
            '@mui/x-date-pickers',
            '@mui/x-date-pickers-pro',
            '@emotion/react',
            '@emotion/styled'
          ],
          // 路由相關
          'router-vendor': ['react-router-dom'],
          // 圖表相關
          'charts-vendor': ['recharts'],
          // 日期處理
          'date-vendor': ['date-fns', 'dayjs'],
          // 動畫相關
          'animation-vendor': ['framer-motion', '@lottiefiles/dotlottie-react'],
          // HTTP請求
          'http-vendor': ['axios'],
          // Azure相關
          'azure-vendor': ['@azure/msal-browser', '@azure/msal-react'],
          // 日曆相關
          'calendar-vendor': ['react-big-calendar'],
          // 樣式相關
          'style-vendor': ['styled-components']
        },
        // 文件名格式
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `js/[name]-[hash].js`;
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\.(css)$/.test(assetInfo.name)) {
            return `css/[name]-[hash].${ext}`;
          }
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
            return `images/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        }
      }
    },
    // 啟用代碼分割
    chunkSizeWarningLimit: 1000,
    // 啟用source map（開發環境）
    sourcemap: true,
    // 壓縮配置
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  // 依賴預構建配置
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@mui/material',
      '@mui/icons-material',
      'axios',
      'date-fns',
      'dayjs'
    ]
  }
})
