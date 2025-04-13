import { createBrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';
import { Dashboard } from '../pages/Dashboard/Dashboard';
import MainLayout from '../components/layout/MainLayout';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <ProtectedRoute><MainLayout /></ProtectedRoute>,
    children: [
      {
        path: '/dashboard',
        element: <Dashboard />,
        },
    ],
  },
]); 