import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import routes from './routes';

const router = createBrowserRouter(routes);

export * from './RouteElement';
export const Router = () => <RouterProvider router={router} />;
