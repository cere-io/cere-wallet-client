import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import TagManager from 'react-gtm-module';

import { GTM_ID } from '~/constants';
import { Redirect } from './Redirect';
import { RedirectPopup } from './RedirectPopup';
import { ConfirmPopup } from './ConfirmPopup';
import { TransactionPopup } from './TransactionPopup';
import { FramePopup } from './FramePopup';
import { PermissionsPopup } from './PermissionsPopup';

const initGtm = () => GTM_ID && TagManager.initialize({ gtmId: GTM_ID });

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
        path: 'permissions',
        Component: PermissionsPopup,
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

          initGtm(); // Init GTM asynchronously on wallet load

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

          initGtm(); // Init GTM asynchronously on authorize UI

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
