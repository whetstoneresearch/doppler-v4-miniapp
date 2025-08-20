import { createConfig, http } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { createStorage } from 'wagmi'
import { injected } from 'wagmi/connectors'

// Create wagmi config
export const config = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    injected(),
  ],
  transports: {
    [base.id]: http('https://mainnet.base.org'),
    [baseSepolia.id]: http('https://sepolia.base.org'),
  },
  storage: createStorage({ storage: window.localStorage }),
})
