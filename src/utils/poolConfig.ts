import { parseEther, zeroAddress } from "viem";

export const TOKEN_TOTAL_SUPPLY = parseEther("1000000000");
export const TOKEN_NUM_MIN_TO_SELL = parseEther("900000000");
export const TOKEN_MIN_PROCEEDS = parseEther("100");
export const TOKEN_MAX_PROCEEDS = parseEther("600");
export const TOKEN_FEE = 20000; // 2% default for V4 dynamic
export const DEFAULT_START_TICK = 174312; // Align with pure-markets-interface V4 defaults
export const DEFAULT_END_TICK = 186840;   // Align with pure-markets-interface V4 defaults

export function tokenParams(token: {
  name: string;
  symbol: string;
  timestamp: bigint;
}) {
  return {
    name: token.name,
    symbol: token.symbol,
    totalSupply: TOKEN_TOTAL_SUPPLY,
    numTokensToSell: TOKEN_NUM_MIN_TO_SELL,
    blockTimestamp: Number(token.timestamp),
    startTimeOffset: 300, // 5 minutes from now (in seconds, not days as the SDK comment incorrectly states)
    duration: 7, // 7 days
    epochLength: 3600, // 1 hour epochs
    tickRange: {
      startTick: DEFAULT_START_TICK,
      endTick: DEFAULT_END_TICK,
    },
    // Align with pure-markets-interface V4 dynamic defaults
    tickSpacing: 2,
    fee: TOKEN_FEE,
    minProceeds: TOKEN_MIN_PROCEEDS,
    maxProceeds: TOKEN_MAX_PROCEEDS,
    tokenURI: "",
    yearlyMintRate: 0n,
    vestingDuration: 0n,
    recipients: [],
    amounts: [],
    integrator: zeroAddress,
    numeraire: zeroAddress,
  };
}
