import { styled, Box, ToggleButtonGroup, ToggleButton, ToggleButtonGroupProps } from '@cere-wallet/ui';
import { useCallback, useState } from 'react';

export type RawDataProps = {
  hex?: string;
  json?: string;
};

const Data = styled(Box)({
  fontSize: '12px',
  color: '#717684',
  wordBreak: 'break-all',
});

export const RawData = ({ hex, json }: RawDataProps) => {
  const [type, setType] = useState<'hex' | 'json'>('json');
  const handleChange: NonNullable<ToggleButtonGroupProps['onChange']> = useCallback(
    (event, value) => setType(value),
    [],
  );

  if (!hex || !json) {
    return <Data>{json || hex}</Data>;
  }

  return (
    <Box>
      <ToggleButtonGroup exclusive fullWidth size="small" value={type} onChange={handleChange}>
        <ToggleButton value="json">Json</ToggleButton>
        <ToggleButton value="hex">Hex Data</ToggleButton>
      </ToggleButtonGroup>

      <Data paddingY={4} marginX={1}>
        {type === 'json' ? json : hex}
      </Data>
    </Box>
  );
};
