import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ModuleListPage from './pages/ModuleListPage';
import ModuleDetailPage from './pages/ModuleDetailPage';
import NotFound from './pages/NotFound';

const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: '/', element: <Dashboard /> },
          { path: '/modules/:moduleKey', element: <ModuleListPage /> },
          { path: '/modules/:moduleKey/:id', element: <ModuleDetailPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFound /> },
]);

export default router;
