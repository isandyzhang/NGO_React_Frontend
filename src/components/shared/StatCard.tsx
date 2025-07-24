import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import { areaElementClasses } from '@mui/x-charts/LineChart';

export type StatCardProps = {
  title: string;
  value: string;
  interval: string;
  trend: 'up' | 'down' | 'neutral';
  data: number[];
  icon?: React.ReactElement;
};

function getDaysInMonth(month: number, year: number) {
  const date = new Date(year, month, 0);
  const monthName = date.toLocaleDateString('zh-TW', {
    month: 'short',
  });
  const daysInMonth = date.getDate();
  const days = [];
  let i = 1;
  while (days.length < daysInMonth) {
    days.push(`${monthName} ${i}`);
    i += 1;
  }
  return days;
}

function AreaGradient({ color, id }: { color: string; id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity={0.3} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}

export default function StatCard({
  title,
  value,
  interval,
  trend,
  data,
  icon,
}: StatCardProps) {
  const theme = useTheme();
  const daysInWeek = getDaysInMonth(4, 2024);

  const trendColors = {
    up:
      theme.palette.mode === 'light'
        ? theme.palette.success.main
        : theme.palette.success.dark,
    down:
      theme.palette.mode === 'light'
        ? theme.palette.error.main
        : theme.palette.error.dark,
    neutral:
      theme.palette.mode === 'light'
        ? theme.palette.grey[400]
        : theme.palette.grey[700],
  };

  const labelColors = {
    up: 'success' as const,
    down: 'error' as const,
    neutral: 'default' as const,
  };

  const color = labelColors[trend];
  const chartColor = trendColors[trend];
  // 根據卡片類型返回不同的趨勢值
  const getTrendValue = (trend: 'up' | 'down' | 'neutral', title: string) => {
    const trendMap = {
      '個案人數': { up: '+23.7%', down: '-8.9%', neutral: '+2.1%' },
      '志工人數': { up: '+15.2%', down: '-5.4%', neutral: '+1.8%' },
      '活動總數': { up: '+31.5%', down: '-12.6%', neutral: '+4.2%' }
    };
    
    return trendMap[title as keyof typeof trendMap]?.[trend] || { up: '+18.5%', down: '-12.3%', neutral: '+3.2%' }[trend];
  };
  
  const trendValue = getTrendValue(trend, title);

  return (
    <Card 
      variant="outlined" 
      sx={{ 
        height: '85%', // 增加卡片高度
        flexGrow: 1,
        borderRadius: 2,
        border: '1px solid #e0e0e0',
        backgroundColor: '#ffffff',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          borderColor: chartColor,
        }
      }}
    >
      <CardContent sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        p: 3, // 增加內邊距從2改為3
        pb: 1,
        justifyContent: 'flex-start' // 改為flex-start讓內容往上靠
      }}>
        {/* 標題和趨勢標籤 */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          mb: 1, // 減少底部間距
          width: '100%'
        }}>
          <Typography 
            component="h2" 
            variant="subtitle2" 
            sx={{ 
              mb: 0,
              ...theme.customTypography.dashboardTitle
            }}
          >
            {title}
          </Typography>
                      <Chip 
              size="small" 
              color={color} 
              label={trendValue}
              sx={{
                height: 28,
                fontSize: '0.875rem',
                fontWeight: 600,
                borderRadius: '14px',
                '& .MuiChip-label': {
                  px: 2
                }
              }}
            />
        </Box>

        <Stack
          direction="row" // 改為水平排列
          sx={{ 
            justifyContent: 'space-between', // 改為space-between讓左右兩邊分開
            flexGrow: '1', 
            gap: 2, // 增加左右兩邊的間距
            alignItems: 'flex-start' // 改為左對齊
          }}
        >
          {/* 左邊：數字信息 */}
          <Stack sx={{ gap: 0.5, alignItems: 'flex-start', flex: 1 }}> {/* 改為左對齊，flex: 1讓它佔據剩餘空間 */}
            <Typography 
              variant="h3" 
              component="p" 
              sx={{ 
                ...theme.customTypography.dashboardValue,
                textAlign: 'left', // 確保文字左對齊
                pl: 0, // 增加左邊距
                mb: 0.5 // 減少底部間距
              }}
            >
              {value}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                ...theme.customTypography.dashboardSubtitle,
                textAlign: 'left', // 確保文字左對齊
                pl: 1, // 增加左邊距
                mb: 1 // 減少底部間距
              }}
            >
              {interval}
            </Typography>
          </Stack>
          
          {/* 右邊：迷你圖表 */}
          <Box sx={{ 
            width: '250px', // 增加寬度讓圖表更寬
            height: 100, // 增加高度
            flexShrink: 0, // 防止縮小
            minHeight: 100, // 確保最小高度
            overflow: 'hidden', // 隱藏溢出內容
            position: 'relative', // 相對定位
            display: 'flex',
            justifyContent: 'flex-end', // 靠右對齊
            alignItems: 'center' // 垂直置中
          }}>
            <SparkLineChart
              color={chartColor}
              data={data} // 使用從props傳入的data
              area
              showHighlight={false}
              showTooltip={false}
              margin={{ top: 0, bottom: 10, left: 0, right:-20 }} // 移除所有邊距
              width={300} // 明確設定寬度
              height={110} // 明確設定高度
              xAxis={{
                scaleType: 'band',
                data: Array.from({length: data.length}, (_, i) => (i + 1).toString()) // 根據data長度動態調整
              }}
              sx={{
                [`& .${areaElementClasses.root}`]: {
                  fill: `url(#area-gradient-${value})`,
                },
                width: '100%',
                height: '100%',
                '& .MuiChartsAxis-root': {
                  display: 'none'
                },
                '& .MuiChartsLine-root': {
                  strokeWidth: 2.5,
                  stroke: chartColor
                },
                '& .MuiChartsAxis-line': {
                  display: 'none'
                },
                '& .MuiChartsAxis-tick': {
                  display: 'none'
                },
                '& .MuiChartsAxis-label': {
                  display: 'none'
                },
                '& .MuiChartsAxis-tickLabel': {
                  display: 'none'
                },
                '& .MuiChartsAxis-tickMark': {
                  display: 'none'
                },
                '& .MuiChartsAxis-grid': {
                  display: 'none'
                }
              }}
            >
              <AreaGradient color={chartColor} id={`area-gradient-${value}`} />
            </SparkLineChart>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}