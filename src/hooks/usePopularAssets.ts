import { useCallback, useEffect, useState } from 'react';
import { COIN_GECKO_API } from '~/constants';
import { Asset, NETWORKS_LIST } from '~/stores';

const EXCLUDE_POPULAR_LIST = ['matic', 'usdc', 'cere'];
const [ETHERIUM] = NETWORKS_LIST;
const TOKEN_QUANTITY = 100;
const COIN_GECKO_API_SEARCH = `${COIN_GECKO_API}/coins/markets?vs_currency=usd&category=polygon-ecosystem&order=market_cap_desc&per_page=${TOKEN_QUANTITY}&page=1&sparkline=false`;

export function usePopularAssets() {
  const [data, setData] = useState<Asset[]>([]);
  const [isLoading, setLoading] = useState(false);

  const fetchSearch = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${COIN_GECKO_API_SEARCH}`);
      const data = await response.json();

      const items: Asset[] = data.reduce((acc: Asset[], item: Record<string, string>) => {
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
    } catch (err) {
      console.warn('Failed fetch trending assets:', err);
    } finally {
      setLoading(false);
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
