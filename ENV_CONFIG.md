# 🔧 環境配置說明

## 📋 概述
本專案使用統一的 API 配置管理，所有 API 請求都通過 `src/config/env.ts` 統一管理。

## 🌐 API 地址配置

### 方法一：使用環境變數 (推薦)
創建 `.env` 文件在專案根目錄：

```env
# API 配置
VITE_API_BASE_URL=http://localhost:5282/api

# 其他配置
VITE_REQUEST_TIMEOUT=10000
VITE_APP_NAME=NGO個案管理系統
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development
VITE_MAX_FILE_SIZE=5242880
VITE_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif
VITE_DEFAULT_PAGE_SIZE=10
```

### 方法二：直接修改 env.ts
如果不使用 `.env` 文件，可以直接修改 `src/config/env.ts` 中的預設值。

## 🖥️ 不同裝置配置

### 本地開發
```env
VITE_API_BASE_URL=http://localhost:5282/api
```

### 其他開發者機器
```env
# 根據實際 API 運行端口調整
VITE_API_BASE_URL=http://localhost:5000/api
# 或
VITE_API_BASE_URL=http://localhost:7240/api
```

### 生產環境
```env
VITE_API_BASE_URL=https://your-api-domain.com/api
```

## 📁 文件結構
```
src/
├── config/
│   └── env.ts           # 統一配置管理
├── services/
│   ├── api.ts           # API 客戶端 (Axios)
│   ├── caseService.ts   # 個案服務
│   └── ...
```

## 🔄 配置流程
1. **創建 `.env` 文件**：複製上面的範本
2. **調整 API 地址**：根據您的 API 實際運行端口
3. **重啟開發服務器**：`npm run dev`
4. **驗證連接**：檢查瀏覽器開發者工具的網路請求

## 🚀 優勢
- ✅ **統一管理**：所有 API 請求都使用相同配置
- ✅ **環境隔離**：不同環境可以有不同配置
- ✅ **版本控制友好**：`.env` 文件可以被 gitignore
- ✅ **團隊協作**：每個開發者可以有自己的配置
- ✅ **自動處理**：請求攔截器、錯誤處理、認證等

## 🛠️ 故障排除

### API 連接失敗
1. 檢查 API 是否正在運行
2. 確認端口號是否正確
3. 檢查 CORS 設定
4. 查看瀏覽器開發者工具的錯誤訊息

### 環境變數不生效
1. 確保 `.env` 文件在專案根目錄
2. 變數名稱必須以 `VITE_` 開頭
3. 修改後需要重啟開發服務器 