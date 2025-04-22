import { createConfig, http } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { createStorage } from 'wagmi'
import { injected } from 'wagmi/connectors'

// Create wagmi config
export const config = createConfig({
  chains: [baseSepolia],
  connectors: [
    injected(),
  ],
  transports: {
    [baseSepolia.id]: http('https://sepolia.base.org'),
  },
  storage: createStorage({ storage: window.localStorage }),
})