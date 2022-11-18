import { useRef } from 'react';
import { Popover, PopoverProps } from '@mui/material';
import { DropdownAnchor, DropdownAnchorProps } from './DropdownAnchor';

export type DropdownProps = Pick<PopoverProps, 'open' | 'children'> &
  Omit<DropdownAnchorProps, 'open'> & {
    direction?: 'right' | 'left';
    onToggle?: (open: boolean) => void;
  };

export const Dropdown = ({ open, label, leftElement, direction = 'left', children, onToggle }: DropdownProps) => {
  const anchorRef = useRef(null);
  const horizontal = direction === 'left' ? 'right' : 'left';

  return (
    <>
      <DropdownAnchor
        ref={anchorRef}
        open={open}
        label={label}
        leftElement={leftElement}
        onOpen={() => onToggle?.(true)}
      />
      <Popover
        open={open}
        onClose={() => onToggle?.(false)}
        anchorEl={anchorRef.current}
        anchorOrigin={{
          horizontal,
          vertical: 'bottom',
        }}
        transformOrigin={{
          horizontal,
          vertical: -8,
        }}
        PaperProps={{
          elevation: 0,
          sx: {
            padding: 2,
            borderRadius: 3,
            border: '1px solid #E7E8EB', // TODO: Use borders from theme
            boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.1);', // TODO: Use theme shadow
          },
        }}
      >
        {children}
      </Popover>
    </>
  );
};
