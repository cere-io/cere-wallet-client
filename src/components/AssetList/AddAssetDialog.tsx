import { FC, useState } from 'react';
import { Box, Dialog, DialogContent, useIsMobile, styled } from '@cere-wallet/ui';
import { AddPopularAsset } from './AddPopularAsset';
import { AddCustomAsset } from './AddCustomAsset';

interface AddAssetDialogProps {
  open: boolean;
  onClose: () => void;
}

const StyledDialog = styled(Dialog)(() => ({
  '& .MuiBox-root .MuiDialogContent-root': {
    paddingTop: 24,
  },
}));

const Container = styled(Box)(() => ({
  width: 416,
  marginLeft: 'auto',
  marginRight: 'auto',
}));

export const AddAssetDialog: FC<AddAssetDialogProps> = ({ open, onClose }) => {
  const isMobile = useIsMobile();
  const [step, setStep] = useState(0);

  return (
    <StyledDialog fullScreen={isMobile} open={open} onClose={onClose}>
      <DialogContent>
        <Container>
          {step === 0 && <AddPopularAsset changeStep={() => setStep(1)} />}
          {step === 1 && <AddCustomAsset changeStep={() => setStep(0)} onClose={onClose} />}
        </Container>
      </DialogContent>
    </StyledDialog>
  );
};
