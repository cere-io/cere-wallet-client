import { Ref, forwardRef } from 'react';
import useCopyClipboard from 'react-use-clipboard';
import { Tooltip } from '@mui/material';
import { useIsMobile } from '../../hooks';
import { CheckIcon, ContentCopyIcon } from '../../icons';
import { IconButton, IconButtonProps } from '../IconButton';
import { CopyNotification } from './CopyNotification';

export type CopyButtonProps = Omit<IconButtonProps, 'children'> & {
  value: string;
  title?: string;
  successDuration?: number;
  successMessage?: string;
};

export const CopyButton = forwardRef(
  (
    {
      value,
      title = 'Copy to clipboard',
      successMessage = 'Copied!',
      successDuration = 2000,
      ...props
    }: CopyButtonProps,
    ref: Ref<HTMLButtonElement>,
  ) => {
    const isMobile = useIsMobile();
    const [isCopied, copy] = useCopyClipboard(value, { successDuration });

    return (
      <>
        <Tooltip title={isCopied ? successMessage : title}>
          <IconButton ref={ref} {...props} onClick={copy}>
            {isCopied ? <CheckIcon fontSize="small" color="success" /> : <ContentCopyIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
        {isMobile && <CopyNotification open={isCopied} message={successMessage} />}
      </>
    );
  },
);
