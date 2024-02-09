import { Route, Routes } from 'react-router-dom';

import { Authorize, AuthorizeClose, AuthorizeRedirect, IntroRoute, LoginRoute, OtpRoute } from './Authorize';
import { useAppContextStore } from '~/hooks';

export const AuthorizationRouter = () => {
  const store = useAppContextStore();
  const skipOnboardingHelloPage = Boolean(store.app?.skipOnboardingHelloPage);

  const isGame = ['metaverse-dash-run', 'candy-jam', 'cere-game-portal'].includes(store.app?.appId as string); // TODO remove after promo
  return (
    <Routes>
      <Route element={<Authorize />}>
        <Route index element={isGame || skipOnboardingHelloPage ? <LoginRoute /> : <IntroRoute />} />
        <Route path="close" element={<AuthorizeClose />} />
        <Route path="redirect" element={<AuthorizeRedirect />} />
        <Route path="intro" element={<IntroRoute />} />
        <Route path="signin" element={<LoginRoute variant="signin" />} />
        <Route path="signup" element={<LoginRoute variant="signup" />} />
        <Route path="otp" element={<OtpRoute />} />
      </Route>
    </Routes>
  );
};
