import { useCallback, useEffect, useState } from 'react';
import { COIN_GECKO_API } from '~/constants';
import { Asset, NETWORKS_LIST } from '~/stores';

const COIN_GECKO_API_SEARCH = `${COIN_GECKO_API}search`;

const [ETHERIUM] = NETWORKS_LIST;

export function useSearchAssets() {
  const [search, setSearch] = useState('');
  const [data, setData] = useState<Asset[]>([]);
  const [isLoading, setLoading] = useState(false);

  const fetchSearch = useCallback(async () => {
    setLoading(true);
    const response = await fetch(`${COIN_GECKO_API_SEARCH}?query=${search}`);
    const data = await response.json();

    const items: Asset[] = data.сoins.map(({ item }: { item: Record<string, string | number> }) => ({
      ticker: item.symbol,
      displayName: item.name,
      network: ETHERIUM.value,
      thumb: item.thumb,
      decimals: item.symbol,
    }));
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
