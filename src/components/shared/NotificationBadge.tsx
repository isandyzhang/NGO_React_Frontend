import React from 'react';
import { Badge, Box } from '@mui/material';
import { THEME_COLORS } from '../../styles/theme';

interface NotificationBadgeProps {
  showBadge?: boolean;
  children: React.ReactNode;
  size?: 'small' | 'medium';
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  showBadge = false,
  children,
  size = 'medium'
}) => {

  return (
    <Box sx={{ position: 'relative', display: 'inline-block' }}>
      <Badge
        variant="dot"
        color="error"
        invisible={!showBadge}
        sx={{
          '& .MuiBadge-badge': {
            backgroundColor: THEME_COLORS.ERROR,
            minWidth: size === 'small' ? '12px' : '16px',
            height: size === 'small' ? '12px' : '16px',
            borderRadius: '50%',
            border: '2px solid white',
            boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
            // 讓紅點更顯眼
            '&::after': {
              content: '""',
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              animation: 'pulse 2s infinite',
            }
          },
          // 添加脈動動畫
          '@keyframes pulse': {
            '0%': {
              transform: 'scale(1)',
              opacity: 1,
            },
            '50%': {
              transform: 'scale(1.3)',
              opacity: 0.7,
            },
            '100%': {
              transform: 'scale(1)',
              opacity: 1,
            },
          }
        }}
      >
        {children}
      </Badge>
    </Box>
  );
};

export default NotificationBadge;