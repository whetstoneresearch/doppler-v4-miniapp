import { GraphQLClient } from "graphql-request";

// Initialize GraphQL client
const client = new GraphQLClient("https://doppler-v4-poc.ponder-dev.com/");
// const client = new GraphQLClient("http://localhost:42069/");

// Token type definition
export interface Token {
  address: string;
  name: string;
  symbol: string;
}

export interface Asset {
  marketCapUsd: bigint;
}

export interface DailyVolume {
  volumeUsd: bigint;
}

// Pool type definition based on schema
export interface Pool {
  address: string;
  chainId: bigint;
  tick: number;
  sqrtPrice: bigint;
  liquidity: bigint;
  createdAt: bigint;
  asset: Asset;
  baseToken: Token;
  quoteToken: Token;
  price: bigint;
  fee: number;
  type: string;
  dollarLiquidity: bigint;
  dailyVolume: DailyVolume;
  volumeUsd: bigint;
  percentDayChange: number;
  totalFee0: bigint;
  totalFee1: bigint;
  graduationThreshold: bigint;
  graduationBalance: bigint;
  isToken0: boolean;
  lastRefreshed: bigint | null;
  lastSwapTimestamp: bigint | null;
  reserves0: bigint;
  reserves1: bigint;
}

export interface Pools {
  items: Pool[];
}

// GraphQL query for fetching pools
export const GET_POOLS_QUERY = `
  query GetPools {
    pools(orderBy: "createdAt", orderDirection: "desc", where: { type: "v4" }) {
      items {
        address
        chainId
        tick
        sqrtPrice
        liquidity
        createdAt
        baseToken {
          address
          name
          symbol
        }
        quoteToken {
          address
          name
          symbol
        }
        price
        fee
        type
        dollarLiquidity
        dailyVolume {
          volumeUsd
        }
        asset {
          marketCapUsd 
        }
        volumeUsd
        percentDayChange
        totalFee0
        totalFee1
        graduationThreshold
        graduationBalance
        isToken0
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
  const response = await client.request<{ pools: Pools }>(GET_POOLS_QUERY);
  return response.pools;
};
