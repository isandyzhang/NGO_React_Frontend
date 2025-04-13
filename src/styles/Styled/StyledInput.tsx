import { styled, TextField } from '@mui/material';

export const StyledInput = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#2e7d32',
    },
    '&:hover fieldset': {
      borderColor: '#60ad5e',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#005005',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#2e7d32',
    '&.Mui-focused': {
      color: '#005005',
    },
  },
  margin: '8px 0',
});
