import { Route, Routes, useSearchParams } from 'react-router-dom';

import { useAppContextStore } from '~/hooks';
import {
  Authorize,
  AuthorizeClose,
  AuthorizeRedirect,
  AuthorizeIntro,
  AuthorizeLogin,
  AuthorizeOtp,
  AuthorizePermissions,
  AuthorizeComplete,
  AuthorizeLink,
} from './Authorize';

export const AuthorizationRouter = () => {
  const [params] = useSearchParams();
  const store = useAppContextStore();
  const email = params.get('email');
  const skipLoginIntro = params.get('skipIntro') || store.whiteLabel?.skipLoginIntro;

  const isGame = ['metaverse-dash-run', 'candy-jam', 'cere-game-portal'].includes(store.app?.appId as string); // TODO remove after promo

  return (
    <Routes>
      <Route element={<Authorize />}>
        {email ? (
          <Route index element={<AuthorizeOtp sendOtp />} />
        ) : (
          <>
            <Route index element={isGame || skipLoginIntro ? <AuthorizeLogin /> : <AuthorizeIntro />} />
            <Route path="intro" element={<AuthorizeIntro />} />
            <Route path="signin" element={<AuthorizeLogin variant="signin" />} />
            <Route path="signup" element={<AuthorizeLogin variant="signup" />} />
            <Route path="otp" element={<AuthorizeOtp />} />
          </>
        )}

        <Route path="permissions" element={<AuthorizePermissions />} />
        <Route path="complete" element={<AuthorizeComplete />} />
        <Route path="close" element={<AuthorizeClose />} />
        <Route path="redirect" element={<AuthorizeRedirect />} />
        <Route path="magic-link" element={<AuthorizeLink />} />
      </Route>
    </Routes>
  );
};
