import { Route, Routes } from 'react-router-dom';

import { Authorize, AuthorizeClose, AuthorizeRedirect, IntroRoute, LoginRoute, OtpRoute } from './Authorize';
import { useAppContextStore } from '~/hooks';

export const AuthorizationRouter = () => {
  const store = useAppContextStore();

  const isGame = ['metaverse-dash-run', 'candy-jam'].includes(store.app?.appId as string);
  return (
    <Routes>
      <Route element={<Authorize />}>
        <Route index element={isGame ? <LoginRoute isGame={isGame} /> : <IntroRoute />} />
        <Route path="close" element={<AuthorizeClose />} />
        <Route path="redirect" element={<AuthorizeRedirect />} />
        <Route path="intro" element={<IntroRoute />} />
        <Route path="signin" element={<LoginRoute variant="signin" />} />
        <Route path="signup" element={<LoginRoute variant="signup" />} />
        <Route path="otp" element={<OtpRoute isGame={isGame} />} />
      </Route>
    </Routes>
  );
};
