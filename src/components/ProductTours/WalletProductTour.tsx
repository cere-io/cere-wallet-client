import { useCallback, useEffect, useState } from 'react';
import { introductionTourSteps } from './IntroductionTourSteps';
import { WalletIntroduceStartDialog } from './WalletIntroduceStartDialog';
import { WalletIntroduceFinishDialog } from './WalletIntroduceFinishDialog';
import { useTour } from '@reactour/tour';

type WalletProductTourProps = {
  onClose: () => void;
};

export const WalletProductTour = ({ onClose }: WalletProductTourProps) => {
  const { setIsOpen, setSteps, isOpen, currentStep, setCurrentStep } = useTour();
  const [introduceStartDialog, setIntroduceStartDialog] = useState(false);
  const [introduceFinishDialog, setIntroduceFinishDialog] = useState(false);

  const handleOpenIntroduceStartDialog = useCallback(() => {
    setIntroduceStartDialog(false);
    setSteps(introductionTourSteps);
    setIsOpen(true);
  }, [setIsOpen, setSteps, setIntroduceStartDialog]);

  const handleBackToTour = useCallback(() => {
    setCurrentStep(introductionTourSteps.length - 1);
    setIsOpen(true);
    setIntroduceFinishDialog(false);
  }, [setIsOpen, setCurrentStep]);

  const handleCloseIntroduceStartDialog = useCallback(() => {
    setIntroduceStartDialog(false);
    localStorage.setItem('showProductTour', 'false');
    onClose?.();
  }, [setIntroduceStartDialog, onClose]);

  const handleCloseIntroduceFinishDialog = useCallback(() => {
    setIntroduceFinishDialog(false);
    localStorage.setItem('showProductTour', 'false');
    onClose?.();
  }, [setIntroduceFinishDialog, onClose]);

  useEffect(() => {
    if (!isOpen) {
      if (currentStep + 1 === introductionTourSteps.length) {
        setIntroduceFinishDialog(true);
      } else if (!introduceFinishDialog && currentStep === 0) {
        setIntroduceStartDialog(true);
      }
    }
  }, [isOpen, currentStep, introduceFinishDialog]);

  return (
    <>
      <WalletIntroduceStartDialog
        open={introduceStartDialog}
        onStartTour={handleOpenIntroduceStartDialog}
        onClose={handleCloseIntroduceStartDialog}
      />
      <WalletIntroduceFinishDialog
        open={introduceFinishDialog}
        onBackClick={handleBackToTour}
        onDoneClick={handleCloseIntroduceFinishDialog}
        onClose={handleCloseIntroduceFinishDialog}
      />
    </>
  );
};
