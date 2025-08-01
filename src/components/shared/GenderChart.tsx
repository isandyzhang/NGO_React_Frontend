import * as React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { useDrawingArea } from '@mui/x-charts/hooks';
import { styled, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { Male, Female } from '@mui/icons-material';
import { THEME_COLORS } from '../../styles/theme';

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
        fontSize: '1.8rem',
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
  const primaryY = top + height / 2 + 15; // 調整為更大圖表的中心位置
  const secondaryY = primaryY + 25;

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

interface GenderData {
  id: number;
  value: number;
  label: string;
}

interface GenderChartProps {
  data: GenderData[];
  loading?: boolean;
}

export default function GenderChart({ data, loading = false }: GenderChartProps) {
  const theme = useTheme();
  
  if (loading) {
    return (
      <Card sx={{ 
        boxShadow: { xs: 1, sm: 2 },
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <CardContent sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          flex: 1,
          minHeight: 300
        }}>
          <Typography>載入中...</Typography>
        </CardContent>
      </Card>
    );
  }

  // 計算總數
  const totalCount = data.reduce((sum, item) => sum + item.value, 0);

  // 準備性別數據
  const genderInfo = data.map((item) => {
    const isMale = item.label === '男生' || item.label === 'Male';
    const isFemale = item.label === '女生' || item.label === 'Female';
    
    return {
      name: isMale ? '男生' : isFemale ? '女生' : item.label,
      value: item.value,
      percentage: totalCount > 0 ? Math.round((item.value / totalCount) * 100) : 0,
      color: isMale ? THEME_COLORS.MALE_AVATAR : isFemale ? THEME_COLORS.FEMALE_AVATAR : THEME_COLORS.CHART_COLOR_1,
      icon: isMale ? <Male /> : isFemale ? <Female /> : null,
    };
  });

  return (
    <Card sx={{ 
      boxShadow: { xs: 1, sm: 2 },
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <CardContent sx={{ 
        p: { xs: 1.5, sm: 2, md: 2.5, lg: 3 },
        flex: 1,
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
          性別分佈
        </Typography>
        
        {/* 上半圓形圖表區域 */}
        <Box sx={{ 
          height: { xs: 200, sm: 220, md: 240 },
          width: '100%',
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          mb: 1.5 // 減少底部間距
        }}>
          <PieChart
            series={[
              {
                data: data,
                innerRadius: 60,
                outerRadius: 100,
                startAngle: -90,   // 從上方開始
                endAngle: 90,      // 到下方結束，形成完整的半圓
                paddingAngle: 1, // 減少區塊間的間隔
                highlightScope: { fade: 'global', highlight: 'item' },
              },
            ]}
            colors={genderInfo.map(g => g.color)}
            width={360}
            height={240}
            margin={{ top: 20, bottom: 20, left: 60, right: 60 }}
            hideLegend
            sx={{ 
              maxWidth: '100%', 
              maxHeight: '100%'
            }}
          >
            <PieCenterLabel 
              primaryText={totalCount.toLocaleString()} 
              secondaryText="總數" 
            />
          </PieChart>
        </Box>

        {/* 性別統計列表 */}
        <Stack spacing={1.5}> {/* 減少列表項目間的間隔 */}
          {genderInfo.map((gender, index) => (
            <Stack
              key={index}
              direction="row"
              sx={{ 
                alignItems: 'center', 
                gap: 2,
                p: 1, // 減少內邊距
                borderRadius: 1,
                backgroundColor: `${gender.color}10`, // 10% 透明度背景
                border: `1px solid ${gender.color}30`, // 30% 透明度邊框
              }}
            >
              {/* 性別圖標 */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: gender.color,
                  color: 'white',
                  flexShrink: 0
                }}
              >
                {gender.icon}
              </Box>

              {/* 性別信息 */}
              <Stack sx={{ flex: 1 }}>
                <Stack
                  direction="row"
                  sx={{
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 0.5
                  }}
                >
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: '600',
                      fontSize: '1rem',
                      color: '#333333'
                    }}
                  >
                    {gender.name}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#666666', 
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}
                    >
                      {gender.value}人
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: gender.color,
                        fontSize: '0.875rem',
                        fontWeight: '600'
                      }}
                    >
                      {gender.percentage}%
                    </Typography>
                  </Stack>
                </Stack>
                
                {/* 進度條 */}
                <Box
                  sx={{
                    width: '100%',
                    height: 6,
                    backgroundColor: '#f0f0f0',
                    borderRadius: 3,
                    overflow: 'hidden'
                  }}
                >
                  <Box
                    sx={{
                      width: `${gender.percentage}%`,
                      height: '100%',
                      backgroundColor: gender.color,
                      borderRadius: 3,
                      transition: 'width 0.6s ease-in-out'
                    }}
                  />
                </Box>
              </Stack>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}