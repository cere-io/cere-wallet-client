import { TextField, TextFieldProps, Button, styled } from '@mui/material';
import { forwardRef, Ref, useImperativeHandle, useRef } from 'react';

const MaxButton = styled(Button)(({ theme }) => ({
  position: 'absolute',
  // width: 62,
  top: 8,
  right: 8,
  borderRadius: 12,
}));

export type AmountInputProps = Omit<TextFieldProps, 'type'> & {
  maxValue?: number | string;
};

export const AmountInput = forwardRef<null, AmountInputProps>(
  ({ maxValue, children, ...props }, ref: Ref<HTMLInputElement | null>) => {
    const innerRef = useRef<HTMLInputElement | null>(null);

    useImperativeHandle(ref, () => innerRef.current);

    const onMaxHandler = () => {
      const el = innerRef?.current?.getElementsByTagName('input')[0];
      if (el && maxValue) {
        el.value = String(maxValue);
      }
    };

    return (
      <>
        <TextField ref={innerRef} {...props}>
          {children}
        </TextField>
        <MaxButton variant="contained" disabled={!maxValue} onClick={() => onMaxHandler()}>
          Max
        </MaxButton>
      </>
    );
  },
);
