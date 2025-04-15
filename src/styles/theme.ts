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
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#000000',
      secondary: '#000000',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h4: {
      fontWeight: 500,
      color: '#000000',
    },
    h5: {
      fontWeight: 500,
      color: '#000000',
    },
    h6: {
      fontWeight: 500,
      color: '#000000',
    },
    body1: {
      color: '#000000',
    },
    body2: {
      color: '#000000',
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
    MuiTypography: {
      defaultProps: {
        color: 'text.primary',
      },
    },
    MuiBreadcrumbs: {
      styleOverrides: {
        root: {
          color: '#000000',
        },
        li: {
          color: '#000000',
        },
      },
    },
  },
}); 