import { styled, TextField } from '@mui/material';

export const StyledInput = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.light,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.dark,
    },
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.primary.main,
    '&.Mui-focused': {
      color: theme.palette.primary.dark,
    },
  },
  margin: '8px 0',
}));
