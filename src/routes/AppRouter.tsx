import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import { Redirect } from './Redirect';
import { RedirectPopup } from './RedirectPopup';
import { ConfirmPopup } from './ConfirmPopup';
import { TransactionPopup } from './TransactionPopup';
import { FramePopup } from './FramePopup';

const router = createBrowserRouter([
  {
    path: '/',
    children: [
      {
        index: true,
        element: <Redirect to="wallet/home" />,
      },

      {
        path: 'redirect',
        Component: RedirectPopup,
      },

      {
        path: 'confirm',
        Component: ConfirmPopup,
      },

      {
        path: 'transaction',
        Component: TransactionPopup,
      },

      {
        path: 'frame',
        Component: FramePopup,
      },

      {
        path: 'popup/*',
        lazy: async () => {
          const { EmbedWalletRouter } = await import(/* webpackChunkName: "EmbedWalletRouter" */ './EmbedWalletRouter');

          return {
            Component: EmbedWalletRouter,
          };
        },
      },

      {
        path: 'wallet/*',
        lazy: async () => {
          const { WalletRouter } = await import(/* webpackChunkName: "WalletRouter" */ './WalletRouter');

          return {
            Component: WalletRouter,
          };
        },
      },

      {
        path: 'authorize/*',
        lazy: async () => {
          const { AuthorizationRouter } = await import(
            /* webpackChunkName: "AuthorizationRouter" */ './AuthorizationRouter'
          );

          return {
            Component: AuthorizationRouter,
          };
        },
      },
    ],
  },
]);

export const getRoutes = () => router.routes;
export const AppRouter = () => <RouterProvider router={router} />;
