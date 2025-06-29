# 主題使用指南

## 📋 概述

本指南將幫助您正確使用案件管理系統的主題系統，確保 UI 的一致性和可維護性。

## 🎨 THEME_COLORS 常數

我們提供了一套標準化的顏色常數，位於 `src/styles/theme.ts`：

### 主要顏色
```typescript
import { THEME_COLORS } from '../styles/theme';

// 主要綠色系
THEME_COLORS.PRIMARY          // #4caf50 - 主色調
THEME_COLORS.PRIMARY_LIGHT    // #60ad5e - 淺綠色
THEME_COLORS.PRIMARY_DARK     // #005005 - 深綠色
```

### 文字顏色
```typescript
THEME_COLORS.TEXT_PRIMARY     // #1f2937 - 主要文字（深色）
THEME_COLORS.TEXT_SECONDARY   // #374151 - 次要文字（中等深度）
THEME_COLORS.TEXT_MUTED       // #6b7280 - 弱化文字（灰色）
THEME_COLORS.TEXT_LIGHT       // #9ca3af - 淺色文字
```

### 背景顏色
```typescript
THEME_COLORS.BACKGROUND_PRIMARY   // #f9fafb - 主要背景
THEME_COLORS.BACKGROUND_SECONDARY // #f3f4f6 - 次要背景
THEME_COLORS.BACKGROUND_CARD      // #ffffff - 卡片背景
```

### 邊框顏色
```typescript
THEME_COLORS.BORDER_LIGHT     // #e5e7eb - 淺邊框
THEME_COLORS.BORDER_DEFAULT   // #d1d5db - 標準邊框
THEME_COLORS.BORDER_DARK      // #9ca3af - 深邊框
```

### 狀態顏色
```typescript
THEME_COLORS.SUCCESS          // #4caf50 - 成功狀態
THEME_COLORS.SUCCESS_LIGHT    // #f1f8e9 - 淺成功色
THEME_COLORS.ERROR            // #f44336 - 錯誤狀態
THEME_COLORS.ERROR_LIGHT      // #ffebee - 淺錯誤色
THEME_COLORS.WARNING          // #ff9800 - 警告狀態
THEME_COLORS.INFO             // #2196f3 - 資訊狀態
```

## 🛠️ commonStyles 共用樣式

使用 `src/styles/commonStyles.ts` 中的預定義樣式：

### 表單樣式
```typescript
import { commonStyles } from '../styles/commonStyles';

// 表單區塊
<Box sx={{ ...commonStyles.formSection }}>
  <Typography sx={{ ...commonStyles.formHeader }}>
    表單標題
  </Typography>
  
  <Typography sx={{ ...commonStyles.formLabel }}>
    欄位標籤
  </Typography>
  
  <TextField sx={{ ...commonStyles.formInput }} />
</Box>
```

### 按鈕樣式
```typescript
// 主要按鈕
<Button sx={{ ...commonStyles.primaryButton }}>
  儲存
</Button>

// 次要按鈕
<Button sx={{ ...commonStyles.secondaryButton }}>
  取消
</Button>
```

### 表格樣式
```typescript
// 表格頭部
<TableCell sx={{ ...commonStyles.tableHeader }}>
  標題
</TableCell>

// 表格單元格
<TableCell sx={{ ...commonStyles.tableCell }}>
  內容
</TableCell>

// 可編輯行
<TableRow sx={{ ...commonStyles.editableRow }}>
  ...
</TableRow>
```

### 狀態標籤
```typescript
import { getStatusStyle } from '../styles/commonStyles';

<Chip 
  label="進行中" 
  sx={{ ...getStatusStyle('ongoing') }}
/>
```

## ✅ 正確使用範例

### ❌ 錯誤用法（硬編碼）
```typescript
<Typography sx={{ 
  color: '#1f2937',        // 硬編碼顏色
  fontWeight: 600,         // 硬編碼字重
  marginBottom: '16px'     // 硬編碼間距
}}>
  標題
</Typography>

<Button sx={{
  backgroundColor: '#4caf50',  // 硬編碼背景色
  '&:hover': {
    backgroundColor: '#388e3c'  // 硬編碼 hover 色
  }
}}>
  按鈕
</Button>
```

