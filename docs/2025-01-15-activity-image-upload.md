# 活動圖片上傳功能開發日誌

**日期**: 2025-01-15  
**工作項目**: 實作 Azure Blob Storage 圖片上傳功能  
**開發者**: Claude Code Assistant  

## 📋 工作摘要

修復活動管理頁面的圖片上傳問題，從原本的 Base64 儲存改為 Azure Blob Storage 方案。

## 🐛 原始問題

1. **新增活動時無法儲存** - 時間格式不匹配（DateOnly vs DateTime）
2. **有圖片時無法建立活動** - Base64 字串超過資料庫欄位長度限制（255字元）

## ✅ 已完成的修正

### 1. 時間格式問題修正
**檔案**: `D:\GitHub\NGO_WebAPI_Backend\Models\Activity.cs`
```csharp
// 修正前: DateOnly?
// 修正後: DateTime?
public DateTime? StartDate { get; set; }
public DateTime? EndDate { get; set; }
public DateTime? SignupDeadline { get; set; }
```

**檔案**: `D:\GitHub\NGO_WebAPI_Backend\Controllers\ActivityController.cs`
- 移除所有 `DateOnly.FromDateTime()` 和 `ToDateTime()` 轉換
- 直接使用 DateTime 類型

### 2. Azure Blob Storage 圖片上傳實作

#### 後端修改

**檔案**: `D:\GitHub\NGO_WebAPI_Backend\NGO_WebAPI_Backend.csproj`
```xml
<PackageReference Include="Azure.Storage.Blobs" Version="12.22.2" />
```

**檔案**: `D:\GitHub\NGO_WebAPI_Backend\appsettings.json`
```json
{
  "ConnectionStrings": {
    "AzureStorage": "你的Azure Storage連接字串"
  },
  "AzureStorage": {
    "ContainerName": "activity-images"
  }
}
```

**檔案**: `D:\GitHub\NGO_WebAPI_Backend\Controllers\ActivityController.cs`
- 新增 `POST /api/Activity/upload-image` 端點
- 新增 `POST /api/Activity/test-upload` 測試端點
- 加入 `[AllowAnonymous]` 允許無登入上傳
- 圖片驗證：類型、大小（5MB）
- 自動產生唯一檔名
- 回傳 Azure Blob URL

**檔案**: `D:\GitHub\NGO_WebAPI_Backend\Models\NgoplatformDbContext.cs`
```csharp
// 還原為適合 URL 的長度
entity.Property(e => e.ImageUrl)
    .HasMaxLength(255)
    .IsUnicode(false);
```

#### 前端修改

**檔案**: `D:\GitHub\Case-Management-System\src\services\activityService.ts`
```typescript
// 新增 uploadImage 方法
async uploadImage(formData: FormData): Promise<{ imageUrl: string }>
```

**檔案**: `D:\GitHub\Case-Management-System\src\components\ActivityManagementPage\NewActivityForm.tsx`
- 修改 `handleImageUpload` 為 async 函數
- 先上傳圖片到 Azure，再建立活動
- 加入上傳中動畫效果
- 詳細錯誤處理和訊息顯示

## 🔄 工作流程

### 新的圖片上傳流程
1. 用戶選擇圖片檔案
2. 前端驗證檔案類型和大小
3. 上傳到 Azure Blob Storage (`/api/Activity/upload-image`)
4. Azure 回傳永久 URL
5. 前端將 URL 設定到表單
6. 建立活動時只儲存 URL 到資料庫

### 資料格式對比
```
舊方式: Base64 字串（6,000,000+ 字元）
新方式: Azure URL（~150 字元）
範例: https://ngoimages.blob.core.windows.net/activity-images/abc123.jpg
```

## 🚨 目前狀態

### ⚠️ 待解決問題
- **圖片上傳失敗**: 用戶反應上傳圖片時直接跳出失敗訊息
- 已加入詳細錯誤處理，需要查看具體錯誤原因

### 🔧 排查步驟
1. **重新編譯後端**: `dotnet build && dotnet run`
2. **檢查錯誤訊息**: 查看瀏覽器 Console 和錯誤彈窗
3. **測試基本連通性**: 使用 `/api/Activity/test-upload` 端點
4. **設定 Azure 連接字串**: 替換 appsettings.json 中的預設值

### 可能的錯誤原因
- Azure Storage 連接字串未設定（`"你的Azure Storage連接字串"`）
- 後端服務未啟動
- API 路徑錯誤
- 網路連線問題

## 📁 修改的檔案清單

### 後端檔案
- `NGO_WebAPI_Backend.csproj` - 新增 Azure Blob Storage 套件
- `appsettings.json` - Azure Storage 設定
- `Models/Activity.cs` - 時間欄位類型修正
- `Models/NgoplatformDbContext.cs` - ImageUrl 欄位長度還原
- `Controllers/ActivityController.cs` - 新增圖片上傳 API

### 前端檔案
- `services/activityService.ts` - 新增圖片上傳服務
- `components/ActivityManagementPage/NewActivityForm.tsx` - 圖片上傳邏輯修改

## 🎯 下一步工作

1. **排查當前上傳失敗問題**
   - 查看詳細錯誤訊息
   - 確認 Azure Storage 設定
   - 測試 API 連通性

2. **Azure Storage 設定**
   - 建立 Azure Storage 帳戶
   - 取得連接字串
   - 設定容器權限

3. **功能測試**
   - 測試圖片上傳流程
   - 驗證活動建立功能
   - 確認圖片顯示正常

4. **優化改進**
   - 加入圖片壓縮
   - 支援多張圖片
   - 改善使用者體驗

## 💡 技術筆記

### Azure Blob Storage 優勢
- 專業的檔案儲存服務
- 自動備份和災難恢復
- CDN 加速支援
- 成本效益高
- 減輕資料庫負擔

### 實作重點
- 使用 `FormData` 而非 axios 避免 Content-Type 問題
- `[AllowAnonymous]` 簡化權限管理
- 唯一檔名避免衝突：`{Guid}_{原檔名}`
- 完整的錯誤處理和使用者回饋

---
**備註**: 此文件記錄了 2025-01-15 的開發進度，方便後續開發者接手工作。