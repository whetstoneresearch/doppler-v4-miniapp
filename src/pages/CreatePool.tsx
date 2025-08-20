import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { useState } from "react"
import { useAccount, useWalletClient, usePublicClient } from "wagmi"
import { getAddresses } from "@/utils/getAddresses"
import { DopplerSDK, StaticAuctionBuilder, DynamicAuctionBuilder } from "@whetstone-research/doppler-sdk"
import { PublicClient, parseEther } from "viem"
import { getBlock } from "viem/actions"

export default function CreatePool() {
  const account = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient() as PublicClient
  const [isDeploying, setIsDeploying] = useState(false)
  const [auctionType, setAuctionType] = useState<'static' | 'dynamic'>('dynamic')

  const [formData, setFormData] = useState({
    tokenName: '',
    tokenSymbol: '',
  })


  const handleDeploy = async (e: React.FormEvent) => {
    if (!walletClient || !publicClient) throw new Error("Wallet client or public client not found");
    e.preventDefault();
    setIsDeploying(true);
    try {
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
        address: addresses.v4.airlock,
        abi: [{
          name: 'owner',
          type: 'function',
          inputs: [],
          outputs: [{ name: '', type: 'address' }],
          stateMutability: 'view',
        }],
        functionName: 'owner',
      }) as `0x${string}`;
      
      // Handle both static and dynamic auctions using the new builder pattern
      if (auctionType === 'static') {
        // Use WETH address directly from addresses
        const weth = addresses.v3.weth;

        // Build static auction using the new builder pattern
        const staticParams = new StaticAuctionBuilder()
          .tokenConfig({
            name: formData.tokenName,
            symbol: formData.tokenSymbol,
            tokenURI: "", // Should be fetched from metadata service
          })
          .saleConfig({
            initialSupply: parseEther("1000000000"), // 1 billion tokens
            numTokensToSell: parseEther("900000000"), // 900 million tokens
            numeraire: weth,
          })
          .poolByTicks({
            startTick: 175000,
            endTick: 225000,
            fee: 10000, // 1% fee tier
          })
          .withMigration({
            type: 'uniswapV2' as const
          })
          .withUserAddress(account.address)
          .withIntegrator(account.address)
          .build();
        
        console.log("=== STATIC AUCTION DEPLOYMENT (New Builder) ===");
        console.log("Static Params:", JSON.stringify(staticParams, (_key, value) => 
          typeof value === 'bigint' ? value.toString() : value, 2));
        console.log("==============================================");
        
        // Create static auction
        const result = await factory.createStaticAuction(staticParams);
        
        console.log("Static auction deployment completed!");
        console.log("Transaction hash:", result.transactionHash);
        console.log("Token address:", result.tokenAddress);
        console.log("Pool address:", result.poolAddress);
        
        return;
      }
      
      // Dynamic auction configuration using the new builder pattern
      // Get block timestamp first
      const block = await getBlock(publicClient);
      const adjustedTimestamp = block.timestamp + 300n; // Add 5 minutes
      
      // Build dynamic auction using the new builder pattern
      const dynamicParams = new DynamicAuctionBuilder()
        .tokenConfig({
          name: formData.tokenName,
          symbol: formData.tokenSymbol,
          tokenURI: "",
        })
        .saleConfig({
          initialSupply: parseEther("1000000000"), // 1 billion tokens
          numTokensToSell: parseEther("900000000"), // 900 million tokens
        })
        .poolConfig({
          fee: 3000, // 0.3% fee tier
          tickSpacing: 8, // Match V4 tick spacing
        })
        .auctionByTicks({
          startTick: 180000,
          endTick: 190000,
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
      
      console.log("=== DYNAMIC AUCTION DEPLOYMENT (New Builder) ===");
      console.log("Dynamic Params:", JSON.stringify(dynamicParams, (_key, value) => 
        typeof value === 'bigint' ? value.toString() : value, 2));
      console.log("Airlock Owner:", airlockOwner);
      console.log("Chain ID:", 84532);
      console.log("Current Address:", account.address);
      console.log("================================================");
      
      // Create dynamic auction using the built config
      const result = await factory.createDynamicAuction(dynamicParams);
      
      console.log("Dynamic auction deployment completed!");
      console.log("Transaction hash:", result.transactionHash);
      console.log("Token address:", result.tokenAddress);
      console.log("Hook address:", result.hookAddress);
      console.log("Pool ID:", result.poolId);

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
              <label className="text-sm font-medium">Token Name</label>
              <input 
                type="text"
                value={formData.tokenName}
                onChange={(e) => setFormData(prev => ({ ...prev, tokenName: e.target.value }))}
                className="w-full px-4 py-2 rounded-md bg-background/50 border border-input focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="e.g., My Awesome Token"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Token Symbol</label>
              <input 
                type="text"
                value={formData.tokenSymbol}
                onChange={(e) => setFormData(prev => ({ ...prev, tokenSymbol: e.target.value.toUpperCase() }))}
                className="w-full px-4 py-2 rounded-md bg-background/50 border border-input focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="e.g., MAT"
                maxLength={6}
              />
              <p className="text-xs text-muted-foreground">Maximum 6 characters, automatically converted to uppercase</p>
            </div>
            <div className="space-y-4 pt-4">
              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  className="flex-1 bg-primary/90 hover:bg-primary/80"
                  disabled={isDeploying}
                >
                  {isDeploying ? "Deploying..." : `Create ${auctionType === 'static' ? 'Static' : 'Dynamic'} Token`}
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
      </div>
    </div>
  )
}
