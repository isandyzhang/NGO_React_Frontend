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

const statusData = [
  { name: '低收入戶', value: 25 },
  { name: '中低收入戶', value: 35 },
  { name: '身心障礙', value: 20 },
  { name: '原住民', value: 15 },
  { name: '其他', value: 5 },
];

export const SpecialStatusChart: React.FC = () => {
  const theme = useTheme();

  return (
    <ChartCard title="特殊狀態分布">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={statusData}
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