import React from 'react';
import { 
  Box, 
  CardContent, 
  Typography, 
  Button,
  Paper
} from '@mui/material';
import { StyledCard } from '../shared/StyledCard';
import { 
  People, 
  Assignment, 
  TrendingUp, 
  Notifications 
} from '@mui/icons-material';

const Dashboard: React.FC = () => {
  const statsCards = [
    {
      title: '個案人數',
      value: '156',
      icon: <Assignment />,
      color: '#1976d2'
    },
    {
      title: '待訪個案',
      value: '23',
      icon: <Notifications />,
      color: '#ed6c02'
    },
    {
      title: '志工人數',
      value: '45',
      icon: <People />,
      color: '#2e7d32'
    }
  ];

  return (
    <Box>
      {/* 頁面標題 */}
      <Typography variant="h4" component="h1" gutterBottom>
        儀表板
      </Typography>
      
      {/* 統計卡片 */}
      <Box 
        display="flex" 
        flexWrap="wrap" 
        gap={3} 
        sx={{ mb: 4 }}
      >
        {statsCards.map((card, index) => (
          <Box 
            key={index} 
            flexBasis={{ xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.333% - 16px)' }}
            minWidth={0}
          >
            <StyledCard cardType="stat">
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      {card.title}
                    </Typography>
                    <Typography variant="h4" component="div">
                      {card.value}
                    </Typography>
                  </Box>
                  <Box sx={{ color: card.color }}>
                    {card.icon}
                  </Box>
                </Box>
              </CardContent>
            </StyledCard>
          </Box>
        ))}
      </Box>

      {/* 快速操作 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          快速操作
        </Typography>
        <Box display="flex" gap={2} flexWrap="wrap">
          <Button variant="contained" color="primary">
            新增案例
          </Button>
          <Button variant="outlined" color="primary">
            案例搜尋
          </Button>
          <Button variant="outlined" color="secondary">
            生成報告
          </Button>
          <Button variant="outlined" color="info">
            系統設置
          </Button>
        </Box>
      </Paper>

      {/* 最近活動 */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          最近活動
        </Typography>
        <Box>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
            • 案例 #001 - 已更新評估資料 (2小時前)
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
            • 案例 #045 - 新增家庭訪問記錄 (5小時前)
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
            • 案例 #032 - 完成個案評估 (1天前)
          </Typography>
          <Typography variant="body2" color="textSecondary">
            • 系統維護通知 - 預計週末進行 (2天前)
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Dashboard;
