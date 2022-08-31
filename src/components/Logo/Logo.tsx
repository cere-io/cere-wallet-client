import { CereIcon, Stack, styled, Typography } from '@cere-wallet/ui';

export type LogoProps = {
  label?: string;
};

const LogoIcon = styled(CereIcon)({
  fontSize: '28px',
});

export const Logo = ({ label }: LogoProps) => {
  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <LogoIcon />
      {label && (
        <Typography noWrap fontWeight="bold">
          {label}
        </Typography>
      )}
    </Stack>
  );
};
