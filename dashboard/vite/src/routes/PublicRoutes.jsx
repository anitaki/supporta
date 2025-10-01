import { lazy } from 'react';

// project imports
import Loadable from 'ui-component/Loadable';
import MinimalLayout from 'layout/MinimalLayout';

const HomePage = Loadable(lazy(() => import('views/pages/HomePage')));

// ==============================|| PUBLIC ROUTING ||============================== //

const PublicRoutes = {
  path: '/',
  element: <MinimalLayout />,
  children: [
    {
      index: true,
      element: <HomePage />
    }
  ]
};

export default PublicRoutes;
