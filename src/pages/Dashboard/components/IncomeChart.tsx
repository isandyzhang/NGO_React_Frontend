import React from 'react';
import { Paper, Box, Typography, useTheme } from '@mui/material';
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
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const incomeData = [
  { name: '0-20萬', value: 30 },
  { name: '20-40萬', value: 25 },
  { name: '40-60萬', value: 20 },
  { name: '60-80萬', value: 15 },
  { name: '80萬以上', value: 10 },
];

const COLORS = ['#4caf50', '#2196f3', '#ff9800', '#f44336', '#9c27b0'];

export const IncomeChart: React.FC = () => {
  const theme = useTheme();

  return (
    <Paper sx={{ p: 3, borderRadius: 5, width: '620px', height: '350px' }}>
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
          <AttachMoneyIcon sx={{ color: 'white' }} />
        </Box>
        <Typography variant="h6">家庭收入分布</Typography>
      </Box>
      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={incomeData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" name="人數" radius={[4, 4, 0, 0]}>
            {incomeData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};