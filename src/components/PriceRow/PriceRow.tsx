import { InfoTableRow } from '@cere-wallet/ui';
import { PriceData } from '~/stores';

export type PriceRowProps = {
  label: string;
  price: PriceData;
};

export const PriceRow = ({ label, price: { equalsTo, amount, symbol } }: PriceRowProps) => (
  <InfoTableRow
    label={label}
    value={`${amount} ${symbol}`}
    caption={equalsTo && `(~${equalsTo.amount} ${equalsTo?.symbol})`}
  />
);
