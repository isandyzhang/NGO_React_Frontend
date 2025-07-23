import React, { useState } from 'react';
import { 
  Box, 
  Tabs, 
  Tab,
  useTheme,
  Typography,
  Switch,
  FormGroup,
  FormControlLabel,
  Paper,
} from '@mui/material';
import { 
  Add, 
  Inventory,
  Warning,
  Home,
  Assignment,
  Storage,
  CalendarMonth
} from '@mui/icons-material';
import { THEME_COLORS } from '../styles/theme';
import { commonStyles, getResponsiveSpacing } from '../styles/commonStyles';
import PageHeader from '../components/shared/PageHeader';
import PageContainer from '../components/shared/PageContainer';
import NotificationBadge from '../components/shared/NotificationBadge';
import { useNotificationContext } from '../contexts/NotificationContext';
import EmergencySupplyNeedAddTab from '../components/SuppliesManagementPage/EmergencySupplyNeedAddTab';
import InventoryTab from '../components/SuppliesManagementPage/InventoryTab';
import RegularRequestTab from '../components/SuppliesManagementPage/RegularRequestTab';
import EmergencyRequestTab from '../components/SuppliesManagementPage/EmergencyRequestTab';
import DistributionTab from '../components/SuppliesManagementPage/DistributionTab';


/**
 * 物資管理頁面組件
 * 
 * 主要功能：
 * 1. 物資類型切換 - 使用Switch按鈕切換常駐物資和緊急物資
 * 2. 新增物資需求 - 建立新的物資申請，包含基本資訊、數量、緊急程度等
 * 3. 物資總覽 - 查看物資庫存狀況、申請記錄和統計資料
 * 
 * 設計特色：
 * - 採用Switch按鈕切換物資類型，提供清晰的分類管理
 * - 分頁式設計，提供清晰的功能導航
 * - 統一的視覺風格和用戶體驗
 * - 響應式設計，支援各種螢幕尺寸
 */
