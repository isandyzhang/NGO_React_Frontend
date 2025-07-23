# AI 圖片生成功能說明

## 功能概述

AI 圖片生成功能允許用戶在新增活動時，使用 Azure OpenAI 的 DALL-E-3 模型生成符合描述的活動圖片。

## 技術架構

### 後端 (ASP.NET Core)
- **Controller**: `ImageGenerationController`
- **API 端點**: 
  - `POST /api/ImageGeneration/generate` - 生成圖片
  - `POST /api/ImageGeneration/test-connection` - 測試連接
- **依賴**: `Azure.AI.OpenAI` SDK

### 前端 (React)
- **服務**: `imageGenerationService.ts`
- **組件**: `NewActivityForm.tsx` 中的 AI 生成按鈕和對話框
- **功能**: 圖片描述輸入、生成、預覽和使用

## 配置說明

### 1. Azure OpenAI 配置

在 `appsettings.json` 中添加以下配置：

```json
{
  "AzureOpenAI": {
    "Endpoint": "https://your-resource.openai.azure.com/",
    "ApiKey": "your-api-key",
    "DeploymentName": "gpt-4.1",
    "DalleDeploymentName": "dall-e-3"
  }
}
```

### 2. 環境變數

在 Azure App Service 的應用程式設定中添加：

- `AzureOpenAI:Endpoint` - Azure OpenAI 服務端點
- `AzureOpenAI:ApiKey` - Azure OpenAI API 金鑰
- `AzureOpenAI:DalleDeploymentName` - DALL-E-3 部署名稱

## 使用流程

### 1. 生成圖片
1. 在新增活動頁面點擊 "AI 生成" 按鈕
2. 在彈出的對話框中輸入圖片描述
3. 點擊 "生成圖片" 按鈕
4. 等待 AI 生成完成
5. 預覽生成的圖片
6. 點擊 "使用此圖片" 將圖片應用到活動

### 2. 圖片存儲
- AI 生成的圖片不會立即存儲到 Azure Blob Storage
- 圖片會在提交活動表單時，與其他圖片一起統一上傳
- 確保數據一致性和事務安全

## 功能特點

### 1. 用戶體驗
- **直觀界面**: 簡潔的對話框設計
- **即時預覽**: 生成後可立即預覽圖片
- **描述提示**: 提供示例描述幫助用戶輸入
- **進度指示**: 生成過程中顯示載入動畫

### 2. 錯誤處理
- **輸入驗證**: 檢查描述長度和內容
- **連接測試**: 提供測試按鈕驗證服務配置
- **錯誤提示**: 詳細的錯誤訊息和建議

### 3. 安全性
- **API 金鑰保護**: 金鑰存儲在後端配置中
- **輸入清理**: 驗證和清理用戶輸入
- **錯誤隱藏**: 不暴露敏感配置信息

## API 文檔

### 生成圖片
```http
POST /api/ImageGeneration/generate
Content-Type: application/json

{
  "prompt": "圖片描述文字"
}
```

**回應**:
```json
{
  "success": true,
  "imageData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "message": "圖片生成成功"
}
```

### 測試連接
```http
POST /api/ImageGeneration/test-connection
```

**回應**:
```json
{
  "success": true,
  "message": "Azure OpenAI 連接測試成功"
}
```

## 開發注意事項

### 1. 成本控制
- DALL-E-3 API 調用有費用
- 建議添加使用限制和監控
- 考慮緩存常用生成的圖片

### 2. 性能優化
- 圖片生成可能需要 10-30 秒
- 建議添加超時處理
- 考慮異步處理大圖片

### 3. 內容政策
- 確保生成的圖片符合使用規範
- 添加內容過濾機制
- 提供舉報和審核功能

## 故障排除

### 常見問題

1. **連接測試失敗**
   - 檢查 Azure OpenAI 配置
   - 確認 API 金鑰有效
   - 驗證端點 URL 格式

2. **圖片生成失敗**
   - 檢查描述是否符合內容政策
   - 確認服務配額是否充足
   - 查看後端日誌獲取詳細錯誤

3. **圖片無法顯示**
   - 檢查 Base64 數據格式
   - 確認圖片大小限制
   - 驗證瀏覽器支援

### 日誌查看

後端日誌會記錄以下信息：
- 圖片生成請求
- API 調用結果
- 錯誤詳情和堆疊追蹤

## 未來改進

1. **批量生成**: 支援一次生成多張圖片
2. **風格選擇**: 提供不同的圖片風格選項
3. **歷史記錄**: 保存用戶的生成歷史
4. **智能建議**: 基於活動類型推薦描述
5. **圖片編輯**: 支援生成後的圖片編輯功能 