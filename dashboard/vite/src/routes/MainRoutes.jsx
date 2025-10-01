import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import ProtectedRoute from './ProtectedRoute';

// dashboard routing
const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));

// utilities routing
const UtilsTypography = Loadable(lazy(() => import('views/utilities/Typography')));
const UtilsColor = Loadable(lazy(() => import('views/utilities/Color')));
const UtilsShadow = Loadable(lazy(() => import('views/utilities/Shadow')));

// sample page routing
const SamplePage = Loadable(lazy(() => import('views/sample-page')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <ProtectedRoute />,
  children: [
    {
      element: <MainLayout />,
      children: [
        {
          path: '/',
          element: <DashboardDefault />
        },
        {
          path: 'dashboard',
          children: [
            {
              index: true, // ← default child for /dashboard
              element: <DashboardDefault />
            },
            {
              path: 'default',
              element: <DashboardDefault />
            }
          ]
        },
        {
          path: 'typography',
          element: <UtilsTypography />
        },
        {
          path: 'color',
          element: <UtilsColor />
        },
        {
          path: 'shadow',
          element: <UtilsShadow />
        },
        {
          path: '/sample-page',
          element: <SamplePage />
        }
      ]
    }
  ]
};

export default MainRoutes;
