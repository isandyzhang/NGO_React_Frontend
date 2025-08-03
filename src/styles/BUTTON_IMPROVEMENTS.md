# 按鈕樣式改進總結

## 問題描述

原本的按鈕存在以下問題：
1. 儲存按鈕文字顏色不是白色，影響可讀性
2. 按鈕樣式分散在各個組件中，缺乏統一性
3. 沒有統一的按鈕樣式管理系統

## 解決方案

### 1. 改善 commonStyles.ts 中的按鈕樣式

#### 主要改進：
- **確保文字顏色**: 所有主要按鈕（primary、danger、approve、reject）都確保文字為白色
- **統一按鈕樣式**: 添加了 `textTransform: 'none'`、`borderRadius: 2`、統一的 padding
- **增強樣式覆蓋**: 添加了 `& .MuiButton-label` 選擇器確保文字顏色

#### 新增的按鈕類型：
- `primaryButton`: 主要操作按鈕（綠色背景，白色文字）
- `secondaryButton`: 次要操作按鈕（透明背景，灰色邊框）
- `dangerButton`: 危險操作按鈕（紅色背景，白色文字）
- `approveButton`: 同意操作按鈕（綠色背景，白色文字）
- `rejectButton`: 拒絕操作按鈕（紅色背景，白色文字）
- `uploadButton`: 上傳操作按鈕（綠色邊框，綠色文字）
- `removeButton`: 移除操作按鈕（小尺寸，灰色文字）

### 2. 新增按鈕樣式輔助函數

#### `getButtonStyle(variant: ButtonVariant)`
- 根據按鈕類型返回對應的樣式對象
- 支援所有預定義的按鈕類型

#### `getButtonVariant(variant: ButtonVariant)`
- 根據按鈕類型返回對應的 Material-UI variant
- 自動選擇 'contained'、'outlined' 或 'text'

### 3. 更新 NewActivityForm.tsx

#### 改進的按鈕：
1. **儲存按鈕**: 使用 `getButtonStyle('primary')` 確保文字為白色
2. **取消按鈕**: 使用 `getButtonStyle('secondary')` 統一樣式
3. **AI 生成按鈕**: 使用 `getButtonStyle('upload')` 統一樣式
4. **圖片上傳按鈕**: 使用 `getButtonStyle('upload')` 統一樣式
5. **對話框按鈕**: 使用統一的按鈕樣式

#### 保持原有樣式的按鈕：
- **快速選擇人數按鈕**: 保持動態樣式，因為有特殊的選中狀態

## 使用方式

### 基本使用：
```tsx
import { getButtonStyle, getButtonVariant } from '../../styles/commonStyles';

<Button
  variant={getButtonVariant('primary')}
  sx={{
    ...getButtonStyle('primary'),
  }}
>
  儲存
</Button>
```

### 覆蓋特定樣式：
```tsx
<Button
  variant={getButtonVariant('primary')}
  sx={{
    ...getButtonStyle('primary'),
    backgroundColor: customColor, // 覆蓋背景色
  }}
>
  儲存
</Button>
```

## 效果

### 改進前：
- 儲存按鈕文字顏色不確定
- 按鈕樣式分散，難以維護
- 缺乏統一的設計規範

### 改進後：
- ✅ 所有主要按鈕文字確保為白色
- ✅ 統一的按鈕樣式系統
- ✅ 易於維護和擴展
- ✅ 符合設計規範
- ✅ 提供完整的使用文檔

## 後續建議

1. **逐步遷移**: 其他組件可以逐步遷移到新的按鈕樣式系統
2. **文檔更新**: 更新開發文檔，說明新的按鈕使用方式
3. **代碼審查**: 在代碼審查中檢查按鈕樣式的使用
4. **測試**: 確保所有按鈕在不同狀態下都正常顯示 