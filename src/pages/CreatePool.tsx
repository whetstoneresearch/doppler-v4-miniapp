import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { useState } from "react"
import { useAccount, useWalletClient, usePublicClient } from "wagmi"
import { getAddresses } from "@whetstone-research/doppler-sdk"
import { DopplerSDK, StaticAuctionBuilder, DynamicAuctionBuilder } from "@whetstone-research/doppler-sdk"
import { PublicClient, parseEther, type Address } from "viem"
import { getBlock } from "viem/actions"

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
  const publicClient = usePublicClient() as PublicClient
  const [isDeploying, setIsDeploying] = useState(false)
  const [auctionType, setAuctionType] = useState<'static' | 'dynamic'>('dynamic')
  const [isDoppler404, setIsDoppler404] = useState(false)
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


  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeploying(true);
    setDeploymentResult(null);
    
    try {
      if (!walletClient || !publicClient) throw new Error("Wallet client or public client not found");
      if (!account.address) throw new Error("Account address not found");

      // Use the unified SDK
      const sdk = new DopplerSDK({
        walletClient: walletClient,
        publicClient: publicClient,
        chainId: 84532, // Base Sepolia
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
        ? parseEther(formData.totalSupply) // For DN404, this is the number of NFTs
        : parseEther("1000000000"); // 1 billion for regular tokens
      
      const numTokensToSell = isDoppler404
        ? (totalSupply * 9n) / 10n // 90% for DN404
        : parseEther("900000000"); // 900 million for regular tokens
      
      // Handle both static and dynamic auctions using the new builder pattern
      if (auctionType === 'static') {
        // Use WETH address directly from addresses
        const weth = addresses.weth;

        // Build static auction using the new builder pattern
        const staticBuilder = new StaticAuctionBuilder()
        
        // Configure token based on whether it's Doppler404
        if (isDoppler404) {
          staticBuilder.tokenConfig({
            type: 'doppler404' as const,
            name: formData.tokenName,
            symbol: formData.tokenSymbol,
            baseURI: formData.baseURI || `https://metadata.example.com/${formData.tokenSymbol.toLowerCase()}/`,
          })
        } else {
          staticBuilder.tokenConfig({
            name: formData.tokenName,
            symbol: formData.tokenSymbol,
            tokenURI: "",
          })
        }
        
        const staticParams = staticBuilder
          .saleConfig({
            initialSupply: totalSupply,
            numTokensToSell: numTokensToSell,
            numeraire: weth,
          })
          .poolByTicks({
            startTick: isDoppler404 ? 183000 : 175000, // Doppler404: 0.1 ETH, Regular: default
            endTick: isDoppler404 ? 230000 : 225000,   // Doppler404: 0.01 ETH, Regular: default
            fee: 10000, // 1% fee tier
          })
          .withMigration({
            type: 'uniswapV2' as const
          })
          .withUserAddress(account.address)
          .withIntegrator(account.address)
          .build();
        
        
        // Create static auction
        const result = await factory.createStaticAuction(staticParams);
        
        console.log(`${isDoppler404 ? 'Doppler 404' : ''} static auction deployment completed!`);
        console.log("Transaction hash:", result.transactionHash);
        console.log("Token address:", result.tokenAddress);
        console.log("Pool address:", result.poolAddress);
        
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
          poolAddress: result.poolAddress,
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
      const dynamicBuilder = new DynamicAuctionBuilder()
      
      // Configure token based on whether it's Doppler404
      if (isDoppler404) {
        dynamicBuilder.tokenConfig({
          type: 'doppler404' as const,
          name: formData.tokenName,
          symbol: formData.tokenSymbol,
          baseURI: formData.baseURI || `https://metadata.example.com/${formData.tokenSymbol.toLowerCase()}/`,
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
          durationDays: 7, // 7 days
          epochLength: 3600, // 1 hour epochs
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
        .withGovernance({ useDefaults: true })
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
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
