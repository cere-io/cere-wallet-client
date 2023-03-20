import { styled, Loading, Logo } from '@cere-wallet/ui';
import { useCallback, useEffect, useState } from 'react';
import { usePopupStore } from '~/hooks';
import { RedirectPopupStore } from '~/stores';

const Frame = styled('iframe')({
  width: '100%',
  height: '100vh',
  maxHeight: 'calc(100% - 10px)',
  border: 'none',
});

export const FramePopup = () => {
  const [url, setUrl] = useState<string>();
  const [loaded, setLoaded] = useState(false);
  const hideLoader = useCallback(() => setLoaded(true), []);

  const store = usePopupStore((popupId) => new RedirectPopupStore(popupId, true));

  useEffect(() => {
    return store.waitForRedirectRequest((url) => {
      console.log('Opening URL in the frame popup', url);

      setUrl(url);
    });
  }, [store]);

  return (
    <>
      {!loaded && (
        <Loading sx={{ position: 'absolute' }} fullScreen>
          <Logo />
        </Loading>
      )}

      {url && (
        <Frame
          title="Embedded browser"
          style={{ opacity: loaded ? 1 : 0 }}
          onLoad={hideLoader}
          onError={hideLoader}
          src={url}
        />
      )}
    </>
  );
};
