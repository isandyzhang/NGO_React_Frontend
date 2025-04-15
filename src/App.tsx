import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';
import { theme } from './styles/theme';
import { AuthProvider } from './hooks/useAuth';
import { router } from './routes';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
