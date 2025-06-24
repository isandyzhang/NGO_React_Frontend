import React from 'react';
import { Card, CardProps, styled } from '@mui/material';

// 擴展的 Card 組件，支援額外的樣式變體
interface StyledCardProps extends Omit<CardProps, 'variant'> {
  cardType?: 'default' | 'stat' | 'chart' | 'action';
  interactive?: boolean;
}

const BaseStyledCard = styled(Card)<{ cardType?: string; interactive?: boolean }>(
  ({ theme, cardType, interactive }) => ({
    // 基礎樣式已在 theme.ts 中定義，這裡可以添加變體樣式
    ...(cardType === 'stat' && {
      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
      borderLeft: `4px solid ${theme.palette.primary.main}`,
    }),
    
    ...(cardType === 'chart' && {
      minHeight: '300px',
      display: 'flex',
      flexDirection: 'column',
    }),
    
    ...(cardType === 'action' && {
      cursor: 'pointer',
      '&:hover': {
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
        transform: 'translateY(-2px)',
      },
    }),

    ...(interactive && {
      cursor: 'pointer',
      '&:active': {
        transform: 'translateY(0px)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      },
    }),
  })
);

export const StyledCard: React.FC<StyledCardProps> = ({
  children,
  cardType = 'default',
  interactive = false,
  ...props
}) => {
  return (
    <BaseStyledCard
      cardType={cardType}
      interactive={interactive}
      {...props}
    >
      {children}
    </BaseStyledCard>
  );
};

export default StyledCard; 