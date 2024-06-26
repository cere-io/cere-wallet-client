import ReactCodeInput from '@cere/react-code-input';
import { styled } from '@cere-wallet/ui';
import { Typography, Stack } from '@mui/material';
import { forwardRef } from 'react';

const DIGITS_NUMBER = 6;

interface OtpProps {
  errorMessage?: string;
  onChange?: (code: string) => void;
}

const CodeInput = styled(ReactCodeInput)(({ theme }) => ({
  textAlign: 'center',
  input: {
    height: '56px',
    width: '44px',
    borderRadius: '16px',
    border: `1px solid #E7E8EB`,
    fontSize: '16px',
    // @ts-ignore
    textAlign: '-webkit-center',
    outline: 'none',
    margin: '0 2px',
    padding: '0',
    backgroundColor: theme.isGame ? 'transparent' : '#fff',
    color: theme.isGame ? theme.palette.primary.light : theme.palette.text.primary,
    '& :first-of-type': {
      marginLeft: '0 auto !important',
    },
    '& :last-of-type': {
      marginRight: '0 auto !important',
    },
    '&:focus': {
      border: `2px solid ${theme.isGame ? theme.palette.primary.light : theme.palette.primary.main} !important`,
    },

    '@media (min-width: 376px)': {
      '&:nth-of-type(3)': {
        marginRight: '26px !important',
      },
    },
  },
}));

export const OtpInput = forwardRef<null, OtpProps>(({ onChange, errorMessage }, ref) => {
  const handleCodeChange = (value: string) => {
    if (typeof onChange === 'function') {
      onChange(value.toLowerCase());
    }
  };

  return (
    <Stack direction="column" textAlign="center" spacing={1}>
      <CodeInput
        ref={ref}
        name="OTP"
        type={'text'}
        inputMode="url"
        fields={DIGITS_NUMBER}
        onChange={handleCodeChange}
        inputStyleInvalid={{ border: '1px solid red' }}
        isValid={!errorMessage}
      />
      <Typography variant="body2" color="error.main">
        {errorMessage}
      </Typography>
    </Stack>
  );
});
