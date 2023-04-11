import { Route, Routes } from 'react-router-dom';

import { AuthorizeClose, AuthorizeRedirect, IntroRoute, LoginRoute, OtpRoute } from './Authorize';

export const AuthorizationRouter = () => (
  <Routes>
    <Route index element={<IntroRoute />} />
    <Route path="close" element={<AuthorizeClose />} />
    <Route path="redirect" element={<AuthorizeRedirect />} />
    <Route path="intro" element={<IntroRoute />} />
    <Route path="signin" element={<LoginRoute variant="signin" />} />
    <Route path="signup" element={<LoginRoute variant="signup" />} />
    <Route path="otp" element={<OtpRoute />} />
  </Routes>
);
