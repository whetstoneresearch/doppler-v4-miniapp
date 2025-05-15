import { parseEther, zeroAddress } from "viem";

export const TOKEN_TOTAL_SUPPLY = parseEther("1000000000");
export const TOKEN_NUM_MIN_TO_SELL = parseEther("900000000");
export const TOKEN_MIN_PROCEEDS = parseEther("100");
export const TOKEN_MAX_PROCEEDS = parseEther("600");
export const TOKEN_FEE = 3000;
export const DEFAULT_START_TICK = 167000;
export const DEFAULT_END_TICK = 195000;

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
    startTimeOffset: 1,
    duration: 1,
    epochLength: 200,
    tickRange: {
      startTick: DEFAULT_START_TICK,
      endTick: DEFAULT_END_TICK,
    },
    tickSpacing: 8,
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
