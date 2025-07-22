import { DOPPLER_V4_ADDRESSES } from "doppler-v4-sdk";
// Unified SDK import (not yet used)
// @ts-ignore - Imports added for future migration
import { getAddresses as getUnifiedAddresses, ADDRESSES } from "doppler-sdk";

export const getAddresses = (chainId: number) => {
  return DOPPLER_V4_ADDRESSES[chainId];
};
