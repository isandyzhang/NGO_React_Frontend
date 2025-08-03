import React from 'react';
import { 
  Box, 
  Breadcrumbs, 
  Link, 
  Typography, 
  useTheme 
} from '@mui/material';
import { Home } from '@mui/icons-material';
import { THEME_COLORS } from '../../styles/theme';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface PageBreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

const PageBreadcrumbs: React.FC<PageBreadcrumbsProps> = ({ items, className }) => {
  const theme = useTheme();

  return (
    <Box className={className}>
      <Breadcrumbs 
        aria-label="breadcrumb" 
        sx={{ mb: { xs: 0, sm: 1 } }}
        separator="›"
      >
        {/* 首頁連結 */}
        <Link 
          underline="hover" 
          color="inherit" 
          component="button"
          onClick={(e) => e.preventDefault()}
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            ...theme.customTypography?.legendLabel,
            fontSize: { xs: '0.875rem', sm: '1rem' },
            color: THEME_COLORS.TEXT_MUTED,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            '&:hover': {
              color: THEME_COLORS.TEXT_SECONDARY,
            }
          }}
        >
          <Home sx={{ mr: 0.5, fontSize: { xs: 14, sm: 16 } }} />
          首頁
        </Link>
        
        {/* 動態麵包屑項目 */}
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          if (isLast) {
            // 最後一項顯示為文字
            return (
              <Box 
                key={index}
                component="span"
                sx={{
                  display: 'flex', 
                  alignItems: 'center',
                  ...theme.customTypography?.legendLabel,
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  color: THEME_COLORS.TEXT_PRIMARY,
                  fontWeight: 500,
                }}
              >
                {item.icon && (
                  <Box sx={{ mr: 0.5, display: 'flex', alignItems: 'center' }}>
                    {item.icon}
                  </Box>
                )}
                {item.label}
              </Box>
            );
          } else {
            // 中間項目顯示為連結
            return (
              <Link 
                key={index}
                underline="hover" 
                color="inherit" 
                component="button"
                onClick={(e) => {
                  e.preventDefault();
                  if (item.href && item.href !== "#") {
                    window.location.href = item.href;
                  }
                }}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  ...theme.customTypography?.legendLabel,
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  color: THEME_COLORS.TEXT_MUTED,
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  '&:hover': {
                    color: THEME_COLORS.TEXT_SECONDARY,
                  }
                }}
              >
                {item.icon && (
                  <Box sx={{ mr: 0.5, display: 'flex', alignItems: 'center' }}>
                    {item.icon}
                  </Box>
                )}
                {item.label}
              </Link>
            );
          }
        })}
      </Breadcrumbs>
    </Box>
  );
};

export default PageBreadcrumbs; 