# Doppler V4 Mini App

A modern web application built with React, TypeScript, and Vite that integrates with the Doppler V4 protocol. This application provides a user interface for interacting with Doppler's liquidity bootstrapping protocol and a starting point to build your own applications on Doppler. 

## Status

This repository is no longer maintained 🚨 

View the [Doppler Demo App](https://github.com/whetstoneresearch/doppler-demo-app) which uses the latest [Doppler SDK](https://github.com/whetstoneresearch/doppler-sdk).

## Tech Stack

- **Frontend Framework**: React 
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **State Management**: React Query
- **API Client**: GraphQL Request
- **Web3 Integration**: wagmi, viem

## Prerequisites

- Node.js (Latest LTS version recommended)
- Bun or your favorite package manager
- A Web3 wallet (like MetaMask) 

## Installation

1. Clone the repository:
```bash
git clone https://github.com/whetstoneresearch/doppler-v4-miniapp
cd doppler-v4-miniapp
```

2. Install 

```bash
bun install
```

## Development

To start the development server:

```bash
bun run dev
```

This will start the Vite development server with hot module replacement enabled.

## Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run lint` - Run ESLint
- `bun run preview` - Preview production build locally

## Project Structure

```
src/
├── assets/        # Static assets
├── components/    # Reusable UI components
├── hooks/         # Custom React hooks
├── lib/          # Utility libraries and configurations
├── pages/        # Page components
├── utils/        # Helper functions
└── App.tsx       # Root component
```

## Deployment config

This demo application is currently configured to be ran on Base Sepolia with the default contract addresses provided from the [doppler-v4-sdk](https://github.com/whetstoneresearch/doppler-sdk/tree/main/packages/doppler-v4-sdk). It also comes out of the box with a predefined and hosted [Doppler indexer](https://github.com/whetstoneresearch/doppler-sdk/tree/main/packages/doppler-v3-indexer) to make it as easy as possible to get started.

## Testing

In order to use the demo application to create or swap tokens, you will need a wallet configured on Base Sepolia with testnet ETH. [Here's a list of publicly available faucets](https://docs.base.org/chain/network-faucets). 

## License

[MIT](/LICENSE)
