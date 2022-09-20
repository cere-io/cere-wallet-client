import { forwardRef, Ref } from 'react';
import { Tooltip } from '@mui/material';
import useCopyClipboard from 'react-use-clipboard';

import { ContentCopyIcon, CheckIcon } from '../../icons';
import { IconButton, IconButtonProps } from '../IconButton';

export type CopyButtonProps = Omit<IconButtonProps, 'children'> & {
  value: string;
  successDuration?: number;
};

export const CopyButton = forwardRef(
  ({ value, successDuration = 3000, ...props }: CopyButtonProps, ref: Ref<HTMLButtonElement>) => {
    const [isCopied, copy] = useCopyClipboard(value, { successDuration });

    return (
      <Tooltip title={isCopied ? 'Copied!' : 'Copy to clipboard'}>
        <IconButton ref={ref} {...props} onClick={copy}>
          {isCopied ? <CheckIcon fontSize="small" color="success" /> : <ContentCopyIcon fontSize="small" />}
        </IconButton>
      </Tooltip>
    );
  },
);
