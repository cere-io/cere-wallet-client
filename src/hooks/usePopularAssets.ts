import { useCallback, useEffect, useState } from 'react';
import { Asset, NETWORKS_LIST } from '~/stores';
import tokensList from '~/assets/token_data.json';

const [, POLYGON] = NETWORKS_LIST;

export function usePopularAssets() {
  const [data, setData] = useState<Asset[]>([]);

  const fetchSearch = useCallback(async () => {
    const items: Asset[] = tokensList.reduce((acc: Asset[], item: Record<string, any>) => {
      acc.push({
        id: item.id,
        ticker: item.symbol,
        address: item.contract_address,
        displayName: item.symbol?.toLocaleUpperCase(),
        network: POLYGON.value,
        type: 'ERC20',
        thumb: item.image,
        decimals: item.decimals,
        balance: 0,
      });
      return acc;
    }, []);

    setData(items);
  }, []);

  useEffect(() => {
    fetchSearch();
  }, [fetchSearch]);

  return {
    data,
  };
}
