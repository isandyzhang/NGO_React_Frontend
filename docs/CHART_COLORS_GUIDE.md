# 📊 圖表顏色使用指南

本指南詳細說明案件管理系統中圖表的顏色配置和使用方式。

## 🎨 設計理念

### 配色策略
- **主色調**：以品牌綠色 `#4caf50` 為核心
- **簡化原則**：統一使用綠色系及相近的自然色調，避免過於鮮豔的配色
- **視覺層次**：通過不同綠色深淺表現數據重要性
- **品牌一致性**：所有圖表顏色都基於主題綠色衍生

## 🎭 顏色配置詳解

### 1. 基礎圖表色彩 (theme.chart.colors)
5色綠色系調色盤，用於一般數據視覺化：
```typescript
colors: [
  '#4caf50',  // 主綠色 - 品牌色
  '#66bb6a',  // 中綠色 - 輔助色
  '#81c784',  // 淺綠色 - 第三色
  '#a5d6a7',  // 更淺綠色 - 第四色
  '#388e3c',  // 深綠色 - 強調色
]
```

### 2. 主要數據系列 (theme.chart.primary)
綠色系漸變，用於重要指標展示：
```typescript
primary: [
  '#4caf50',  // 主綠色
  '#66bb6a',  // 中綠色
  '#81c784',  // 淺綠色
  '#a5d6a7',  // 更淺綠色
]
```

### 3. 次要數據系列 (theme.chart.secondary)
深綠色系，用於輔助信息：
```typescript
secondary: [
  '#388e3c',  // 深綠色
  '#2e7d32',  // 更深綠色
  '#1b5e20',  // 最深綠色
  '#4caf50',  // 回到主色
]
```

### 4. 分類數據色彩 (theme.chart.categorical)
用於個案困難分析等分類數據：
```typescript
categorical: [
  '#4caf50',  // 主綠色
  '#66bb6a',  // 中綠色
  '#81c784',  // 淺綠色
  '#a5d6a7',  // 更淺綠色
  '#388e3c',  // 深綠色
  '#2e7d32',  // 更深綠色
  '#c8e6c9',  // 極淺綠色
  '#e8f5e8',  // 背景綠色
]
```

### 5. 地區分布色彩 (theme.chart.geographic)
用於地理數據展示：
```typescript
geographic: [
  '#4caf50',  // 主綠色
  '#66bb6a',  // 中綠色
  '#81c784',  // 淺綠色
  '#a5d6a7',  // 更淺綠色
  '#388e3c',  // 深綠色
]
```

### 6. 趨勢數據色彩 (theme.chart.trend)
用於時間序列和趨勢圖表：
```typescript
trend: {
  positive: '#4caf50',    // 正向趨勢 - 主綠色
  negative: '#81c784',    // 負向趨勢 - 淺綠色（避免紅色）
  neutral: '#a5d6a7',     // 中性趨勢 - 更淺綠色
  baseline: '#c8e6c9',    // 基準線 - 極淺綠色
}
```

### 7. 狀態指示色彩 (theme.chart.status)
用於狀態標示和進度顯示：
```typescript
status: {
  active: '#4caf50',      // 活躍狀態 - 主綠色
  pending: '#81c784',     // 待處理狀態 - 淺綠色
  completed: '#66bb6a',   // 完成狀態 - 中綠色
  cancelled: '#a5d6a7',   // 取消狀態 - 更淺綠色
  draft: '#c8e6c9',       // 草稿狀態 - 極淺綠色
}
```

## 📈 實際應用範例

### Dashboard 統計卡片
```typescript
const statsCards = [
  {
    title: '個案人數',
    value: '156',
    icon: <Assignment />,
    color: THEME_COLORS.CHART_PRIMARY  // '#4caf50'
  },
  {
    title: '志工人數',
    value: '45',
    icon: <People />,
    color: THEME_COLORS.CHART_SECONDARY  // '#66bb6a'
  },
  // ...
];
```

### 個案困難分析圓餅圖
```typescript
const difficultiesColors = theme.chart.categorical.slice(0, difficultiesData.length);

<PieChart
  colors={difficultiesColors}
  // ...
/>
```

### 地區分布長條圖
```typescript
<BarChart
  colors={theme.chart.geographic}
  series={[
    {
      dataKey: 'count',
      label: '個案人數',
      color: theme.chart.geographic[0]  // '#4caf50'
    },
  ]}
  // ...
/>
```

## 🛠️ 使用方式

### 1. 在組件中引用主題顏色
```typescript
import { useTheme } from '@mui/material/styles';
import { THEME_COLORS } from '../styles/theme';

const MyComponent = () => {
  const theme = useTheme();
  
  // 使用圖表顏色
  const chartColors = theme.chart.categorical;
  const primaryColor = THEME_COLORS.CHART_PRIMARY;
  
  // ...
};
```

### 2. 為不同圖表類型選擇合適的配色
- **圓餅圖/甜甜圈圖**：使用 `theme.chart.categorical`
- **長條圖/柱狀圖**：使用 `theme.chart.geographic` 或 `theme.chart.colors`
- **折線圖**：使用 `theme.chart.trend` 或 `theme.chart.primary/secondary`
- **狀態圖表**：使用 `theme.chart.status`

### 3. 自定義圖表顏色
```typescript
// 使用特定的顏色序列
const customColors = [
  theme.chart.primary[0],   // '#4caf50'
  theme.chart.secondary[0], // '#388e3c'
  theme.chart.colors[2]     // '#81c784'
];

// 根據數據動態選擇顏色
const getColorByValue = (value: number) => {
  if (value > 100) return theme.chart.trend.positive;  // '#4caf50'
  if (value < 50) return theme.chart.trend.negative;   // '#81c784'
  return theme.chart.trend.neutral;                    // '#a5d6a7'
};
```

## 🎯 最佳實踐

### 1. 一致性原則
- 同一類型的數據在不同圖表中使用相同顏色
- 保持整個應用程式的配色一致性

### 2. 語義化色彩
- 深綠色用於重要/強調的數據
- 淺綠色用於次要/輔助的數據
- 極淺綠色用於背景/基準線

### 3. 簡化設計
- 避免使用過多不同顏色
- 優先使用綠色系的不同深淺
- 保持品牌色彩的統一性

### 4. 無障礙考量
- 確保足夠的色彩對比度
- 使用不同深淺而非不同色相來區分數據

## 🔮 未來擴展

### 計劃新增的配色方案
- **深色模式配色**：適用於深色主題的圖表顏色
- **高對比度模式**：無障礙友好的高對比度配色
- **季節性配色**：根據季節或節日調整的特殊配色

### 可能的改進方向
- 動態配色系統
- 用戶自定義配色選項
- AI 輔助的最佳配色建議

---

*最後更新：2024年12月* 