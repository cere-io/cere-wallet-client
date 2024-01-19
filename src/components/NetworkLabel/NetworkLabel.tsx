import { styled, Stack, Typography } from '@cere-wallet/ui';

import { CoinIcon } from '~/components';

export type NetworkLabelProps = {
  label: string;
  icon?: string;
};

const Container = styled(Stack)({
  width: '240px',
  borderRadius: '30px',
  backgroundColor: '#E7E8EB',
  padding: '6px 8px',
  justifyContent: 'center',
  alignItems: 'center',
});

const Label = styled(Typography)({
  fontSize: '12px',
  fontWeight: '600',
  color: '#717684',
});

export const NetworkLabel = ({ label, icon = 'matic' }: NetworkLabelProps) => {
  return (
    <Container spacing={1} direction="row">
      <CoinIcon coin={icon} fontSize="small" />
      <Label>{label}</Label>
    </Container>
  );
};
