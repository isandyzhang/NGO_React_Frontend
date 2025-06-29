import React, { useState } from 'react';
import { 
  Box, 
  Tabs,
  Tab,
  useTheme,
} from '@mui/material';
import { 
  PersonAdd,
  Search,
  Folder,
} from '@mui/icons-material';
import PageHeader from '../shared/PageHeader';
import PageContainer from '../shared/PageContainer';
import AddCaseTab from './AddCaseTab';
import SearchEditCaseTab from './SearchEditCaseTab';

/**
 * 個案管理主頁面
 * 
 * 此頁面包含兩個主要功能分頁：
 * 1. 新增個案 - 用於添加新的個案資料
 * 2. 查詢/修改 - 用於查詢和修改現有個案
 */

const CaseManagement: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // 分頁配置
  const tabs = [
    {
      label: '新增個案',
      icon: <PersonAdd sx={{ fontSize: 20 }} />,
      component: <AddCaseTab />
    },
    {
      label: '查詢/修改',
      icon: <Search sx={{ fontSize: 20 }} />,
      component: <SearchEditCaseTab />
    }
  ];

  return (
    <PageContainer>
      {/* 統一的頁面頭部 */}
      <PageHeader
        breadcrumbs={[
          { label: '個案管理', icon: <Folder sx={{ fontSize: 16 }} /> }
        ]}
        showSearch={false}
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
        <Box sx={{ 
          width: '100%',
          overflow: 'hidden' // 防止內容溢出
        }}>
          {tabs[activeTab].component}
        </Box>
      </Box>
    </PageContainer>
  );
};

export default CaseManagement; 