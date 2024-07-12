import { OTPInput, SlotProps } from 'input-otp';
import { styled, Typography, Stack, Box } from '@cere-wallet/ui';
import { forwardRef } from 'react';

interface OtpProps {
  errorMessage?: string;
  onChange?: (code: string) => void;
}

type SlotInputProps = {
  active?: boolean;
  error?: boolean;
};

const SlotInput = styled(Typography, {
  shouldForwardProp: (prop) => !['active', 'error'].includes(prop as string),
})<SlotInputProps>(({ theme, active, error }) => ({
  width: 44,
  height: 54,
  lineHeight: '52px',
  borderRadius: 16,
  borderWidth: 1,
  borderStyle: 'solid',
  textAlign: 'center',
  padding: '1px',
  borderColor: error ? theme.palette.error.main : theme.palette.divider,
  backgroundColor: theme.isGame ? 'transparent' : theme.palette.background.default,
  color: theme.isGame ? theme.palette.primary.light : theme.palette.text.primary,

  ...(active && {
    padding: 0,
    borderWidth: 2,
    borderColor: theme.isGame ? theme.palette.primary.light : theme.palette.primary.main,
  }),
}));

const Slot = ({ char, isActive, error }: SlotProps & SlotInputProps) => (
  <SlotInput as="div" active={isActive} error={error}>
    {char}
  </SlotInput>
);

export const OtpInput = forwardRef<null, OtpProps>(({ onChange, errorMessage }, ref) => {
  const hasError = !!errorMessage;

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <OTPInput
        ref={ref}
        autoFocus
        maxLength={6}
        onChange={onChange}
        aria-label="OTP input"
        render={({ slots }) => (
          <Stack direction="row" spacing={3}>
            <Stack direction="row" spacing={1}>
              {slots.slice(0, 3).map((slot, index) => (
                <Slot key={index} error={hasError} {...slot} />
              ))}
            </Stack>

            <Stack direction="row" spacing={1}>
              {slots.slice(3).map((slot, index) => (
                <Slot key={index} error={hasError} {...slot} />
              ))}
            </Stack>
          </Stack>
        )}
      />

      {hasError && (
        <Typography marginTop={1} variant="body2" color="error.main">
          {errorMessage}
        </Typography>
      )}
    </Box>
  );
});
