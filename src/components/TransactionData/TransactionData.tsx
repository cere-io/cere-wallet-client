import {
  styled,
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  ToggleButtonGroupProps,
  Divider,
} from '@cere-wallet/ui';
import { useCallback, useMemo, useState } from 'react';

export type TransactionDataProps = {
  hex?: string;
  data?: object;
};

const DenseData = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: theme.typography.pxToRem(12),
  wordBreak: 'break-all',
  maxHeight: 260,
  overflow: 'auto',
}));

const Data = styled(DenseData)(({ theme }) => ({
  margin: theme.spacing(2, 0),
  padding: theme.spacing(2, 1),
}));

export const TransactionData = ({ hex, data }: TransactionDataProps) => {
  const [type, setType] = useState<'hex' | 'json'>();
  const json = useMemo(() => JSON.stringify(data, null, 2), [data]);
  const currentType = !type && json ? 'json' : type;
  const handleChange: NonNullable<ToggleButtonGroupProps['onChange']> = useCallback(
    (event, value) => setType(value),
    [],
  );

  if (!json && hex) {
    return <DenseData>{hex}</DenseData>;
  }

  return (
    <Box>
      {json && hex && (
        <ToggleButtonGroup exclusive fullWidth size="small" value={currentType} onChange={handleChange}>
          <ToggleButton value="json">Json</ToggleButton>
          <ToggleButton value="hex">Hex Data</ToggleButton>
        </ToggleButtonGroup>
      )}

      <Data whiteSpace={currentType === 'json' ? 'pre' : 'normal'}>{currentType === 'json' ? json : hex}</Data>
      <Divider />
    </Box>
  );
};
