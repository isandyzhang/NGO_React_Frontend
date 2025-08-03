# 按鈕樣式使用指南

## 概述

本專案在 `commonStyles.ts` 中定義了統一的按鈕樣式，確保整個應用程式的按鈕風格一致。

## 可用的按鈕類型

### 1. 主要按鈕 (Primary Button)
- **用途**: 主要操作，如提交、確認、儲存
- **樣式**: 綠色背景，白色文字
- **使用方式**:
```tsx
import { commonStyles, getButtonStyle, getButtonVariant } from '../../styles/commonStyles';

<Button
  variant={getButtonVariant('primary')}
  sx={{
    ...getButtonStyle('primary'),
    // 可以覆蓋特定樣式
    backgroundColor: customColor,
  }}
>
  儲存
</Button>
```

### 2. 次要按鈕 (Secondary Button)
- **用途**: 取消、返回等次要操作
- **樣式**: 透明背景，灰色邊框
- **使用方式**:
```tsx
<Button
  variant={getButtonVariant('secondary')}
  sx={{
    ...getButtonStyle('secondary'),
  }}
>
  取消
</Button>
```

### 3. 危險按鈕 (Danger Button)
- **用途**: 刪除、取消等危險操作
- **樣式**: 紅色背景，白色文字
- **使用方式**:
```tsx
<Button
  variant={getButtonVariant('danger')}
  sx={{
    ...getButtonStyle('danger'),
  }}
>
  刪除
</Button>
```

### 4. 同意按鈕 (Approve Button)
- **用途**: 批准、同意等正面操作
- **樣式**: 綠色背景，白色文字
- **使用方式**:
```tsx
<Button
  variant={getButtonVariant('approve')}
  sx={{
    ...getButtonStyle('approve'),
  }}
>
  同意
</Button>
```

### 5. 拒絕按鈕 (Reject Button)
- **用途**: 拒絕、不同意等否定操作
- **樣式**: 紅色背景，白色文字
- **使用方式**:
```tsx
<Button
  variant={getButtonVariant('reject')}
  sx={{
    ...getButtonStyle('reject'),
  }}
>
  拒絕
</Button>
```

### 6. 上傳按鈕 (Upload Button)
- **用途**: 文件上傳操作
- **樣式**: 綠色邊框，綠色文字
- **使用方式**:
```tsx
<Button
  variant={getButtonVariant('upload')}
  sx={{
    ...getButtonStyle('upload'),
  }}
>
  選擇檔案
</Button>
```

### 7. 移除按鈕 (Remove Button)
- **用途**: 移除項目的小按鈕
- **樣式**: 小尺寸，灰色文字
- **使用方式**:
```tsx
<Button
  variant={getButtonVariant('remove')}
  sx={{
    ...getButtonStyle('remove'),
  }}
>
  移除
</Button>
```

## 完整使用範例

```tsx
import React from 'react';
import { Button } from '@mui/material';
import { commonStyles, getButtonStyle, getButtonVariant } from '../../styles/commonStyles';

const MyComponent: React.FC = () => {
  return (
    <div>
      {/* 主要操作按鈕 */}
      <Button
        variant={getButtonVariant('primary')}
        onClick={handleSave}
        sx={{
          ...getButtonStyle('primary'),
          // 可以覆蓋特定樣式
          backgroundColor: customColor,
        }}
      >
        儲存
      </Button>

      {/* 次要操作按鈕 */}
      <Button
        variant={getButtonVariant('secondary')}
        onClick={handleCancel}
        sx={{
          ...getButtonStyle('secondary'),
        }}
      >
        取消
      </Button>

      {/* 危險操作按鈕 */}
      <Button
        variant={getButtonVariant('danger')}
        onClick={handleDelete}
        sx={{
          ...getButtonStyle('danger'),
        }}
      >
        刪除
      </Button>
    </div>
  );
};
```

## 注意事項

1. **文字顏色**: 所有主要按鈕（primary、danger、approve、reject）都確保文字為白色
2. **響應式設計**: 按鈕樣式已包含響應式設計考慮
3. **無障礙設計**: 按鈕樣式符合無障礙設計標準
4. **一致性**: 請使用這些預定義樣式，避免自定義按鈕樣式

## 遷移指南

如果您有現有的按鈕需要遷移到新的樣式系統：

1. 導入必要的函數：
```tsx
import { getButtonStyle, getButtonVariant } from '../../styles/commonStyles';
```

2. 替換現有的按鈕樣式：
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

這樣可以確保整個應用程式的按鈕風格一致，並且易於維護。 