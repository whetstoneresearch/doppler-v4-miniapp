# Doppler V4 Miniapp

This is a demo app for the Doppler protocol. It showcases deploying and interacting with Doppler auctions (static/V3 and dynamic/V4), quoting trades, and optional Doppler404 (DN404) hybrid NFT + ERC20 tokens.

- Doppler protocol on GitHub: https://github.com/whetstoneresearch/doppler

## What This Demo Uses From the SDK

- **`DopplerSDK.factory`**: unified entry to create static (V3) and dynamic (V4) auctions.
- **Builder pattern**: `StaticAuctionBuilder` and `DynamicAuctionBuilder` to construct deployments.
- **Quoter**: high-level quoting for V2/V3 and a V4 fallback.
- **DopplerLens**: ABI-driven quoting path for dynamic auctions.
- **Unified addresses**: one call to resolve addresses across chains.
- **Bytecode exports**: `DopplerBytecode`/`DERC20Bytecode` for deterministic address computation.

## Code Samples

All samples link to the exact source lines in this repo (GitHub-style anchors).

### Initialize SDK + Factory

```ts
// Use the unified SDK
const sdk = new DopplerSDK({
  walletClient,
  publicClient,
  chainId: 84532, // Base Sepolia
});

const factory = sdk.factory;
const addresses = getAddresses(84532);
```
[Source: `src/pages/CreatePool.tsx#L55-L63`](src/pages/CreatePool.tsx#L55-L63)

### Static Auction (V3)

```ts
const staticParams = new StaticAuctionBuilder()
  .saleConfig({ initialSupply, numTokensToSell, numeraire: weth })
  .poolByTicks({ startTick, endTick, fee: 10000 })
  .withMigration({ type: 'uniswapV2' })
  .withUserAddress(account.address)
  .withIntegrator(account.address)
  .build();

const result = await factory.createStaticAuction(staticParams);
```
[Source: `src/pages/CreatePool.tsx#L111-L131`](src/pages/CreatePool.tsx#L111-L131)

### Dynamic Auction (V4) with Streaming Fees

```ts
const dynamicParams = new DynamicAuctionBuilder()
  .saleConfig({ initialSupply, numTokensToSell })
  .poolConfig({ fee: 3000, tickSpacing: 8 })
  .auctionByTicks({
    startTick, endTick,
    minProceeds: parseEther("100"),
    maxProceeds: parseEther("600"),
    durationDays: 7,
    epochLength: 3600,
  })
  .withMigration({
    type: 'uniswapV4', fee: 3000, tickSpacing: 60,
    streamableFees: {
      lockDuration: 60 * 60 * 24 * 30,
      beneficiaries: [{ address: airlockOwner, percentage: 500 }, { address: account.address, percentage: 9500 }]
    }
  })
  .withGovernance({ useDefaults: true })
  .withUserAddress(account.address)
  .withIntegrator()
  .withTime({ blockTimestamp: Number(adjustedTimestamp) })
  .build();

const result = await factory.createDynamicAuction(dynamicParams);
```
[Source: `src/pages/CreatePool.tsx#L187-L238`](src/pages/CreatePool.tsx#L187-L238)

### Doppler404 (DN404) Token Config

```ts
dynamicBuilder.tokenConfig({
  type: 'doppler404' as const,
  name: formData.tokenName,
  symbol: formData.tokenSymbol,
  baseURI: formData.baseURI || `https://metadata.example.com/${formData.tokenSymbol.toLowerCase()}/`,
})
```
[Source: `src/pages/CreatePool.tsx#L172-L178`](src/pages/CreatePool.tsx#L172-L178)

### Quoting

```ts
// V4 quoting
const quoter = new Quoter(publicClient, chainId)
const quoteV4 = await quoter.quoteExactInputV4({ poolKey: key, zeroForOne, exactAmount: amountIn, hookData: "0x" })

// V3 quoting 
const quoteV3 = await quoter.quoteExactInputV3({
  tokenIn, tokenOut, amountIn, fee: pool.fee, sqrtPriceLimitX96: 0n,
})
```
[Source: `src/pages/PoolDetails.tsx#L529-L537`](src/pages/PoolDetails.tsx#L529-L537), [and `#L569-L575`](src/pages/PoolDetails.tsx#L569-L575)

### Addresses

```ts
import { getAddresses } from "@whetstone-research/doppler-sdk";

const addresses = getAddresses(84532); // or your chainId
```
[Source: `src/pages/CreatePool.tsx#L5-L5`](src/pages/CreatePool.tsx#L5-L5), [and `#L63-L63`](src/pages/CreatePool.tsx#L63-L63)
