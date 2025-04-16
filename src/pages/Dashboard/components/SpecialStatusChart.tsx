import React from 'react';
import { Paper, Box, Typography } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useTheme } from '@mui/material/styles';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';

const statusData = [
  { name: '低收入戶', value: 25 },
  { name: '中低收入戶', value: 35 },
  { name: '身心障礙', value: 20 },
  { name: '原住民', value: 15 },
  { name: '其他', value: 5 },
];

const COLORS = ['#4caf50', '#2196f3', '#ff9800', '#f44336', '#9c27b0'];

export const SpecialStatusChart: React.FC = () => {
  const theme = useTheme();

  return (
    <Paper sx={{ p: 3, borderRadius: 5, width: '620px', height: '350px' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Box
          sx={{
            backgroundColor: 'primary.main',
            borderRadius: '50%',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 2,
          }}
        >
          <AccessibilityNewIcon sx={{ color: 'white' }} />
        </Box>
        <Typography variant="h6">特殊狀態分布</Typography>
      </Box>

      <Box sx={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart
            data={statusData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" name="人數" radius={[4, 4, 0, 0]}>
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};