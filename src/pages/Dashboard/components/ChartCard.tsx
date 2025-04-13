import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({ title, children }) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        {children}
      </CardContent>
    </Card>
  );
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
  label?: string;
}

export const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: 'white',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <p style={{ margin: '0 0 5px 0' }}>{label}</p>
        <p style={{ margin: '0' }}>{`人數: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
}; 