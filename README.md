# NGO案管系統前端

## 📋 項目概述

NGO案管系統是一個專為非營利組織設計的現代化案件管理系統，提供完整的個案管理、活動管理、物資管理和行事曆管理功能。本項目採用React 18 + TypeScript + Material-UI技術棧，提供響應式設計和優秀的用戶體驗。

## 🚀 快速開始

### 系統需求
- Node.js 18.0.0+
- npm 9.0.0+
- 現代瀏覽器（Chrome 90+、Firefox 88+、Safari 14+、Edge 90+）

### 安裝和運行
```bash
# 克隆項目
git clone https://github.com/your-org/ngo-frontend.git
cd ngo-frontend

# 安裝依賴
npm install

# 啟動開發服務器
npm run dev

# 構建生產版本
npm run build

# 預覽生產版本
npm run preview
```

### 環境配置
```bash
# 複製環境配置文件
cp .env.example .env.local

# 配置必要的環境變量
VITE_API_BASE_URL=http://localhost:5264
VITE_APP_NAME=NGO案管系統
```

## 🏗️ 技術架構

### 核心技術棧
- **React 18** - 現代化React框架
- **TypeScript** - 靜態類型檢查
- **Vite** - 快速構建工具
- **Material-UI (MUI)** - 組件庫和設計系統
- **React Router** - 客戶端路由
- **MUI X Charts** - 數據可視化

### 項目結構
```
src/
├── components/          # 組件庫
│   ├── ActivityManagementPage/    # 活動管理
│   ├── CalendarPage/             # 行事曆管理
│   ├── CaseManagementPage/       # 個案管理
│   ├── SuppliesManagementPage/   # 物資管理
│   ├── layout/                   # 布局組件
│   └── shared/                   # 共享組件
├── config/              # 配置文件
├── hooks/               # 自定義Hook
├── pages/               # 頁面組件
├── routes/              # 路由配置
├── services/            # API服務
├── styles/              # 樣式配置
├── types/               # TypeScript類型
├── utils/               # 工具函數
├── App.tsx              # 根組件
└── main.tsx             # 入口文件
```

## 🎯 主要功能

### 1. 儀表板 (Dashboard)
- 統計數據概覽
- 圖表數據可視化
- 系統狀態監控

### 2. 個案管理 (Case Management)
- 個案資料新增和編輯
- 個案搜尋和篩選
- 個案狀態追蹤

### 3. 活動管理 (Activity Management)
- 活動創建和編輯
- 報名審核管理
- 活動狀態追蹤

### 4. 物資管理 (Supplies Management)
- 常駐物資申請
- 緊急物資需求
- 庫存管理
- 配送追蹤

### 5. 行事曆管理 (Calendar Management)
- 行程規劃
- 事件管理
- 提醒功能

## 🎨 設計系統

### 顏色主題
```typescript
// 主要顏色系統
PRIMARY: '#4caf50',      // 主綠色
SUCCESS: '#4caf50',      // 成功色
ERROR: '#f44336',        // 錯誤色
WARNING: '#ff9800',      // 警告色
```

### 響應式設計
- **手機** (xs): 0px - 599px
- **平板** (sm): 600px - 959px  
- **桌面** (md): 960px - 1279px
- **大桌面** (lg): 1280px+

### 主題使用
```typescript
import { THEME_COLORS } from '../styles/theme';
import { useTheme } from '@mui/material/styles';

const Component = () => {
  const theme = useTheme();
  
  return (
    <Box sx={{
      color: THEME_COLORS.TEXT_PRIMARY,
      backgroundColor: THEME_COLORS.BACKGROUND_CARD,
      ...theme.customTypography.cardTitle
    }}>
      內容
    </Box>
  );
};
```

## 🔧 開發指南

### 代碼規範
- 使用TypeScript進行類型檢查
- 遵循ESLint配置規範
- 統一使用THEME_COLORS主題常數
- 組件命名使用PascalCase
- 文件命名使用camelCase

