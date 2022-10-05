import { IconButton, IconButtonProps, QrCodeScannerIcon } from '@cere-wallet/ui';
import { useCallback, useState } from 'react';
import { AddressQRDialog } from '../AddressQRDialog';

export type AddressQRButtonProps = IconButtonProps & {
  address: string;
};

export const AddressQRButton = ({ address, ...props }: AddressQRButtonProps) => {
  const [open, setOpen] = useState(false);

  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);

  return (
    <>
      <IconButton {...props} onClick={handleOpen}>
        <QrCodeScannerIcon fontSize="small" />
      </IconButton>
      <AddressQRDialog address={address} open={open} onClose={handleClose} />
    </>
  );
};
