import { useCallback, useEffect, useState } from 'react';
import { COIN_GECKO_API } from '~/constants';
import { Asset, NETWORKS_LIST } from '~/stores';

const COIN_GECKO_API_SEARCH = `${COIN_GECKO_API}search`;
const EXCLUDE_POPULAR_LIST = ['matic', 'usdc', 'cere'];
const [ETHERIUM] = NETWORKS_LIST;

export function useSearchAssets() {
  const [search, setSearch] = useState('');
  const [data, setData] = useState<Asset[]>([]);
  const [isLoading, setLoading] = useState(false);

  const fetchSearch = useCallback(async () => {
    if (!search.length) {
      return;
    }

    setLoading(true);
    const response = await fetch(`${COIN_GECKO_API_SEARCH}?query=${search}`);
    const data = await response.json();

    const items: Asset[] = data.coins.reduce((acc: Asset[], item: Record<string, string>) => {
      if (!EXCLUDE_POPULAR_LIST.includes(item.symbol?.toLowerCase()))
        acc.push({
          id: item.id,
          ticker: item.symbol || '',
          displayName: item.symbol?.toLocaleUpperCase(),
          network: ETHERIUM.value,
          type: 'ERC20',
          thumb: item.image,
          decimals: 0,
          balance: 0,
        });
      return acc;
    }, []);
    setData(items);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    fetchSearch();
  }, [fetchSearch]);

  return {
    isLoading,
    data,
    search,
    setSearch,
  };
}
