/**
 * 活動管理頁面 (ActivityManagement)
 * 
 * 主要功能：
 * 1. 新增活動表單 - 建立新的民眾活動和社區服務
 * 2. 活動管理 - 查看、編輯、搜尋現有活動（整合了編輯功能）
 * 3. 報名審核 - 管理民眾和個案的活動報名申請
 * 
 * 頁面結構：
 * - Tab 1: 新增活動（使用 NewActivityForm 組件）
 * - Tab 2: 活動管理（使用 ActivityManagement 組件，包含查看、編輯、搜尋功能）
 * - Tab 3: 報名審核（使用 RegistrationReview 組件）
 * 
 * 特色功能：
 * - 響應式設計，支援桌面和手機
 * - 模組化架構，組件分離
 * - 完整的活動生命週期管理
 * - 報名狀態管理和審核工作流程
 */

import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
} from '@mui/material';
import { 
  EventNote,
  People,
  Event,
} from '@mui/icons-material';
import { THEME_COLORS } from '../styles/theme';
import PageContainer from '../components/shared/PageContainer';
import PageHeader from '../components/shared/PageHeader';
import NewActivityForm from '../components/ActivityManagementPage/NewActivityForm';
import ActivityManagement from '../components/ActivityManagementPage/ActivityManagement';
import RegistrationReviewMain from '../components/ActivityManagementPage/RegistrationReviewMain';

/**
 * 活動管理頁面主組件
 */
const ActivityManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // 分頁配置
  const tabs = [
    {
      label: '新增活動',
      icon: <EventNote sx={{ fontSize: 20 }} />,
      component: <NewActivityForm />
    },
    {
      label: '活動管理',
      icon: <Event sx={{ fontSize: 20 }} />,
      component: <ActivityManagement />
    },
    {
      label: '報名審核',
      icon: <People sx={{ fontSize: 20 }} />,
      component: <RegistrationReviewMain />
    }
  ];

  return (
    <PageContainer>
      <PageHeader 
        breadcrumbs={[
          { label: '活動管理', href: '/activity-management' }
        ]}
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
              color: THEME_COLORS.TEXT_MUTED,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 1,
              '&:hover': {
                color: THEME_COLORS.PRIMARY,
                bgcolor: `${THEME_COLORS.PRIMARY}14`, // 8% 透明度
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: THEME_COLORS.PRIMARY,
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
            '& .Mui-selected': {
              color: `${THEME_COLORS.PRIMARY} !important`,
              fontWeight: 600,
              bgcolor: `${THEME_COLORS.PRIMARY}14`, // 8% 透明度
            },
            borderBottom: 1,
            borderColor: THEME_COLORS.BORDER_LIGHT,
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

export default ActivityManagementPage; 