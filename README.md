# 🌟 Case Management System

一個以 React + Vite 建構的多步驟表單管理系統，支援 Azure AD 登入與表單狀態共享。  
未來可串接 MySQL 資料庫並部署至 Azure Web App。

---

## 🧱 技術

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Material UI (MUI)](https://mui.com/)
- [Framer Motion](https://www.framer.com/motion/) - 動畫處理
- [MSAL.js](https://github.com/AzureAD/microsoft-authentication-library-for-js) - Azure AD 登入
- [React Router v6](https://reactrouter.com/)
- Axios - API 請求處理
- Context + Custom Hook - 表單狀態管理

---

## 📁 專案結構摘要

```bash
src/
├── components/
│   ├── shared/              # 通用元件
│   ├── layout/              # Navbar, ProtectedRoute 等
│   └── case/caseform/       # 多步驟表單元件（BasicInfo, FQ/HQ/IQ/EQ）
├── pages/                   # 各頁面（Login, CasePage）
├── auth/                    # Azure AD 登入邏輯（AuthProvider, msalConfig）
├── context/                 # 表單資料共享（FormContext）
├── hooks/                   # 自定義 hook（useFormSteps）
├── services/                # API 模組（串接後端）
├── mock/                    # 假資料（formMockData.ts）
├── styles/                  # CSS & styled 組件
├── types/                   # TypeScript 型別定義
