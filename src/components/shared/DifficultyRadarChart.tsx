import * as React from 'react';
import { RadarChart } from '@mui/x-charts/RadarChart';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import { THEME_COLORS } from '../../styles/theme';

interface DifficultyRadarChartProps {
  loading?: boolean;
}

// 假資料 - 八種困難類型
const mockDifficultyData = [
  { category: '經濟困難', value: 85, color: THEME_COLORS.CHART_COLOR_6, trend: '+5%' },
  { category: '家庭問題', value: 72, color: THEME_COLORS.CHART_COLOR_3, trend: '+3%' },
  { category: '學習困難', value: 63, color: THEME_COLORS.CHART_COLOR_2, trend: '-2%' },
  { category: '健康問題', value: 45, color: THEME_COLORS.CHART_COLOR_4, trend: '+1%' },
  { category: '行為問題', value: 38, color: THEME_COLORS.CHART_COLOR_5, trend: '-4%' },
  { category: '人際關係', value: 52, color: THEME_COLORS.CHART_COLOR_1, trend: '+7%' },
  { category: '情緒困擾', value: 67, color: THEME_COLORS.CHART_COLOR_4, trend: '+2%' },
  { category: '就業困難', value: 41, color: THEME_COLORS.CHART_COLOR_6, trend: '+6%' },
];

export default function DifficultyRadarChart({ loading = false }: DifficultyRadarChartProps) {
  const theme = useTheme();
  
  if (loading) {
    return (
      <Card sx={{ 
        width: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        boxShadow: { xs: 1, sm: 2 },
        height: '100%'
      }}>
        <CardContent sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          flex: 1,
          minHeight: 400
        }}>
          <Typography>載入中...</Typography>
        </CardContent>
      </Card>
    );
  }

  // 準備雷達圖資料
  const radarData = mockDifficultyData.map(item => item.value);
  const radarLabels = mockDifficultyData.map(item => item.category);

  return (
    <Card sx={{ 
      width: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      boxShadow: { xs: 1, sm: 2 },
      height: '100%'
    }}>
      <CardContent sx={{ 
        flex: 1, 
        p: { xs: 1.5, sm: 2, md: 2.5, lg: 3 },
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Typography 
          gutterBottom 
          sx={{
            ...theme.customTypography.cardTitle,
            fontSize: '1.125rem',
            mb: 2
          }}
        >
          個案面臨困難分析
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'column', md: 'row' },
          alignItems: { xs: 'center', sm: 'center', md: 'flex-start' }, 
          gap: { xs: 2, sm: 2.5, md: 3.5 }
        }}>
          {/* 左側：雷達圖 */}
          <Box 
            sx={{ 
              flex: '0 0 auto',
              width: { xs: 300, sm: 320, md: 340, lg: 360 },
              height: { xs: 300, sm: 320, md: 340, lg: 360 },
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <RadarChart
              height={340}
              width={340}
              series={[
                {
                  label: '困難程度',
                  data: mockDifficultyData.map(item => item.value),
                },
              ]}
              radar={{
                max: 100,
                metrics: mockDifficultyData.map(item => item.category),
              }}
              margin={{ top: 40, bottom: 40, left: 40, right: 40 }}
            />
          </Box>
          
          {/* 右側：困難類型統計 */}
          <Box sx={{ 
            flex: 1, 
            width: { xs: '100%', sm: '100%', md: 'auto' },
            minWidth: 0
          }}>
            <Stack spacing={1.5}>
              {mockDifficultyData.map((difficulty, index) => (
                <Box key={index} sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  p: 1.5,
                  borderRadius: 1,
                  backgroundColor: `${difficulty.color}08`,
                  border: `1px solid ${difficulty.color}20`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: `${difficulty.color}15`,
                    transform: 'translateY(-1px)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  },
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2, 
                    flex: 1, 
                    minWidth: 0 
                  }}>
                    {/* 顏色指示器 */}
                    <Box 
                      sx={{ 
                        width: 4, 
                        height: 24, 
                        borderRadius: 2, 
                        backgroundColor: difficulty.color,
                        flexShrink: 0
                      }} 
                    />
                    
                    {/* 困難類型名稱 */}
                    <Typography sx={{ 
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      color: '#333333',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {difficulty.category}
                    </Typography>
                  </Box>
                  
                  {/* 數值和趨勢 */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1.5, 
                    flexShrink: 0 
                  }}>
                    {/* 困難程度值 */}
                    <Typography sx={{ 
                      fontWeight: '700',
                      fontSize: '1rem',
                      color: difficulty.color,
                      minWidth: '35px',
                      textAlign: 'right'
                    }}>
                      {difficulty.value}
                    </Typography>
                    
                    {/* 趨勢變化 */}
                    <Chip 
                      size="small" 
                      label={difficulty.trend}
                      sx={{
                        height: 20,
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        borderRadius: '10px',
                        backgroundColor: difficulty.trend.startsWith('+') 
                          ? '#e8f5e8' 
                          : difficulty.trend.startsWith('-')
                          ? '#ffebee'
                          : '#f5f5f5',
                        color: difficulty.trend.startsWith('+') 
                          ? '#2e7d32' 
                          : difficulty.trend.startsWith('-')
                          ? '#d32f2f'
                          : '#666666',
                        '& .MuiChip-label': {
                          px: 1
                        }
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>
        </Box>
        
        {/* 底部說明 */}
        <Typography 
          variant="caption" 
          sx={{ 
            color: '#999999',
            textAlign: 'center',
            display: 'block',
            mt: 2,
            fontSize: '0.75rem',
            fontStyle: 'italic'
          }}
        >
          雷達圖顯示各類困難的相對程度 (0-100分)
        </Typography>
      </CardContent>
    </Card>
  );
}