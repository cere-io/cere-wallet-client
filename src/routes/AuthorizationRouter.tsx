import { Route, Routes } from 'react-router-dom';

import { Authorize, AuthorizeClose, AuthorizeRedirect, IntroRoute, LoginRoute, OtpRoute } from './Authorize';

export const AuthorizationRouter = () => (
  <Routes>
    <Route element={<Authorize />}>
      <Route index element={<LoginRoute />} />
      <Route path="close" element={<AuthorizeClose />} />
      <Route path="redirect" element={<AuthorizeRedirect />} />
      <Route path="intro" element={<IntroRoute />} />
      <Route path="signin" element={<LoginRoute variant="signin" />} />
      <Route path="signup" element={<LoginRoute variant="signup" />} />
      <Route path="otp" element={<OtpRoute />} />
    </Route>
  </Routes>
);
