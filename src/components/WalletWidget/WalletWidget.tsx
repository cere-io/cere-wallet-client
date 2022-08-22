import { Box } from '@cere-wallet/ui';

export type WalletWidgetProps = {};

const WalletWidget = (props: WalletWidgetProps) => {
  return (
    <Box
      sx={{
        width: 60,
        height: 60,
        borderRadius: '50%',
        backgroundColor: 'blueviolet',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
      }}
    >
      Cere
    </Box>
  );
};

export default WalletWidget;
