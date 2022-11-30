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
  marginLeft: theme.spacing(2),
}));

export const AddressDropdown = ({
  options,
  address: value,
  size,
  maxLength,
  icon,
  variant,
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
      <MenuList disablePadding dense>
        {options.map(({ label, address, icon }) => (
          <ListItemButton>
            <Icon>{icon}</Icon>
            <ListItemText primary={label} secondary={<Address address={address} variant="text" maxLength={24} />} />

            {address === value && (
              <Check>
                <CheckCircleIcon fontSize="small" color="primary" />
              </Check>
            )}
          </ListItemButton>
        ))}
      </MenuList>
    </Dropdown>
  );
};
