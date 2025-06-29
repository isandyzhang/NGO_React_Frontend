import React from 'react';
import { Card, CardProps, styled } from '@mui/material';

// 擴展的 Card 組件 Props 介面，支援額外的樣式變體
interface StyledCardProps extends Omit<CardProps, 'variant'> {
  cardType?: 'default' | 'stat' | 'chart' | 'action'; // 卡片類型變體
  interactive?: boolean; // 是否支援互動效果
}

/**
 * 基礎樣式化卡片組件
 * 使用 Material-UI 的 styled API 創建自定義樣式
 */
const BaseStyledCard = styled(Card)<{ cardType?: string; interactive?: boolean }>(
  ({ theme, cardType, interactive }) => ({
    // 基礎樣式已在 theme.ts 中定義，這裡可以添加變體樣式
    // 統計卡片樣式（預留）
    // ...(cardType === 'stat' && {
    //   background: 'linear-gradient(135deg, #ffffff 0%, 'rgba(248, 249, 250, 1)' 100%)',
    //   borderLeft: `4px solid ${theme.palette.primary.main}`,
    // }),
    
    // 操作卡片樣式（預留）
    // ...(cardType === 'action' && {
    //   cursor: 'pointer',
    //   '&:hover': {
    //     boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
    //     transform: 'translateY(-2px)',
    //   },
    // }),

    // 互動效果樣式
    ...(interactive && {
      cursor: 'pointer',
      '&:active': {
        transform: 'translateY(0px)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      },
    }),
  })
);

/**
 * 樣式化卡片組件 (StyledCard)
 * 
 * 主要功能：
 * 1. 統一的卡片樣式 - 提供一致的視覺設計和間距
 * 2. 多種卡片變體 - 支援不同用途的卡片樣式
 * 3. 互動效果 - 可選的點擊和懸停動畫效果
 * 4. 主題整合 - 與系統主題色彩和樣式完全整合
 * 
 * 支援的卡片類型：
 * - default: 標準卡片樣式
 * - stat: 統計數據卡片（預留）
 * - chart: 圖表容器卡片（預留）
 * - action: 可操作卡片（預留）
 * 
 * 特色：
 * - 基於 Material-UI Card 組件擴展
 * - 支援所有原生 Card 的 Props
 * - 可自定義互動效果
 * - 響應式設計適配不同螢幕尺寸
 * 
 * 使用範例：
 * ```jsx
 * <StyledCard cardType="stat" interactive>
 *   <CardContent>統計內容</CardContent>
 * </StyledCard>
 * ```
 */
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