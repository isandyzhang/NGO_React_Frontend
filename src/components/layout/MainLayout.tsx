import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import { useAuth } from '../../hooks/useAuth';

const MainLayout: React.FC = () => {
  const { logout } = useAuth();
  
  return (
    <Box sx={{
      display: 'flex',
      minHeight: '100vh',
      bgcolor: '#ededed',
      position: 'relative',
    }}>
      <Sidebar onLogout={logout} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          padding: 3,
          bgcolor: '#ededed',
        }}
  >
  <Outlet />
</Box>
    </Box>
  );
};

export default MainLayout; 