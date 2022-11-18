import { Ref, forwardRef } from 'react';
import { Link as RouterLink, LinkProps as RouterLinkProps, useSearchParams } from 'react-router-dom';
import { Link as UILink, LinkProps as UILinkProps } from '@cere-wallet/ui';

export type LinkProps = UILinkProps & RouterLinkProps;

export const LinkBehavior = forwardRef(({ to, ...props }: RouterLinkProps, ref: Ref<HTMLAnchorElement>) => {
  const [params] = useSearchParams();

  return <RouterLink ref={ref} {...props} to={`${to}?${params}`} />;
});

export const Link = forwardRef((props: LinkProps, ref: Ref<HTMLAnchorElement>) => (
  <UILink ref={ref} {...props} component={LinkBehavior} />
));
