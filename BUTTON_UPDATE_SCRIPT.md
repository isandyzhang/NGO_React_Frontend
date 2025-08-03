# 按鈕樣式批量更新腳本

## 已更新的檔案

### ✅ 已完成更新的檔案
1. **NewActivityForm.tsx** - 已更新所有按鈕使用 commonStyles
2. **InventoryTab.tsx** - 已更新搜尋、儲存、刪除按鈕
3. **AccountManagement.tsx** - 已更新新增帳號、確認刪除按鈕

### ✅ 已正確使用 commonStyles 的檔案
1. **Login.tsx** - 已正確使用 `commonStyles.primaryButton`
2. **AddCaseTab.tsx** - 已正確使用 `commonStyles.primaryButton`

## 需要檢查和更新的檔案

### 🔍 待檢查的檔案列表

#### 活動管理相關
- `ActivityManagement.tsx` (6個按鈕)
- `PublicRegistrationReview.tsx` (6個按鈕)
- `CaseRegistrationReview.tsx` (6個按鈕)

#### 個案管理相關
- `SearchEditCaseTab.tsx` (4個按鈕)

#### 物資管理相關
- `RegularRequestTab.tsx` (6個按鈕)
- `DistributionTab.tsx` (5個按鈕)
- `EmergencyRequestTab.tsx` (4個按鈕)
- `EmergencySupplyNeedAddTab.tsx` (1個按鈕)

#### 帳號管理相關
- `AddAccountDialog.tsx` (1個按鈕)
- `EditAccountDialog.tsx` (1個按鈕)

#### 其他組件
- `CalendarPage/index.tsx` (3個按鈕)
- `AIOptimizeButton.tsx` (1個按鈕)
- `ChangePasswordDialog.tsx` (1個按鈕)
- `Stepper.tsx` (2個按鈕)
- `SpeechToText.tsx` (1個按鈕)

## 更新步驟

### 1. 檢查檔案是否已導入 commonStyles
```tsx
// 檢查是否有這行導入
import { commonStyles, getButtonStyle, getButtonVariant } from '../../styles/commonStyles';
```

### 2. 更新按鈕樣式
```tsx
// 舊的方式
<Button variant="contained" sx={{ bgcolor: 'green', color: 'white' }}>
  儲存
</Button>

// 新的方式
<Button
  variant={getButtonVariant('primary')}
  sx={{
    ...getButtonStyle('primary'),
  }}
>
  儲存
</Button>
```

### 3. 按鈕類型對應
- **主要操作** (儲存、提交、確認): `primary`
- **次要操作** (取消、返回): `secondary`
- **危險操作** (刪除、移除): `danger`
- **同意操作** (批准、同意): `approve`
- **拒絕操作** (拒絕、不同意): `reject`
- **上傳操作** (檔案上傳): `upload`
- **移除操作** (小按鈕): `remove`

## 批量更新命令

### 搜尋所有需要更新的按鈕
```bash
grep -r "variant=\"contained\"" src/components/ src/pages/ | grep -v "commonStyles"
```

### 檢查特定檔案
```bash
# 檢查活動管理檔案
grep -n "variant=\"contained\"" src/components/ActivityManagementPage/*.tsx

# 檢查物資管理檔案
grep -n "variant=\"contained\"" src/components/SuppliesManagementPage/*.tsx

# 檢查個案管理檔案
grep -n "variant=\"contained\"" src/components/CaseManagementPage/*.tsx
```

## 優先級順序

### 🔥 高優先級 (常用功能)
1. `ActivityManagement.tsx` - 活動管理主要功能
2. `SearchEditCaseTab.tsx` - 個案搜尋編輯
3. `DistributionTab.tsx` - 物資分配

### 🟡 中優先級 (管理功能)
1. `PublicRegistrationReview.tsx` - 民眾報名審核
2. `CaseRegistrationReview.tsx` - 個案報名審核
3. `RegularRequestTab.tsx` - 定期需求

### 🟢 低優先級 (輔助功能)
1. `EmergencyRequestTab.tsx` - 緊急需求
2. `CalendarPage/index.tsx` - 日曆功能
3. 其他對話框組件

## 更新檢查清單

### 每個檔案需要檢查的項目：
- [ ] 是否已導入 `getButtonStyle` 和 `getButtonVariant`
- [ ] 主要操作按鈕是否使用 `primary` 類型
- [ ] 取消按鈕是否使用 `secondary` 類型
- [ ] 刪除按鈕是否使用 `danger` 類型
- [ ] 文字顏色是否正確 (主要按鈕應為白色)
- [ ] 樣式是否統一

### 測試項目：
- [ ] 按鈕 hover 效果正常
- [ ] 按鈕 disabled 狀態正常
- [ ] 響應式設計正常
- [ ] 無 console 錯誤

## 完成標準

當所有檔案都更新完成後，應該：
1. 所有主要按鈕文字都是白色
2. 按鈕樣式統一且一致
3. 代碼維護性提高
4. 用戶體驗改善 