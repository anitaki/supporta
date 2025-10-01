import { createBrowserRouter } from 'react-router-dom';

// routes
import AuthenticationRoutes from './AuthenticationRoutes';
import MainRoutes from './MainRoutes';
import PublicRoutes from './PublicRoutes';

// ==============================|| ROUTING RENDER ||============================== //

const router = createBrowserRouter([PublicRoutes, AuthenticationRoutes, MainRoutes], {
  basename: import.meta.env.VITE_APP_BASE_NAME
});

export default router;
