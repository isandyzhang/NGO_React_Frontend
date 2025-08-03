# NGO 平台前端架構文檔

## 📋 專案概覽

NGO 平台前端是一個基於 React + TypeScript + Vite 的現代化單頁應用程式，採用模組化架構設計，提供完整的 NGO 管理功能。

### 🎯 核心功能
- **用戶認證與權限管理**
- **個案管理系統**
- **活動管理與報名審核**
- **物資管理與分配**
- **儀表板與數據視覺化**
- **排程管理**
- **AI 輔助功能**

## 🏗️ 技術架構

### 核心技術棧
```
React 18 + TypeScript + Vite
├── Material-UI (MUI) - UI 組件庫
├── React Router - 路由管理
├── Axios - HTTP 客戶端
├── React Query - 狀態管理
└── Vite - 建構工具
```

### 開發工具
- **ESLint** - 代碼品質檢查
- **Prettier** - 代碼格式化
- **TypeScript** - 類型安全
- **Vite** - 快速開發與建構

## 📁 目錄結構

```
src/
├── components/           # 組件目錄
│   ├── shared/          # 共享組件
│   ├── layout/          # 布局組件
│   ├── ActivityManagementPage/
│   ├── CaseManagementPage/
│   ├── SuppliesManagementPage/
│   └── SchedulePage/
├── pages/               # 頁面組件
├── services/            # API 服務層
├── hooks/               # 自定義 Hooks
├── contexts/            # React Context
├── types/               # TypeScript 類型定義
├── utils/               # 工具函數
├── styles/              # 樣式文件
├── config/              # 配置文件
└── routes/              # 路由配置
```

## 🧩 組件架構

### 1. 共享組件 (Shared Components)

#### 核心組件
- **AIOptimizeButton** - AI 優化按鈕
- **ComparisonDialog** - 比較對話框
- **ConfirmDialog** - 確認對話框
- **ErrorDialog** - 錯誤對話框
- **GoogleMapSelector** - 地圖選擇器
- **LoadingSpinner** - 載入動畫
- **NotificationBadge** - 通知徽章
- **PageContainer** - 頁面容器
- **PageHeader** - 頁面標題
- **StatCard** - 統計卡片

#### 圖表組件
- **DifficultyRadarChart** - 困難度雷達圖
- **GenderChart** - 性別分布圖
- **RegionChart** - 地區分布圖

#### 表單組件
- **ChangePasswordDialog** - 修改密碼對話框
- **Stepper** - 步驟指示器
- **SpeechToText** - 語音轉文字

### 2. 布局組件 (Layout Components)

#### MainLayout
- 響應式側邊欄導航
- 頂部工具欄
- 用戶權限控制
- 主題切換

#### ProtectedRoute
- 路由權限驗證
- 身份驗證檢查
- 重導向邏輯

#### Sidebar
- 動態導航選單
- 權限基礎顯示
- 折疊/展開功能

### 3. 功能頁面組件

#### ActivityManagementPage
```
ActivityManagementPage/
├── ActivityManagement.tsx      # 主頁面
├── NewActivityForm.tsx         # 新增活動表單
├── CaseRegistrationReview.tsx  # 個案報名審核
├── PublicRegistrationReview.tsx # 公眾報名審核
└── RegistrationReviewMain.tsx  # 報名審核主頁
```

#### CaseManagementPage
```
CaseManagementPage/
├── AddCaseTab.tsx              # 新增個案
└── SearchEditCaseTab.tsx       # 搜尋編輯個案
```

#### SuppliesManagementPage
```
SuppliesManagementPage/
├── InventoryTab.tsx            # 庫存管理
├── DistributionTab.tsx         # 分配管理
├── RegularRequestTab.tsx       # 一般需求
├── EmergencyRequestTab.tsx     # 緊急需求
└── EmergencySupplyNeedAddTab.tsx # 緊急需求新增
```

## 🔧 服務層架構

### API 服務組織
```
services/
├── shared/
│   └── api.ts                 # 基礎 API 配置
├── accountManagement/
│   ├── accountService.ts      # 帳戶管理
│   ├── authService.ts         # 認證服務
│   └── azureService.ts        # Azure 服務
├── activityManagement/
│   ├── activityService.ts     # 活動管理
│   ├── activityAIService.ts   # AI 優化服務
│   ├── activityImageService.ts # 圖片生成
│   └── registrationService.ts # 報名管理
├── caseManagement/
│   ├── caseService.ts         # 個案管理
│   ├── caseNewService.ts      # 新增個案
│   └── caseSpeechService.ts   # 語音服務
├── dashboard/
│   └── dashboardService.ts    # 儀表板數據
├── schedule/
│   ├── calendarService.ts     # 日曆服務
│   └── scheduleService.ts     # 排程服務
└── supplyManagement/
    ├── supplyService.ts       # 物資管理
    ├── distributionBatchService.ts # 批次分配
    └── emergencySupplyNeedService.ts # 緊急需求
```

