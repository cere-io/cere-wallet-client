import { styled, Stack, Typography, MaticIcon } from '@cere-wallet/ui';

export type NetworkLabelProps = {
  label: string;
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

const Icon = styled(MaticIcon)({
  // TODO: Properly detect network icon
  color: '#8247E5',
});

export const NetworkLabel = ({ label }: NetworkLabelProps) => {
  return (
    <Container spacing={1} direction="row">
      <Icon fontSize="small" />
      <Label>{label}</Label>
    </Container>
  );
};
