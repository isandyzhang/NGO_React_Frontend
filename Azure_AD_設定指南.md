# 🔐 Azure AD 混合登入模式設定指南

## 📋 目錄
- [概述](#概述)
- [Azure App Registration 設定](#azure-app-registration-設定)
- [環境變數配置](#環境變數配置)
- [功能測試](#功能測試)
- [常見問題](#常見問題)

---

## 概述

本系統支援**混合模式身份驗證**，使用者可以選擇：
1. **資料庫登入**：使用既有的工作人員帳號密碼
2. **Azure AD 登入**：使用 Microsoft 365 帳號單一登入（SSO）

### 🎯 實作狀態
- ✅ 混合架構已完成
- ✅ 程式碼整合完成
- ⚠️ **需要配置 Azure AD** 才能使用 SSO 功能
- ✅ 資料庫登入持續正常運作

---

## Azure App Registration 設定

### 第一步：建立 Azure App Registration

1. **登入 Azure Portal**
   - 前往 [Azure Portal](https://portal.azure.com)
   - 使用管理員帳號登入

2. **導航到 Azure Active Directory**
   ```
   Azure Portal → Azure Active Directory → App registrations
   ```

3. **建立新的應用程式註冊**
   - 點擊 `+ New registration`
   - 填寫以下資訊：
     ```
     Name: NGO案管系統
     Supported account types: Accounts in this organizational directory only
     Redirect URI: 
       - Type: Single-page application (SPA)
       - Value: http://localhost:5173 (開發環境)
       - Value: https://your-production-domain.com (生產環境)
     ```

4. **記錄重要資訊**
   - 註冊完成後，記錄以下資訊：
     - **Application (client) ID**：例如 `12345678-1234-1234-1234-123456789abc`
     - **Directory (tenant) ID**：例如 `87654321-4321-4321-4321-fedcba987654`

### 第二步：配置 API 權限

1. **新增 API 權限**
   ```
   App registration → API permissions → Add a permission
   ```

2. **選擇 Microsoft Graph**
   - 選擇 `Microsoft Graph`
   - 選擇 `Delegated permissions`

3. **新增必要權限**
   ```
   ✅ openid
   ✅ profile  
   ✅ User.Read
   ✅ email
   ```

4. **授予管理員同意**
   - 點擊 `Grant admin consent for [Organization]`
   - 確認授權

### 第三步：配置身份驗證設定

1. **設定重導向 URI**
   ```
   App registration → Authentication
   
   單頁應用程式：
   - http://localhost:5173 (開發)
   - https://your-domain.com (生產)
   
   登出 URL：
   - http://localhost:5173/login (開發)
   - https://your-domain.com/login (生產)
   ```

2. **啟用隱式授予流程**（可選）
   ```
   ☑️ Access tokens (used for implicit flows)
   ☑️ ID tokens (used for implicit and hybrid flows)
   ```

---

## 環境變數配置

### 第一步：建立環境檔案

1. **複製環境範本**
   ```bash
   cd NGO_React_Frontend
   cp .env.example .env.local
   ```

2. **編輯 .env.local**
   ```env
   # API 設定
   VITE_API_BASE_URL=http://localhost:5264
   VITE_APP_NAME=NGO案管系統
   
   # Azure AD 設定
   VITE_AZURE_CLIENT_ID=你的-azure-client-id
   VITE_AZURE_TENANT_ID=你的-tenant-id
   VITE_AZURE_REDIRECT_URI=http://localhost:5173
   VITE_AZURE_LOGOUT_URI=http://localhost:5173/login
   VITE_ENABLE_AZURE_LOGIN=true
   VITE_USE_POPUP_LOGIN=false
   VITE_DEBUG_AZURE=true
   ```

### 第二步：配置說明

| 變數名稱 | 說明 | 範例值 |
|---------|------|--------|
| `VITE_AZURE_CLIENT_ID` | Azure App Registration 的用戶端 ID | `12345678-1234-1234-1234-123456789abc` |
| `VITE_AZURE_TENANT_ID` | Azure AD 租用戶 ID | `87654321-4321-4321-4321-fedcba987654` |
| `VITE_AZURE_REDIRECT_URI` | 登入後重導向網址 | `http://localhost:5173` |
| `VITE_AZURE_LOGOUT_URI` | 登出後重導向網址 | `http://localhost:5173/login` |
| `VITE_ENABLE_AZURE_LOGIN` | 是否啟用 Azure AD 登入 | `true` 或 `false` |
| `VITE_USE_POPUP_LOGIN` | 使用彈出視窗登入 | `true` 或 `false` |
| `VITE_DEBUG_AZURE` | 啟用 Azure AD 偵錯 | `true` 或 `false` |

---

## 功能測試

### 第一步：重啟開發伺服器

```bash
cd NGO_React_Frontend
npm run dev
```

### 第二步：測試登入功能

1. **資料庫登入測試**
   - 使用既有的工作人員帳號密碼
   - 應該正常運作

2. **Azure AD 登入測試**
   - 如果 `VITE_ENABLE_AZURE_LOGIN=true` 且配置正確
   - 應該顯示「使用 Azure AD 登入」按鈕
   - 如果配置不完整，顯示「Azure AD 登入（未配置）」

3. **測試案例**
   ```
   ✅ 資料庫登入成功
   ✅ Azure AD 按鈕顯示狀態正確
   ✅ 登入狀態持續保持
   ✅ 登出功能正常
   ✅ 頁面重新載入後狀態保持
   ```

---

## 常見問題

### Q1: Azure AD 按鈕顯示「未配置」

**解決方案：**
1. 檢查 `.env.local` 檔案是否存在
2. 確認 `VITE_AZURE_CLIENT_ID` 和 `VITE_AZURE_TENANT_ID` 不為空
3. 確認 `VITE_ENABLE_AZURE_LOGIN=true`
4. 重啟開發伺服器

### Q2: Azure AD 登入時出現錯誤

**可能原因及解決方案：**

1. **hash_empty_error 錯誤**
   ```
   錯誤訊息：Hash value cannot be processed because it is empty
   ```
   **解決方案：**
   - 系統已自動處理此錯誤，會自動清理 URL
   - 如持續出現，請檢查重導向 URI 設定
   - 嘗試重新載入頁面

2. **重導向 URI 不匹配**
   - 檢查 Azure App Registration 中的重導向 URI
   - 確保與 `VITE_AZURE_REDIRECT_URI` 相同
   - URI 必須完全匹配（包括 http/https、port）

3. **權限不足**
   - 確認已授予必要的 API 權限
   - 檢查是否已執行管理員同意

4. **租用戶設定**
   - 確認使用正確的 `VITE_AZURE_TENANT_ID`
   - 或使用 `common` 支援多租用戶

### Q3: 彈出視窗被阻擋

**解決方案：**
1. 設定 `VITE_USE_POPUP_LOGIN=false` 使用重導向登入
2. 或者允許瀏覽器彈出視窗權限

### Q4: 開發與生產環境切換

**開發環境 (.env.local)：**
```env
VITE_AZURE_REDIRECT_URI=http://localhost:5173
VITE_AZURE_LOGOUT_URI=http://localhost:5173/login
```

**生產環境 (.env.production)：**
```env
VITE_AZURE_REDIRECT_URI=https://your-domain.com
VITE_AZURE_LOGOUT_URI=https://your-domain.com/login
```

### Q5: 偵錯 Azure AD 問題

**啟用偵錯模式：**
```env
VITE_DEBUG_AZURE=true
```

**檢查瀏覽器控制台：**
- F12 開發者工具
- Console 標籤
- 查看 MSAL 相關日誌

**常見錯誤解決步驟：**
1. **hash_empty_error**：
   ```bash
   # 檢查重導向 URI 設定
   # 確保 Azure App Registration 中的 URI 與環境變數一致
   
   # 開發環境
   VITE_AZURE_REDIRECT_URI=http://localhost:5173
   
   # Azure Portal 中設定
   # 單頁應用程式 → http://localhost:5173
   ```

2. **MSAL 初始化錯誤**：
   - 檢查 Client ID 和 Tenant ID 是否正確
   - 確認網路連線正常
   - 清除瀏覽器快取

3. **權限錯誤**：
   - 確認 API 權限已正確授予
   - 檢查管理員同意是否完成

---

## 📞 技術支援

如果在設定過程中遇到問題：

1. **檢查環境變數**：確保所有必要的變數都已正確設定
2. **查看控制台錯誤**：開啟瀏覽器開發者工具檢查錯誤訊息
3. **測試資料庫登入**：確認基本登入功能仍然正常
4. **段落式設定**：先設定基本功能，再逐步啟用 Azure AD

---

## 🎯 下一步

完成 Azure AD 設定後，您將擁有：

✅ **雙重登入方式**：資料庫 + Azure AD  
✅ **單一登入體驗**：Microsoft 365 整合  
✅ **靈活配置**：可隨時啟用/停用 Azure AD  
✅ **向後兼容**：既有使用者無需改變使用習慣

**系統現在已完全支援混合模式身份驗證！** 🚀