import { useParams } from 'react-router-dom';
import { SocialAuth, SocialAuthProps } from '~/components';

export const SocialAuthRoute = () => {
  let { type } = useParams<{ type: SocialAuthProps['type'] }>();

  return type ? <SocialAuth type={type} /> : null;
};
