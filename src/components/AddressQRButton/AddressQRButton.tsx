import { IconButton, QrCodeScannerIcon } from '@cere-wallet/ui';
import { useCallback, useState } from 'react';
import { AddressQRDialog } from '../AddressQRDialog';

export type AddressQRButtonProps = {
  address: string;
};

export const AddressQRButton = ({ address }: AddressQRButtonProps) => {
  const [open, setOpen] = useState(false);

  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);

  return (
    <>
      <IconButton onClick={handleOpen}>
        <QrCodeScannerIcon />
      </IconButton>
      <AddressQRDialog address={address} open={open} onClose={handleClose} />
    </>
  );
};
