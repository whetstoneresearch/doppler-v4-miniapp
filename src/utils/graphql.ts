import { GraphQLClient } from "graphql-request";

// Initialize GraphQL client
const client = new GraphQLClient("https://doppler-sdk-s1ck.marble.live/");
// const client = new GraphQLClient("http://localhost:42069/");

// Token type definition
export interface Token {
  address: string;
  name: string;
  symbol: string;
}

export interface Asset {
  marketCapUsd: bigint;
  migrated?: boolean;
  migratedAt?: bigint;
  v2Pool?: string;
}

export interface DailyVolume {
  volumeUsd: bigint;
}

// PoolKey and Pool type definition based on schema
export interface PoolKey {
  currency0: string;
  currency1: string;
  fee: number;
  tickSpacing: number;
  hooks: string;
}

export interface Pool {
  // For V4 pools, this maps to hooks address
  address: string;
  chainId: bigint;
  tick: number;
  // Some endpoints return sqrtPriceX96; we normalize to sqrtPrice
  sqrtPrice: bigint;
  liquidity: bigint;
  createdAt: bigint;
  asset: Asset | null;
  baseToken: Token;
  quoteToken: Token;
  price: bigint;
  fee: number;
  type: string;
  dollarLiquidity: bigint;
  dailyVolume: DailyVolume | null;
  volumeUsd: bigint;
  percentDayChange: number;
  totalFee0: bigint;
  totalFee1: bigint;
  graduationPercentage?: number;
  graduationBalance?: bigint;
  isToken0: boolean;
  isContentCoin: boolean;
  isCreatorCoin: boolean;
  lastRefreshed: bigint | null;
  lastSwapTimestamp: bigint | null;
  reserves0: bigint;
  reserves1: bigint;
  // V4 specific: key components
  poolKey?: PoolKey;
  currency0?: string;
  currency1?: string;
  tickSpacing?: number;
  hooks?: string;
}

export interface Pools {
  items: Pool[];
}

// GraphQL query for fetching pools (both v3 static and v4 dynamic auctions)
export const GET_POOLS_QUERY = `
  query GetPools {
    pools(
      orderBy: "createdAt"
      orderDirection: "desc"
      limit: 25
      where: {
        type_in: ["v3", "v4"]
        isCreatorCoin: false
        isContentCoin: false
      }
    ) {
      items {
        address
        chainId
        tick
        sqrtPrice
        liquidity
        createdAt
        baseToken { address name symbol }
        quoteToken { address name symbol }
        price
        fee
        type
        dollarLiquidity
        dailyVolume { volumeUsd }
        asset {
          marketCapUsd
          migrated
          migratedAt
          v2Pool
        }
        volumeUsd
        percentDayChange
        totalFee0
        totalFee1
        isToken0
        isCreatorCoin
        isContentCoin
        lastRefreshed
        lastSwapTimestamp
        reserves0
        reserves1
      }
    }
  }
`;

// Function to fetch pools using TanStack Query
export const getPools = async (): Promise<Pools> => {
  const response = await client.request<{ pools: { items: any[] } }>(GET_POOLS_QUERY);
  const items: Pool[] = response.pools.items.map((p: any) => ({
    address: p.address,
    chainId: BigInt(p.chainId),
    tick: p.tick,
    sqrtPrice: BigInt(p.sqrtPrice),
    liquidity: BigInt(p.liquidity),
    createdAt: BigInt(p.createdAt),
    baseToken: p.baseToken,
    quoteToken: p.quoteToken,
    price: BigInt(p.price),
    fee: p.fee,
    type: p.type || 'v3',
    dollarLiquidity: BigInt(p.dollarLiquidity),
    dailyVolume: p.dailyVolume ? { volumeUsd: BigInt(p.dailyVolume.volumeUsd) } : null,
    asset: p.asset ? {
      marketCapUsd: BigInt(p.asset.marketCapUsd),
      migrated: p.asset.migrated,
      migratedAt: p.asset.migratedAt ? BigInt(p.asset.migratedAt) : undefined,
      v2Pool: p.asset.v2Pool ?? undefined,
    } : null,
    volumeUsd: BigInt(p.volumeUsd),
    percentDayChange: p.percentDayChange,
    totalFee0: BigInt(p.totalFee0),
    totalFee1: BigInt(p.totalFee1),
    isToken0: p.isToken0,
    isCreatorCoin: p.isCreatorCoin || false,
    isContentCoin: p.isContentCoin || false,
    lastRefreshed: p.lastRefreshed ? BigInt(p.lastRefreshed) : null,
    lastSwapTimestamp: p.lastSwapTimestamp ? BigInt(p.lastSwapTimestamp) : null,
    reserves0: BigInt(p.reserves0),
    reserves1: BigInt(p.reserves1),
    // For V4 pools, poolKey fields might be available
    poolKey: p.currency0 ? {
      currency0: p.currency0,
      currency1: p.currency1,
      fee: p.fee,
      tickSpacing: p.tickSpacing,
      hooks: p.hooks || p.address,
    } : undefined,
    currency0: p.currency0,
    currency1: p.currency1,
    tickSpacing: p.tickSpacing,
    hooks: p.hooks || p.address,
  }))
  return { items }
};
