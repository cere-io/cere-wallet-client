import { ReactElement, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BackIcon, IconButton, Stack, Typography, useIsMobile } from '@cere-wallet/ui';

export type PageHeaderProps = {
  title: string;
  backUrl?: string;
  rightElement?: ReactElement;
};

export const PageHeader = ({ title, rightElement, backUrl }: PageHeaderProps) => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();

  const handleBack = useCallback(
    () => backUrl && navigate({ ...location, pathname: backUrl }, { replace: true }),
    [backUrl, location, navigate],
  );

  return isMobile && !backUrl ? null : (
    <Stack direction="row" alignItems="center" marginBottom={2} spacing={1} height={40}>
      {backUrl && (
        <IconButton onClick={handleBack} color="inherit">
          <BackIcon />
        </IconButton>
      )}

      <Typography variant="h3" flex={1} noWrap={true}>
        {title}
      </Typography>

      {rightElement}
    </Stack>
  );
};
