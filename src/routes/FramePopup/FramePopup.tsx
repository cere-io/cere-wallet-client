import { styled } from '@cere-wallet/ui';
import { useRouteElementContext } from '../RouteElement';

const Frame = styled('iframe')({
  width: '100%',
  height: '100%',
  minHeight: '600px',
  border: 'none',
});

export const FramePopup = () => {
  const { preopenInstanceId } = useRouteElementContext();

  return <Frame title="Redirect" src={`/redirect?preopenInstanceId=${preopenInstanceId}`} />;
};
