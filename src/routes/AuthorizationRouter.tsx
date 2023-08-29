import { Route, Routes } from 'react-router-dom';

import { Authorize, AuthorizeClose, AuthorizeRedirect, IntroRoute, LoginRoute, OtpRoute } from './Authorize';
import { useTheme } from '@mui/material';

export const AuthorizationRouter = () => {
  const { whiteLabel } = useTheme();

  return (
    <Routes>
      <Route element={<Authorize />}>
        <Route index element={whiteLabel ? <LoginRoute /> : <IntroRoute />} />
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
