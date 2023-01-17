import { useCallback, useEffect, useState } from 'react';
import { COIN_GECKO_API } from '~/constants';
import { Asset } from '~/stores';

const TOKEN_QUANTITY = 100;
const COIN_GECKO_API_SEARCH = `${COIN_GECKO_API}/coins/markets?vs_currency=usd&category=ethereum-ecosystem&order=market_cap_desc&per_page=${TOKEN_QUANTITY}&page=1&sparkline=false`;

export function usePopularAssets() {
  const [data, setData] = useState<Asset[]>([]);
  const [isLoading, setLoading] = useState(false);

  const fetchSearch = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${COIN_GECKO_API_SEARCH}`);
      const data = await response.json();

      const items: Asset[] = data.map((item: Record<string, string>) => ({
        ticker: item.symbol || '',
        displayName: item.symbol?.toUpperCase(),
        network: 'Ethereum',
        type: 'ERC20',
        thumb: item.image,
        symbol: item.symbol,
        decimals: item.symbol,
      }));

      setData(items);
    } catch (err) {
      console.log('Coingecko failed fetch trending assets:', err);
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
