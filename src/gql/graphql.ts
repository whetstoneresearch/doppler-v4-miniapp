/* eslint-disable */
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  BigInt: { input: any; output: any; }
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: { input: any; output: any; }
};

export type Meta = {
  __typename?: 'Meta';
  status?: Maybe<Scalars['JSON']['output']>;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Query = {
  __typename?: 'Query';
  _meta?: Maybe<Meta>;
  activePoolsBlob?: Maybe<ActivePoolsBlob>;
  activePoolsBlobs: ActivePoolsBlobPage;
  asset?: Maybe<Asset>;
  assets: AssetPage;
  dailyVolume?: Maybe<DailyVolume>;
  dailyVolumes: DailyVolumePage;
  ethPrice?: Maybe<EthPrice>;
  ethPrices: EthPricePage;
  hourBucket?: Maybe<HourBucket>;
  hourBucketUsd?: Maybe<HourBucketUsd>;
  hourBucketUsds: HourBucketUsdPage;
  hourBuckets: HourBucketPage;
  module?: Maybe<Module>;
  modules: ModulePage;
  pendingTokenImages?: Maybe<PendingTokenImages>;
  pendingTokenImagess: PendingTokenImagesPage;
  pool?: Maybe<Pool>;
  pools: PoolPage;
  position?: Maybe<Position>;
  positions: PositionPage;
  swap?: Maybe<Swap>;
  swaps: SwapPage;
  token?: Maybe<Token>;
  tokens: TokenPage;
  user?: Maybe<User>;
  userAsset?: Maybe<UserAsset>;
  userAssets: UserAssetPage;
  users: UserPage;
  v2Pool?: Maybe<V2Pool>;
  v2Pools: V2PoolPage;
  v4CheckpointBlob?: Maybe<V4CheckpointBlob>;
  v4CheckpointBlobs: V4CheckpointBlobPage;
  v4PoolConfig?: Maybe<V4PoolConfig>;
  v4PoolConfigs: V4PoolConfigPage;
  v4PoolPriceHistory?: Maybe<V4PoolPriceHistory>;
  v4PoolPriceHistorys: V4PoolPriceHistoryPage;
  v4pools?: Maybe<V4pools>;
  v4poolss: V4poolsPage;
};


export type QueryActivePoolsBlobArgs = {
  chainId: Scalars['BigInt']['input'];
};


export type QueryActivePoolsBlobsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<ActivePoolsBlobFilter>;
};


export type QueryAssetArgs = {
  address: Scalars['String']['input'];
};


export type QueryAssetsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<AssetFilter>;
};


export type QueryDailyVolumeArgs = {
  pool: Scalars['String']['input'];
};


export type QueryDailyVolumesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<DailyVolumeFilter>;
};


export type QueryEthPriceArgs = {
  timestamp: Scalars['BigInt']['input'];
};


export type QueryEthPricesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<EthPriceFilter>;
};


export type QueryHourBucketArgs = {
  chainId: Scalars['BigInt']['input'];
  hourId: Scalars['Float']['input'];
  pool: Scalars['String']['input'];
};


export type QueryHourBucketUsdArgs = {
  chainId: Scalars['BigInt']['input'];
  hourId: Scalars['Float']['input'];
  pool: Scalars['String']['input'];
};


export type QueryHourBucketUsdsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<HourBucketUsdFilter>;
};


export type QueryHourBucketsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<HourBucketFilter>;
};


export type QueryModuleArgs = {
  address: Scalars['String']['input'];
};


export type QueryModulesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<ModuleFilter>;
};


export type QueryPendingTokenImagesArgs = {
  chainId: Scalars['BigInt']['input'];
};


export type QueryPendingTokenImagessArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<PendingTokenImagesFilter>;
};


export type QueryPoolArgs = {
  address: Scalars['String']['input'];
  chainId: Scalars['BigInt']['input'];
};


export type QueryPoolsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<PoolFilter>;
};


export type QueryPositionArgs = {
  chainId: Scalars['BigInt']['input'];
  pool: Scalars['String']['input'];
  tickLower: Scalars['Float']['input'];
  tickUpper: Scalars['Float']['input'];
};


export type QueryPositionsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<PositionFilter>;
};


export type QuerySwapArgs = {
  txHash: Scalars['String']['input'];
};


export type QuerySwapsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<SwapFilter>;
};


export type QueryTokenArgs = {
  address: Scalars['String']['input'];
};


export type QueryTokensArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<TokenFilter>;
};


export type QueryUserArgs = {
  address: Scalars['String']['input'];
};


export type QueryUserAssetArgs = {
  assetId: Scalars['String']['input'];
  chainId: Scalars['BigInt']['input'];
  userId: Scalars['String']['input'];
};


export type QueryUserAssetsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<UserAssetFilter>;
};


export type QueryUsersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<UserFilter>;
};


export type QueryV2PoolArgs = {
  address: Scalars['String']['input'];
};


export type QueryV2PoolsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<V2PoolFilter>;
};


export type QueryV4CheckpointBlobArgs = {
  chainId: Scalars['Int']['input'];
};


export type QueryV4CheckpointBlobsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<V4CheckpointBlobFilter>;
};


export type QueryV4PoolConfigArgs = {
  hookAddress: Scalars['String']['input'];
};


export type QueryV4PoolConfigsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<V4PoolConfigFilter>;
};


export type QueryV4PoolPriceHistoryArgs = {
  pool: Scalars['String']['input'];
};


export type QueryV4PoolPriceHistorysArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<V4PoolPriceHistoryFilter>;
};


export type QueryV4poolsArgs = {
  chainId: Scalars['BigInt']['input'];
  poolId: Scalars['String']['input'];
};


export type QueryV4poolssArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<V4poolsFilter>;
};

export type ActivePoolsBlob = {
  __typename?: 'activePoolsBlob';
  activePools: Scalars['JSON']['output'];
  chainId: Scalars['BigInt']['output'];
};

export type ActivePoolsBlobFilter = {
  AND?: InputMaybe<Array<InputMaybe<ActivePoolsBlobFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<ActivePoolsBlobFilter>>>;
  chainId?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_gt?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_gte?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  chainId_lt?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_lte?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_not?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
};

export type ActivePoolsBlobPage = {
  __typename?: 'activePoolsBlobPage';
  items: Array<ActivePoolsBlob>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type Asset = {
  __typename?: 'asset';
  address: Scalars['String']['output'];
  chainId: Scalars['BigInt']['output'];
  createdAt: Scalars['BigInt']['output'];
  dayVolumeUsd: Scalars['BigInt']['output'];
  governance: Scalars['String']['output'];
  holderCount: Scalars['Int']['output'];
  integrator: Scalars['String']['output'];
  isToken0: Scalars['Boolean']['output'];
  liquidityMigrator: Scalars['String']['output'];
  liquidityUsd: Scalars['BigInt']['output'];
  marketCapUsd: Scalars['BigInt']['output'];
  migrated: Scalars['Boolean']['output'];
  migratedAt?: Maybe<Scalars['BigInt']['output']>;
  migrationPool: Scalars['String']['output'];
  numTokensToSell: Scalars['BigInt']['output'];
  numeraire: Scalars['String']['output'];
  percentDayChange: Scalars['Float']['output'];
  pool?: Maybe<Pool>;
  poolAddress: Scalars['String']['output'];
  poolInitializer: Scalars['String']['output'];
  swaps?: Maybe<SwapPage>;
  timelock: Scalars['String']['output'];
  userAssets?: Maybe<UserAssetPage>;
  v2Pool?: Maybe<Scalars['String']['output']>;
};


export type AssetSwapsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<SwapFilter>;
};


export type AssetUserAssetsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<UserAssetFilter>;
};