const SuppliesManagement: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [isEmergencySupply, setIsEmergencySupply] = useState(false);
  const { counts, hasSupplyNotifications, hasDistributionNotifications } = useNotificationContext();


  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSupplyTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsEmergencySupply(event.target.checked);
    // 當切換物資類型時，重置到第一個標籤頁
    setActiveTab(0);
  };



  // 分頁配置
  const tabs = isEmergencySupply ? [
    {
      label: '新增物資需求',
      icon: <Add sx={{ fontSize: 20 }} />,
      component: <EmergencySupplyNeedAddTab />,
      showNotification: false
    },
    {
      label: '物資申請及紀錄',
      icon: <Assignment sx={{ fontSize: 20 }} />,
      component: <EmergencyRequestTab />,
      showNotification: false // 緊急物資暂時不显示紅點
    }
  ] : [
    {
      label: '物資庫存',
      icon: <Storage sx={{ fontSize: 20 }} />,
      component: <InventoryTab />,
      showNotification: false
    },
    {
      label: '物資申請及紀錄',
      icon: <Assignment sx={{ fontSize: 20 }} />,
      component: <RegularRequestTab />,
      showNotification: hasSupplyNotifications
    },
    {
      label: '每月物資發放',
      icon: <CalendarMonth sx={{ fontSize: 20 }} />,
      component: <DistributionTab isEmergencySupply={false} />,
      showNotification: hasDistributionNotifications
    }
  ];

  return (
    <PageContainer>
      {/* 統一的頁面頭部組件 */}
      <PageHeader
        breadcrumbs={[
          { label: '物資管理', icon: <Inventory sx={{ fontSize: 16 }} /> }
        ]}
      />

      {/* 物資類型切換區域 */}
      <Paper elevation={1} sx={{ 
        p: getResponsiveSpacing('md'),
        mt: 2,
        mb: 3,
        bgcolor: isEmergencySupply ? THEME_COLORS.ERROR_LIGHT : THEME_COLORS.BACKGROUND_CARD,
        border: isEmergencySupply ? `1px solid ${THEME_COLORS.ERROR}` : `1px solid ${THEME_COLORS.BORDER_LIGHT}`,
        borderRadius: 2
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 0 }
        }}>
          {/* 左側：物資類型資訊 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              p: 1,
              borderRadius: 1,
              bgcolor: isEmergencySupply ? THEME_COLORS.ERROR : THEME_COLORS.PRIMARY,
              color: 'white'
            }}>
              {isEmergencySupply ? (
                <Warning sx={{ fontSize: 20 }} />
              ) : (
                <Home sx={{ fontSize: 20 }} />
              )}
            </Box>
            <Box>
              <Typography variant="h6" sx={{ 
                fontWeight: 600,
                color: isEmergencySupply ? THEME_COLORS.ERROR : THEME_COLORS.PRIMARY
              }}>
                {isEmergencySupply ? '緊急物資管理' : '常駐物資管理'}
              </Typography>
              <Typography variant="body2" sx={{ 
                color: THEME_COLORS.TEXT_MUTED,
                fontSize: '0.875rem'
              }}>
                {isEmergencySupply 
                  ? '管理緊急情況下所需的物資和設備'
                  : '管理日常運營所需的常規物資和設備'
                }
              </Typography>
            </Box>
          </Box>

          {/* 右側：切換開關 */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            flexDirection: { xs: 'row', sm: 'row' }
          }}>
            <Typography variant="body2" sx={{ 
              color: THEME_COLORS.TEXT_SECONDARY,
              fontWeight: 500,
              display: { xs: 'none', sm: 'block' }
            }}>
              切換物資類型
            </Typography>
            <FormGroup>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Typography variant="body1" sx={{ 
                  color: !isEmergencySupply ? THEME_COLORS.PRIMARY : THEME_COLORS.TEXT_MUTED,
                  fontWeight: !isEmergencySupply ? 600 : 400,
                  fontSize: '1.1rem'
                }}>
                  常駐
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isEmergencySupply}
                      onChange={handleSupplyTypeChange}
                      sx={{
                        transform: 'scale(1.5)',
                        mx: 1,
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: THEME_COLORS.ERROR,
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: THEME_COLORS.ERROR,
                        },
                        '& .MuiSwitch-track': {
                          backgroundColor: THEME_COLORS.PRIMARY,
                        },
                      }}
                    />
                  }
                  label=""
                  sx={{ margin: 0 }}
                />
                <Typography variant="body1" sx={{ 
                  color: isEmergencySupply ? THEME_COLORS.ERROR : THEME_COLORS.TEXT_MUTED,
                  fontWeight: isEmergencySupply ? 600 : 400,
                  fontSize: '1.1rem'
                }}>
                  緊急
                </Typography>
              </Box>
            </FormGroup>
          </Box>
        </Box>
      </Paper>

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
                color: isEmergencySupply ? THEME_COLORS.ERROR : THEME_COLORS.PRIMARY,
                bgcolor: isEmergencySupply 
                  ? `${THEME_COLORS.ERROR}14` 
                  : `${THEME_COLORS.PRIMARY}14`,
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: isEmergencySupply ? THEME_COLORS.ERROR : THEME_COLORS.PRIMARY,
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
            '& .Mui-selected': {
              color: `${isEmergencySupply ? THEME_COLORS.ERROR : THEME_COLORS.PRIMARY} !important`,
              fontWeight: 600,
              bgcolor: isEmergencySupply 
                ? `${THEME_COLORS.ERROR}14` 
                : `${THEME_COLORS.PRIMARY}14`,
            },
            borderBottom: 1,
            borderColor: THEME_COLORS.BORDER_LIGHT,
            mb: 3,
          }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={
                tab.showNotification ? (
                  <NotificationBadge 
                    showBadge={true}
                    size="small"
                  >
                    <span>{tab.label}</span>
                  </NotificationBadge>
                ) : (
                  tab.label
                )
              }
              icon={tab.icon}
              iconPosition="start"
            />
          ))}
        </Tabs>

        {/* 分頁內容 - 緊急物資時顯示左右布局 */}
        <Box sx={{ 
          display: 'flex', 
          gap: 3,
          flexDirection: { xs: 'column', lg: 'row' },
          alignItems: 'flex-start'
        }}>
          {/* 左側：主要內容 */}
          <Box sx={{ 
            flex: 1,
            minWidth: 0, // 防止 flex 子元素溢出
          }}>
            {tabs[activeTab].component}
          </Box>
          

        </Box>
      </Box>
    </PageContainer>
  );
};

export default SuppliesManagement; 