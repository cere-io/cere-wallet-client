import { Link as UILink, LinkProps as UILinkProps } from '@cere-wallet/ui';
import { Link as RouterLink, LinkProps as RouterLinkProps, useSearchParams } from 'react-router-dom';

export type LinkProps = UILinkProps & RouterLinkProps;

export const LinkBehavior = ({ to, ...props }: RouterLinkProps) => {
  const [params] = useSearchParams();

  return <RouterLink {...props} to={`${to}?${params}`} />;
};

export const Link = (props: LinkProps) => <UILink {...props} component={LinkBehavior} />;
