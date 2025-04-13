import React, { ReactNode } from 'react';
import { Box, Container } from '@mui/material';

interface DashboardGridProps {
  children: ReactNode;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({ children }) => {
  const childrenArray = React.Children.toArray(children);
  
  return (
    <Box sx={{ 
      flexGrow: 1,
      backgroundColor: 'background.default',
      minHeight: '100vh',
      py: 3
    }}>
      <Container maxWidth="xl">
        <Box sx={{ display: 'grid', gap: 3 }}>
          <Box sx={{ backgroundColor: 'background.paper', borderRadius: 1, p: 2 }}>
            {childrenArray[0]}
          </Box>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, 
            gap: 3 
          }}>
            <Box sx={{ backgroundColor: 'background.paper', borderRadius: 1, p: 2 }}>
              {childrenArray[1]}
            </Box>
            <Box sx={{ backgroundColor: 'background.paper', borderRadius: 1, p: 2 }}>
              {childrenArray[2]}
            </Box>
            <Box sx={{ backgroundColor: 'background.paper', borderRadius: 1, p: 2 }}>
              {childrenArray[3]}
            </Box>
          </Box>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, 
            gap: 3 
          }}>
            <Box sx={{ backgroundColor: 'background.paper', borderRadius: 1, p: 2 }}>
              {childrenArray[4]}
            </Box>
            <Box sx={{ backgroundColor: 'background.paper', borderRadius: 1, p: 2 }}>
              {childrenArray[5]}
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}; 