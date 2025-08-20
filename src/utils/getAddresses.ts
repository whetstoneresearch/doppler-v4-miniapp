// Using unified SDK for all addresses
import { getAddresses as getUnifiedAddresses } from "@whetstone-research/doppler-sdk";

export const getAddresses = (chainId: number) => {
  const unifiedAddresses = getUnifiedAddresses(chainId);
  
  // The unified SDK has all addresses in a flat structure
  // We'll create v3 and v4 objects for compatibility
  return {
    v3: {
      airlock: unifiedAddresses.airlock,
      tokenFactory: unifiedAddresses.tokenFactory,
      v3Initializer: unifiedAddresses.v3Initializer,
      v3Quoter: unifiedAddresses.v3Quoter,
      governanceFactory: unifiedAddresses.governanceFactory,
      liquidityMigrator: unifiedAddresses.v2Migrator, // V2 migrator is used for V3 static auctions
      universalRouter: unifiedAddresses.universalRouter,
      permit2: unifiedAddresses.permit2,
      weth: unifiedAddresses.weth,
    },
    v4: {
      airlock: unifiedAddresses.airlock,
      tokenFactory: unifiedAddresses.tokenFactory,
      v4Initializer: unifiedAddresses.v4Initializer,
      doppler: unifiedAddresses.doppler,
      dopplerLens: unifiedAddresses.dopplerLens,
      dopplerDeployer: unifiedAddresses.dopplerDeployer,
      poolManager: unifiedAddresses.poolManager,
      stateView: unifiedAddresses.stateView,
      governanceFactory: unifiedAddresses.governanceFactory,
      migrator: unifiedAddresses.v4Migrator,
      universalRouter: unifiedAddresses.universalRouter,
      permit2: unifiedAddresses.permit2,
      weth: unifiedAddresses.weth,
    },
  };
};
