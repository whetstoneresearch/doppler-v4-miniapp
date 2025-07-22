import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { useState } from "react"
import { useAccount, useWalletClient, usePublicClient } from "wagmi"
import { getAddresses } from "@/utils/getAddresses"
import { getDrift } from "@/utils/drift"
import { getBlock } from "viem/actions"
import { tokenParams } from "@/utils/poolConfig"
import { ReadWriteFactory } from "doppler-v4-sdk"
import { DopplerSDK } from "doppler-sdk"
import { PublicClient } from "viem"

export default function CreatePool() {
  const account = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient() as PublicClient
  const [, setIsDeploying] = useState(false)
  const [isDeployingUnified, setIsDeployingUnified] = useState(false)

  const addresses = getAddresses(84532)

  const [formData, setFormData] = useState({
    tokenName: '',
    tokenSymbol: '',
  })

  const handleDeploy = async (e: React.FormEvent) => {
    if (!walletClient) throw new Error("Wallet client not found");
    e.preventDefault();
    setIsDeploying(true);
    try {
      if (!account.address) throw new Error("Account address not found");

      const block = await getBlock(walletClient)
      console.log(addresses)

      const drift = getDrift(walletClient);

      // Add 5 minutes to current timestamp to ensure start time is in the future
      // The SDK adds 30 seconds to this, so we'll have ~5.5 minutes buffer
      const adjustedTimestamp = block.timestamp + 300n;
      const deployParams = tokenParams({
        name: formData.tokenName,
        symbol: formData.tokenSymbol,
        timestamp: adjustedTimestamp,
      })
      // @ts-ignore
      const rwFactory = new ReadWriteFactory(addresses.airlock, drift);
      
      // Encode V4 migrator data with beneficiaries
      // 95% to token creator, 5% to airlock owner (handled automatically by SDK)
      const v4MigratorData = await rwFactory.encodeV4MigratorData({
        fee: 3000, // 0.3% fee tier
        tickSpacing: 60, // Standard tick spacing for 0.3% pools
        lockDuration: 60 * 60 * 24 * 30, // 30 days lock duration
        beneficiaries: [
          {
            beneficiary: account.address, // Token creator gets 95% (SDK will adjust this)
            shares: BigInt(1e18), // 100% (SDK will scale to 95%)
          }
        ]
      }, true); // includeDefaultBeneficiary = true to add 5% for airlock owner
      
        const { createParams, hook, token } = rwFactory.buildConfig(
        { ...deployParams, liquidityMigratorData: v4MigratorData },
        addresses
      )
      
      // Log V4 SDK arguments
      console.log("=== V4 SDK DEPLOYMENT ARGUMENTS ===");
      console.log("Deploy Params:", JSON.stringify(deployParams, (key, value) => 
        typeof value === 'bigint' ? value.toString() : value, 2));
      console.log("Addresses:", JSON.stringify(addresses, null, 2));
      console.log("V4 Migrator Data:", v4MigratorData);
      console.log("Create Params:", JSON.stringify(createParams, (key, value) => 
        typeof value === 'bigint' ? value.toString() : value, 2));
      console.log("Expected Hook Address:", hook);
      console.log("Expected Token Address:", token);
      console.log("=================================");

      const simulation = await rwFactory.simulateCreate(createParams)
      console.log("V4 SDK Simulation Result:", simulation);
      
      const txHash = await rwFactory.create(createParams)
      console.log("V4 SDK Transaction Hash:", txHash)
    } catch (error) {
      console.error("Deployment failed:", error);
    } finally {
      setIsDeploying(false);
    }
  };

  const handleDeployUnified = async (e: React.FormEvent) => {
    if (!walletClient || !publicClient) throw new Error("Wallet client or public client not found");
    e.preventDefault();
    setIsDeployingUnified(true);
    try {
      if (!account.address) throw new Error("Account address not found");

      // Use the unified SDK
      const sdk = new DopplerSDK({
        walletClient,
        publicClient,
        chainId: 84532, // Base Sepolia
      });

      const factory = sdk.factory;
      
      // Get airlock owner address
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
      }) as `0x${string}`;
      
      // Log unified SDK arguments before building config
      const unifiedSDKParams = {
        userAddress: account.address,
        token: {
          name: formData.tokenName,
          symbol: formData.tokenSymbol,
          tokenURI: "",
          yearlyMintRate: 0n,
        },
        sale: {
          initialSupply: BigInt("1000000000000000000000000000"), // 1 billion tokens
          numTokensToSell: BigInt("900000000000000000000000000"), // 900 million tokens
          numeraire: "0x0000000000000000000000000000000000000000" as `0x${string}`, // ETH
        },
        auction: {
          duration: 7, // 7 days
          epochLength: 3600, // 1 hour
          startTick: 180000,
          endTick: 190000,
          minProceeds: BigInt("100000000000000000000"), // 100 ETH
          maxProceeds: BigInt("600000000000000000000"), // 600 ETH
          numPdSlugs: 5,
        },
        pool: {
          fee: 3000, // 0.3% fee tier
          tickSpacing: 8, // Match V4 SDK tick spacing from poolConfig.ts
        },
        migration: {
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
        },
        governance: {
          initialVotingDelay: 7200, // 2 hours
          initialVotingPeriod: 50400, // 14 hours
          initialProposalThreshold: 0n,
        },
        integrator: "0x0000000000000000000000000000000000000000" as `0x${string}`,
      };
      
      // Log unified SDK arguments
      console.log("=== UNIFIED SDK DEPLOYMENT ARGUMENTS ===");
      console.log("Unified SDK Params:", JSON.stringify(unifiedSDKParams, (key, value) => 
        typeof value === 'bigint' ? value.toString() : value, 2));
      console.log("Airlock Owner:", airlockOwner);
      console.log("Chain ID:", 84532);
      console.log("Current Address:", account.address);
      
      // Get block timestamp first (same as V4 SDK)
      const block = await getBlock(publicClient);
      const adjustedTimestamp = block.timestamp + 300n; // Add 5 minutes
      
      // Build config first to get all params
      const buildConfig = factory.buildDynamicAuctionConfig({
        name: formData.tokenName,
        symbol: formData.tokenSymbol,
        tokenURI: "",
        totalSupply: BigInt("1000000000000000000000000000"),
        numTokensToSell: BigInt("900000000000000000000000000"),
        recipients: [],
        amounts: [],
        vestingDuration: 0n,
        yearlyMintRate: 0n,
        tickRange: { startTick: 180000, endTick: 190000 },
        duration: 7,
        epochLength: 3600,
        tickSpacing: 8, // Match V4 SDK tick spacing
        fee: 3000,
        minProceeds: BigInt("100000000000000000000"),
        maxProceeds: BigInt("600000000000000000000"),
        blockTimestamp: Number(adjustedTimestamp), // Pass the adjusted timestamp (like V4 SDK)
        // The unified SDK will add 30 seconds to this, just like V4 SDK does
        migration: unifiedSDKParams.migration,
        useGovernance: true,
      }, account.address);
      
      console.log("Built Config:", JSON.stringify(buildConfig, (key, value) => 
        typeof value === 'bigint' ? value.toString() : value, 2));
      console.log("========================================");
      
      // Create dynamic auction using unified SDK with the built config
      const result = await factory.createDynamicAuction(buildConfig);
      
      console.log("Unified SDK deployment completed!");
      console.log("Transaction hash:", result.transactionHash);
      console.log("Token address:", result.tokenAddress);
      console.log("Hook address:", result.hookAddress);
      console.log("Pool ID:", result.poolId);

    } catch (error) {
      console.error("Unified SDK deployment failed:", error);
    } finally {
      setIsDeployingUnified(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-primary">Create New Pool</h1>
        <div className="border border-primary/20 rounded-lg p-6 bg-card/50 backdrop-blur">
          <form onSubmit={handleDeploy} className="space-y-6">
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
            <div className="mt-6 p-4 border border-yellow-500/30 rounded-lg bg-yellow-500/5">
              <p className="text-sm text-yellow-600 mb-2">Choose your deployment method:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• <strong>V4 SDK</strong>: Uses the existing V4-specific SDK (current production)</li>
                <li>• <strong>Unified SDK</strong>: Uses the new unified SDK (experimental)</li>
              </ul>
            </div>
            <div className="space-y-4 pt-4">
              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  className="flex-1 bg-primary/90 hover:bg-primary/80"
                  disabled={isDeployingUnified}
                >
                  Create Token (V4 SDK)
                </Button>
                <Button 
                  onClick={handleDeployUnified}
                  className="flex-1 bg-green-600/90 hover:bg-green-600/80"
                  disabled={isDeployingUnified}
                >
                  {isDeployingUnified ? "Deploying..." : "Create Token (Unified SDK)"}
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
