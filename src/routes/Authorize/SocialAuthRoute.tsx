import { useParams } from 'react-router-dom';
import { SocialAuth, SocialAuthProps } from '~/components';

export const SocialAuthRoute = () => {
  let { type } = useParams<{ type: SocialAuthProps['type'] }>();

  return <SocialAuth type={type} />;
};
