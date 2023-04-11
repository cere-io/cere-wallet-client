import { Navigate, To, resolvePath, useLocation } from 'react-router-dom';

export const Redirect = ({ to }: { to: To }) => {
  const location = useLocation();
  const { pathname, hash } = resolvePath(to, location.pathname);

  return <Navigate replace to={{ ...location, pathname, hash }} />;
};
