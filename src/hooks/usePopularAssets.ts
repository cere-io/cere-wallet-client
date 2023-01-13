import { useCallback, useEffect, useState } from 'react';
import { COIN_GECKO_API } from '~/constants';
import { Asset } from '~/stores';

const COIN_GECKO_API_SEARCH = `${COIN_GECKO_API}search/trending`;

export function usePopularAssets() {
  const [data, setData] = useState<Asset[]>([]);
  const [isLoading, setLoading] = useState(false);

  const fetchSearch = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${COIN_GECKO_API_SEARCH}`);
      const data = await response.json();

      const items: Asset[] = data.coins?.map(({ item }: { item: Record<string, string | number> }) => ({
        ticker: item.symbol || '',
        displayName: item.name,
        network: item.network,
        thumb: item.thumb,
        symbol: item.symbol,
        decimals: item.symbol,
      }));
      setData(items);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log('Coingecko failed fetch trending assets:', err);
    }
  }, []);

  useEffect(() => {
    fetchSearch();
  }, [fetchSearch]);

  return {
    isLoading,
    data,
  };
}
