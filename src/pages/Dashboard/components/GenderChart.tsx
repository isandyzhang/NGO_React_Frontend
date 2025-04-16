import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useTheme, Paper, Box, Typography } from '@mui/material';
import WcIcon from '@mui/icons-material/Wc'; // 性別 icon

const genderData = [
  { name: '男性', value: 60 },
  { name: '女性', value: 40 },
];

const COLORS = [ '#2196f3','#f44336'];

export const GenderChart: React.FC = () => {
  const theme = useTheme();

  return (
    <Paper sx={{ p: 3, borderRadius: 5, width: '620px', height: '350px' }}>
      {/* 標題區塊 */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Box
          sx={{
            backgroundColor: theme.palette.primary.main,
            borderRadius: '50%',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 2,
          }}
        >
          <WcIcon sx={{ color: 'white' }} />
        </Box>
        <Typography variant="h6">性別分佈</Typography>
      </Box>

      {/* 圖表區塊 */}
      <Box sx={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={genderData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={80}
              dataKey="value"
            >
              {genderData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};
