/**
 * Price Oracle Service
 * Fetches real-time token prices from multiple sources
 */

export interface TokenPrice {
  symbol: string;
  priceUSD: number;
  timestamp: number;
  source: string;
}

export interface PriceSource {
  name: string;
  fetchPrice: (symbol: string) => Promise<number | null>;
}

class PriceOracleService {
  private priceCache: Map<string, { price: number; timestamp: number }> = new Map();
  private cacheDuration = 60000; // 1 minute

  // Price sources in order of preference
  private sources: PriceSource[] = [
    {
      name: 'CoinGecko',
      fetchPrice: this.fetchFromCoinGecko.bind(this),
    },
    {
      name: 'Pyth Network',
      fetchPrice: this.fetchFromPyth.bind(this),
    },
    {
      name: 'Sui DEX',
      fetchPrice: this.fetchFromSuiDex.bind(this),
    },
  ];

  /**
   * Get token price in USD
   */
  async getPrice(symbol: string): Promise<TokenPrice> {
    // Check cache
    const cached = this.priceCache.get(symbol);
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return {
        symbol,
        priceUSD: cached.price,
        timestamp: cached.timestamp,
        source: 'cache',
      };
    }

    // Try each source
    for (const source of this.sources) {
      try {
        const price = await source.fetchPrice(symbol);
        if (price !== null) {
          // Cache the result
          this.priceCache.set(symbol, {
            price,
            timestamp: Date.now(),
          });

          return {
            symbol,
            priceUSD: price,
            timestamp: Date.now(),
            source: source.name,
          };
        }
      } catch (error) {
        console.warn(`Failed to fetch price from ${source.name}:`, error);
        continue;
      }
    }

    throw new Error(`Failed to fetch price for ${symbol} from all sources`);
  }

  /**
   * Get multiple token prices
   */
  async getPrices(symbols: string[]): Promise<TokenPrice[]> {
    return Promise.all(symbols.map(symbol => this.getPrice(symbol)));
  }

  /**
   * Fetch price from CoinGecko API
   */
  private async fetchFromCoinGecko(symbol: string): Promise<number | null> {
    try {
      const coinIds: Record<string, string> = {
        SUI: 'sui',
        ETH: 'ethereum',
        SOL: 'solana',
        MATIC: 'matic-network',
        BNB: 'binancecoin',
        USDC: 'usd-coin',
        WAL: 'walrus', // Placeholder
      };

      const coinId = coinIds[symbol];
      if (!coinId) {
        return null;
      }

      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      return data[coinId]?.usd || null;
    } catch (error) {
      console.error('CoinGecko fetch error:', error);
      return null;
    }
  }

  /**
   * Fetch price from Pyth Network
   */
  private async fetchFromPyth(symbol: string): Promise<number | null> {
    try {
      // Pyth Network price feed IDs
      const priceIds: Record<string, string> = {
        SUI: '0x23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744',
        ETH: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
        SOL: '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d',
        BNB: '0x2f95862b045670cd22bee3114c39763a4a08beeb663b145d283c31d7d1101c4f',
        USDC: '0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a',
      };

      const priceId = priceIds[symbol];
      if (!priceId) {
        return null;
      }

      const response = await fetch(
        `https://hermes.pyth.network/api/latest_price_feeds?ids[]=${priceId}`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Pyth API error: ${response.status}`);
      }

      const data = await response.json();
      const priceFeed = data[0];

      if (!priceFeed) {
        return null;
      }

      // Parse Pyth price (price * 10^expo)
      const price = parseFloat(priceFeed.price.price);
      const expo = priceFeed.price.expo;
      const actualPrice = price * Math.pow(10, expo);

      return actualPrice;
    } catch (error) {
      console.error('Pyth fetch error:', error);
      return null;
    }
  }

  /**
   * Fetch price from Sui DEX pools
   */
  private async fetchFromSuiDex(symbol: string): Promise<number | null> {
    try {
      // Query Cetus or Turbos pools for price
      // This would require querying on-chain data

      /*
      import { SuiClient } from '@mysten/sui/client';

      const client = new SuiClient({ url: 'https://fullnode.mainnet.sui.io' });

      // Query pool for symbol/USDC pair
      const poolAddress = getPoolAddress(symbol, 'USDC');
      const poolData = await client.getObject({
        id: poolAddress,
        options: { showContent: true },
      });

      // Calculate price from reserves
      const reserves = parsePoolReserves(poolData);
      const price = reserves.reserve1 / reserves.reserve0;

      return price;
      */

      // Fallback to hardcoded prices for development
      const fallbackPrices: Record<string, number> = {
        SUI: 1.5,
        WAL: 0.8,
        ETH: 2000,
        SOL: 100,
        MATIC: 0.8,
        BNB: 300,
        USDC: 1.0,
      };

      return fallbackPrices[symbol] || null;
    } catch (error) {
      console.error('Sui DEX fetch error:', error);
      return null;
    }
  }

  /**
   * Clear price cache
   */
  clearCache() {
    this.priceCache.clear();
  }

  /**
   * Get cache status
   */
  getCacheStatus() {
    return {
      size: this.priceCache.size,
      entries: Array.from(this.priceCache.entries()).map(([symbol, data]) => ({
        symbol,
        price: data.price,
        age: Date.now() - data.timestamp,
      })),
    };
  }
}

export const priceOracleService = new PriceOracleService();
