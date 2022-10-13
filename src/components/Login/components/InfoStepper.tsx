import {
  Stack,
  MobileStepper,
  Typography,
  styled,
  ComingSoonIcon,
  StoreYourTokensIcon,
  ManageYourFundsIcon,
} from '@cere-wallet/ui';
import { ReactElement, useState } from 'react';
import { InfoStepperPage } from './';

const Container = styled(Stack)({
  display: 'flex',
  width: '350px',
});

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
    InfoStepperPage(
      <ImagePage1 />,
      'Direct access to your collectibles',
      'All your items seamlessly available in one place',
    ),
    InfoStepperPage(<ImagePage2 />, 'Securely store your tokens', 'You are in control of your keys and assets'),
    InfoStepperPage(
      <ImagePage3 />,
      'Manage funds to buy and sell',
      'Send and receive any currency or simply top up with your card',
    ),
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => (prevActiveStep < STEPPER_PAGES.length - 1 ? prevActiveStep + 1 : 0));
  };

  return (
    <Container>
      {STEPPER_PAGES[activeStep]}
      <MobileStepper
        style={{ flex: 1 }}
        variant="dots"
        steps={STEPPER_PAGES.length}
        position="static"
        activeStep={activeStep}
        nextButton={
          // TODO added style here because we don't hav a button for it in UI KIT
          <Typography variant="subtitle1" onClick={handleNext} style={{ cursor: 'pointer', paddingLeft: '0 auto' }}>
            Next
          </Typography>
        }
        backButton={<></>}
      />
    </Container>
  );
};
