// ABI for DopplerLensQuoter contract
// This quoter is specifically for Doppler V4 dynamic auctions
// It simulates a swap and returns liquidity data without reverting
export const dopplerLensQuoterAbi = [
  {
    name: "quoteDopplerLensData",
    type: "function",
    stateMutability: "nonpayable",  // Not a view function - it simulates state changes
    inputs: [
      {
        name: "params",
        type: "tuple",
        components: [
          {
            name: "poolKey",
            type: "tuple",
            components: [
              { name: "currency0", type: "address" },  // Lower currency, sorted numerically
              { name: "currency1", type: "address" },  // Higher currency, sorted numerically
              { name: "fee", type: "uint24" },         // Should be DYNAMIC_FEE_FLAG (0x800000)
              { name: "tickSpacing", type: "int24" },
              { name: "hooks", type: "address" },      // The Doppler hook contract
            ],
          },
          { name: "zeroForOne", type: "bool" },        // Swap direction
          { name: "exactAmount", type: "uint128" },    // Amount to swap
          { name: "hookData", type: "bytes" },         // Additional data for the hook
        ],
      },
    ],
    outputs: [
      {
        name: "returnData",
        type: "tuple",
        components: [
          { name: "sqrtPriceX96", type: "uint160" },  // Price after swap
          { name: "amount0", type: "uint256" },       // Amount of token0
          { name: "amount1", type: "uint256" },       // Amount of token1  
          { name: "tick", type: "int24" },            // Current tick
        ],
      },
    ],
  },
] as const