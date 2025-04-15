import React from 'react';
import { Box, Typography, Breadcrumbs, Grid } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';

import { SchoolDistribution } from './components/SchoolDistribution';
import { AgeChart } from './components/AgeChart';
import { GenderChart } from './components/GenderChart';
import { SpecialStatusChart } from './components/SpecialStatusChart';
import { IncomeChart } from './components/IncomeChart';

export const Dashboard: React.FC = () => {
  return (
    <Box sx={{ width: '100%', px: { xs: 2, sm: 3 }, py: 2 }}>
      {/* 麵包屑導覽 */}
      <Box sx={{ mb: 2 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Box
            component={RouterLink}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: 'text.primary',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            <HomeIcon sx={{ mr: 0.5, fontSize: 20 }} />
            首頁
          </Box>
          <Typography>儀表板</Typography>
        </Breadcrumbs>
      </Box>
      
      {/* 圖表區塊 */}
      <Grid container spacing={2} justifyContent="flex-start" alignItems="stretch">
        <Grid>
          <SchoolDistribution />
        </Grid>
        <Grid>
          <AgeChart />
        </Grid>
        <Grid>
          <GenderChart />
        </Grid>
        <Grid>
          <SpecialStatusChart />
        </Grid>
        <Grid>
          <IncomeChart />
        </Grid>
      </Grid>
    </Box>
  );
};
