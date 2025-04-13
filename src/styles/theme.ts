import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32', // 深绿色
      light: '#60ad5e',
      dark: '#005005',
    },
    secondary: {
      main: '#4caf50', // 浅绿色
      light: '#80e27e',
      dark: '#087f23',
    },
    background: {
      default: '#f1f8e9',
      paper: '#ffffff',
    },
    text: {
      primary: '#2e7d32',
      secondary: '#558b2f',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      color: '#2e7d32',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontSize: '1rem',
          padding: '12px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '&:hover fieldset': {
              borderColor: '#2e7d32',
            },
          },
        },
      },
    },
  },
}); 