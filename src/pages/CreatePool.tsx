import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { useState } from "react"
import { useAccount, useWalletClient, usePublicClient } from "wagmi"
import { getAddresses, calculateTickRange } from "@whetstone-research/doppler-sdk"
import { DopplerSDK, StaticAuctionBuilder, DynamicAuctionBuilder } from "@whetstone-research/doppler-sdk"
import { parseEther, formatEther, decodeEventLog, type Address } from "viem"
import { CommandBuilder, SwapRouter02Encoder } from "doppler-router"
import { getBlock } from "viem/actions"
import { airlockAbi } from "@whetstone-research/doppler-sdk"

// DN404 ABI for mirrorERC721 function
const dn404Abi = [
  {
    name: 'mirrorERC721',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
] as const

export default function CreatePool() {
  const account = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  const [isDeploying, setIsDeploying] = useState(false)
  const [auctionType, setAuctionType] = useState<'static' | 'dynamic'>('dynamic')
  const [isDoppler404, setIsDoppler404] = useState(false)
  const [enableBundlePrebuy, setEnableBundlePrebuy] = useState(false)
  const [prebuyPercent, setPrebuyPercent] = useState<string>('1')
  const [deploymentResult, setDeploymentResult] = useState<{
    tokenAddress: string
    nftAddress?: string
    poolAddress?: string
    hookAddress?: string
    poolId?: string
    transactionHash: string
    auctionType: 'static' | 'dynamic'
  } | null>(null)

  const [formData, setFormData] = useState({
    tokenName: '',
    tokenSymbol: '',
    baseURI: '',
    totalSupply: '10000000',
  })

  // DN404: number of ERC20 base units represented per NFT.
  // We want 1 NFT = 1,000 tokens; tokens have 18 decimals, so use 1000e18.
  const DN404_UNIT = parseEther('1000')


  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeploying(true);
    setDeploymentResult(null);
    
    try {
      if (!walletClient || !publicClient) throw new Error("Wallet client or public client not found");
      if (!account.address) throw new Error("Account address not found");

      // Use the unified SDK
      const sdk = new DopplerSDK({
        walletClient: walletClient as any,
        publicClient: publicClient as any,
        chainId: 84532 as const, // Base Sepolia
      });

      const factory = sdk.factory;
      const addresses = getAddresses(84532);
      
      // Get airlock owner address for dynamic auction fee streaming
      const airlockOwner = await publicClient.readContract({
        address: addresses.airlock,
        abi: [{
          name: 'owner',
          type: 'function',
          inputs: [],
          outputs: [{ name: '', type: 'address' }],
          stateMutability: 'view',
        }],
        functionName: 'owner',
      }) as Address;
      
      // Calculate token supply based on whether it's Doppler404
      const totalSupply = isDoppler404 
        ? parseEther(formData.totalSupply) // For DN404, this is the token supply in base units
        : parseEther("1000000000"); // 1 billion for regular tokens
      
      const numTokensToSell = isDoppler404
        ? (totalSupply * 9n) / 10n // 90% for DN404
        : parseEther("900000000"); // 900 million for regular tokens
      
      // Handle both static and dynamic auctions using the new builder pattern
      if (auctionType === 'static') {
        // Use WETH address directly from addresses
        const weth = addresses.weth;

        // Build static auction using the new builder pattern
        const staticBuilder = new StaticAuctionBuilder(84532)
        
        // Configure token based on whether it's Doppler404
        if (isDoppler404) {
          staticBuilder.tokenConfig({
            type: 'doppler404' as const,
            name: formData.tokenName,
            symbol: formData.tokenSymbol,
            baseURI: formData.baseURI || `https://metadata.example.com/${formData.tokenSymbol.toLowerCase()}/`,
            unit: DN404_UNIT,
          })
        } else {
          staticBuilder.tokenConfig({
            name: formData.tokenName,
            symbol: formData.tokenSymbol,
            tokenURI: "",
          })
        }
        
        // Choose a reasonable price corridor in ETH per token and derive ticks.
        // Use a conservative default corridor per variant.
        const staticFee = 10000 // 1% tier for static pools
        const tickSpacing = staticFee === 10000 ? 200 : staticFee === 3000 ? 60 : 10
        const { startTick, endTick } = isDoppler404
          ? calculateTickRange(0.01, 0.1, tickSpacing)   // ~0.01–0.1 ETH per token
          : calculateTickRange(0.0001, 0.001, tickSpacing) // ~0.0001–0.001 ETH per token

        let builderChain = staticBuilder
          .saleConfig({
            initialSupply: totalSupply,
            numTokensToSell: numTokensToSell,
            numeraire: weth,
          })
          .poolByTicks({
            startTick,
            endTick,
            fee: staticFee, // 1% fee tier
          })
          .withMigration({
            type: 'uniswapV2' as const
          })
          .withUserAddress(account.address)
          .withIntegrator(account.address)
          // Use default governance params for static auctions
          .withGovernance({ type: 'default' as const })

        const staticParams = builderChain.build();

        // If user enabled pre-buy via bundling, simulate and bundle create + swap
        if (enableBundlePrebuy) {
          // 1) Simulate create to get CreateParams and predicted asset/pool
          const { createParams, asset, pool } = await factory.simulateCreateStaticAuction(staticParams)

          // 2) Compute target amountOut as percent of tokens for sale (integer percent)
          const pctNum = Number(prebuyPercent || '0')
          const pct = Number.isFinite(pctNum) ? Math.max(0, Math.min(100, Math.floor(pctNum))) : 0
          const amountOut = (staticParams.sale.numTokensToSell * BigInt(pct)) / 100n

          if (amountOut <= 0n) {
            throw new Error('Pre-buy percent must be greater than 0')
          }

          // 3) Quote required ETH input using Bundler simulator
          console.log('[BUNDLE PREBUY] createParams:', createParams)
          console.log('[BUNDLE PREBUY] predicted asset (token):', asset)
          console.log('[BUNDLE PREBUY] predicted pool:', pool)
          console.log('[BUNDLE PREBUY] numTokensToSell:', staticParams.sale.numTokensToSell.toString())
          console.log('[BUNDLE PREBUY] prebuy percent:', pct, '%')
          console.log('[BUNDLE PREBUY] target amountOut (tokens):', amountOut.toString())

          const amountIn = await factory.simulateBundleExactOutput(createParams, {
            tokenIn: weth,
            tokenOut: asset,
            amount: amountOut,
            fee: staticParams.pool.fee,
            sqrtPriceLimitX96: 0n,
          })

          console.log('[BUNDLE PREBUY] simulated required amountIn (wei):', amountIn.toString())
          console.log('[BUNDLE PREBUY] simulated required amountIn (ETH):', formatEther(amountIn))

          // Sanity cross-check: run exact-in sim with the returned amountIn and confirm we meet/exceed amountOut
          try {
            const crossOut = await factory.simulateBundleExactInput(createParams, {
              tokenIn: weth,
              tokenOut: asset,
              amountIn,
              fee: staticParams.pool.fee,
              sqrtPriceLimitX96: 0n,
            })
            console.log('[BUNDLE PREBUY][cross-check] amountOut for amountIn:', crossOut.toString())
          } catch (e) {
            console.warn('[BUNDLE PREBUY][cross-check] exact-in simulation failed:', e)
          }

          // 4) Build Universal Router commands for exact-out V3 swap (wrap ETH then swap)
          const universalRouter = addresses.universalRouter as Address
          const encoder = new SwapRouter02Encoder()
          const encodedPath = encoder.encodePathExactOutput([weth as Address, asset as Address])
          const builder = new CommandBuilder()
          builder.addWrapEth(universalRouter, amountIn)
          builder.addV3SwapExactOut(account.address as Address, amountOut, amountIn, encodedPath, false)
          // NOTE: We do not currently sweep/unwrap potential leftover WETH from the Universal Router.
          // If simulateBundleExactOutput returns a conservative amount and the actual swap consumes less,
          // the remainder may be left in the router unless additional sweep/unwrap steps are appended.
          const [commands, inputs] = builder.build()

          // 5) Atomically create + pre-buy via Bundler
          const txHash = await factory.bundle(createParams, commands, inputs, { value: amountIn })

          console.log(`${isDoppler404 ? 'Doppler 404' : ''} static auction (bundled pre-buy) submitted!`)
          console.log('Transaction hash:', txHash)
          console.log('Predicted token address:', asset)
          console.log('Predicted pool address:', pool)

          // If Doppler404, get the NFT mirror address from predicted token (will be valid post-mining)
          let nftAddress: Address | undefined
          if (isDoppler404) {
            try {
              nftAddress = await publicClient.readContract({
                address: asset as Address,
                abi: dn404Abi,
                functionName: 'mirrorERC721',
              })
            } catch (error) {
              console.error('Failed to get NFT mirror address (pre-confirmation):', error)
            }
          }

          setDeploymentResult({
            tokenAddress: asset as string,
            nftAddress,
            poolAddress: pool as string,
            transactionHash: txHash as string,
            auctionType: 'static',
          })

          return;
        }

        // Otherwise, plain create without pre-buy
        const result = await factory.createStaticAuction(staticParams);
        
        // The SDK returns tokenAddress (asset) and poolAddress (pool) in that order.
        // We still decode the Create event to confirm and use it as the source of truth.
        let correctedTokenAddress = result.tokenAddress as Address | undefined
        let correctedPoolAddress = result.poolAddress as Address | undefined
        try {
          const receipt = await publicClient.getTransactionReceipt({ hash: result.transactionHash as `0x${string}` })
          const createLog = receipt.logs.find((log) => {
            try {
              const decoded = decodeEventLog({ abi: airlockAbi as any, data: log.data, topics: log.topics }) as any
              return decoded.eventName === 'Create'
            } catch {
              return false
            }
          })
          if (createLog) {
            const decoded = decodeEventLog({ abi: airlockAbi as any, data: createLog.data, topics: createLog.topics }) as any
            if (decoded?.eventName === 'Create') {
              const asset = decoded.args.asset as Address
              const poolOrHook = decoded.args.poolOrHook as Address
              // For static auctions, poolOrHook is the V3 pool address
              correctedTokenAddress = asset
              correctedPoolAddress = poolOrHook
              // If the event differs from the SDK result, prefer the event-decoded values.
              if (result.tokenAddress?.toLowerCase() !== asset.toLowerCase() || result.poolAddress?.toLowerCase() !== poolOrHook.toLowerCase()) {
                console.warn('[STATIC CREATE] Event-decoded token/pool differs from SDK result. Using event-decoded addresses.', {
                  sdkToken: result.tokenAddress,
                  sdkPool: result.poolAddress,
                  eventToken: asset,
                  eventPool: poolOrHook,
                })
              }
            }
          }
        } catch (e) {
          console.warn('[STATIC CREATE] Failed to decode Create event for address correction:', e)
        }

        console.log(`${isDoppler404 ? 'Doppler 404' : ''} static auction deployment completed!`);
        console.log("Transaction hash:", result.transactionHash);
        console.log("Token address (corrected):", correctedTokenAddress);
        console.log("Pool address (corrected):", correctedPoolAddress);

        // If Doppler404, get the NFT mirror address
        let nftAddress: Address | undefined;
        if (isDoppler404) {
          try {
            nftAddress = await publicClient.readContract({
              address: result.tokenAddress as Address,
              abi: dn404Abi,
              functionName: 'mirrorERC721',
            });
          } catch (error) {
            console.error("Failed to get NFT mirror address:", error);
          }
        }

        setDeploymentResult({
          tokenAddress: correctedTokenAddress as string,
          nftAddress,
          poolAddress: correctedPoolAddress as string,
          transactionHash: result.transactionHash,
          auctionType: 'static',
        });
        
        return;
      }
      
      // Dynamic auction configuration using the new builder pattern
      // Get block timestamp first
      const block = await getBlock(publicClient);
      const adjustedTimestamp = block.timestamp + 60n; // Add 1 minute
      
      // Build dynamic auction using the new builder pattern
      const dynamicBuilder = new DynamicAuctionBuilder(84532)
      
      // Configure token based on whether it's Doppler404
      if (isDoppler404) {
        dynamicBuilder.tokenConfig({
          type: 'doppler404' as const,
          name: formData.tokenName,
          symbol: formData.tokenSymbol,
          baseURI: formData.baseURI || `https://metadata.example.com/${formData.tokenSymbol.toLowerCase()}/`,
          unit: DN404_UNIT,
        })
      } else {
        dynamicBuilder.tokenConfig({
          name: formData.tokenName,
          symbol: formData.tokenSymbol,
          tokenURI: "",
        })
      }
      
      const dynamicParams = dynamicBuilder
        .saleConfig({
          initialSupply: totalSupply,
          numTokensToSell: numTokensToSell,
        })
        .poolConfig({
          fee: 3000, // 0.3% fee tier
          tickSpacing: 8, // Match V4 tick spacing
        })
        .auctionByTicks({
          startTick: isDoppler404 ? 183000 : 180000, // Doppler404: 0.1 ETH, Regular: default
          endTick: isDoppler404 ? 230000 : 190000,   // Doppler404: 0.01 ETH, Regular: default
          minProceeds: parseEther("100"), // 100 ETH
          maxProceeds: parseEther("600"), // 600 ETH
          durationDays: isDoppler404 ? 1 : 7, // DN404: 1 day, Regular: 7 days
          epochLength: isDoppler404 ? 600 : 3600, // DN404: ~11m 40s, Regular: 1 hour
        })
        .withMigration({
          type: 'uniswapV4' as const,
          fee: 3000,
          tickSpacing: 60,
          streamableFees: {
            lockDuration: 60 * 60 * 24 * 30, // 30 days
            beneficiaries: [
              {
                address: airlockOwner,
                percentage: 500, // 5% to airlock owner (in basis points)
              },
              {
                address: account.address,
                percentage: 9500, // 95% to token creator (in basis points)
              }
            ]
          }
        })
        .withGovernance({ type: 'default' })
        .withUserAddress(account.address)
        .withIntegrator() // Uses zero address by default
        .withTime({
          blockTimestamp: Number(adjustedTimestamp),
        })
        .build();
      
      
      // Create dynamic auction using the built config
      const result = await factory.createDynamicAuction(dynamicParams);
      
      console.log(`${isDoppler404 ? 'Doppler 404' : ''} dynamic auction deployment completed!`);
      console.log("Transaction hash:", result.transactionHash);
      console.log("Token address:", result.tokenAddress);
      console.log("Hook address:", result.hookAddress);
      console.log("Pool ID:", result.poolId);
      
      // If Doppler404, get the NFT mirror address
      let nftAddress: Address | undefined;
      if (isDoppler404) {
        try {
          nftAddress = await publicClient.readContract({
            address: result.tokenAddress as Address,
            abi: dn404Abi,
            functionName: 'mirrorERC721',
          });
        } catch (error) {
          console.error("Failed to get NFT mirror address:", error);
        }
      }
      
      setDeploymentResult({
        tokenAddress: result.tokenAddress,
        nftAddress,
        hookAddress: result.hookAddress,
        poolId: result.poolId,
        transactionHash: result.transactionHash,
        auctionType: 'dynamic',
      });

    } catch (error) {
      console.error("Auction deployment failed:", error);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-primary">Create New Pool</h1>
        <div className="border border-primary/20 rounded-lg p-6 bg-card/50 backdrop-blur">
          <form onSubmit={handleDeploy} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Auction Type</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setAuctionType('static')}
                  className={`flex-1 px-4 py-2 rounded-md transition-colors ${
                    auctionType === 'static' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-background/50 border border-input hover:bg-background/70'
                  }`}
                >
                  Static Auction (V3)
                </button>
                <button
                  type="button"
                  onClick={() => setAuctionType('dynamic')}
                  className={`flex-1 px-4 py-2 rounded-md transition-colors ${
                    auctionType === 'dynamic' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-background/50 border border-input hover:bg-background/70'
                  }`}
                >
                  Dynamic Auction (V4)
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {auctionType === 'static' 
                  ? 'Traditional bonding curve with fixed liquidity distribution across price range'
                  : 'Dutch auction with dynamic rebalancing across epochs'}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="doppler404"
                  checked={isDoppler404}
                  onChange={(e) => setIsDoppler404(e.target.checked)}
                  className="w-4 h-4 rounded border-input text-primary focus:ring-primary"
                />
                <label htmlFor="doppler404" className="text-sm font-medium cursor-pointer">
                  Create Doppler404 Token (NFT + ERC20)
                </label>
              </div>
              <p className="text-xs text-muted-foreground">
                {isDoppler404 
                  ? 'Create a hybrid token that combines NFT and ERC20 functionality with built-in liquidity'
                  : 'Create a standard ERC20 token with built-in liquidity'}
              </p>
            </div>
            
            {auctionType === 'static' && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="bundlePrebuy"
                    checked={enableBundlePrebuy}
                    onChange={(e) => setEnableBundlePrebuy(e.target.checked)}
                    className="w-4 h-4 rounded border-input text-primary focus:ring-primary"
                  />
                  <label htmlFor="bundlePrebuy" className="text-sm font-medium cursor-pointer">
                    Pre-buy via bundling (static auctions)
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Atomically create the pool and buy a portion of tokens using ETH.
                </p>
                {enableBundlePrebuy && (
                  <div className="space-y-2 pl-6">
                    <label className="text-sm font-medium">Pre-buy percent of tokens for sale</label>
                    <input
                      type="number"
                      value={prebuyPercent}
                      onChange={(e) => setPrebuyPercent(e.target.value)}
                      className="w-full px-4 py-2 rounded-md bg-background/50 border border-input focus:border-primary focus:ring-1 focus:ring-primary"
                      placeholder="e.g., 1"
                      min="1"
                      max="100"
                      step="1"
                    />
                    <p className="text-xs text-muted-foreground">
                      We will simulate the required ETH and execute an exact-output V3 swap during creation.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Token Name</label>
              <input 
                type="text"
                value={formData.tokenName}
                onChange={(e) => setFormData(prev => ({ ...prev, tokenName: e.target.value }))}
                className="w-full px-4 py-2 rounded-md bg-background/50 border border-input focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder={isDoppler404 ? "e.g., Cool NFT Collection" : "e.g., My Awesome Token"}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Token Symbol</label>
              <input 
                type="text"
                value={formData.tokenSymbol}
                onChange={(e) => setFormData(prev => ({ ...prev, tokenSymbol: e.target.value.toUpperCase() }))}
                className="w-full px-4 py-2 rounded-md bg-background/50 border border-input focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder={isDoppler404 ? "e.g., COOL" : "e.g., MAT"}
                maxLength={6}
                required
              />
              <p className="text-xs text-muted-foreground">Maximum 6 characters, automatically converted to uppercase</p>
            </div>
            
            {isDoppler404 && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Base URI</label>
                  <input 
                    type="text"
                    value={formData.baseURI}
                    onChange={(e) => setFormData(prev => ({ ...prev, baseURI: e.target.value }))}
                    className="w-full px-4 py-2 rounded-md bg-background/50 border border-input focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="e.g., https://metadata.example.com/cool/"
                    required={isDoppler404}
                  />
                  <p className="text-xs text-muted-foreground">
                    The base URI for NFT metadata. Token IDs will be appended to this.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Total Token Supply</label>
                  <input 
                    type="number"
                    value={formData.totalSupply}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalSupply: e.target.value }))}
                    className="w-full px-4 py-2 rounded-md bg-background/50 border border-input focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="e.g., 10000000"
                    min="1000"
                    step="1000"
                    required={isDoppler404}
                  />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-primary">
                      NFT Supply: {formData.totalSupply ? Math.floor(Number(formData.totalSupply) / 1000).toLocaleString() : '0'} NFTs
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Each NFT represents 1,000 tokens. Total supply must be divisible by 1,000.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      90% of tokens will be available for initial sale, 10% reserved for liquidity.
                    </p>
                  </div>
                </div>
              </>
            )}
            
            <div className="space-y-4 pt-4">
              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  className="flex-1 bg-primary/90 hover:bg-primary/80"
                  disabled={isDeploying || !account.isConnected}
                >
                  {isDeploying ? "Deploying..." : `Create ${isDoppler404 ? 'Doppler404' : ''} ${auctionType === 'static' ? 'Static' : 'Dynamic'} Token`}
                </Button>
              </div>
              <Link to="/" className="block">
                <Button 
                  variant="outline" 
                  className="w-full border-primary/40 hover:bg-primary/10"
                >
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </div>
        
        {deploymentResult && (
          <div className="mt-6 border border-primary/20 rounded-lg p-6 bg-card/50 backdrop-blur">
            <h2 className="text-xl font-bold mb-4 text-primary">Deployment Successful! 🎉</h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium">Token Address (ERC20):</span>
                <p className="font-mono break-all text-muted-foreground">{deploymentResult.tokenAddress}</p>
              </div>
              {deploymentResult.nftAddress && (
                <div>
                  <span className="font-medium">NFT Address (ERC721):</span>
                  <p className="font-mono break-all text-muted-foreground">{deploymentResult.nftAddress}</p>
                </div>
              )}
              {deploymentResult.poolAddress && (
                <div>
                  <span className="font-medium">Pool Address:</span>
                  <p className="font-mono break-all text-muted-foreground">{deploymentResult.poolAddress}</p>
                </div>
              )}
              {deploymentResult.hookAddress && (
                <div>
                  <span className="font-medium">Hook Address:</span>
                  <p className="font-mono break-all text-muted-foreground">{deploymentResult.hookAddress}</p>
                </div>
              )}
              {deploymentResult.poolId && (
                <div>
                  <span className="font-medium">Pool ID:</span>
                  <p className="font-mono break-all text-muted-foreground">{deploymentResult.poolId}</p>
                </div>
              )}
              <div>
                <span className="font-medium">Transaction Hash:</span>
                <p className="font-mono break-all text-muted-foreground">{deploymentResult.transactionHash}</p>
              </div>
              <div className="pt-3 space-y-2">
                <a 
                  href={`https://sepolia.basescan.org/tx/${deploymentResult.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="w-full">
                    View Transaction on BaseScan →
                  </Button>
                </a>
                <a 
                  href={`https://sepolia.basescan.org/address/${deploymentResult.tokenAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="w-full">
                    View Token Contract →
                  </Button>
                </a>
                {deploymentResult.nftAddress && (
                  <a 
                    href={`https://sepolia.basescan.org/address/${deploymentResult.nftAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="w-full">
                      View NFT Contract →
                    </Button>
                  </a>
                )}
                {/* Link to the pool details page */}
                {(() => {
                  const chainId = 84532; // Base Sepolia for this miniapp
                  const v4Hook = deploymentResult.auctionType === 'dynamic' ? deploymentResult.hookAddress : undefined;
                  const v3Pool = deploymentResult.auctionType === 'static' ? deploymentResult.poolAddress : undefined;
                  const poolPageAddress = (v4Hook || v3Pool);
                  if (!poolPageAddress) return null;
                  return (
                    <Link to={`/pool/${poolPageAddress}?chainId=${chainId}`}>
                      <Button className="w-full">
                        Open Pool Page →
                      </Button>
                    </Link>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
