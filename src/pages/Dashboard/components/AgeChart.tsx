import React from 'react';
import { Paper, Box, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useTheme } from '@mui/material/styles';
import TimelineIcon from '@mui/icons-material/Timeline';

const data = [
  { name: '6-8歲', value: 110 },
  { name: '9-11歲', value: 170 },
  { name: '12-14歲', value: 145 },
  { name: '15-17歲', value: 85 },
  { name: '18歲以上', value: 60 },
];

export const AgeChart: React.FC = () => {
  const theme = useTheme();

  return (
    <Paper sx={{ p: 3, height: '100%', borderRadius: 5 ,width:'300px'}}>
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
          <TimelineIcon sx={{ color: 'white' }} />
        </Box>
        <Typography variant="h6">年齡分佈</Typography>
      </Box>

      <Box sx={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Bar
              dataKey="value"
              fill={theme.palette.primary.main}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}; 