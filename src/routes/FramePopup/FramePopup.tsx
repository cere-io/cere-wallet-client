import { styled } from '@cere-wallet/ui';
import { useRouteElementContext } from '../RouteElement';

const Frame = styled('iframe')({
  width: '100%',
  height: '100vh',
  maxHeight: '99%',
  border: 'none',
});

export const FramePopup = () => {
  const { preopenInstanceId } = useRouteElementContext();

  return <Frame title="Redirect" src={`/redirect?preopenInstanceId=${preopenInstanceId}`} />;
};
