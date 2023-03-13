import { useCallback, useEffect, useState } from 'react';
import { Asset, NETWORKS_LIST } from '~/stores';
import { useDebounce } from './useDebounce';
import tokensList from '~/assets/token_data.json';

const [, POLYGON] = NETWORKS_LIST;
const isDev = process.env.REACT_APP_ENV === 'dev' || process.env.REACT_APP_ENV === 'stage';

export function useSearchAssets() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [data, setData] = useState<Asset[]>([]);

  const fetchSearch = useCallback(() => {
    if (!debouncedSearch.length) {
      return;
    }

    const items: Asset[] = tokensList.reduce((acc: Asset[], item: Record<string, any>) => {
      if (isDev) {
        if (item.test_address) {
          acc.push({
            id: item.id,
            ticker: item.symbol,
            address: item.test_address,
            displayName: item.symbol?.toLocaleUpperCase(),
            network: POLYGON.value,
            type: 'ERC20',
            thumb: item.image,
            decimals: item.decimals,
            balance: 0,
          });
        }
      } else {
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
      }
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
