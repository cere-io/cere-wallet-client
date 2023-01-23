import { MenuItem, styled, TextField, TextFieldProps } from '@cere-wallet/ui';
import { observer } from 'mobx-react-lite';
import { forwardRef } from 'react';

import { Asset } from '~/stores';
import { AssetListItem } from '../AssetList';

export type AssetSelectProps = TextFieldProps & {
  assets: Asset[];
};

const StyledSelect = styled(TextField)({
  '& .MuiSelect-select': {
    padding: 0,
  },

  '& .MuiInputBase-input': {
    minHeight: 66,
  },
});

const AssetSelect = forwardRef(({ assets, ...props }: AssetSelectProps, ref) => (
  <StyledSelect {...props} inputRef={ref} select>
    {assets.map((asset) => (
      <MenuItem disableGutters key={asset.ticker} value={asset.ticker} sx={{ borderRadius: 0, height: 57 }}>
        <AssetListItem dense disableInset iconSize="inherit" asset={asset} />
      </MenuItem>
    ))}
  </StyledSelect>
));

export default observer(AssetSelect);