### 組件開發
```typescript
// 標準組件結構
interface ComponentProps {
  title: string;
  onAction: () => void;
}

const Component: React.FC<ComponentProps> = ({ title, onAction }) => {
  const [state, setState] = useState<StateType>(initialState);
  
  const handleAction = useCallback(() => {
    onAction();
  }, [onAction]);
  
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6">{title}</Typography>
      <Button onClick={handleAction}>操作</Button>
    </Box>
  );
};

export default Component;
```

### API調用模式
```typescript
// 標準API調用模式
const useApiData = () => {
  const [data, setData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getData();
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入失敗');
    } finally {
      setLoading(false);
    }
  }, []);
  
  return { data, loading, error, loadData };
};
```

## 📊 性能優化

### 已實現的優化
- 組件懶加載
- 圖片優化
- Bundle分割
- 組件記憶化

### 建議的優化
- 使用React.memo防止不必要的重新渲染
- 使用useMemo和useCallback優化計算
- 實施虛擬滾動（長列表）
- 使用Web Workers處理複雜計算

## 🔒 安全性

### 身份驗證
- JWT令牌管理
- 自動令牌刷新
- 路由保護機制

### 數據保護
- 輸入驗證
- XSS防護
- CSRF防護
- 安全的API調用

## 🧪 測試

### 運行測試
```bash
# 單元測試
npm run test

# 端到端測試
npm run test:e2e

# 測試覆蓋率
npm run test:coverage
```

### 測試策略
- 組件單元測試
- 集成測試
- 端到端測試
- 性能測試

## 📝 部署

### 生產構建
```bash
# 構建生產版本
npm run build

# 檢查構建文件
ls -la dist/
```

### 部署選項
- **靜態托管**: Vercel、Netlify、GitHub Pages
- **容器化**: Docker + Kubernetes
- **CDN**: CloudFront、CloudFlare

### 環境配置
```bash
# 生產環境變量
VITE_API_BASE_URL=https://api.your-domain.com
VITE_APP_NAME=NGO案管系統
NODE_ENV=production
```

## 🛠️ 維護和監控

### 代碼質量
```bash
# ESLint檢查
npm run lint

# TypeScript類型檢查
npm run type-check

# 格式化代碼
npm run format
```

### 性能監控
- Bundle大小分析
- 載入時間監控
- 內存使用追蹤
- 用戶體驗指標

## 📚 相關文檔

- [技術架構文檔](./技術架構文檔.md) - 詳細的技術架構說明
- [專案優化建議](./專案優化建議.md) - 代碼優化和清理建議
- [清理腳本建議](./清理腳本建議.md) - 自動化清理腳本

## 🤝 貢獻指南

### 開發流程
1. Fork 項目
2. 創建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 創建Pull Request

### 提交規範
```bash
# 提交格式
type(scope): subject

# 示例
feat(auth): 添加Azure AD集成
fix(dashboard): 修復圖表顯示問題
docs(readme): 更新安裝說明
```

### 代碼審查
- 確保所有測試通過
- 遵循代碼規範
- 添加適當的文檔
- 性能影響評估

## 📄 許可證

本項目採用 MIT 許可證。詳見 [LICENSE](./LICENSE) 文件。

## 📞 聯繫方式

- 項目負責人：[您的姓名]
- 郵箱：[your-email@example.com]
- 項目地址：[https://github.com/your-org/ngo-frontend]

## 🔮 路線圖

### 短期目標 (1-3個月)
- [ ] 完成Azure AD集成
- [ ] 實現離線功能
- [ ] 添加單元測試
- [ ] 性能優化

### 中期目標 (3-6個月)
- [ ] PWA支援
- [ ] 國際化支援
- [ ] 進階分析功能
- [ ] 移動端優化

### 長期目標 (6個月+)
- [ ] 微前端架構
- [ ] AI輔助功能
- [ ] 高級工作流程
- [ ] 第三方集成

---

**感謝所有為此項目做出貢獻的開發者！** 🙏
