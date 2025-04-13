import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartCard, CustomTooltip } from './ChartCard';
import { useTheme } from '@mui/material';

const incomeData = [
  { name: '0-20萬', value: 30 },
  { name: '20-40萬', value: 25 },
  { name: '40-60萬', value: 20 },
  { name: '60-80萬', value: 15 },
  { name: '80萬以上', value: 10 },
];

export const IncomeChart: React.FC = () => {
  const theme = useTheme();

  return (
    <ChartCard title="家庭收入分布">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={incomeData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar
            dataKey="value"
            name="人數"
            fill={theme.palette.primary.main}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}; 