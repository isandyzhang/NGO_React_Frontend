import { styled, Button } from '@mui/material';

export const StyledButton = styled(Button)(({ theme }) => ({
  padding: '12px',
  borderRadius: '8px',
  textTransform: 'none',
  fontSize: '1rem',
  fontWeight: 500,
  boxShadow: 'none',
  '&:hover': {
    boxShadow: `0 2px 4px ${theme.palette.primary.main}25`,
  },
  '&.MuiButton-containedPrimary': {
    background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
    '&:hover': {
      background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 90%)`,
    }
  },
  '&.MuiButton-outlinedPrimary': {
    borderColor: theme.palette.primary.main,
    color: theme.palette.primary.main,
    '&:hover': {
      borderColor: theme.palette.primary.dark,
      color: theme.palette.primary.dark,
      backgroundColor: theme.palette.background.paper,
    }
  },
  '&.MuiButton-outlinedSecondary': {
    borderColor: theme.palette.secondary.main,
    color: theme.palette.secondary.main,
    '&:hover': {
      borderColor: theme.palette.secondary.dark,
      color: theme.palette.secondary.dark,
      backgroundColor: theme.palette.background.paper,
    }
  },
}));
