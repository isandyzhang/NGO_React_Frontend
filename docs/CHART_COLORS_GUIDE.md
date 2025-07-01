# 📊 圖表顏色使用指南

本指南詳細說明案件管理系統中圖表的顏色配置和使用方式。

## 🎨 設計理念

### 配色策略
- **主色調**：以品牌綠色 `#4caf50` 為核心
- **輔助色彩**：藍色、橙色、紫色等形成和諧色彩組合
- **視覺層次**：通過不同色彩強度表現數據重要性
- **無障礙設計**：確保足夠的色彩對比度

## 🎭 顏色配置詳解

### 1. 基礎圖表色彩 (theme.chart.colors)
7色調色盤，用於一般數據視覺化：
```typescript
colors: [
  '#4caf50',  // 主綠色 - 品牌色，代表成長和希望
  '#2196f3',  // 藍色 - 信任和穩定
  '#ff9800',  // 橙色 - 活力和溫暖
  '#9c27b0',  // 紫色 - 創新和智慧
  '#f44336',  // 紅色 - 重要性和警示
  '#00bcd4',  // 青色 - 清新和平靜
  '#795548',  // 棕色 - 穩重和可靠
]
```

### 2. 主要數據系列 (theme.chart.primary)
綠色系，用於重要指標展示：
```typescript
primary: [
  '#4caf50',  // 主綠色 - 核心指標
  '#66bb6a',  // 中綠色 - 相關指標
  '#388e3c',  // 深綠色 - 對比指標
  '#81c784',  // 淺綠色 - 輔助指標
]
```

### 3. 次要數據系列 (theme.chart.secondary)
藍色系，用於輔助信息：
```typescript
secondary: [
  '#2196f3',  // 主藍色
  '#42a5f5',  // 中藍色
  '#1976d2',  // 深藍色
  '#64b5f6',  // 淺藍色
]
```

### 4. 分類數據色彩 (theme.chart.categorical)
用於個案困難分析等分類數據：
```typescript
categorical: [
  '#4caf50',  // 經濟困難 - 綠色（主要問題）
  '#2196f3',  // 情緒障礙 - 藍色（心理健康）
  '#ff9800',  // 溝通障礙 - 橙色（溝通問題）
  '#9c27b0',  // 醫療需求 - 紫色（醫療相關）
  '#f44336',  // 成癮問題 - 紅色（嚴重問題）
  '#00bcd4',  // 家庭暴力 - 青色（家庭問題）
  '#795548',  // 犯罪紀錄 - 棕色（法律問題）
  '#607d8b',  // 其他問題 - 灰藍色
]
```

### 5. 地區分布色彩 (theme.chart.geographic)
用於地理數據展示：
```typescript
geographic: [
  '#4caf50',  // 北部 - 綠色
  '#2196f3',  // 中部 - 藍色
  '#ff9800',  // 南部 - 橙色
  '#9c27b0',  // 東部 - 紫色
  '#00bcd4',  // 外島 - 青色
]
```

### 6. 趨勢數據色彩 (theme.chart.trend)
用於時間序列和趨勢圖表：
```typescript
trend: {
  positive: '#4caf50',    // 正向趨勢 - 綠色
  negative: '#f44336',    // 負向趨勢 - 紅色
  neutral: '#ff9800',     // 中性趨勢 - 橙色
  baseline: '#9e9e9e',    // 基準線 - 灰色
}
```

### 7. 狀態指示色彩 (theme.chart.status)
用於狀態標示和進度顯示：
```typescript
status: {
  active: '#4caf50',      // 活躍狀態 - 綠色
  pending: '#ff9800',     // 待處理狀態 - 橙色
  completed: '#2196f3',   // 完成狀態 - 藍色
  cancelled: '#f44336',   // 取消狀態 - 紅色
  draft: '#9e9e9e',       // 草稿狀態 - 灰色
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
    color: THEME_COLORS.CHART_PRIMARY
  },
  {
    title: '志工人數',
    value: '45',
    icon: <People />,
    color: THEME_COLORS.CHART_SECONDARY
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
      color: theme.chart.geographic[0]
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
  theme.chart.primary[0],
  theme.chart.secondary[0],
  theme.chart.colors[2]
];

// 根據數據動態選擇顏色
const getColorByValue = (value: number) => {
  if (value > 100) return theme.chart.trend.positive;
  if (value < 50) return theme.chart.trend.negative;
  return theme.chart.trend.neutral;
};
```

## 🎯 最佳實踐

### 1. 一致性原則
- 同一類型的數據在不同圖表中使用相同顏色
- 保持整個應用程式的配色一致性

### 2. 語義化色彩
- 綠色用於正面/成功的數據
- 紅色用於負面/警告的數據
- 藍色用於中性/信息性的數據

### 3. 無障礙考量
- 確保足夠的色彩對比度
- 不依賴顏色作為唯一的資訊傳達方式
- 考慮色盲使用者的需求

### 4. 響應式設計
- 在不同螢幕尺寸下保持顏色的清晰度
- 考慮深色模式的兼容性（未來擴展）

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