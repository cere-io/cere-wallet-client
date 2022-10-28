import { useCallback, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useLocation, useNavigate } from 'react-router-dom';
import { Stack, ToggleButton, ToggleButtonGroup, useIsMobile } from '@cere-wallet/ui';

import { AccountBalanceWidget, ActivityList, AssetList, OnboardingDialog } from '~/components';
import {
  WalletIntroduceFinishDialog,
  WalletIntroduceStartDialog,
  introductionTourSteps,
} from '~/components/ProductTours';
import { useTour } from '@reactour/tour';

const WalletHome = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const { setIsOpen, setSteps, isOpen, currentStep, setCurrentStep } = useTour();

  const [currentTab, setCurrentTab] = useState<'assets' | 'activity'>('assets');
  const showOnboarding = location.hash.slice(1) === 'onboarding';
  const showProductTour = location.hash.slice(1) === 'product-tour';

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
    navigate({ ...location, hash: '' });
  }, []);

  const handleCloseIntroduceFinishDialog = useCallback(() => {
    setIntroduceFinishDialog(false);
    navigate({ ...location, hash: '' });
  }, [setIntroduceFinishDialog, location, navigate]);

  useEffect(() => {
    if (showProductTour && !isOpen) {
      if (currentStep + 1 === introductionTourSteps.length) {
        setIntroduceFinishDialog(true);
      } else if (!introduceFinishDialog && currentStep === 0) {
        setIntroduceStartDialog(true);
      }
    }
  }, [isOpen, currentStep, showProductTour, introduceFinishDialog]);

  return (
    <Stack spacing={4}>
      <AccountBalanceWidget title="Account overview" dense={isMobile} />

      <Stack spacing={3}>
        <ToggleButtonGroup
          className="wallet-assets"
          exclusive
          fullWidth
          color="primary"
          size={isMobile ? 'small' : 'medium'}
          value={currentTab}
          onChange={(event, value) => value && setCurrentTab(value)}
          sx={{
            maxWidth: 430,
            alignSelf: 'center',
          }}
        >
          <ToggleButton value="assets">Assets</ToggleButton>
          <ToggleButton value="activity">Activity</ToggleButton>
        </ToggleButtonGroup>

        {currentTab === 'assets' ? <AssetList dense={isMobile} /> : <ActivityList dense={isMobile} />}
      </Stack>

      <OnboardingDialog open={showOnboarding} onClose={() => navigate({ ...location, hash: '' })} />
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
    </Stack>
  );
};

export default observer(WalletHome);
