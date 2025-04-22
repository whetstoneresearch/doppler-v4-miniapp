import { DOPPLER_V4_ADDRESSES } from "doppler-v4-sdk";

export const getAddresses = (chainId: number) => {
  return DOPPLER_V4_ADDRESSES[chainId];
};
