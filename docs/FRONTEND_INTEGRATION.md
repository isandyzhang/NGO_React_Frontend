# 前端與 C# 後端整合說明

## 概述

本專案已經為與 C# 後端的整合做好了準備，包含完整的 API 服務層、類型定義和錯誤處理。

## 已完成的整合準備

### 1. API 服務層
- ✅ **基礎 API 配置** (`src/services/api.ts`)
  - Axios 實例配置
  - 請求/響應攔截器
  - 自動 Token 管理
  - 錯誤處理

- ✅ **個案管理服務** (`src/services/caseService.ts`)
  - 個案 CRUD 操作
  - 搜尋功能
  - 照片上傳
  - 狀態管理

- ✅ **活動管理服務** (`src/services/activityService.ts`)
  - 活動 CRUD 操作
  - 報名管理
  - 審核功能
  - 統計資料

- ✅ **認證服務** (`src/services/authService.ts`)
  - 登入/登出
  - Token 刷新
  - 用戶管理
  - 權限控制

### 2. TypeScript 類型定義
所有 API 相關的類型都已定義，確保類型安全：
```typescript
import { CaseFormData, ActivityRecord, User } from '../services';
```

### 3. 環境變數配置
- 配置文件：`src/config/env.ts`
- 支援開發/生產環境切換
- API URL 可配置

## 如何在組件中使用 API 服務

### 1. 個案管理範例

```typescript
import React, { useState, useEffect } from 'react';
import { caseService, CaseRecord } from '../services';

const CaseList: React.FC = () => {
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // 獲取個案列表
  const fetchCases = async () => {
    try {
      setLoading(true);
      const response = await caseService.getCases({
        page: 1,
        pageSize: 10
      });
      setCases(response.data);
    } catch (error) {
      console.error('獲取個案列表失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  // 創建新個案
  const handleCreateCase = async (caseData: CaseFormData) => {
    try {
      const newCase = await caseService.createCase(caseData);
      setCases(prev => [...prev, newCase]);
    } catch (error) {
      console.error('創建個案失敗:', error);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  return (
    // JSX 內容
  );
};
```

### 2. 活動管理範例

```typescript
import { activityService, ActivityRecord } from '../services';

// 獲取活動列表
const activities = await activityService.getActivities();

// 創建新活動
const newActivity = await activityService.createActivity({
  name: '社區關懷活動',
  location: '台北市',
  volunteerCount: 10,
  participantCount: 20,
  // ... 其他欄位
});

// 審核報名
await activityService.approveRegistration(registrationId);
```

### 3. 認證範例

```typescript
import { authService } from '../services';

// 登入
const loginResult = await authService.login({
  username: 'admin',
  password: 'password'
});

// 檢查登入狀態
const isLoggedIn = authService.isAuthenticated();

// 獲取當前用戶
const currentUser = authService.getStoredUser();
```

## 錯誤處理

API 服務已包含統一的錯誤處理：

```typescript
try {
  const result = await caseService.createCase(data);
  // 處理成功結果
} catch (error) {
  if (error.response?.status === 401) {
    // 未授權，會自動重定向到登入頁
  } else if (error.response?.status === 400) {
    // 請求錯誤，顯示錯誤訊息
    console.error('請求錯誤:', error.response.data.message);
  } else {
    // 其他錯誤
    console.error('操作失敗:', error.message);
  }
}
```

## 環境配置

### 開發環境
在專案根目錄創建 `.env.local` 文件：
```env
VITE_API_BASE_URL=https://localhost:7001/api
VITE_APP_ENV=development
```

### 生產環境
在專案根目錄創建 `.env.production` 文件：
```env
VITE_API_BASE_URL=https://your-production-api.com/api
VITE_APP_ENV=production
```

## 待辦事項

### 後端開發者需要完成：

1. **實作 API 端點**
   - 參考 `docs/API_REFERENCE.md` 文檔
   - 實作所有必要的 Controller 和 Action

2. **設定 CORS**
   ```csharp
   services.AddCors(options =>
   {
       options.AddPolicy("AllowReactApp",
           builder =>
           {
               builder.WithOrigins("http://localhost:5173", "http://localhost:5174", "http://localhost:5175")
                      .AllowAnyHeader()
                      .AllowAnyMethod()
                      .AllowCredentials();
           });
   });
   ```

3. **JWT 認證設定**
   - 配置 JWT Token 生成和驗證
   - 實作 Refresh Token 機制

4. **資料庫設計**
   - 根據前端的類型定義設計對應的資料表
   - 實作 Entity Framework 模型

### 前端開發者需要完成：

1. **更新現有組件**
   - 將模擬資料替換為真實 API 調用
   - 添加載入狀態和錯誤處理

2. **測試 API 整合**
   - 確保所有 API 調用正常工作
   - 驗證錯誤處理機制

3. **優化用戶體驗**
   - 添加載入動畫
   - 改善錯誤提示
   - 實作離線處理

## 範例：將現有組件改為使用真實 API

### 修改前（使用模擬資料）：
```typescript
const [caseRecords] = useState<CaseRecord[]>([
  { id: 1, name: '張三', ... },
  { id: 2, name: '李四', ... },
]);
```

### 修改後（使用真實 API）：
```typescript
const [caseRecords, setCaseRecords] = useState<CaseRecord[]>([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  const fetchCases = async () => {
    try {
      setLoading(true);
      const response = await caseService.getCases();
      setCaseRecords(response.data);
    } catch (error) {
      console.error('載入個案失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchCases();
}, []);
```

## 總結

前端已經完全準備好與 C# 後端整合：
- ✅ 完整的 API 服務層
- ✅ TypeScript 類型定義
- ✅ 錯誤處理機制
- ✅ 環境配置系統
- ✅ 認證和授權支援

只需要後端實作對應的 API 端點，前端就可以無縫接入真實的資料和功能。 