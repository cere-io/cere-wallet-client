import { TourProvider, ProviderProps } from '@reactour/tour';
import { Button, CloseIcon, IconButton, Stack, styled, Typography, Divider } from '@cere-wallet/ui';
import { ReactElement } from 'react';

const CloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  right: theme.typography.pxToRem(12),
  top: theme.typography.pxToRem(12),
  '&:hover': {
    '& svg': {
      fill: theme.palette.primary.main,
    },
  },
}));

export const CereTourProvider = ({ children }: ProviderProps): ReactElement<ProviderProps> => {
  return (
    <TourProvider
      onClickMask={() => {}}
      styles={{
        popover: (base) => ({
          ...base,
          borderRadius: 16,
          padding: 16,
        }),
        svgWrapper: (props) => ({
          ...props,
        }),
        maskArea: (props) => ({
          ...props,
          rx: 16,
        }),
        maskRect: (props) => ({
          ...props,
        }),
      }}
      steps={[]}
      showBadge={false}
      disableInteraction={true}
      components={{
        Close: ({ onClick }) => {
          return (
            <CloseButton variant="filled" size="small" onClick={() => onClick?.()}>
              <CloseIcon />
            </CloseButton>
          );
        },
        Navigation: ({ currentStep, steps, setCurrentStep, setIsOpen, nextButton }) => {
          return (
            <Stack spacing={2} marginTop={3}>
              <Divider />
              <Stack spacing={1} direction="row" alignItems="center" justifyContent="space-between" minWidth={300}>
                <Typography variant="body2" color="text.secondary">
                  {currentStep + 1} of {steps.length}
                </Typography>
                <Stack direction="row" alignItems="center" justifyContent="center">
                  {currentStep > 0 && (
                    <Button variant="text" size="large" onClick={() => setCurrentStep(currentStep - 1)}>
                      Back
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => {
                      if (currentStep + 1 === steps.length) {
                        setIsOpen(false);
                      } else {
                        setCurrentStep(currentStep + 1);
                      }
                    }}
                  >
                    Next
                  </Button>
                </Stack>
              </Stack>
            </Stack>
          );
        },
      }}
    >
      {children}
    </TourProvider>
  );
};
