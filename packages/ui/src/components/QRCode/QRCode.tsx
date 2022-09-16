import { forwardRef, Ref } from 'react';
import { styled } from '@mui/material';
import QR, { QRCodeProps as QRProps } from 'react-qr-code';

export type QRCodeProps = Omit<QRProps, 'ref'>;

const Wrapper = styled('div')(({ theme }) => ({
  display: 'inline-block',
  padding: theme.spacing(3),
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: theme.palette.divider,
  borderRadius: 16,
}));

export const QRCode = forwardRef(({ size = 168, ...props }: QRCodeProps, ref: Ref<SVGElement>) => (
  <Wrapper>
    <QR ref={ref as Ref<any>} size={size} {...props} />
  </Wrapper>
));
