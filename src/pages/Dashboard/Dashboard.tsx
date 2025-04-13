import React from 'react';
import { Box, Typography, Container, Breadcrumbs, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import { DashboardGrid } from './components/DashboardGrid';
import { SchoolDistribution } from './components/SchoolDistribution';
import { AgeChart } from './components/AgeChart';
import { QuarterlyChart } from './components/QuarterlyChart';
import { GenderChart } from './components/GenderChart';
import { SpecialStatusChart } from './components/SpecialStatusChart';
import { IncomeChart } from './components/IncomeChart';

export const Dashboard: React.FC = () => {
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link
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
          </Link>
          <Typography color="text.primary">儀表板</Typography>
        </Breadcrumbs>
      </Box>

      <Box sx={{ flexGrow: 1 }}>
        <Container maxWidth="xl">
          <Typography variant="h4" component="h1" gutterBottom>
            儀表板
          </Typography>
          <DashboardGrid>
            <SchoolDistribution />
            <AgeChart />
            <GenderChart />
            <QuarterlyChart />
            <SpecialStatusChart />
            <IncomeChart />
          </DashboardGrid>
        </Container>
      </Box>
    </Box>
  );
}; 