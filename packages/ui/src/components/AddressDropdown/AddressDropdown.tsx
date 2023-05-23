import { ListItemButton, ListItemIcon, ListItemText, MenuList, styled, svgIconClasses } from '@mui/material';
import { ReactElement, useMemo, useState } from 'react';
import { ArrowDropDownIcon, ArrowDropUpIcon, CheckCircleIcon } from '../../icons';
import { Address, AddressProps } from '../Address';
import { Dropdown, DropdownProps } from '../Dropdown';

export type AddressDropdownOption = {
  label: string;
  address: string;
  icon: ReactElement;
};

export type AddressDropdownProps = Omit<DropdownProps, 'open' | 'renderAnchor'> &
  AddressProps & {
    options: AddressDropdownOption[];
    onChange: (option: AddressDropdownOption) => void;
  };

const Icon = styled(ListItemIcon)(({ theme }) => ({
  minWidth: theme.spacing(4),

  [`.${svgIconClasses.root}`]: {
    fontSize: theme.typography.pxToRem(20),
  },
}));

const Check = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  width: theme.spacing(4),
}));

export const AddressDropdown = ({
  options,
  address: value,
  size,
  maxLength,
  icon,
  variant,
  onChange,
  ...props
}: AddressDropdownProps) => {
  const [open, setOpen] = useState(false);
  const selectedOption = useMemo(() => options.find((option) => option.address === value), [value, options]);

  return (
    <Dropdown
      {...props}
      dense
      disableGutters
      open={open}
      onToggle={setOpen}
      renderAnchor={({ ref, onOpen }) => (
        <Address
          ref={ref}
          aria-label="Switch address"
          aria-expanded={open}
          onClick={onOpen}
          address={value}
          variant={variant}
          size={size}
          maxLength={maxLength}
          icon={icon ?? selectedOption?.icon}
          endAdornment={open ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
        />
      )}
    >
      <MenuList aria-label="Address dropdown" disablePadding dense>
        {options.map((option) => (
          <ListItemButton
            key={option.address}
            aria-label={option.label}
            onClick={() => {
              if (option.address !== value) {
                onChange?.(option);
              }
            }}
          >
            <Icon>{option.icon}</Icon>
            <ListItemText
              primary={option.label}
              primaryTypographyProps={{ 'aria-hidden': true }}
              secondary={<Address address={option.address} variant="text" maxLength={22} />}
            />

            <Check>{option.address === value && <CheckCircleIcon fontSize="small" color="primary" />}</Check>
          </ListItemButton>
        ))}
      </MenuList>
    </Dropdown>
  );
};
