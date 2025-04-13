import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { ThemeProvider } from '@mui/material';
import { theme } from './styles/theme';
import { AuthProvider } from './hooks/useAuth';
import MainLayout from './components/layout/MainLayout';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<Dashboard />} />
              <Route index element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
