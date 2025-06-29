import React, { useState } from 'react';
import { 
  Box, 
  Tabs, 
  Tab,
  useTheme
} from '@mui/material';
import { 
  Add, 
  Visibility,
  Inventory
} from '@mui/icons-material';
import PageHeader from '../components/shared/PageHeader';
import PageContainer from '../components/shared/PageContainer';
import AddSupplyRequestTab from '../components/SuppliesManagementPage/AddSupplyRequestTab';
import SupplyOverviewTab from '../components/SuppliesManagementPage/SupplyOverviewTab';

/**
 * 物資管理頁面組件
 * 
 * 主要功能：
 * 1. 新增物資需求 - 建立新的物資申請，包含基本資訊、數量、緊急程度等
 * 2. 物資總覽 - 查看物資庫存狀況、申請記錄和統計資料
 * 
 * 設計特色：
 * - 採用分頁式設計，提供清晰的功能導航
 * - 統一的視覺風格和用戶體驗
 * - 響應式設計，支援各種螢幕尺寸
 */
const SuppliesManagement: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // 分頁配置
  const tabs = [
    {
      label: '新增物資需求',
      icon: <Add sx={{ fontSize: 20 }} />,
      component: <AddSupplyRequestTab />
    },
    {
      label: '物資總覽',
      icon: <Visibility sx={{ fontSize: 20 }} />,
      component: <SupplyOverviewTab />
    }
  ];

  return (
    <PageContainer>
      {/* 統一的頁面頭部組件 */}
      <PageHeader
        breadcrumbs={[
          { label: '物資管理', icon: <Inventory sx={{ fontSize: 16 }} /> }
        ]}
        showSearch={true}
        searchPlaceholder="搜尋物資、申請記錄..."
      />

      {/* 分頁導航 */}
      <Box sx={{ mt: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 500,
              minHeight: 48,
              minWidth: 120,
              color: '#6b7280',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 1,
              '&:hover': {
                color: '#4caf50',
                bgcolor: 'rgba(76, 175, 80, 0.08)',
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#4caf50',
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
            '& .Mui-selected': {
              color: '#4caf50 !important',
              fontWeight: 600,
              bgcolor: 'rgba(76, 175, 80, 0.08)',
            },
            borderBottom: 1,
            borderColor: '#e5e7eb',
            mb: 3,
          }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
            />
          ))}
        </Tabs>

        {/* 分頁內容 */}
        <Box>
          {tabs[activeTab].component}
        </Box>
      </Box>
    </PageContainer>
  );
};

export default SuppliesManagement; 