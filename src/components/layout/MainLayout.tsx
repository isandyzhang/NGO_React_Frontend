import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useTheme } from '@mui/material';
import Sidebar from './Sidebar';
import { useAuth } from '../../hooks/useAuth';

const MainLayout: React.FC = () => {
  const { logout } = useAuth();
  const theme = useTheme();
  
  return (
    <Box sx={{
      display: 'flex',
      minHeight: '100vh',
      bgcolor: theme.palette.background.default,
      position: 'relative',
    }}>
      <Sidebar onLogout={logout} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          padding: 3,
          bgcolor: theme.palette.background.default,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout; 