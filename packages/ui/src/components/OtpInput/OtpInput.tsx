import ReactCodeInput from 'react-code-input';
import { useState } from 'react';
import { styled } from '@cere-wallet/ui';

const DIGITS_NUMBER = 6;

interface OtpProps {
  onChange?: (code: string) => void;
}

const CodeInput = styled(ReactCodeInput)({
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

    '& :first-of-type': {
      marginLeft: '0 auto !important',
    },
    '& :last-of-type': {
      marginRight: '0 auto !important',
    },
    '& :focus': {
      border: `2px solid red !important`,
    },

    '@media (min-width: 376px)': {
      '&:nth-of-type(3)': {
        marginRight: '26px !important',
      },
    },
  },
});

export const OtpInput = ({ onChange }: OtpProps) => {
  const [error, setError] = useState<string>();

  const handleCodeChange = (value: string) => {
    console.log('handleCodeChange', value);
    if (!value) {
      setError('');
    }
    if (onChange && typeof onChange === 'function') {
      onChange(value);
    }
  };

  return (
    <CodeInput
      name="OTP"
      type={'text'}
      inputMode="url"
      fields={DIGITS_NUMBER}
      onChange={handleCodeChange}
      isValid={!error}
    />
  );
};
