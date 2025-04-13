import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';

interface SchoolData {
  name: string;
  count: number;
  percentage: string;
  change: string;
}

const schoolData: SchoolData[] = [
  { name: '台北市立第一國民小學', count: 125, percentage: '25%', change: '+4.5%' },
  { name: '台北市立第二國民小學', count: 98, percentage: '19.6%', change: '+2.1%' },
  { name: '台北市立第三國民小學', count: 156, percentage: '31.2%', change: '+5.8%' },
  { name: '台北市立第四國民小學', count: 121, percentage: '24.2%', change: '+3.2%' },
];

export const SchoolDistribution: React.FC = () => {
  return (
    <Paper sx={{ p: 3 }}>
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
          <LanguageIcon sx={{ color: 'white' }} />
        </Box>
        <Typography variant="h6">學校分佈統計</Typography>
      </Box>

      {schoolData.map((school, index) => (
        <Box
          key={school.name}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            py: 2,
            borderBottom: index < schoolData.length - 1 ? '1px solid #eee' : 'none',
          }}
        >
          <Box>
            <Typography variant="body1">{school.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {school.count}人
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body1">{school.percentage}</Typography>
            <Typography
              variant="body2"
              sx={{ color: school.change.startsWith('+') ? 'success.main' : 'error.main' }}
            >
              {school.change}
            </Typography>
          </Box>
        </Box>
      ))}
    </Paper>
  );
};
