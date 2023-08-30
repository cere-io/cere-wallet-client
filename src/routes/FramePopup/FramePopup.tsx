import { styled, Loading, Logo } from '@cere-wallet/ui';
import { useCallback, useEffect, useState } from 'react';
import { usePopupStore } from '~/hooks';
import { RedirectPopupStore } from '~/stores';

const Frame = styled('iframe')({
  border: 'none',
  width: '100%',
  height: '100%',
});

const Container = styled('div')(({ theme: { whiteLabel } }) => ({
  width: '100%',
  height: '100vh',
  backgroundSize: 'cover',
  backgroundImage: whiteLabel?.backgroundImage ? `url(${whiteLabel.backgroundImage})` : 'none',
  backgroundRepeat: 'no-repeat',
  overflow: 'hidden',
  padding: whiteLabel?.backgroundImage ? '0 20px' : '0',
}));

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

      <Container>
        {url && (
          <Frame
            title="Embedded browser"
            style={{ opacity: loaded ? 1 : 0 }}
            onLoad={hideLoader}
            onError={hideLoader}
            src={url}
          />
        )}
      </Container>
    </>
  );
};
