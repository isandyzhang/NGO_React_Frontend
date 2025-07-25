import * as React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { useDrawingArea } from '@mui/x-charts/hooks';
import { styled, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import { LocationOn } from '@mui/icons-material';
import { CountyDistribution } from '../../services/dashboardService';

interface StyledTextProps {
  variant: 'primary' | 'secondary';
}

const StyledText = styled('text', {
  shouldForwardProp: (prop) => prop !== 'variant',
})<StyledTextProps>(({ theme }) => ({
  textAnchor: 'middle',
  dominantBaseline: 'central',
  fill: (theme.vars || theme).palette.text.primary,
  variants: [
    {
      props: {
        variant: 'primary',
      },
      style: {
        fontSize: '2rem',
        fontWeight: 700,
        fill: '#333333',
      },
    },
    {
      props: ({ variant }) => variant !== 'primary',
      style: {
        fontSize: '0.875rem',
        fontWeight: 400,
        fill: '#999999',
      },
    },
  ],
}));

interface PieCenterLabelProps {
  primaryText: string;
  secondaryText: string;
}

function PieCenterLabel({ primaryText, secondaryText }: PieCenterLabelProps) {
  const { width, height, left, top } = useDrawingArea();
  const primaryY = top + height / 2 - 10;
  const secondaryY = primaryY + 24;

  return (
    <React.Fragment>
      <StyledText variant="primary" x={left + width / 2} y={primaryY}>
        {primaryText}
      </StyledText>
      <StyledText variant="secondary" x={left + width / 2} y={secondaryY}>
        {secondaryText}
      </StyledText>
    </React.Fragment>
  );
}

const colors = [
  'hsl(142, 70%, 45%)', // 主綠色
  'hsl(142, 60%, 55%)', // 較淺綠色
  'hsl(142, 50%, 65%)', // 更淺綠色
  'hsl(142, 40%, 75%)', // 淺綠色
  'hsl(142, 30%, 85%)', // 很淺綠色
  'hsl(220, 20%, 65%)', // 灰色系作為其他顏色
  'hsl(220, 20%, 55%)',
  'hsl(220, 20%, 45%)',
  'hsl(220, 20%, 35%)',
  'hsl(220, 20%, 25%)',
];

interface RegionChartProps {
  data: CountyDistribution[];
  loading?: boolean;
}

export default function RegionChart({ data, loading = false }: RegionChartProps) {
  const theme = useTheme();
  
  console.log('🗺️ RegionChart 接收到的資料:', { data, loading, dataLength: data?.length });
  
  if (loading) {
    return (
      <Card
        variant="outlined"
        sx={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}
      >
        <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <Typography>載入中...</Typography>
        </CardContent>
      </Card>
    );
  }
  
  // 檢查資料是否為空
  if (!data || data.length === 0) {
    return (
      <Card
        variant="outlined"
        sx={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}
      >
        <CardContent>
          <Typography 
            component="h2" 
            variant="subtitle2" 
            sx={{ 
              mb: 2,
              ...theme.customTypography.cardTitle,
              fontSize: '1.125rem'
            }}
          >
            個案地區分佈
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: 300,
            flexDirection: 'column',
            gap: 2
          }}>
            <LocationOn sx={{ fontSize: 48, color: theme.palette.text.secondary, opacity: 0.5 }} />
            <Typography color="textSecondary">
              暫無地區分佈資料
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // 準備圖表數據
  const chartData = data.map((item, index) => ({
    id: index,
    value: item.count,
    label: item.county,
  }));

  // 計算總數
  const totalCount = data.reduce((sum, item) => sum + item.count, 0);

  // 準備地區數據，包含百分比計算
  const regions = data.map((item, index) => ({
    name: item.county,
    value: totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0,
    count: item.count,
    color: colors[index % colors.length],
  }));

  return (
    <Card
      variant="outlined"
      sx={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}
    >
      <CardContent>
        <Typography 
          component="h2" 
          variant="subtitle2" 
          sx={{ 
            ...theme.customTypography.dashboardTitle,
            mb: 2
          }}
        >
          個案地區分佈
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'flex-start',
          gap: 3,
          flexDirection: { xs: 'column', md: 'row' }
        }}>
          {/* 左側：甜甜圈圖表 */}
          <Box sx={{ 
            flexShrink: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <PieChart
              colors={colors}
              margin={{
                left: 40,
                right: 40,
                top: 40,
                bottom: 40,
              }}
              series={[
                {
                  data: chartData,
                  innerRadius: 60,
                  outerRadius: 110,
                  paddingAngle: 1,
                  highlightScope: { fade: 'global', highlight: 'item' },
                },
              ]}
              height={260}
              width={260}
              hideLegend
            >
              <PieCenterLabel 
                primaryText={totalCount.toLocaleString()} 
                secondaryText="總計" 
              />
            </PieChart>
          </Box>

          {/* 右側：明細列表 */}
          <Box sx={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 2,
            minWidth: 0
          }}>
            {regions.slice(0, 4).map((region, index) => (
              <Stack
                key={index}
                direction="row"
                sx={{ alignItems: 'center', gap: 2, pb: 1 }}
              >
                <LocationOn sx={{ color: region.color, fontSize: 20 }} />
                <Stack sx={{ gap: 1, flexGrow: 1 }}>
                  <Stack
                    direction="row"
                    sx={{
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: '600',
                        fontSize: '0.95rem',
                        color: '#333333'
                      }}
                    >
                      {region.name}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#666666', 
                          fontSize: '0.8rem',
                          fontWeight: '500'
                        }}
                      >
                        {region.count}人
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#999999',
                          fontSize: '0.75rem',
                          fontWeight: '400'
                        }}
                      >
                        {region.value}%
                      </Typography>
                    </Stack>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    aria-label="各地區個案數量比例"
                    value={region.value}
                    sx={{
                      [`& .${linearProgressClasses.bar}`]: {
                        backgroundColor: region.color,
                      },
                    }}
                  />
                </Stack>
              </Stack>
            ))}
          </Box>
        </Box>
        {regions.length > 4 && (
          <Typography 
            variant="caption" 
            sx={{ 
              color: '#999999',
              textAlign: 'center',
              display: 'block',
              mt: 1,
              fontSize: '0.75rem',
              fontWeight: '400'
            }}
          >
            顯示前4個地區 (共{regions.length}個地區)
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}