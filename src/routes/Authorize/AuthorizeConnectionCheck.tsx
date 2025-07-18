import { observer } from 'mobx-react-lite';
import { Loading, Logo } from '@cere-wallet/ui';
import { useEffect } from 'react';
import { useOutletContext, useNavigate, useLocation } from 'react-router-dom';

import { AuthorizePopupStore } from '~/stores';
import AuthorizeIntro from './AuthorizeIntro';
import AuthorizeLogin from './AuthorizeLogin';

interface AuthorizeConnectionCheckProps {
  showIntro?: boolean;
  variant?: 'signin' | 'signup';
}

const AuthorizeConnectionCheck = observer(({ showIntro = false, variant }: AuthorizeConnectionCheckProps) => {
  const store = useOutletContext<AuthorizePopupStore>();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If connection check is complete, the store will handle any necessary redirects
    if (store.connectionCheckComplete && !store.isCheckingConnection) {
      console.log('Connection check complete, hasActiveSession:', store.hasActiveSession);
    }
  }, [store.connectionCheckComplete, store.isCheckingConnection, store.hasActiveSession, navigate, location]);

  // Show loading while checking for existing connections
  if (store.isCheckingConnection || !store.connectionCheckComplete) {
    return (
      <Loading fullScreen>
        <Logo />
      </Loading>
    );
  }

  // If no existing connection found, show the appropriate login component
  if (showIntro) {
    return <AuthorizeIntro />;
  }

  return <AuthorizeLogin variant={variant} />;
});

export default AuthorizeConnectionCheck;
