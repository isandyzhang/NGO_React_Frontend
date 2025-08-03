# 共享對話框組件使用指南

本目錄包含了統一的對話框組件，使用 `commonStyles` 中定義的樣式，確保整個應用程式的對話框風格一致。

## 組件列表

### 1. ComparisonDialog - 比較對話框
用於顯示兩個版本內容的比較，如 AI 優化前後的對比。

```tsx
import { ComparisonDialog } from '../shared';

<ComparisonDialog
  open={showDialog}
  onClose={handleClose}
  title="AI 優化結果比較"
  icon={<CompareIcon />}
  originalText="原始文字內容"
  optimizedText="優化後文字內容"
  originalLabel="原始描述"
  optimizedLabel="AI 優化後描述"
  originalLength={100}
  optimizedLength="優化後文字內容"
  onAccept={handleAccept}
  onRegenerate={handleRegenerate}
  acceptButtonText="採用優化版本"
  regenerateButtonText="重新生成"
  isRegenerating={false}
/>
```

### 2. ConfirmDialog - 確認對話框
用於需要用戶確認的操作，如刪除、同意、拒絕等。

```tsx
import { ConfirmDialog } from '../shared';

<ConfirmDialog
  open={showConfirm}
  onClose={handleClose}
  title="確認刪除"
  message="您確定要刪除這個項目嗎？此操作無法撤銷。"
  confirmText="確定刪除"
  cancelText="取消"
  onConfirm={handleDelete}
  confirmButtonVariant="danger"
  icon={<DeleteIcon />}
/>
```

### 3. ErrorDialog - 錯誤對話框
用於顯示錯誤訊息。

```tsx
import { ErrorDialog } from '../shared';

<ErrorDialog
  open={showError}
  onClose={handleClose}
  title="發生錯誤"
  message="無法連接到伺服器，請檢查網路連線後重試。"
  closeText="關閉"
/>
```

## 按鈕變體 (Button Variants)

ConfirmDialog 支援以下按鈕變體：

- `primary` - 主要操作（藍色）
- `danger` - 危險操作（紅色）
- `approve` - 同意操作（綠色）
- `reject` - 拒絕操作（紅色）

## 樣式系統

所有對話框組件都使用 `commonStyles` 中定義的樣式：

- `comparisonDialog` - 比較對話框樣式
- `confirmDialog` - 確認對話框樣式
- `errorDialog` - 錯誤對話框樣式
- `infoDialog` - 資訊對話框樣式

## 使用建議

1. **一致性**：優先使用這些預定義的對話框組件，確保 UI 一致性
2. **可訪問性**：所有組件都包含適當的 ARIA 標籤和鍵盤導航支援
3. **響應式**：組件會自動適應不同螢幕尺寸
4. **主題化**：樣式會自動跟隨應用程式的主題設定

## 自定義

如果需要自定義樣式，可以：

1. 修改 `commonStyles.ts` 中的對話框樣式定義
2. 創建新的對話框組件，繼承現有的樣式結構
3. 使用 `getDialogStyle()` 輔助函數獲取特定類型的樣式

## 範例

完整的範例請參考：
- `AIOptimizeButton.tsx` - 使用 ComparisonDialog
- `CaseRegistrationReview.tsx` - 使用 ConfirmDialog 