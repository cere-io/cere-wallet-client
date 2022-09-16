import { useCallback, useRef } from 'react';
import { Address, Button, Dialog, DialogContent, DialogProps, QRCode, Stack, Typography } from '@cere-wallet/ui';
import { downloadSvg } from './downloadSvg';

export type AddressQRDialogProps = DialogProps & {
  address: string;
};

export const AddressQRDialog = ({ address, ...props }: AddressQRDialogProps) => {
  const qrRef = useRef<SVGElement>(null);
  const handleDownload = useCallback(() => qrRef.current && downloadSvg(qrRef.current, 'QRCode'), []);

  return (
    <Dialog {...props}>
      <DialogContent>
        <Stack alignItems="center" marginX={4} marginBottom={3}>
          <Typography variant="h6">Your public address</Typography>

          <Stack spacing={2} alignItems="center" marginTop={3} marginBottom={6}>
            <QRCode ref={qrRef} value={address} />
            <Button variant="outlined" onClick={handleDownload}>
              Download QR
            </Button>
          </Stack>

          <Address address={address} showCopy variant="filled" maxLength={30} />
        </Stack>
      </DialogContent>
    </Dialog>
  );
};