export type AssetFilter = {
  AND?: InputMaybe<Array<InputMaybe<AssetFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<AssetFilter>>>;
  address?: InputMaybe<Scalars['String']['input']>;
  address_contains?: InputMaybe<Scalars['String']['input']>;
  address_ends_with?: InputMaybe<Scalars['String']['input']>;
  address_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  address_not?: InputMaybe<Scalars['String']['input']>;
  address_not_contains?: InputMaybe<Scalars['String']['input']>;
  address_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  address_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  address_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  address_starts_with?: InputMaybe<Scalars['String']['input']>;
  chainId?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_gt?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_gte?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  chainId_lt?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_lte?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_not?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  createdAt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_gt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_gte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  createdAt_lt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_lte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_not?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  dayVolumeUsd?: InputMaybe<Scalars['BigInt']['input']>;
  dayVolumeUsd_gt?: InputMaybe<Scalars['BigInt']['input']>;
  dayVolumeUsd_gte?: InputMaybe<Scalars['BigInt']['input']>;
  dayVolumeUsd_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  dayVolumeUsd_lt?: InputMaybe<Scalars['BigInt']['input']>;
  dayVolumeUsd_lte?: InputMaybe<Scalars['BigInt']['input']>;
  dayVolumeUsd_not?: InputMaybe<Scalars['BigInt']['input']>;
  dayVolumeUsd_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  governance?: InputMaybe<Scalars['String']['input']>;
  governance_contains?: InputMaybe<Scalars['String']['input']>;
  governance_ends_with?: InputMaybe<Scalars['String']['input']>;
  governance_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  governance_not?: InputMaybe<Scalars['String']['input']>;
  governance_not_contains?: InputMaybe<Scalars['String']['input']>;
  governance_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  governance_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  governance_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  governance_starts_with?: InputMaybe<Scalars['String']['input']>;
  holderCount?: InputMaybe<Scalars['Int']['input']>;
  holderCount_gt?: InputMaybe<Scalars['Int']['input']>;
  holderCount_gte?: InputMaybe<Scalars['Int']['input']>;
  holderCount_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  holderCount_lt?: InputMaybe<Scalars['Int']['input']>;
  holderCount_lte?: InputMaybe<Scalars['Int']['input']>;
  holderCount_not?: InputMaybe<Scalars['Int']['input']>;
  holderCount_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  integrator?: InputMaybe<Scalars['String']['input']>;
  integrator_contains?: InputMaybe<Scalars['String']['input']>;
  integrator_ends_with?: InputMaybe<Scalars['String']['input']>;
  integrator_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  integrator_not?: InputMaybe<Scalars['String']['input']>;
  integrator_not_contains?: InputMaybe<Scalars['String']['input']>;
  integrator_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  integrator_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  integrator_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  integrator_starts_with?: InputMaybe<Scalars['String']['input']>;
  isToken0?: InputMaybe<Scalars['Boolean']['input']>;
  isToken0_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  isToken0_not?: InputMaybe<Scalars['Boolean']['input']>;
  isToken0_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  liquidityMigrator?: InputMaybe<Scalars['String']['input']>;
  liquidityMigrator_contains?: InputMaybe<Scalars['String']['input']>;
  liquidityMigrator_ends_with?: InputMaybe<Scalars['String']['input']>;
  liquidityMigrator_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  liquidityMigrator_not?: InputMaybe<Scalars['String']['input']>;
  liquidityMigrator_not_contains?: InputMaybe<Scalars['String']['input']>;
  liquidityMigrator_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  liquidityMigrator_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  liquidityMigrator_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  liquidityMigrator_starts_with?: InputMaybe<Scalars['String']['input']>;
  liquidityUsd?: InputMaybe<Scalars['BigInt']['input']>;
  liquidityUsd_gt?: InputMaybe<Scalars['BigInt']['input']>;
  liquidityUsd_gte?: InputMaybe<Scalars['BigInt']['input']>;
  liquidityUsd_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  liquidityUsd_lt?: InputMaybe<Scalars['BigInt']['input']>;
  liquidityUsd_lte?: InputMaybe<Scalars['BigInt']['input']>;
  liquidityUsd_not?: InputMaybe<Scalars['BigInt']['input']>;
  liquidityUsd_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  marketCapUsd?: InputMaybe<Scalars['BigInt']['input']>;
  marketCapUsd_gt?: InputMaybe<Scalars['BigInt']['input']>;
  marketCapUsd_gte?: InputMaybe<Scalars['BigInt']['input']>;
  marketCapUsd_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  marketCapUsd_lt?: InputMaybe<Scalars['BigInt']['input']>;
  marketCapUsd_lte?: InputMaybe<Scalars['BigInt']['input']>;
  marketCapUsd_not?: InputMaybe<Scalars['BigInt']['input']>;
  marketCapUsd_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  migrated?: InputMaybe<Scalars['Boolean']['input']>;
  migratedAt?: InputMaybe<Scalars['BigInt']['input']>;
  migratedAt_gt?: InputMaybe<Scalars['BigInt']['input']>;
  migratedAt_gte?: InputMaybe<Scalars['BigInt']['input']>;
  migratedAt_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  migratedAt_lt?: InputMaybe<Scalars['BigInt']['input']>;
  migratedAt_lte?: InputMaybe<Scalars['BigInt']['input']>;
  migratedAt_not?: InputMaybe<Scalars['BigInt']['input']>;
  migratedAt_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  migrated_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  migrated_not?: InputMaybe<Scalars['Boolean']['input']>;
  migrated_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  migrationPool?: InputMaybe<Scalars['String']['input']>;
  migrationPool_contains?: InputMaybe<Scalars['String']['input']>;
  migrationPool_ends_with?: InputMaybe<Scalars['String']['input']>;
  migrationPool_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  migrationPool_not?: InputMaybe<Scalars['String']['input']>;
  migrationPool_not_contains?: InputMaybe<Scalars['String']['input']>;
  migrationPool_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  migrationPool_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  migrationPool_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  migrationPool_starts_with?: InputMaybe<Scalars['String']['input']>;
  numTokensToSell?: InputMaybe<Scalars['BigInt']['input']>;
  numTokensToSell_gt?: InputMaybe<Scalars['BigInt']['input']>;
  numTokensToSell_gte?: InputMaybe<Scalars['BigInt']['input']>;
  numTokensToSell_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  numTokensToSell_lt?: InputMaybe<Scalars['BigInt']['input']>;
  numTokensToSell_lte?: InputMaybe<Scalars['BigInt']['input']>;
  numTokensToSell_not?: InputMaybe<Scalars['BigInt']['input']>;
  numTokensToSell_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  numeraire?: InputMaybe<Scalars['String']['input']>;
  numeraire_contains?: InputMaybe<Scalars['String']['input']>;
  numeraire_ends_with?: InputMaybe<Scalars['String']['input']>;
  numeraire_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  numeraire_not?: InputMaybe<Scalars['String']['input']>;
  numeraire_not_contains?: InputMaybe<Scalars['String']['input']>;
  numeraire_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  numeraire_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  numeraire_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  numeraire_starts_with?: InputMaybe<Scalars['String']['input']>;
  percentDayChange?: InputMaybe<Scalars['Float']['input']>;
  percentDayChange_gt?: InputMaybe<Scalars['Float']['input']>;
  percentDayChange_gte?: InputMaybe<Scalars['Float']['input']>;
  percentDayChange_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  percentDayChange_lt?: InputMaybe<Scalars['Float']['input']>;
  percentDayChange_lte?: InputMaybe<Scalars['Float']['input']>;
  percentDayChange_not?: InputMaybe<Scalars['Float']['input']>;
  percentDayChange_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  poolAddress?: InputMaybe<Scalars['String']['input']>;
  poolAddress_contains?: InputMaybe<Scalars['String']['input']>;
  poolAddress_ends_with?: InputMaybe<Scalars['String']['input']>;
  poolAddress_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  poolAddress_not?: InputMaybe<Scalars['String']['input']>;
  poolAddress_not_contains?: InputMaybe<Scalars['String']['input']>;
  poolAddress_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  poolAddress_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  poolAddress_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  poolAddress_starts_with?: InputMaybe<Scalars['String']['input']>;
  poolInitializer?: InputMaybe<Scalars['String']['input']>;
  poolInitializer_contains?: InputMaybe<Scalars['String']['input']>;
  poolInitializer_ends_with?: InputMaybe<Scalars['String']['input']>;
  poolInitializer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  poolInitializer_not?: InputMaybe<Scalars['String']['input']>;
  poolInitializer_not_contains?: InputMaybe<Scalars['String']['input']>;
  poolInitializer_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  poolInitializer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  poolInitializer_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  poolInitializer_starts_with?: InputMaybe<Scalars['String']['input']>;
  timelock?: InputMaybe<Scalars['String']['input']>;
  timelock_contains?: InputMaybe<Scalars['String']['input']>;
  timelock_ends_with?: InputMaybe<Scalars['String']['input']>;
  timelock_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  timelock_not?: InputMaybe<Scalars['String']['input']>;
  timelock_not_contains?: InputMaybe<Scalars['String']['input']>;
  timelock_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  timelock_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  timelock_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  timelock_starts_with?: InputMaybe<Scalars['String']['input']>;
  v2Pool?: InputMaybe<Scalars['String']['input']>;
  v2Pool_contains?: InputMaybe<Scalars['String']['input']>;
  v2Pool_ends_with?: InputMaybe<Scalars['String']['input']>;
  v2Pool_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  v2Pool_not?: InputMaybe<Scalars['String']['input']>;
  v2Pool_not_contains?: InputMaybe<Scalars['String']['input']>;
  v2Pool_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  v2Pool_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  v2Pool_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  v2Pool_starts_with?: InputMaybe<Scalars['String']['input']>;
};

