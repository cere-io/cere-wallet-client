import { TextField, TextFieldProps, Button, InputAdornment } from '@mui/material';
import { forwardRef, useRef, Ref, useImperativeHandle, useCallback } from 'react';

export type AmountInputProps = Omit<TextFieldProps, 'type'> & {
  maxValue?: string;
};

export const AmountInput = forwardRef<null, AmountInputProps>(
  ({ maxValue, children, ...props }, ref: Ref<HTMLInputElement | null>) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    useImperativeHandle(ref, () => inputRef.current);

    const handleMaxClick = useCallback(() => {
      const input = inputRef.current;

      if (input && maxValue) {
        /**
         * Hacky fix for onChange event manual trigger
         */
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(input, maxValue);
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, [maxValue]);

    return (
      <TextField
        {...props}
        inputRef={inputRef}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Button variant="contained" disabled={!maxValue} onClick={handleMaxClick} sx={{ borderRadius: '12px' }}>
                Max
              </Button>
            </InputAdornment>
          ),
        }}
      />
    );
  },
);
