import { ReactElement, useState } from 'react';
import {
  ComingSoonIcon,
  ManageYourFundsIcon,
  MobileStepper,
  PlayArrowIcon,
  Stack,
  StoreYourTokensIcon,
  Typography,
  styled,
} from '@cere-wallet/ui';
import { InfoStepperItem } from './';

const ImagePage1 = styled(ComingSoonIcon)(({ theme }) => ({
  fontSize: theme.typography.pxToRem(240),
}));

const ImagePage2 = styled(StoreYourTokensIcon)(({ theme }) => ({
  fontSize: theme.typography.pxToRem(240),
}));

const ImagePage3 = styled(ManageYourFundsIcon)(({ theme }) => ({
  fontSize: theme.typography.pxToRem(240),
}));

export const InfoStepper = () => {
  const [activeStep, setActiveStep] = useState<number>(0);

  const STEPPER_PAGES: ReactElement[] = [
    InfoStepperItem(
      <ImagePage1 />,
      'Direct access to your collectibles',
      'All your items seamlessly available in one place',
    ),
    InfoStepperItem(<ImagePage2 />, 'Securely store your tokens', 'You are in control of your keys and assets'),
    InfoStepperItem(
      <ImagePage3 />,
      'Manage funds to buy and sell',
      'Send and receive any currency or simply top up with your card',
    ),
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => (prevActiveStep < STEPPER_PAGES.length - 1 ? prevActiveStep + 1 : 0));
  };

  return (
    <Stack direction="column" justifyContent="stretch">
      {STEPPER_PAGES[activeStep]}
      <MobileStepper
        variant="dots"
        steps={STEPPER_PAGES.length}
        position="static"
        activeStep={activeStep}
        nextButton={
          // TODO added style here because we don't hav a button for it in UI KIT
          <Stack direction="row">
            <Typography variant="subtitle1" onClick={handleNext} style={{ cursor: 'pointer', paddingLeft: '0 auto' }}>
              Next
            </Typography>
            <PlayArrowIcon onClick={handleNext} />
          </Stack>
        }
        backButton={<></>}
      />
    </Stack>
  );
};