### ✅ 正確用法（使用主題）
```typescript
<Typography sx={{ 
  ...commonStyles.formHeader  // 使用預定義樣式
}}>
  標題
</Typography>

<Button sx={{
  ...commonStyles.primaryButton  // 使用共用按鈕樣式
}}>
  按鈕
</Button>

// 或者使用 theme 屬性
<TextField sx={{
  bgcolor: THEME_COLORS.BACKGROUND_PRIMARY,
  '& fieldset': { 
    borderColor: THEME_COLORS.BORDER_LIGHT 
  },
  '&:hover fieldset': { 
    borderColor: THEME_COLORS.PRIMARY 
  },
  '&.Mui-focused fieldset': { 
    borderColor: THEME_COLORS.PRIMARY 
  },
}} />
```

## 🎯 組件開發最佳實踐

### 1. 導入必要的樣式
```typescript
import { THEME_COLORS } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
```

### 2. 使用預定義樣式
優先使用 `commonStyles` 中的樣式，而不是重新定義：

```typescript
// ✅ 推薦
<Box sx={{ ...commonStyles.formSection }}>
  
// ❌ 不推薦  
<Box sx={{ 
  bgcolor: '#ffffff',
  borderRadius: 2,
  p: 3,
  mb: 3,
  border: '1px solid #e5e7eb'
}}>
```

### 3. 響應式設計
使用預定義的響應式間距：

```typescript
import { getResponsiveSpacing } from '../styles/commonStyles';

<Box sx={{ 
  mb: getResponsiveSpacing('md')  // 響應式間距
}}>
```

### 4. 動畫效果
使用預定義的動畫：

```typescript
<Box sx={{ 
  ...commonStyles.animations.fadeIn  // 淡入動畫
}}>
```

## 🔍 表單驗證樣式

```typescript
import { getValidationStyle } from '../styles/commonStyles';

<TextField
  error={hasError}
  sx={getValidationStyle(hasError)}  // 自動應用錯誤樣式
/>
```

## 📱 開發工具

### VS Code 擴展建議
- **Theme IntelliSense**: 自動完成主題屬性
- **Color Highlight**: 顯示顏色預覽

### ESLint 規則
我們建議添加以下 ESLint 規則來防止硬編碼顏色：

```json
{
  "rules": {
    "no-hardcoded-colors": {
      "patterns": ["#[0-9a-fA-F]{3,6}"],
      "message": "請使用 THEME_COLORS 常數替代硬編碼顏色"
    }
  }
}
```

## 🚀 新組件開發檢查清單

- [ ] 導入 `THEME_COLORS` 和 `commonStyles`
- [ ] 使用預定義的顏色常數
- [ ] 優先使用 `commonStyles` 樣式
- [ ] 避免硬編碼任何顏色值
- [ ] 確保響應式設計
- [ ] 測試不同狀態的樣式
- [ ] 檢查可訪問性（對比度）

## 🎨 設計 Token 系統

我們的主題系統基於設計 Token，提供一致的設計語言：

| Token 類型 | 用途 | 範例 |
|-----------|------|------|
| Color | 顏色系統 | `THEME_COLORS.PRIMARY` |
| Typography | 文字樣式 | `commonStyles.formHeader` |
| Spacing | 間距系統 | `commonStyles.spacing.md` |
| Border | 邊框樣式 | `THEME_COLORS.BORDER_LIGHT` |
| Shadow | 陰影效果 | `commonStyles.statsCard` |

## 🔧 自定義擴展

如需添加新的設計 Token：

1. 在 `THEME_COLORS` 中添加新顏色
2. 在 `commonStyles` 中定義新樣式
3. 更新此文件的文檔
4. 通知團隊成員新的可用樣式

---

*保持一致的設計系統是團隊協作的基礎，請遵循這些指南來確保專案的可維護性和擴展性。* 