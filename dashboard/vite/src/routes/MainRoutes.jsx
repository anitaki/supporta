import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import ProtectedRoute from './ProtectedRoute';

// dashboard routing
const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));

// utilities routing

// sample page routing
const QAManagement = Loadable(lazy(() => import('views/pages/qas')));
const FileManagement = Loadable(lazy(() => import('views/pages/files')));
const ChatAssistant = Loadable(lazy(() => import('views/pages/chat-assistant')))

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
          path: '/qa',
          element: <QAManagement />
        },
        {
          path: '/file',
          element: <FileManagement />
        },
        {
          path: '/chat-assistant',
          element: <ChatAssistant />
        }
      ]
    }
  ]
};

export default MainRoutes;
