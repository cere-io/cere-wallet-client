import { Route, Routes } from 'react-router-dom';

import { Authorize, AuthorizeClose, AuthorizeRedirect, IntroRoute, LoginRoute, OtpRoute } from './Authorize';
import { useWhiteLabel } from '@cere-wallet/ui';

export const AuthorizationRouter = () => {
  const { isGame } = useWhiteLabel();

  return (
    <Routes>
      <Route element={<Authorize />}>
        <Route index element={isGame ? <LoginRoute /> : <IntroRoute />} />
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
