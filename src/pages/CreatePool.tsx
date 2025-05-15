import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { useState } from "react"
import { useAccount, useWalletClient } from "wagmi"
import { getAddresses } from "@/utils/getAddresses"
import { getDrift } from "@/utils/drift"
import { getBlock } from "viem/actions"
import { tokenParams } from "@/utils/poolConfig"
import { ReadWriteFactory } from "doppler-v4-sdk"

export default function CreatePool() {
  const account = useAccount()
  const { data: walletClient } = useWalletClient()
  const [, setIsDeploying] = useState(false)

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
      const deployParams = tokenParams({
        name: formData.tokenName,
        symbol: formData.tokenSymbol,
        timestamp: block.timestamp,
      })
      // @ts-ignore
      const rwFactory = new ReadWriteFactory(addresses.airlock, drift);
      const { createParams, hook, token } = rwFactory.buildConfig(deployParams, addresses)
      console.log(hook, token)
      await rwFactory.simulateCreate(createParams)
      await rwFactory.create(createParams)
    } catch (error) {
      console.error("Deployment failed:", error);
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
            <div className="flex gap-4 pt-4">
              <Button 
                type="submit" 
                className="flex-1 bg-primary/90 hover:bg-primary/80"
              >
                Create Token
              </Button>
              <Link to="/" className="flex-1">
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