### 服務特點
- **統一錯誤處理** - 集中式錯誤管理
- **請求攔截器** - 自動添加認證令牌
- **響應攔截器** - 統一處理 API 響應
- **類型安全** - 完整的 TypeScript 類型定義

## 🎨 樣式系統

### 主題配置
```
styles/
├── theme.ts                   # Material-UI 主題配置
├── commonStyles.ts            # 通用樣式定義
└── global.css                 # 全局樣式
```

### 樣式特點
- **設計系統** - 統一的顏色、字體、間距
- **響應式設計** - 適配各種螢幕尺寸
- **主題化** - 支援深色/淺色主題
- **組件化樣式** - 可重用的樣式組件

### 通用樣式類別
- **表單樣式** - 輸入框、按鈕、標籤
- **對話框樣式** - 確認、錯誤、比較對話框
- **表格樣式** - 數據表格、狀態標籤
- **卡片樣式** - 統計卡片、信息卡片
- **動畫效果** - 載入、過渡動畫

## 🔐 認證與權限

### 認證流程
1. **登入驗證** - JWT Token 認證
2. **權限檢查** - 基於角色的權限控制
3. **路由保護** - 自動重導向未授權訪問
4. **Token 刷新** - 自動更新過期令牌

### 權限系統
- **管理員** - 完整系統權限
- **工作人員** - 個案和活動管理
- **志工** - 有限的操作權限

## 📊 狀態管理

### Context API
- **AuthContext** - 用戶認證狀態
- **NotificationContext** - 通知狀態

### 自定義 Hooks
- **useAuth** - 認證相關邏輯
- **useUserRole** - 用戶角色管理
- **useNotificationStatus** - 通知狀態管理

## 🚀 性能優化

### 代碼分割
- **路由級分割** - 按頁面分割代碼
- **組件級分割** - 大型組件懶載入
- **預載入策略** - 智能預載入關鍵組件

### 優化技術
- **React.memo** - 組件記憶化
- **useCallback/useMemo** - 函數和值記憶化
- **虛擬滾動** - 大量數據渲染優化
- **圖片懶載入** - 按需載入圖片

## 🔧 開發工具

### 建構配置
- **Vite** - 快速開發伺服器
- **TypeScript** - 類型檢查
- **ESLint** - 代碼品質
- **Prettier** - 代碼格式化

### 部署配置
- **環境變數** - 多環境配置
- **建構優化** - 生產環境優化
- **CDN 配置** - 靜態資源加速

## 📱 響應式設計

### 斷點系統
- **xs** - 手機 (0-600px)
- **sm** - 平板 (600-960px)
- **md** - 桌面 (960-1280px)
- **lg** - 大螢幕 (1280px+)

### 適配策略
- **流動布局** - 彈性網格系統
- **組件適配** - 響應式組件設計
- **觸控優化** - 移動設備交互優化

## 🔍 錯誤處理

### 錯誤類型
- **網路錯誤** - API 請求失敗
- **驗證錯誤** - 表單驗證失敗
- **權限錯誤** - 訪問權限不足
- **系統錯誤** - 未預期錯誤

### 處理策略
- **用戶友好提示** - 清晰的錯誤訊息
- **自動重試** - 網路錯誤自動重試
- **錯誤邊界** - React Error Boundary
- **錯誤日誌** - 錯誤追蹤和分析

## 🧪 測試策略

### 測試類型
- **單元測試** - 組件和函數測試
- **整合測試** - API 整合測試
- **端到端測試** - 用戶流程測試

### 測試工具
- **Jest** - 測試框架
- **React Testing Library** - 組件測試
- **Cypress** - 端到端測試

## 📈 監控與分析

### 性能監控
- **載入時間** - 頁面載入性能
- **交互響應** - 用戶交互響應時間
- **錯誤率** - 應用程式錯誤統計

### 用戶分析
- **使用行為** - 用戶操作分析
- **功能使用** - 功能使用統計
- **用戶反饋** - 用戶體驗反饋

## 🔄 版本控制

### Git 工作流
- **功能分支** - 新功能開發
- **發布分支** - 版本發布管理
- **熱修復** - 緊急問題修復

### 發布流程
- **自動化測試** - CI/CD 流程
- **代碼審查** - 代碼品質保證
- **自動部署** - 生產環境部署

## 📚 文檔維護

### 文檔類型
- **API 文檔** - 服務接口文檔
- **組件文檔** - 組件使用說明
- **部署文檔** - 部署和配置指南
- **用戶手冊** - 功能使用指南

### 維護策略
- **即時更新** - 代碼變更同步更新
- **版本對應** - 文檔版本與代碼版本對應
- **用戶反饋** - 根據用戶反饋改進文檔 