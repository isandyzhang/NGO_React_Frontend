import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartCard, CustomTooltip } from './ChartCard';
import { useTheme } from '@mui/material';

const genderData = [
  { name: '男性', value: 60 },
  { name: '女性', value: 40 },
];

const COLORS = ['#0088FE', '#FF69B4'];

export const GenderChart: React.FC = () => {
  const theme = useTheme();

  return (
    <ChartCard title="性別分布">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={genderData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {genderData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}; 