import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartCard, CustomTooltip } from './ChartCard';
import { useTheme } from '@mui/material';

const quarterlyData = [
  { quarter: 'Q1', value: 120 },
  { quarter: 'Q2', value: 180 },
  { quarter: 'Q3', value: 250 },
  { quarter: 'Q4', value: 310 },
];

export const QuarterlyChart: React.FC = () => {
  const theme = useTheme();

  return (
    <ChartCard title="季度統計">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={quarterlyData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="quarter" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            name="人數"
            stroke={theme.palette.primary.main}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}; 