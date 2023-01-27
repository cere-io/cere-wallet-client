import { useCallback, useEffect, useState } from 'react';
import { Asset, NETWORKS_LIST } from '~/stores';
import { useDebounce } from './useDebounce';
import tokensList from '~/assets/token_data.json';

const [, POLYGON] = NETWORKS_LIST;

export function useSearchAssets() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [data, setData] = useState<Asset[]>([]);

  const fetchSearch = useCallback(() => {
    if (!debouncedSearch.length) {
      return;
    }

    const items: Asset[] = tokensList.reduce((acc: Asset[], item: Record<string, any>) => {
      acc.push({
        id: item.id,
        ticker: item.symbol || '',
        displayName: item.symbol?.toLocaleUpperCase(),
        network: POLYGON.value,
        type: 'ERC20',
        thumb: item.image,
        decimals: 0,
        balance: 0,
      });
      return acc;
    }, []);
    setData(items);
  }, [debouncedSearch]);

  useEffect(() => {
    fetchSearch();
  }, [fetchSearch]);

  return {
    data,
    search,
    setSearch,
  };
}