export type AssetPage = {
  __typename?: 'assetPage';
  items: Array<Asset>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type DailyVolume = {
  __typename?: 'dailyVolume';
  chainId: Scalars['BigInt']['output'];
  checkpoints: Scalars['JSON']['output'];
  lastUpdated: Scalars['BigInt']['output'];
  pool: Scalars['String']['output'];
  volumeUsd: Scalars['BigInt']['output'];
};

export type DailyVolumeFilter = {
  AND?: InputMaybe<Array<InputMaybe<DailyVolumeFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<DailyVolumeFilter>>>;
  chainId?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_gt?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_gte?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  chainId_lt?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_lte?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_not?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  lastUpdated?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdated_gt?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdated_gte?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdated_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  lastUpdated_lt?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdated_lte?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdated_not?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdated_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  pool?: InputMaybe<Scalars['String']['input']>;
  pool_contains?: InputMaybe<Scalars['String']['input']>;
  pool_ends_with?: InputMaybe<Scalars['String']['input']>;
  pool_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  pool_not?: InputMaybe<Scalars['String']['input']>;
  pool_not_contains?: InputMaybe<Scalars['String']['input']>;
  pool_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  pool_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  pool_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  pool_starts_with?: InputMaybe<Scalars['String']['input']>;
  volumeUsd?: InputMaybe<Scalars['BigInt']['input']>;
  volumeUsd_gt?: InputMaybe<Scalars['BigInt']['input']>;
  volumeUsd_gte?: InputMaybe<Scalars['BigInt']['input']>;
  volumeUsd_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  volumeUsd_lt?: InputMaybe<Scalars['BigInt']['input']>;
  volumeUsd_lte?: InputMaybe<Scalars['BigInt']['input']>;
  volumeUsd_not?: InputMaybe<Scalars['BigInt']['input']>;
  volumeUsd_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
};

export type DailyVolumePage = {
  __typename?: 'dailyVolumePage';
  items: Array<DailyVolume>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type EthPrice = {
  __typename?: 'ethPrice';
  price: Scalars['BigInt']['output'];
  timestamp: Scalars['BigInt']['output'];
};

export type EthPriceFilter = {
  AND?: InputMaybe<Array<InputMaybe<EthPriceFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<EthPriceFilter>>>;
  price?: InputMaybe<Scalars['BigInt']['input']>;
  price_gt?: InputMaybe<Scalars['BigInt']['input']>;
  price_gte?: InputMaybe<Scalars['BigInt']['input']>;
  price_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  price_lt?: InputMaybe<Scalars['BigInt']['input']>;
  price_lte?: InputMaybe<Scalars['BigInt']['input']>;
  price_not?: InputMaybe<Scalars['BigInt']['input']>;
  price_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  timestamp?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
};

export type EthPricePage = {
  __typename?: 'ethPricePage';
  items: Array<EthPrice>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type HourBucket = {
  __typename?: 'hourBucket';
  average: Scalars['BigInt']['output'];
  chainId: Scalars['BigInt']['output'];
  close: Scalars['BigInt']['output'];
  count: Scalars['Int']['output'];
  high: Scalars['BigInt']['output'];
  hourId: Scalars['Int']['output'];
  low: Scalars['BigInt']['output'];
  open: Scalars['BigInt']['output'];
  pool?: Maybe<Pool>;
};

export type HourBucketFilter = {
  AND?: InputMaybe<Array<InputMaybe<HourBucketFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<HourBucketFilter>>>;
  average?: InputMaybe<Scalars['BigInt']['input']>;
  average_gt?: InputMaybe<Scalars['BigInt']['input']>;
  average_gte?: InputMaybe<Scalars['BigInt']['input']>;
  average_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  average_lt?: InputMaybe<Scalars['BigInt']['input']>;
  average_lte?: InputMaybe<Scalars['BigInt']['input']>;
  average_not?: InputMaybe<Scalars['BigInt']['input']>;
  average_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  chainId?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_gt?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_gte?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  chainId_lt?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_lte?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_not?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  close?: InputMaybe<Scalars['BigInt']['input']>;
  close_gt?: InputMaybe<Scalars['BigInt']['input']>;
  close_gte?: InputMaybe<Scalars['BigInt']['input']>;
  close_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  close_lt?: InputMaybe<Scalars['BigInt']['input']>;
  close_lte?: InputMaybe<Scalars['BigInt']['input']>;
  close_not?: InputMaybe<Scalars['BigInt']['input']>;
  close_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  count?: InputMaybe<Scalars['Int']['input']>;
  count_gt?: InputMaybe<Scalars['Int']['input']>;
  count_gte?: InputMaybe<Scalars['Int']['input']>;
  count_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  count_lt?: InputMaybe<Scalars['Int']['input']>;
  count_lte?: InputMaybe<Scalars['Int']['input']>;
  count_not?: InputMaybe<Scalars['Int']['input']>;
  count_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  high?: InputMaybe<Scalars['BigInt']['input']>;
  high_gt?: InputMaybe<Scalars['BigInt']['input']>;
  high_gte?: InputMaybe<Scalars['BigInt']['input']>;
  high_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  high_lt?: InputMaybe<Scalars['BigInt']['input']>;
  high_lte?: InputMaybe<Scalars['BigInt']['input']>;
  high_not?: InputMaybe<Scalars['BigInt']['input']>;
  high_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  hourId?: InputMaybe<Scalars['Int']['input']>;
  hourId_gt?: InputMaybe<Scalars['Int']['input']>;
  hourId_gte?: InputMaybe<Scalars['Int']['input']>;
  hourId_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  hourId_lt?: InputMaybe<Scalars['Int']['input']>;
  hourId_lte?: InputMaybe<Scalars['Int']['input']>;
  hourId_not?: InputMaybe<Scalars['Int']['input']>;
  hourId_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  low?: InputMaybe<Scalars['BigInt']['input']>;
  low_gt?: InputMaybe<Scalars['BigInt']['input']>;
  low_gte?: InputMaybe<Scalars['BigInt']['input']>;
  low_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  low_lt?: InputMaybe<Scalars['BigInt']['input']>;
  low_lte?: InputMaybe<Scalars['BigInt']['input']>;
  low_not?: InputMaybe<Scalars['BigInt']['input']>;
  low_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  open?: InputMaybe<Scalars['BigInt']['input']>;
  open_gt?: InputMaybe<Scalars['BigInt']['input']>;
  open_gte?: InputMaybe<Scalars['BigInt']['input']>;
  open_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  open_lt?: InputMaybe<Scalars['BigInt']['input']>;
  open_lte?: InputMaybe<Scalars['BigInt']['input']>;
  open_not?: InputMaybe<Scalars['BigInt']['input']>;
  open_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  pool?: InputMaybe<Scalars['String']['input']>;
  pool_contains?: InputMaybe<Scalars['String']['input']>;
  pool_ends_with?: InputMaybe<Scalars['String']['input']>;
  pool_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  pool_not?: InputMaybe<Scalars['String']['input']>;
  pool_not_contains?: InputMaybe<Scalars['String']['input']>;
  pool_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  pool_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  pool_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  pool_starts_with?: InputMaybe<Scalars['String']['input']>;
};

export type HourBucketPage = {
  __typename?: 'hourBucketPage';
  items: Array<HourBucket>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type HourBucketUsd = {
  __typename?: 'hourBucketUsd';
  average: Scalars['BigInt']['output'];
  chainId: Scalars['BigInt']['output'];
  close: Scalars['BigInt']['output'];
  count: Scalars['Int']['output'];
  high: Scalars['BigInt']['output'];
  hourId: Scalars['Int']['output'];
  low: Scalars['BigInt']['output'];
  open: Scalars['BigInt']['output'];
  pool?: Maybe<Pool>;
};

export type HourBucketUsdFilter = {
  AND?: InputMaybe<Array<InputMaybe<HourBucketUsdFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<HourBucketUsdFilter>>>;
  average?: InputMaybe<Scalars['BigInt']['input']>;
  average_gt?: InputMaybe<Scalars['BigInt']['input']>;
  average_gte?: InputMaybe<Scalars['BigInt']['input']>;
  average_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  average_lt?: InputMaybe<Scalars['BigInt']['input']>;
  average_lte?: InputMaybe<Scalars['BigInt']['input']>;
  average_not?: InputMaybe<Scalars['BigInt']['input']>;
  average_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  chainId?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_gt?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_gte?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  chainId_lt?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_lte?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_not?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  close?: InputMaybe<Scalars['BigInt']['input']>;
  close_gt?: InputMaybe<Scalars['BigInt']['input']>;
  close_gte?: InputMaybe<Scalars['BigInt']['input']>;
  close_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  close_lt?: InputMaybe<Scalars['BigInt']['input']>;
  close_lte?: InputMaybe<Scalars['BigInt']['input']>;
  close_not?: InputMaybe<Scalars['BigInt']['input']>;
  close_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  count?: InputMaybe<Scalars['Int']['input']>;
  count_gt?: InputMaybe<Scalars['Int']['input']>;
  count_gte?: InputMaybe<Scalars['Int']['input']>;
  count_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  count_lt?: InputMaybe<Scalars['Int']['input']>;
  count_lte?: InputMaybe<Scalars['Int']['input']>;
  count_not?: InputMaybe<Scalars['Int']['input']>;
  count_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  high?: InputMaybe<Scalars['BigInt']['input']>;
  high_gt?: InputMaybe<Scalars['BigInt']['input']>;
  high_gte?: InputMaybe<Scalars['BigInt']['input']>;
  high_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  high_lt?: InputMaybe<Scalars['BigInt']['input']>;
  high_lte?: InputMaybe<Scalars['BigInt']['input']>;
  high_not?: InputMaybe<Scalars['BigInt']['input']>;
  high_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  hourId?: InputMaybe<Scalars['Int']['input']>;
  hourId_gt?: InputMaybe<Scalars['Int']['input']>;
  hourId_gte?: InputMaybe<Scalars['Int']['input']>;
  hourId_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  hourId_lt?: InputMaybe<Scalars['Int']['input']>;
  hourId_lte?: InputMaybe<Scalars['Int']['input']>;
  hourId_not?: InputMaybe<Scalars['Int']['input']>;
  hourId_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  low?: InputMaybe<Scalars['BigInt']['input']>;
  low_gt?: InputMaybe<Scalars['BigInt']['input']>;
  low_gte?: InputMaybe<Scalars['BigInt']['input']>;
  low_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  low_lt?: InputMaybe<Scalars['BigInt']['input']>;
  low_lte?: InputMaybe<Scalars['BigInt']['input']>;
  low_not?: InputMaybe<Scalars['BigInt']['input']>;
  low_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  open?: InputMaybe<Scalars['BigInt']['input']>;
  open_gt?: InputMaybe<Scalars['BigInt']['input']>;
  open_gte?: InputMaybe<Scalars['BigInt']['input']>;
  open_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  open_lt?: InputMaybe<Scalars['BigInt']['input']>;
  open_lte?: InputMaybe<Scalars['BigInt']['input']>;
  open_not?: InputMaybe<Scalars['BigInt']['input']>;
  open_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  pool?: InputMaybe<Scalars['String']['input']>;
  pool_contains?: InputMaybe<Scalars['String']['input']>;
  pool_ends_with?: InputMaybe<Scalars['String']['input']>;
  pool_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  pool_not?: InputMaybe<Scalars['String']['input']>;
  pool_not_contains?: InputMaybe<Scalars['String']['input']>;
  pool_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  pool_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  pool_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  pool_starts_with?: InputMaybe<Scalars['String']['input']>;
};

export type HourBucketUsdPage = {
  __typename?: 'hourBucketUsdPage';
  items: Array<HourBucketUsd>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type Module = {
  __typename?: 'module';
  address: Scalars['String']['output'];
  chainId: Scalars['BigInt']['output'];
  lastUpdated: Scalars['BigInt']['output'];
  state: Scalars['Int']['output'];
};

export type ModuleFilter = {
  AND?: InputMaybe<Array<InputMaybe<ModuleFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<ModuleFilter>>>;
  address?: InputMaybe<Scalars['String']['input']>;
  address_contains?: InputMaybe<Scalars['String']['input']>;
  address_ends_with?: InputMaybe<Scalars['String']['input']>;
  address_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  address_not?: InputMaybe<Scalars['String']['input']>;
  address_not_contains?: InputMaybe<Scalars['String']['input']>;
  address_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  address_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  address_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  address_starts_with?: InputMaybe<Scalars['String']['input']>;
  chainId?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_gt?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_gte?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  chainId_lt?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_lte?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_not?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  lastUpdated?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdated_gt?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdated_gte?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdated_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  lastUpdated_lt?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdated_lte?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdated_not?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdated_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  state?: InputMaybe<Scalars['Int']['input']>;
  state_gt?: InputMaybe<Scalars['Int']['input']>;
  state_gte?: InputMaybe<Scalars['Int']['input']>;
  state_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  state_lt?: InputMaybe<Scalars['Int']['input']>;
  state_lte?: InputMaybe<Scalars['Int']['input']>;
  state_not?: InputMaybe<Scalars['Int']['input']>;
  state_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
};

export type ModulePage = {
  __typename?: 'modulePage';
  items: Array<Module>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PendingTokenImages = {
  __typename?: 'pendingTokenImages';
  chainId: Scalars['BigInt']['output'];
  tokens: Scalars['JSON']['output'];
};

export type PendingTokenImagesFilter = {
  AND?: InputMaybe<Array<InputMaybe<PendingTokenImagesFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<PendingTokenImagesFilter>>>;
  chainId?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_gt?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_gte?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  chainId_lt?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_lte?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_not?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
};

export type PendingTokenImagesPage = {
  __typename?: 'pendingTokenImagesPage';
  items: Array<PendingTokenImages>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type Pool = {
  __typename?: 'pool';
  address: Scalars['String']['output'];
  asset?: Maybe<Asset>;
  baseToken?: Maybe<Token>;
  chainId: Scalars['BigInt']['output'];
  createdAt: Scalars['BigInt']['output'];
  dailyVolume?: Maybe<DailyVolume>;
  dollarLiquidity: Scalars['BigInt']['output'];
  fee: Scalars['Int']['output'];
  graduationBalance: Scalars['BigInt']['output'];
  graduationPercentage: Scalars['Float']['output'];
  holderCount: Scalars['Int']['output'];
  hourBucketUsds?: Maybe<HourBucketUsdPage>;
  hourBuckets?: Maybe<HourBucketPage>;
  isQuoteEth: Scalars['Boolean']['output'];
  isStreaming: Scalars['Boolean']['output'];
  isToken0: Scalars['Boolean']['output'];
  lastRefreshed?: Maybe<Scalars['BigInt']['output']>;
  lastSwapTimestamp?: Maybe<Scalars['BigInt']['output']>;
  liquidity: Scalars['BigInt']['output'];
  marketCapUsd: Scalars['BigInt']['output'];
  maxThreshold: Scalars['BigInt']['output'];
  migrated: Scalars['Boolean']['output'];
  migratedAt?: Maybe<Scalars['BigInt']['output']>;
  migratedFromPool?: Maybe<Scalars['String']['output']>;
  migratedToPool?: Maybe<Scalars['String']['output']>;
  migratedToV4PoolId?: Maybe<Scalars['String']['output']>;
  minThreshold?: Maybe<Scalars['BigInt']['output']>;
  percentDayChange: Scalars['Float']['output'];
  positions?: Maybe<PositionPage>;
  price: Scalars['BigInt']['output'];
  quoteToken?: Maybe<Token>;
  reserves0: Scalars['BigInt']['output'];
  reserves1: Scalars['BigInt']['output'];
  sqrtPrice: Scalars['BigInt']['output'];
  swaps?: Maybe<SwapPage>;
  tick: Scalars['Int']['output'];
  totalFee0: Scalars['BigInt']['output'];
  totalFee1: Scalars['BigInt']['output'];
  totalProceeds: Scalars['BigInt']['output'];
  totalTokensSold: Scalars['BigInt']['output'];
  type: Scalars['String']['output'];
  volumeUsd: Scalars['BigInt']['output'];
};


export type PoolHourBucketUsdsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<HourBucketUsdFilter>;
};


export type PoolHourBucketsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<HourBucketFilter>;
};


export type PoolPositionsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<PositionFilter>;
};


export type PoolSwapsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<SwapFilter>;
};

export type PoolFilter = {
  AND?: InputMaybe<Array<InputMaybe<PoolFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<PoolFilter>>>;
  address?: InputMaybe<Scalars['String']['input']>;
  address_contains?: InputMaybe<Scalars['String']['input']>;
  address_ends_with?: InputMaybe<Scalars['String']['input']>;
  address_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  address_not?: InputMaybe<Scalars['String']['input']>;
  address_not_contains?: InputMaybe<Scalars['String']['input']>;
  address_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  address_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  address_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  address_starts_with?: InputMaybe<Scalars['String']['input']>;
  asset?: InputMaybe<Scalars['String']['input']>;
  asset_contains?: InputMaybe<Scalars['String']['input']>;
  asset_ends_with?: InputMaybe<Scalars['String']['input']>;
  asset_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  asset_not?: InputMaybe<Scalars['String']['input']>;
  asset_not_contains?: InputMaybe<Scalars['String']['input']>;
  asset_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  asset_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  asset_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  asset_starts_with?: InputMaybe<Scalars['String']['input']>;
  baseToken?: InputMaybe<Scalars['String']['input']>;
  baseToken_contains?: InputMaybe<Scalars['String']['input']>;
  baseToken_ends_with?: InputMaybe<Scalars['String']['input']>;
  baseToken_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  baseToken_not?: InputMaybe<Scalars['String']['input']>;
  baseToken_not_contains?: InputMaybe<Scalars['String']['input']>;
  baseToken_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  baseToken_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  baseToken_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  baseToken_starts_with?: InputMaybe<Scalars['String']['input']>;
  chainId?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_gt?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_gte?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  chainId_lt?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_lte?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_not?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  createdAt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_gt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_gte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  createdAt_lt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_lte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_not?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  dailyVolume?: InputMaybe<Scalars['String']['input']>;
  dailyVolume_contains?: InputMaybe<Scalars['String']['input']>;
  dailyVolume_ends_with?: InputMaybe<Scalars['String']['input']>;
  dailyVolume_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  dailyVolume_not?: InputMaybe<Scalars['String']['input']>;
  dailyVolume_not_contains?: InputMaybe<Scalars['String']['input']>;
  dailyVolume_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  dailyVolume_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  dailyVolume_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  dailyVolume_starts_with?: InputMaybe<Scalars['String']['input']>;
  dollarLiquidity?: InputMaybe<Scalars['BigInt']['input']>;
  dollarLiquidity_gt?: InputMaybe<Scalars['BigInt']['input']>;
  dollarLiquidity_gte?: InputMaybe<Scalars['BigInt']['input']>;
  dollarLiquidity_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  dollarLiquidity_lt?: InputMaybe<Scalars['BigInt']['input']>;
  dollarLiquidity_lte?: InputMaybe<Scalars['BigInt']['input']>;
  dollarLiquidity_not?: InputMaybe<Scalars['BigInt']['input']>;
  dollarLiquidity_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  fee?: InputMaybe<Scalars['Int']['input']>;
  fee_gt?: InputMaybe<Scalars['Int']['input']>;
  fee_gte?: InputMaybe<Scalars['Int']['input']>;
  fee_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  fee_lt?: InputMaybe<Scalars['Int']['input']>;
  fee_lte?: InputMaybe<Scalars['Int']['input']>;
  fee_not?: InputMaybe<Scalars['Int']['input']>;
  fee_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  graduationBalance?: InputMaybe<Scalars['BigInt']['input']>;
  graduationBalance_gt?: InputMaybe<Scalars['BigInt']['input']>;
  graduationBalance_gte?: InputMaybe<Scalars['BigInt']['input']>;
  graduationBalance_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  graduationBalance_lt?: InputMaybe<Scalars['BigInt']['input']>;
  graduationBalance_lte?: InputMaybe<Scalars['BigInt']['input']>;
  graduationBalance_not?: InputMaybe<Scalars['BigInt']['input']>;
  graduationBalance_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  graduationPercentage?: InputMaybe<Scalars['Float']['input']>;
  graduationPercentage_gt?: InputMaybe<Scalars['Float']['input']>;
  graduationPercentage_gte?: InputMaybe<Scalars['Float']['input']>;
  graduationPercentage_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  graduationPercentage_lt?: InputMaybe<Scalars['Float']['input']>;
  graduationPercentage_lte?: InputMaybe<Scalars['Float']['input']>;
  graduationPercentage_not?: InputMaybe<Scalars['Float']['input']>;
  graduationPercentage_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  holderCount?: InputMaybe<Scalars['Int']['input']>;
  holderCount_gt?: InputMaybe<Scalars['Int']['input']>;
  holderCount_gte?: InputMaybe<Scalars['Int']['input']>;
  holderCount_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  holderCount_lt?: InputMaybe<Scalars['Int']['input']>;
  holderCount_lte?: InputMaybe<Scalars['Int']['input']>;
  holderCount_not?: InputMaybe<Scalars['Int']['input']>;
  holderCount_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  isQuoteEth?: InputMaybe<Scalars['Boolean']['input']>;
  isQuoteEth_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  isQuoteEth_not?: InputMaybe<Scalars['Boolean']['input']>;
  isQuoteEth_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  isStreaming?: InputMaybe<Scalars['Boolean']['input']>;
  isStreaming_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  isStreaming_not?: InputMaybe<Scalars['Boolean']['input']>;
  isStreaming_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  isToken0?: InputMaybe<Scalars['Boolean']['input']>;
  isToken0_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  isToken0_not?: InputMaybe<Scalars['Boolean']['input']>;
  isToken0_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  lastRefreshed?: InputMaybe<Scalars['BigInt']['input']>;
  lastRefreshed_gt?: InputMaybe<Scalars['BigInt']['input']>;
  lastRefreshed_gte?: InputMaybe<Scalars['BigInt']['input']>;
  lastRefreshed_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  lastRefreshed_lt?: InputMaybe<Scalars['BigInt']['input']>;
  lastRefreshed_lte?: InputMaybe<Scalars['BigInt']['input']>;
  lastRefreshed_not?: InputMaybe<Scalars['BigInt']['input']>;
  lastRefreshed_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  lastSwapTimestamp?: InputMaybe<Scalars['BigInt']['input']>;
  lastSwapTimestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  lastSwapTimestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  lastSwapTimestamp_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  lastSwapTimestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  lastSwapTimestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  lastSwapTimestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  lastSwapTimestamp_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  liquidity?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_gt?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_gte?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  liquidity_lt?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_lte?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_not?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  marketCapUsd?: InputMaybe<Scalars['BigInt']['input']>;
  marketCapUsd_gt?: InputMaybe<Scalars['BigInt']['input']>;
  marketCapUsd_gte?: InputMaybe<Scalars['BigInt']['input']>;
  marketCapUsd_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  marketCapUsd_lt?: InputMaybe<Scalars['BigInt']['input']>;
  marketCapUsd_lte?: InputMaybe<Scalars['BigInt']['input']>;
  marketCapUsd_not?: InputMaybe<Scalars['BigInt']['input']>;
  marketCapUsd_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  maxThreshold?: InputMaybe<Scalars['BigInt']['input']>;
  maxThreshold_gt?: InputMaybe<Scalars['BigInt']['input']>;
  maxThreshold_gte?: InputMaybe<Scalars['BigInt']['input']>;
  maxThreshold_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  maxThreshold_lt?: InputMaybe<Scalars['BigInt']['input']>;
  maxThreshold_lte?: InputMaybe<Scalars['BigInt']['input']>;
  maxThreshold_not?: InputMaybe<Scalars['BigInt']['input']>;
  maxThreshold_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  migrated?: InputMaybe<Scalars['Boolean']['input']>;
  migratedAt?: InputMaybe<Scalars['BigInt']['input']>;
  migratedAt_gt?: InputMaybe<Scalars['BigInt']['input']>;
  migratedAt_gte?: InputMaybe<Scalars['BigInt']['input']>;
  migratedAt_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  migratedAt_lt?: InputMaybe<Scalars['BigInt']['input']>;
  migratedAt_lte?: InputMaybe<Scalars['BigInt']['input']>;
  migratedAt_not?: InputMaybe<Scalars['BigInt']['input']>;
  migratedAt_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  migratedFromPool?: InputMaybe<Scalars['String']['input']>;
  migratedFromPool_contains?: InputMaybe<Scalars['String']['input']>;
  migratedFromPool_ends_with?: InputMaybe<Scalars['String']['input']>;
  migratedFromPool_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  migratedFromPool_not?: InputMaybe<Scalars['String']['input']>;
  migratedFromPool_not_contains?: InputMaybe<Scalars['String']['input']>;
  migratedFromPool_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  migratedFromPool_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  migratedFromPool_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  migratedFromPool_starts_with?: InputMaybe<Scalars['String']['input']>;
  migratedToPool?: InputMaybe<Scalars['String']['input']>;
  migratedToPool_contains?: InputMaybe<Scalars['String']['input']>;
  migratedToPool_ends_with?: InputMaybe<Scalars['String']['input']>;
  migratedToPool_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  migratedToPool_not?: InputMaybe<Scalars['String']['input']>;
  migratedToPool_not_contains?: InputMaybe<Scalars['String']['input']>;
  migratedToPool_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  migratedToPool_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  migratedToPool_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  migratedToPool_starts_with?: InputMaybe<Scalars['String']['input']>;
  migratedToV4PoolId?: InputMaybe<Scalars['String']['input']>;
  migratedToV4PoolId_contains?: InputMaybe<Scalars['String']['input']>;
  migratedToV4PoolId_ends_with?: InputMaybe<Scalars['String']['input']>;
  migratedToV4PoolId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  migratedToV4PoolId_not?: InputMaybe<Scalars['String']['input']>;
  migratedToV4PoolId_not_contains?: InputMaybe<Scalars['String']['input']>;
  migratedToV4PoolId_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  migratedToV4PoolId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  migratedToV4PoolId_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  migratedToV4PoolId_starts_with?: InputMaybe<Scalars['String']['input']>;
  migrated_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  migrated_not?: InputMaybe<Scalars['Boolean']['input']>;
  migrated_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  minThreshold?: InputMaybe<Scalars['BigInt']['input']>;
  minThreshold_gt?: InputMaybe<Scalars['BigInt']['input']>;
  minThreshold_gte?: InputMaybe<Scalars['BigInt']['input']>;
  minThreshold_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  minThreshold_lt?: InputMaybe<Scalars['BigInt']['input']>;
  minThreshold_lte?: InputMaybe<Scalars['BigInt']['input']>;
  minThreshold_not?: InputMaybe<Scalars['BigInt']['input']>;
  minThreshold_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  percentDayChange?: InputMaybe<Scalars['Float']['input']>;
  percentDayChange_gt?: InputMaybe<Scalars['Float']['input']>;
  percentDayChange_gte?: InputMaybe<Scalars['Float']['input']>;
  percentDayChange_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  percentDayChange_lt?: InputMaybe<Scalars['Float']['input']>;
  percentDayChange_lte?: InputMaybe<Scalars['Float']['input']>;
  percentDayChange_not?: InputMaybe<Scalars['Float']['input']>;
  percentDayChange_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  price?: InputMaybe<Scalars['BigInt']['input']>;
  price_gt?: InputMaybe<Scalars['BigInt']['input']>;
  price_gte?: InputMaybe<Scalars['BigInt']['input']>;
  price_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  price_lt?: InputMaybe<Scalars['BigInt']['input']>;
  price_lte?: InputMaybe<Scalars['BigInt']['input']>;
  price_not?: InputMaybe<Scalars['BigInt']['input']>;
  price_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  quoteToken?: InputMaybe<Scalars['String']['input']>;
  quoteToken_contains?: InputMaybe<Scalars['String']['input']>;
  quoteToken_ends_with?: InputMaybe<Scalars['String']['input']>;
  quoteToken_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  quoteToken_not?: InputMaybe<Scalars['String']['input']>;
  quoteToken_not_contains?: InputMaybe<Scalars['String']['input']>;
  quoteToken_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  quoteToken_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  quoteToken_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  quoteToken_starts_with?: InputMaybe<Scalars['String']['input']>;
  reserves0?: InputMaybe<Scalars['BigInt']['input']>;
  reserves0_gt?: InputMaybe<Scalars['BigInt']['input']>;
  reserves0_gte?: InputMaybe<Scalars['BigInt']['input']>;
  reserves0_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  reserves0_lt?: InputMaybe<Scalars['BigInt']['input']>;
  reserves0_lte?: InputMaybe<Scalars['BigInt']['input']>;
  reserves0_not?: InputMaybe<Scalars['BigInt']['input']>;
  reserves0_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  reserves1?: InputMaybe<Scalars['BigInt']['input']>;
  reserves1_gt?: InputMaybe<Scalars['BigInt']['input']>;
  reserves1_gte?: InputMaybe<Scalars['BigInt']['input']>;
  reserves1_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  reserves1_lt?: InputMaybe<Scalars['BigInt']['input']>;
  reserves1_lte?: InputMaybe<Scalars['BigInt']['input']>;
  reserves1_not?: InputMaybe<Scalars['BigInt']['input']>;
  reserves1_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  sqrtPrice?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_gt?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_gte?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  sqrtPrice_lt?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_lte?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_not?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  tick?: InputMaybe<Scalars['Int']['input']>;
  tick_gt?: InputMaybe<Scalars['Int']['input']>;
  tick_gte?: InputMaybe<Scalars['Int']['input']>;
  tick_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  tick_lt?: InputMaybe<Scalars['Int']['input']>;
  tick_lte?: InputMaybe<Scalars['Int']['input']>;
  tick_not?: InputMaybe<Scalars['Int']['input']>;
  tick_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  totalFee0?: InputMaybe<Scalars['BigInt']['input']>;
  totalFee0_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalFee0_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalFee0_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  totalFee0_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalFee0_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalFee0_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalFee0_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  totalFee1?: InputMaybe<Scalars['BigInt']['input']>;
  totalFee1_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalFee1_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalFee1_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  totalFee1_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalFee1_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalFee1_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalFee1_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  totalProceeds?: InputMaybe<Scalars['BigInt']['input']>;
  totalProceeds_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalProceeds_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalProceeds_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  totalProceeds_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalProceeds_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalProceeds_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalProceeds_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  totalTokensSold?: InputMaybe<Scalars['BigInt']['input']>;
  totalTokensSold_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalTokensSold_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalTokensSold_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  totalTokensSold_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalTokensSold_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalTokensSold_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalTokensSold_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  type?: InputMaybe<Scalars['String']['input']>;
  type_contains?: InputMaybe<Scalars['String']['input']>;
  type_ends_with?: InputMaybe<Scalars['String']['input']>;
  type_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  type_not?: InputMaybe<Scalars['String']['input']>;
  type_not_contains?: InputMaybe<Scalars['String']['input']>;
  type_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  type_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  type_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  type_starts_with?: InputMaybe<Scalars['String']['input']>;
  volumeUsd?: InputMaybe<Scalars['BigInt']['input']>;
  volumeUsd_gt?: InputMaybe<Scalars['BigInt']['input']>;
  volumeUsd_gte?: InputMaybe<Scalars['BigInt']['input']>;
  volumeUsd_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  volumeUsd_lt?: InputMaybe<Scalars['BigInt']['input']>;
  volumeUsd_lte?: InputMaybe<Scalars['BigInt']['input']>;
  volumeUsd_not?: InputMaybe<Scalars['BigInt']['input']>;
  volumeUsd_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
};

export type PoolPage = {
  __typename?: 'poolPage';
  items: Array<Pool>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type Position = {
  __typename?: 'position';
  chainId: Scalars['BigInt']['output'];
  createdAt: Scalars['BigInt']['output'];
  liquidity: Scalars['BigInt']['output'];
  owner: Scalars['String']['output'];
  pool?: Maybe<Pool>;
  tickLower: Scalars['Int']['output'];
  tickUpper: Scalars['Int']['output'];
};

export type PositionFilter = {
  AND?: InputMaybe<Array<InputMaybe<PositionFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<PositionFilter>>>;
  chainId?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_gt?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_gte?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  chainId_lt?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_lte?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_not?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  createdAt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_gt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_gte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  createdAt_lt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_lte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_not?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  liquidity?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_gt?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_gte?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  liquidity_lt?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_lte?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_not?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  owner?: InputMaybe<Scalars['String']['input']>;
  owner_contains?: InputMaybe<Scalars['String']['input']>;
  owner_ends_with?: InputMaybe<Scalars['String']['input']>;
  owner_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  owner_not?: InputMaybe<Scalars['String']['input']>;
  owner_not_contains?: InputMaybe<Scalars['String']['input']>;
  owner_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  owner_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  owner_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  owner_starts_with?: InputMaybe<Scalars['String']['input']>;
  pool?: InputMaybe<Scalars['String']['input']>;
  pool_contains?: InputMaybe<Scalars['String']['input']>;
  pool_ends_with?: InputMaybe<Scalars['String']['input']>;
  pool_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  pool_not?: InputMaybe<Scalars['String']['input']>;
  pool_not_contains?: InputMaybe<Scalars['String']['input']>;
  pool_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  pool_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  pool_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  pool_starts_with?: InputMaybe<Scalars['String']['input']>;
  tickLower?: InputMaybe<Scalars['Int']['input']>;
  tickLower_gt?: InputMaybe<Scalars['Int']['input']>;
  tickLower_gte?: InputMaybe<Scalars['Int']['input']>;
  tickLower_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  tickLower_lt?: InputMaybe<Scalars['Int']['input']>;
  tickLower_lte?: InputMaybe<Scalars['Int']['input']>;
  tickLower_not?: InputMaybe<Scalars['Int']['input']>;
  tickLower_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  tickUpper?: InputMaybe<Scalars['Int']['input']>;
  tickUpper_gt?: InputMaybe<Scalars['Int']['input']>;
  tickUpper_gte?: InputMaybe<Scalars['Int']['input']>;
  tickUpper_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  tickUpper_lt?: InputMaybe<Scalars['Int']['input']>;
  tickUpper_lte?: InputMaybe<Scalars['Int']['input']>;
  tickUpper_not?: InputMaybe<Scalars['Int']['input']>;
  tickUpper_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
};

export type PositionPage = {
  __typename?: 'positionPage';
  items: Array<Position>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type Swap = {
  __typename?: 'swap';
  amountIn: Scalars['BigInt']['output'];
  amountOut: Scalars['BigInt']['output'];
  asset?: Maybe<Asset>;
  chainId: Scalars['BigInt']['output'];
  pool?: Maybe<Pool>;
  timestamp: Scalars['BigInt']['output'];
  txHash: Scalars['String']['output'];
  type: Scalars['String']['output'];
  usdPrice: Scalars['BigInt']['output'];
  user: Scalars['String']['output'];
};

export type SwapFilter = {
  AND?: InputMaybe<Array<InputMaybe<SwapFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<SwapFilter>>>;
  amountIn?: InputMaybe<Scalars['BigInt']['input']>;
  amountIn_gt?: InputMaybe<Scalars['BigInt']['input']>;
  amountIn_gte?: InputMaybe<Scalars['BigInt']['input']>;
  amountIn_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  amountIn_lt?: InputMaybe<Scalars['BigInt']['input']>;
  amountIn_lte?: InputMaybe<Scalars['BigInt']['input']>;
  amountIn_not?: InputMaybe<Scalars['BigInt']['input']>;
  amountIn_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  amountOut?: InputMaybe<Scalars['BigInt']['input']>;
  amountOut_gt?: InputMaybe<Scalars['BigInt']['input']>;
  amountOut_gte?: InputMaybe<Scalars['BigInt']['input']>;
  amountOut_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  amountOut_lt?: InputMaybe<Scalars['BigInt']['input']>;
  amountOut_lte?: InputMaybe<Scalars['BigInt']['input']>;
  amountOut_not?: InputMaybe<Scalars['BigInt']['input']>;
  amountOut_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  asset?: InputMaybe<Scalars['String']['input']>;
  asset_contains?: InputMaybe<Scalars['String']['input']>;
  asset_ends_with?: InputMaybe<Scalars['String']['input']>;
  asset_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  asset_not?: InputMaybe<Scalars['String']['input']>;
  asset_not_contains?: InputMaybe<Scalars['String']['input']>;
  asset_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  asset_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  asset_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  asset_starts_with?: InputMaybe<Scalars['String']['input']>;
  chainId?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_gt?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_gte?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  chainId_lt?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_lte?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_not?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  pool?: InputMaybe<Scalars['String']['input']>;
  pool_contains?: InputMaybe<Scalars['String']['input']>;
  pool_ends_with?: InputMaybe<Scalars['String']['input']>;
  pool_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  pool_not?: InputMaybe<Scalars['String']['input']>;
  pool_not_contains?: InputMaybe<Scalars['String']['input']>;
  pool_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  pool_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  pool_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  pool_starts_with?: InputMaybe<Scalars['String']['input']>;
  timestamp?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  txHash?: InputMaybe<Scalars['String']['input']>;
  txHash_contains?: InputMaybe<Scalars['String']['input']>;
  txHash_ends_with?: InputMaybe<Scalars['String']['input']>;
  txHash_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  txHash_not?: InputMaybe<Scalars['String']['input']>;
  txHash_not_contains?: InputMaybe<Scalars['String']['input']>;
  txHash_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  txHash_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  txHash_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  txHash_starts_with?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  type_contains?: InputMaybe<Scalars['String']['input']>;
  type_ends_with?: InputMaybe<Scalars['String']['input']>;
  type_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  type_not?: InputMaybe<Scalars['String']['input']>;
  type_not_contains?: InputMaybe<Scalars['String']['input']>;
  type_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  type_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  type_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  type_starts_with?: InputMaybe<Scalars['String']['input']>;
  usdPrice?: InputMaybe<Scalars['BigInt']['input']>;
  usdPrice_gt?: InputMaybe<Scalars['BigInt']['input']>;
  usdPrice_gte?: InputMaybe<Scalars['BigInt']['input']>;
  usdPrice_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  usdPrice_lt?: InputMaybe<Scalars['BigInt']['input']>;
  usdPrice_lte?: InputMaybe<Scalars['BigInt']['input']>;
  usdPrice_not?: InputMaybe<Scalars['BigInt']['input']>;
  usdPrice_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  user?: InputMaybe<Scalars['String']['input']>;
  user_contains?: InputMaybe<Scalars['String']['input']>;
  user_ends_with?: InputMaybe<Scalars['String']['input']>;
  user_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  user_not?: InputMaybe<Scalars['String']['input']>;
  user_not_contains?: InputMaybe<Scalars['String']['input']>;
  user_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  user_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  user_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  user_starts_with?: InputMaybe<Scalars['String']['input']>;
};

export type SwapPage = {
  __typename?: 'swapPage';
  items: Array<Swap>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type Token = {
  __typename?: 'token';
  address: Scalars['String']['output'];
  chainId: Scalars['BigInt']['output'];
  creatorAddress: Scalars['String']['output'];
  decimals: Scalars['Int']['output'];
  derc20Data?: Maybe<Asset>;
  firstSeenAt: Scalars['BigInt']['output'];
  holderCount: Scalars['Int']['output'];
  image?: Maybe<Scalars['String']['output']>;
  isDerc20: Scalars['Boolean']['output'];
  lastSeenAt: Scalars['BigInt']['output'];
  name: Scalars['String']['output'];
  pool?: Maybe<Pool>;
  symbol: Scalars['String']['output'];
  tokenUriData: Scalars['JSON']['output'];
  totalSupply: Scalars['BigInt']['output'];
  volumeUsd: Scalars['BigInt']['output'];
};

export type TokenFilter = {
  AND?: InputMaybe<Array<InputMaybe<TokenFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<TokenFilter>>>;
  address?: InputMaybe<Scalars['String']['input']>;
  address_contains?: InputMaybe<Scalars['String']['input']>;
  address_ends_with?: InputMaybe<Scalars['String']['input']>;
  address_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  address_not?: InputMaybe<Scalars['String']['input']>;
  address_not_contains?: InputMaybe<Scalars['String']['input']>;
  address_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  address_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  address_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  address_starts_with?: InputMaybe<Scalars['String']['input']>;
  chainId?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_gt?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_gte?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  chainId_lt?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_lte?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_not?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  creatorAddress?: InputMaybe<Scalars['String']['input']>;
  creatorAddress_contains?: InputMaybe<Scalars['String']['input']>;
  creatorAddress_ends_with?: InputMaybe<Scalars['String']['input']>;
  creatorAddress_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  creatorAddress_not?: InputMaybe<Scalars['String']['input']>;
  creatorAddress_not_contains?: InputMaybe<Scalars['String']['input']>;
  creatorAddress_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  creatorAddress_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  creatorAddress_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  creatorAddress_starts_with?: InputMaybe<Scalars['String']['input']>;
  decimals?: InputMaybe<Scalars['Int']['input']>;
  decimals_gt?: InputMaybe<Scalars['Int']['input']>;
  decimals_gte?: InputMaybe<Scalars['Int']['input']>;
  decimals_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  decimals_lt?: InputMaybe<Scalars['Int']['input']>;
  decimals_lte?: InputMaybe<Scalars['Int']['input']>;
  decimals_not?: InputMaybe<Scalars['Int']['input']>;
  decimals_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  derc20Data?: InputMaybe<Scalars['String']['input']>;
  derc20Data_contains?: InputMaybe<Scalars['String']['input']>;
  derc20Data_ends_with?: InputMaybe<Scalars['String']['input']>;
  derc20Data_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  derc20Data_not?: InputMaybe<Scalars['String']['input']>;
  derc20Data_not_contains?: InputMaybe<Scalars['String']['input']>;
  derc20Data_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  derc20Data_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  derc20Data_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  derc20Data_starts_with?: InputMaybe<Scalars['String']['input']>;
  firstSeenAt?: InputMaybe<Scalars['BigInt']['input']>;
  firstSeenAt_gt?: InputMaybe<Scalars['BigInt']['input']>;
  firstSeenAt_gte?: InputMaybe<Scalars['BigInt']['input']>;
  firstSeenAt_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  firstSeenAt_lt?: InputMaybe<Scalars['BigInt']['input']>;
  firstSeenAt_lte?: InputMaybe<Scalars['BigInt']['input']>;
  firstSeenAt_not?: InputMaybe<Scalars['BigInt']['input']>;
  firstSeenAt_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  holderCount?: InputMaybe<Scalars['Int']['input']>;
  holderCount_gt?: InputMaybe<Scalars['Int']['input']>;
  holderCount_gte?: InputMaybe<Scalars['Int']['input']>;
  holderCount_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  holderCount_lt?: InputMaybe<Scalars['Int']['input']>;
  holderCount_lte?: InputMaybe<Scalars['Int']['input']>;
  holderCount_not?: InputMaybe<Scalars['Int']['input']>;
  holderCount_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  image?: InputMaybe<Scalars['String']['input']>;
  image_contains?: InputMaybe<Scalars['String']['input']>;
  image_ends_with?: InputMaybe<Scalars['String']['input']>;
  image_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  image_not?: InputMaybe<Scalars['String']['input']>;
  image_not_contains?: InputMaybe<Scalars['String']['input']>;
  image_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  image_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  image_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  image_starts_with?: InputMaybe<Scalars['String']['input']>;
  isDerc20?: InputMaybe<Scalars['Boolean']['input']>;
  isDerc20_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  isDerc20_not?: InputMaybe<Scalars['Boolean']['input']>;
  isDerc20_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  lastSeenAt?: InputMaybe<Scalars['BigInt']['input']>;
  lastSeenAt_gt?: InputMaybe<Scalars['BigInt']['input']>;
  lastSeenAt_gte?: InputMaybe<Scalars['BigInt']['input']>;
  lastSeenAt_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  lastSeenAt_lt?: InputMaybe<Scalars['BigInt']['input']>;
  lastSeenAt_lte?: InputMaybe<Scalars['BigInt']['input']>;
  lastSeenAt_not?: InputMaybe<Scalars['BigInt']['input']>;
  lastSeenAt_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_contains?: InputMaybe<Scalars['String']['input']>;
  name_ends_with?: InputMaybe<Scalars['String']['input']>;
  name_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  name_not?: InputMaybe<Scalars['String']['input']>;
  name_not_contains?: InputMaybe<Scalars['String']['input']>;
  name_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  name_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  name_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  name_starts_with?: InputMaybe<Scalars['String']['input']>;
  pool?: InputMaybe<Scalars['String']['input']>;
  pool_contains?: InputMaybe<Scalars['String']['input']>;
  pool_ends_with?: InputMaybe<Scalars['String']['input']>;
  pool_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  pool_not?: InputMaybe<Scalars['String']['input']>;
  pool_not_contains?: InputMaybe<Scalars['String']['input']>;
  pool_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  pool_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  pool_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  pool_starts_with?: InputMaybe<Scalars['String']['input']>;
  symbol?: InputMaybe<Scalars['String']['input']>;
  symbol_contains?: InputMaybe<Scalars['String']['input']>;
  symbol_ends_with?: InputMaybe<Scalars['String']['input']>;
  symbol_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  symbol_not?: InputMaybe<Scalars['String']['input']>;
  symbol_not_contains?: InputMaybe<Scalars['String']['input']>;
  symbol_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  symbol_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  symbol_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  symbol_starts_with?: InputMaybe<Scalars['String']['input']>;
  totalSupply?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  totalSupply_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  volumeUsd?: InputMaybe<Scalars['BigInt']['input']>;
  volumeUsd_gt?: InputMaybe<Scalars['BigInt']['input']>;
  volumeUsd_gte?: InputMaybe<Scalars['BigInt']['input']>;
  volumeUsd_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  volumeUsd_lt?: InputMaybe<Scalars['BigInt']['input']>;
  volumeUsd_lte?: InputMaybe<Scalars['BigInt']['input']>;
  volumeUsd_not?: InputMaybe<Scalars['BigInt']['input']>;
  volumeUsd_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
};

export type TokenPage = {
  __typename?: 'tokenPage';
  items: Array<Token>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type User = {
  __typename?: 'user';
  address: Scalars['String']['output'];
  createdAt: Scalars['BigInt']['output'];
  lastSeenAt: Scalars['BigInt']['output'];
  userAssets?: Maybe<UserAssetPage>;
};


export type UserUserAssetsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<UserAssetFilter>;
};

export type UserAsset = {
  __typename?: 'userAsset';
  asset?: Maybe<Asset>;
  assetId: Scalars['String']['output'];
  balance: Scalars['BigInt']['output'];
  chainId: Scalars['BigInt']['output'];
  createdAt: Scalars['BigInt']['output'];
  lastInteraction: Scalars['BigInt']['output'];
  user?: Maybe<User>;
  userId: Scalars['String']['output'];
};

export type UserAssetFilter = {
  AND?: InputMaybe<Array<InputMaybe<UserAssetFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<UserAssetFilter>>>;
  assetId?: InputMaybe<Scalars['String']['input']>;
  assetId_contains?: InputMaybe<Scalars['String']['input']>;
  assetId_ends_with?: InputMaybe<Scalars['String']['input']>;
  assetId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  assetId_not?: InputMaybe<Scalars['String']['input']>;
  assetId_not_contains?: InputMaybe<Scalars['String']['input']>;
  assetId_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  assetId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  assetId_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  assetId_starts_with?: InputMaybe<Scalars['String']['input']>;
  balance?: InputMaybe<Scalars['BigInt']['input']>;
  balance_gt?: InputMaybe<Scalars['BigInt']['input']>;
  balance_gte?: InputMaybe<Scalars['BigInt']['input']>;
  balance_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  balance_lt?: InputMaybe<Scalars['BigInt']['input']>;
  balance_lte?: InputMaybe<Scalars['BigInt']['input']>;
  balance_not?: InputMaybe<Scalars['BigInt']['input']>;
  balance_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  chainId?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_gt?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_gte?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  chainId_lt?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_lte?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_not?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  createdAt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_gt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_gte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  createdAt_lt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_lte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_not?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  lastInteraction?: InputMaybe<Scalars['BigInt']['input']>;
  lastInteraction_gt?: InputMaybe<Scalars['BigInt']['input']>;
  lastInteraction_gte?: InputMaybe<Scalars['BigInt']['input']>;
  lastInteraction_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  lastInteraction_lt?: InputMaybe<Scalars['BigInt']['input']>;
  lastInteraction_lte?: InputMaybe<Scalars['BigInt']['input']>;
  lastInteraction_not?: InputMaybe<Scalars['BigInt']['input']>;
  lastInteraction_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  userId?: InputMaybe<Scalars['String']['input']>;
  userId_contains?: InputMaybe<Scalars['String']['input']>;
  userId_ends_with?: InputMaybe<Scalars['String']['input']>;
  userId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  userId_not?: InputMaybe<Scalars['String']['input']>;
  userId_not_contains?: InputMaybe<Scalars['String']['input']>;
  userId_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  userId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  userId_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  userId_starts_with?: InputMaybe<Scalars['String']['input']>;
};

export type UserAssetPage = {
  __typename?: 'userAssetPage';
  items: Array<UserAsset>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type UserFilter = {
  AND?: InputMaybe<Array<InputMaybe<UserFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<UserFilter>>>;
  address?: InputMaybe<Scalars['String']['input']>;
  address_contains?: InputMaybe<Scalars['String']['input']>;
  address_ends_with?: InputMaybe<Scalars['String']['input']>;
  address_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  address_not?: InputMaybe<Scalars['String']['input']>;
  address_not_contains?: InputMaybe<Scalars['String']['input']>;
  address_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  address_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  address_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  address_starts_with?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_gt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_gte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  createdAt_lt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_lte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_not?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  lastSeenAt?: InputMaybe<Scalars['BigInt']['input']>;
  lastSeenAt_gt?: InputMaybe<Scalars['BigInt']['input']>;
  lastSeenAt_gte?: InputMaybe<Scalars['BigInt']['input']>;
  lastSeenAt_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  lastSeenAt_lt?: InputMaybe<Scalars['BigInt']['input']>;
  lastSeenAt_lte?: InputMaybe<Scalars['BigInt']['input']>;
  lastSeenAt_not?: InputMaybe<Scalars['BigInt']['input']>;
  lastSeenAt_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
};

export type UserPage = {
  __typename?: 'userPage';
  items: Array<User>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type V2Pool = {
  __typename?: 'v2Pool';
  address: Scalars['String']['output'];
  baseToken: Scalars['String']['output'];
  chainId: Scalars['BigInt']['output'];
  isToken0: Scalars['Boolean']['output'];
  migrated: Scalars['Boolean']['output'];
  migratedAt?: Maybe<Scalars['BigInt']['output']>;
  parentPool: Scalars['String']['output'];
  price: Scalars['BigInt']['output'];
  quoteToken: Scalars['String']['output'];
  reserveBaseToken: Scalars['BigInt']['output'];
  reserveQuoteToken: Scalars['BigInt']['output'];
  totalFeeBaseToken: Scalars['BigInt']['output'];
  totalFeeQuoteToken: Scalars['BigInt']['output'];
  v3Pool?: Maybe<Pool>;
};

export type V2PoolFilter = {
  AND?: InputMaybe<Array<InputMaybe<V2PoolFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<V2PoolFilter>>>;
  address?: InputMaybe<Scalars['String']['input']>;
  address_contains?: InputMaybe<Scalars['String']['input']>;
  address_ends_with?: InputMaybe<Scalars['String']['input']>;
  address_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  address_not?: InputMaybe<Scalars['String']['input']>;
  address_not_contains?: InputMaybe<Scalars['String']['input']>;
  address_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  address_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  address_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  address_starts_with?: InputMaybe<Scalars['String']['input']>;
  baseToken?: InputMaybe<Scalars['String']['input']>;
  baseToken_contains?: InputMaybe<Scalars['String']['input']>;
  baseToken_ends_with?: InputMaybe<Scalars['String']['input']>;
  baseToken_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  baseToken_not?: InputMaybe<Scalars['String']['input']>;
  baseToken_not_contains?: InputMaybe<Scalars['String']['input']>;
  baseToken_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  baseToken_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  baseToken_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  baseToken_starts_with?: InputMaybe<Scalars['String']['input']>;
  chainId?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_gt?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_gte?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  chainId_lt?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_lte?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_not?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  isToken0?: InputMaybe<Scalars['Boolean']['input']>;
  isToken0_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  isToken0_not?: InputMaybe<Scalars['Boolean']['input']>;
  isToken0_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  migrated?: InputMaybe<Scalars['Boolean']['input']>;
  migratedAt?: InputMaybe<Scalars['BigInt']['input']>;
  migratedAt_gt?: InputMaybe<Scalars['BigInt']['input']>;
  migratedAt_gte?: InputMaybe<Scalars['BigInt']['input']>;
  migratedAt_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  migratedAt_lt?: InputMaybe<Scalars['BigInt']['input']>;
  migratedAt_lte?: InputMaybe<Scalars['BigInt']['input']>;
  migratedAt_not?: InputMaybe<Scalars['BigInt']['input']>;
  migratedAt_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  migrated_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  migrated_not?: InputMaybe<Scalars['Boolean']['input']>;
  migrated_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  parentPool?: InputMaybe<Scalars['String']['input']>;
  parentPool_contains?: InputMaybe<Scalars['String']['input']>;
  parentPool_ends_with?: InputMaybe<Scalars['String']['input']>;
  parentPool_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  parentPool_not?: InputMaybe<Scalars['String']['input']>;
  parentPool_not_contains?: InputMaybe<Scalars['String']['input']>;
  parentPool_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  parentPool_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  parentPool_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  parentPool_starts_with?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['BigInt']['input']>;
  price_gt?: InputMaybe<Scalars['BigInt']['input']>;
  price_gte?: InputMaybe<Scalars['BigInt']['input']>;
  price_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  price_lt?: InputMaybe<Scalars['BigInt']['input']>;
  price_lte?: InputMaybe<Scalars['BigInt']['input']>;
  price_not?: InputMaybe<Scalars['BigInt']['input']>;
  price_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  quoteToken?: InputMaybe<Scalars['String']['input']>;
  quoteToken_contains?: InputMaybe<Scalars['String']['input']>;
  quoteToken_ends_with?: InputMaybe<Scalars['String']['input']>;
  quoteToken_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  quoteToken_not?: InputMaybe<Scalars['String']['input']>;
  quoteToken_not_contains?: InputMaybe<Scalars['String']['input']>;
  quoteToken_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  quoteToken_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  quoteToken_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  quoteToken_starts_with?: InputMaybe<Scalars['String']['input']>;
  reserveBaseToken?: InputMaybe<Scalars['BigInt']['input']>;
  reserveBaseToken_gt?: InputMaybe<Scalars['BigInt']['input']>;
  reserveBaseToken_gte?: InputMaybe<Scalars['BigInt']['input']>;
  reserveBaseToken_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  reserveBaseToken_lt?: InputMaybe<Scalars['BigInt']['input']>;
  reserveBaseToken_lte?: InputMaybe<Scalars['BigInt']['input']>;
  reserveBaseToken_not?: InputMaybe<Scalars['BigInt']['input']>;
  reserveBaseToken_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  reserveQuoteToken?: InputMaybe<Scalars['BigInt']['input']>;
  reserveQuoteToken_gt?: InputMaybe<Scalars['BigInt']['input']>;
  reserveQuoteToken_gte?: InputMaybe<Scalars['BigInt']['input']>;
  reserveQuoteToken_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  reserveQuoteToken_lt?: InputMaybe<Scalars['BigInt']['input']>;
  reserveQuoteToken_lte?: InputMaybe<Scalars['BigInt']['input']>;
  reserveQuoteToken_not?: InputMaybe<Scalars['BigInt']['input']>;
  reserveQuoteToken_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  totalFeeBaseToken?: InputMaybe<Scalars['BigInt']['input']>;
  totalFeeBaseToken_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalFeeBaseToken_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalFeeBaseToken_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  totalFeeBaseToken_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalFeeBaseToken_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalFeeBaseToken_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalFeeBaseToken_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  totalFeeQuoteToken?: InputMaybe<Scalars['BigInt']['input']>;
  totalFeeQuoteToken_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalFeeQuoteToken_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalFeeQuoteToken_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  totalFeeQuoteToken_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalFeeQuoteToken_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalFeeQuoteToken_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalFeeQuoteToken_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  v3Pool?: InputMaybe<Scalars['String']['input']>;
  v3Pool_contains?: InputMaybe<Scalars['String']['input']>;
  v3Pool_ends_with?: InputMaybe<Scalars['String']['input']>;
  v3Pool_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  v3Pool_not?: InputMaybe<Scalars['String']['input']>;
  v3Pool_not_contains?: InputMaybe<Scalars['String']['input']>;
  v3Pool_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  v3Pool_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  v3Pool_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  v3Pool_starts_with?: InputMaybe<Scalars['String']['input']>;
};

export type V2PoolPage = {
  __typename?: 'v2PoolPage';
  items: Array<V2Pool>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type V4CheckpointBlob = {
  __typename?: 'v4CheckpointBlob';
  chainId: Scalars['Int']['output'];
  checkpoints: Scalars['JSON']['output'];
};

export type V4CheckpointBlobFilter = {
  AND?: InputMaybe<Array<InputMaybe<V4CheckpointBlobFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<V4CheckpointBlobFilter>>>;
  chainId?: InputMaybe<Scalars['Int']['input']>;
  chainId_gt?: InputMaybe<Scalars['Int']['input']>;
  chainId_gte?: InputMaybe<Scalars['Int']['input']>;
  chainId_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  chainId_lt?: InputMaybe<Scalars['Int']['input']>;
  chainId_lte?: InputMaybe<Scalars['Int']['input']>;
  chainId_not?: InputMaybe<Scalars['Int']['input']>;
  chainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
};

export type V4CheckpointBlobPage = {
  __typename?: 'v4CheckpointBlobPage';
  items: Array<V4CheckpointBlob>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type V4PoolConfig = {
  __typename?: 'v4PoolConfig';
  endingTick: Scalars['Int']['output'];
  endingTime: Scalars['BigInt']['output'];
  epochLength: Scalars['BigInt']['output'];
  gamma: Scalars['Int']['output'];
  hookAddress: Scalars['String']['output'];
  isToken0: Scalars['Boolean']['output'];
  maxProceeds: Scalars['BigInt']['output'];
  minProceeds: Scalars['BigInt']['output'];
  numPdSlugs: Scalars['BigInt']['output'];
  numTokensToSell: Scalars['BigInt']['output'];
  startingTick: Scalars['Int']['output'];
  startingTime: Scalars['BigInt']['output'];
};

export type V4PoolConfigFilter = {
  AND?: InputMaybe<Array<InputMaybe<V4PoolConfigFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<V4PoolConfigFilter>>>;
  endingTick?: InputMaybe<Scalars['Int']['input']>;
  endingTick_gt?: InputMaybe<Scalars['Int']['input']>;
  endingTick_gte?: InputMaybe<Scalars['Int']['input']>;
  endingTick_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  endingTick_lt?: InputMaybe<Scalars['Int']['input']>;
  endingTick_lte?: InputMaybe<Scalars['Int']['input']>;
  endingTick_not?: InputMaybe<Scalars['Int']['input']>;
  endingTick_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  endingTime?: InputMaybe<Scalars['BigInt']['input']>;
  endingTime_gt?: InputMaybe<Scalars['BigInt']['input']>;
  endingTime_gte?: InputMaybe<Scalars['BigInt']['input']>;
  endingTime_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  endingTime_lt?: InputMaybe<Scalars['BigInt']['input']>;
  endingTime_lte?: InputMaybe<Scalars['BigInt']['input']>;
  endingTime_not?: InputMaybe<Scalars['BigInt']['input']>;
  endingTime_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  epochLength?: InputMaybe<Scalars['BigInt']['input']>;
  epochLength_gt?: InputMaybe<Scalars['BigInt']['input']>;
  epochLength_gte?: InputMaybe<Scalars['BigInt']['input']>;
  epochLength_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  epochLength_lt?: InputMaybe<Scalars['BigInt']['input']>;
  epochLength_lte?: InputMaybe<Scalars['BigInt']['input']>;
  epochLength_not?: InputMaybe<Scalars['BigInt']['input']>;
  epochLength_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  gamma?: InputMaybe<Scalars['Int']['input']>;
  gamma_gt?: InputMaybe<Scalars['Int']['input']>;
  gamma_gte?: InputMaybe<Scalars['Int']['input']>;
  gamma_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  gamma_lt?: InputMaybe<Scalars['Int']['input']>;
  gamma_lte?: InputMaybe<Scalars['Int']['input']>;
  gamma_not?: InputMaybe<Scalars['Int']['input']>;
  gamma_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  hookAddress?: InputMaybe<Scalars['String']['input']>;
  hookAddress_contains?: InputMaybe<Scalars['String']['input']>;
  hookAddress_ends_with?: InputMaybe<Scalars['String']['input']>;
  hookAddress_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  hookAddress_not?: InputMaybe<Scalars['String']['input']>;
  hookAddress_not_contains?: InputMaybe<Scalars['String']['input']>;
  hookAddress_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  hookAddress_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  hookAddress_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  hookAddress_starts_with?: InputMaybe<Scalars['String']['input']>;
  isToken0?: InputMaybe<Scalars['Boolean']['input']>;
  isToken0_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  isToken0_not?: InputMaybe<Scalars['Boolean']['input']>;
  isToken0_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  maxProceeds?: InputMaybe<Scalars['BigInt']['input']>;
  maxProceeds_gt?: InputMaybe<Scalars['BigInt']['input']>;
  maxProceeds_gte?: InputMaybe<Scalars['BigInt']['input']>;
  maxProceeds_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  maxProceeds_lt?: InputMaybe<Scalars['BigInt']['input']>;
  maxProceeds_lte?: InputMaybe<Scalars['BigInt']['input']>;
  maxProceeds_not?: InputMaybe<Scalars['BigInt']['input']>;
  maxProceeds_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  minProceeds?: InputMaybe<Scalars['BigInt']['input']>;
  minProceeds_gt?: InputMaybe<Scalars['BigInt']['input']>;
  minProceeds_gte?: InputMaybe<Scalars['BigInt']['input']>;
  minProceeds_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  minProceeds_lt?: InputMaybe<Scalars['BigInt']['input']>;
  minProceeds_lte?: InputMaybe<Scalars['BigInt']['input']>;
  minProceeds_not?: InputMaybe<Scalars['BigInt']['input']>;
  minProceeds_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  numPdSlugs?: InputMaybe<Scalars['BigInt']['input']>;
  numPdSlugs_gt?: InputMaybe<Scalars['BigInt']['input']>;
  numPdSlugs_gte?: InputMaybe<Scalars['BigInt']['input']>;
  numPdSlugs_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  numPdSlugs_lt?: InputMaybe<Scalars['BigInt']['input']>;
  numPdSlugs_lte?: InputMaybe<Scalars['BigInt']['input']>;
  numPdSlugs_not?: InputMaybe<Scalars['BigInt']['input']>;
  numPdSlugs_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  numTokensToSell?: InputMaybe<Scalars['BigInt']['input']>;
  numTokensToSell_gt?: InputMaybe<Scalars['BigInt']['input']>;
  numTokensToSell_gte?: InputMaybe<Scalars['BigInt']['input']>;
  numTokensToSell_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  numTokensToSell_lt?: InputMaybe<Scalars['BigInt']['input']>;
  numTokensToSell_lte?: InputMaybe<Scalars['BigInt']['input']>;
  numTokensToSell_not?: InputMaybe<Scalars['BigInt']['input']>;
  numTokensToSell_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  startingTick?: InputMaybe<Scalars['Int']['input']>;
  startingTick_gt?: InputMaybe<Scalars['Int']['input']>;
  startingTick_gte?: InputMaybe<Scalars['Int']['input']>;
  startingTick_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  startingTick_lt?: InputMaybe<Scalars['Int']['input']>;
  startingTick_lte?: InputMaybe<Scalars['Int']['input']>;
  startingTick_not?: InputMaybe<Scalars['Int']['input']>;
  startingTick_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  startingTime?: InputMaybe<Scalars['BigInt']['input']>;
  startingTime_gt?: InputMaybe<Scalars['BigInt']['input']>;
  startingTime_gte?: InputMaybe<Scalars['BigInt']['input']>;
  startingTime_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  startingTime_lt?: InputMaybe<Scalars['BigInt']['input']>;
  startingTime_lte?: InputMaybe<Scalars['BigInt']['input']>;
  startingTime_not?: InputMaybe<Scalars['BigInt']['input']>;
  startingTime_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
};

export type V4PoolConfigPage = {
  __typename?: 'v4PoolConfigPage';
  items: Array<V4PoolConfig>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type V4PoolPriceHistory = {
  __typename?: 'v4PoolPriceHistory';
  chainId: Scalars['BigInt']['output'];
  history: Scalars['JSON']['output'];
  pool: Scalars['String']['output'];
};

export type V4PoolPriceHistoryFilter = {
  AND?: InputMaybe<Array<InputMaybe<V4PoolPriceHistoryFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<V4PoolPriceHistoryFilter>>>;
  chainId?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_gt?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_gte?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  chainId_lt?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_lte?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_not?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  pool?: InputMaybe<Scalars['String']['input']>;
  pool_contains?: InputMaybe<Scalars['String']['input']>;
  pool_ends_with?: InputMaybe<Scalars['String']['input']>;
  pool_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  pool_not?: InputMaybe<Scalars['String']['input']>;
  pool_not_contains?: InputMaybe<Scalars['String']['input']>;
  pool_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  pool_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  pool_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  pool_starts_with?: InputMaybe<Scalars['String']['input']>;
};

export type V4PoolPriceHistoryPage = {
  __typename?: 'v4PoolPriceHistoryPage';
  items: Array<V4PoolPriceHistory>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type V4pools = {
  __typename?: 'v4pools';
  asset?: Maybe<Asset>;
  baseToken?: Maybe<Token>;
  chainId: Scalars['BigInt']['output'];
  createdAt: Scalars['BigInt']['output'];
  currency0: Scalars['String']['output'];
  currency1: Scalars['String']['output'];
  dailyVolume?: Maybe<DailyVolume>;
  dollarLiquidity: Scalars['BigInt']['output'];
  fee: Scalars['Int']['output'];
  hooks: Scalars['String']['output'];
  isQuoteEth: Scalars['Boolean']['output'];
  isToken0: Scalars['Boolean']['output'];
  lastRefreshed?: Maybe<Scalars['BigInt']['output']>;
  lastSwapTimestamp?: Maybe<Scalars['BigInt']['output']>;
  liquidity: Scalars['BigInt']['output'];
  migratedAt: Scalars['BigInt']['output'];
  migratedFromPool?: Maybe<Pool>;
  migratorVersion: Scalars['String']['output'];
  percentDayChange: Scalars['Float']['output'];
  poolId: Scalars['String']['output'];
  price: Scalars['BigInt']['output'];
  quoteToken?: Maybe<Token>;
  reserves0: Scalars['BigInt']['output'];
  reserves1: Scalars['BigInt']['output'];
  sqrtPriceX96: Scalars['BigInt']['output'];
  tick: Scalars['Int']['output'];
  tickSpacing: Scalars['Int']['output'];
  totalFee0: Scalars['BigInt']['output'];
  totalFee1: Scalars['BigInt']['output'];
  volumeUsd: Scalars['BigInt']['output'];
};

export type V4poolsFilter = {
  AND?: InputMaybe<Array<InputMaybe<V4poolsFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<V4poolsFilter>>>;
  asset?: InputMaybe<Scalars['String']['input']>;
  asset_contains?: InputMaybe<Scalars['String']['input']>;
  asset_ends_with?: InputMaybe<Scalars['String']['input']>;
  asset_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  asset_not?: InputMaybe<Scalars['String']['input']>;
  asset_not_contains?: InputMaybe<Scalars['String']['input']>;
  asset_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  asset_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  asset_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  asset_starts_with?: InputMaybe<Scalars['String']['input']>;
  baseToken?: InputMaybe<Scalars['String']['input']>;
  baseToken_contains?: InputMaybe<Scalars['String']['input']>;
  baseToken_ends_with?: InputMaybe<Scalars['String']['input']>;
  baseToken_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  baseToken_not?: InputMaybe<Scalars['String']['input']>;
  baseToken_not_contains?: InputMaybe<Scalars['String']['input']>;
  baseToken_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  baseToken_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  baseToken_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  baseToken_starts_with?: InputMaybe<Scalars['String']['input']>;
  chainId?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_gt?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_gte?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  chainId_lt?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_lte?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_not?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  createdAt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_gt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_gte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  createdAt_lt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_lte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_not?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  currency0?: InputMaybe<Scalars['String']['input']>;
  currency0_contains?: InputMaybe<Scalars['String']['input']>;
  currency0_ends_with?: InputMaybe<Scalars['String']['input']>;
  currency0_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  currency0_not?: InputMaybe<Scalars['String']['input']>;
  currency0_not_contains?: InputMaybe<Scalars['String']['input']>;
  currency0_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  currency0_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  currency0_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  currency0_starts_with?: InputMaybe<Scalars['String']['input']>;
  currency1?: InputMaybe<Scalars['String']['input']>;
  currency1_contains?: InputMaybe<Scalars['String']['input']>;
  currency1_ends_with?: InputMaybe<Scalars['String']['input']>;
  currency1_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  currency1_not?: InputMaybe<Scalars['String']['input']>;
  currency1_not_contains?: InputMaybe<Scalars['String']['input']>;
  currency1_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  currency1_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  currency1_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  currency1_starts_with?: InputMaybe<Scalars['String']['input']>;
  dailyVolume?: InputMaybe<Scalars['String']['input']>;
  dailyVolume_contains?: InputMaybe<Scalars['String']['input']>;
  dailyVolume_ends_with?: InputMaybe<Scalars['String']['input']>;
  dailyVolume_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  dailyVolume_not?: InputMaybe<Scalars['String']['input']>;
  dailyVolume_not_contains?: InputMaybe<Scalars['String']['input']>;
  dailyVolume_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  dailyVolume_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  dailyVolume_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  dailyVolume_starts_with?: InputMaybe<Scalars['String']['input']>;
  dollarLiquidity?: InputMaybe<Scalars['BigInt']['input']>;
  dollarLiquidity_gt?: InputMaybe<Scalars['BigInt']['input']>;
  dollarLiquidity_gte?: InputMaybe<Scalars['BigInt']['input']>;
  dollarLiquidity_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  dollarLiquidity_lt?: InputMaybe<Scalars['BigInt']['input']>;
  dollarLiquidity_lte?: InputMaybe<Scalars['BigInt']['input']>;
  dollarLiquidity_not?: InputMaybe<Scalars['BigInt']['input']>;
  dollarLiquidity_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  fee?: InputMaybe<Scalars['Int']['input']>;
  fee_gt?: InputMaybe<Scalars['Int']['input']>;
  fee_gte?: InputMaybe<Scalars['Int']['input']>;
  fee_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  fee_lt?: InputMaybe<Scalars['Int']['input']>;
  fee_lte?: InputMaybe<Scalars['Int']['input']>;
  fee_not?: InputMaybe<Scalars['Int']['input']>;
  fee_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  hooks?: InputMaybe<Scalars['String']['input']>;
  hooks_contains?: InputMaybe<Scalars['String']['input']>;
  hooks_ends_with?: InputMaybe<Scalars['String']['input']>;
  hooks_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  hooks_not?: InputMaybe<Scalars['String']['input']>;
  hooks_not_contains?: InputMaybe<Scalars['String']['input']>;
  hooks_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  hooks_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  hooks_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  hooks_starts_with?: InputMaybe<Scalars['String']['input']>;
  isQuoteEth?: InputMaybe<Scalars['Boolean']['input']>;
  isQuoteEth_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  isQuoteEth_not?: InputMaybe<Scalars['Boolean']['input']>;
  isQuoteEth_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  isToken0?: InputMaybe<Scalars['Boolean']['input']>;
  isToken0_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  isToken0_not?: InputMaybe<Scalars['Boolean']['input']>;
  isToken0_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  lastRefreshed?: InputMaybe<Scalars['BigInt']['input']>;
  lastRefreshed_gt?: InputMaybe<Scalars['BigInt']['input']>;
  lastRefreshed_gte?: InputMaybe<Scalars['BigInt']['input']>;
  lastRefreshed_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  lastRefreshed_lt?: InputMaybe<Scalars['BigInt']['input']>;
  lastRefreshed_lte?: InputMaybe<Scalars['BigInt']['input']>;
  lastRefreshed_not?: InputMaybe<Scalars['BigInt']['input']>;
  lastRefreshed_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  lastSwapTimestamp?: InputMaybe<Scalars['BigInt']['input']>;
  lastSwapTimestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  lastSwapTimestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  lastSwapTimestamp_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  lastSwapTimestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  lastSwapTimestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  lastSwapTimestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  lastSwapTimestamp_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  liquidity?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_gt?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_gte?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  liquidity_lt?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_lte?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_not?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  migratedAt?: InputMaybe<Scalars['BigInt']['input']>;
  migratedAt_gt?: InputMaybe<Scalars['BigInt']['input']>;
  migratedAt_gte?: InputMaybe<Scalars['BigInt']['input']>;
  migratedAt_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  migratedAt_lt?: InputMaybe<Scalars['BigInt']['input']>;
  migratedAt_lte?: InputMaybe<Scalars['BigInt']['input']>;
  migratedAt_not?: InputMaybe<Scalars['BigInt']['input']>;
  migratedAt_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  migratedFromPool?: InputMaybe<Scalars['String']['input']>;
  migratedFromPool_contains?: InputMaybe<Scalars['String']['input']>;
  migratedFromPool_ends_with?: InputMaybe<Scalars['String']['input']>;
  migratedFromPool_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  migratedFromPool_not?: InputMaybe<Scalars['String']['input']>;
  migratedFromPool_not_contains?: InputMaybe<Scalars['String']['input']>;
  migratedFromPool_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  migratedFromPool_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  migratedFromPool_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  migratedFromPool_starts_with?: InputMaybe<Scalars['String']['input']>;
  migratorVersion?: InputMaybe<Scalars['String']['input']>;
  migratorVersion_contains?: InputMaybe<Scalars['String']['input']>;
  migratorVersion_ends_with?: InputMaybe<Scalars['String']['input']>;
  migratorVersion_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  migratorVersion_not?: InputMaybe<Scalars['String']['input']>;
  migratorVersion_not_contains?: InputMaybe<Scalars['String']['input']>;
  migratorVersion_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  migratorVersion_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  migratorVersion_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  migratorVersion_starts_with?: InputMaybe<Scalars['String']['input']>;
  percentDayChange?: InputMaybe<Scalars['Float']['input']>;
  percentDayChange_gt?: InputMaybe<Scalars['Float']['input']>;
  percentDayChange_gte?: InputMaybe<Scalars['Float']['input']>;
  percentDayChange_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  percentDayChange_lt?: InputMaybe<Scalars['Float']['input']>;
  percentDayChange_lte?: InputMaybe<Scalars['Float']['input']>;
  percentDayChange_not?: InputMaybe<Scalars['Float']['input']>;
  percentDayChange_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  poolId?: InputMaybe<Scalars['String']['input']>;
  poolId_contains?: InputMaybe<Scalars['String']['input']>;
  poolId_ends_with?: InputMaybe<Scalars['String']['input']>;
  poolId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  poolId_not?: InputMaybe<Scalars['String']['input']>;
  poolId_not_contains?: InputMaybe<Scalars['String']['input']>;
  poolId_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  poolId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  poolId_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  poolId_starts_with?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['BigInt']['input']>;
  price_gt?: InputMaybe<Scalars['BigInt']['input']>;
  price_gte?: InputMaybe<Scalars['BigInt']['input']>;
  price_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  price_lt?: InputMaybe<Scalars['BigInt']['input']>;
  price_lte?: InputMaybe<Scalars['BigInt']['input']>;
  price_not?: InputMaybe<Scalars['BigInt']['input']>;
  price_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  quoteToken?: InputMaybe<Scalars['String']['input']>;
  quoteToken_contains?: InputMaybe<Scalars['String']['input']>;
  quoteToken_ends_with?: InputMaybe<Scalars['String']['input']>;
  quoteToken_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  quoteToken_not?: InputMaybe<Scalars['String']['input']>;
  quoteToken_not_contains?: InputMaybe<Scalars['String']['input']>;
  quoteToken_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  quoteToken_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  quoteToken_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  quoteToken_starts_with?: InputMaybe<Scalars['String']['input']>;
  reserves0?: InputMaybe<Scalars['BigInt']['input']>;
  reserves0_gt?: InputMaybe<Scalars['BigInt']['input']>;
  reserves0_gte?: InputMaybe<Scalars['BigInt']['input']>;
  reserves0_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  reserves0_lt?: InputMaybe<Scalars['BigInt']['input']>;
  reserves0_lte?: InputMaybe<Scalars['BigInt']['input']>;
  reserves0_not?: InputMaybe<Scalars['BigInt']['input']>;
  reserves0_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  reserves1?: InputMaybe<Scalars['BigInt']['input']>;
  reserves1_gt?: InputMaybe<Scalars['BigInt']['input']>;
  reserves1_gte?: InputMaybe<Scalars['BigInt']['input']>;
  reserves1_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  reserves1_lt?: InputMaybe<Scalars['BigInt']['input']>;
  reserves1_lte?: InputMaybe<Scalars['BigInt']['input']>;
  reserves1_not?: InputMaybe<Scalars['BigInt']['input']>;
  reserves1_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  sqrtPriceX96?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPriceX96_gt?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPriceX96_gte?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPriceX96_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  sqrtPriceX96_lt?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPriceX96_lte?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPriceX96_not?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPriceX96_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  tick?: InputMaybe<Scalars['Int']['input']>;
  tickSpacing?: InputMaybe<Scalars['Int']['input']>;
  tickSpacing_gt?: InputMaybe<Scalars['Int']['input']>;
  tickSpacing_gte?: InputMaybe<Scalars['Int']['input']>;
  tickSpacing_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  tickSpacing_lt?: InputMaybe<Scalars['Int']['input']>;
  tickSpacing_lte?: InputMaybe<Scalars['Int']['input']>;
  tickSpacing_not?: InputMaybe<Scalars['Int']['input']>;
  tickSpacing_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  tick_gt?: InputMaybe<Scalars['Int']['input']>;
  tick_gte?: InputMaybe<Scalars['Int']['input']>;
  tick_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  tick_lt?: InputMaybe<Scalars['Int']['input']>;
  tick_lte?: InputMaybe<Scalars['Int']['input']>;
  tick_not?: InputMaybe<Scalars['Int']['input']>;
  tick_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  totalFee0?: InputMaybe<Scalars['BigInt']['input']>;
  totalFee0_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalFee0_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalFee0_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  totalFee0_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalFee0_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalFee0_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalFee0_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  totalFee1?: InputMaybe<Scalars['BigInt']['input']>;
  totalFee1_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalFee1_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalFee1_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  totalFee1_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalFee1_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalFee1_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalFee1_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  volumeUsd?: InputMaybe<Scalars['BigInt']['input']>;
  volumeUsd_gt?: InputMaybe<Scalars['BigInt']['input']>;
  volumeUsd_gte?: InputMaybe<Scalars['BigInt']['input']>;
  volumeUsd_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  volumeUsd_lt?: InputMaybe<Scalars['BigInt']['input']>;
  volumeUsd_lte?: InputMaybe<Scalars['BigInt']['input']>;
  volumeUsd_not?: InputMaybe<Scalars['BigInt']['input']>;
  volumeUsd_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
};

export type V4poolsPage = {
  __typename?: 'v4poolsPage';
  items: Array<V4pools>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};
