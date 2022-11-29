import { useCallback, useRef } from 'react';
import {
  Address,
  Button,
  CopyButton,
  Dialog,
  DialogContent,
  DialogProps,
  QRCode,
  Stack,
  Typography,
} from '@cere-wallet/ui';
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
        <Stack alignItems="center" marginBottom={3}>
          <Typography variant="h3">Your public address</Typography>

          <Stack spacing={2} alignItems="center" marginTop={3} marginBottom={6}>
            <QRCode ref={qrRef} value={address} />
            <Button variant="outlined" onClick={handleDownload}>
              Download QR
            </Button>
          </Stack>

          <Address
            address={address}
            variant="filled"
            maxLength={30}
            endAdornment={<CopyButton size="small" value={address} successMessage="Address copied" />}
          />
        </Stack>
      </DialogContent>
    </Dialog>
  );
};
