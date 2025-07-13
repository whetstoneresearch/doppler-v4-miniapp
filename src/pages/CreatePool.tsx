import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { useState } from "react"
import { useAccount, useWalletClient } from "wagmi"
import { getAddresses } from "@/utils/getAddresses"
import { getDrift } from "@/utils/drift"
import { getBlock } from "viem/actions"
import { tokenParams } from "@/utils/poolConfig"
import { ReadWriteFactory } from "doppler-v4-sdk"
import { encodeAbiParameters, parseUnits } from "viem"

const V3_MIGRATOR_ADDRESS = "0x0a3d3678b31cff5f926c2a0384e742e4747605a0" as `0x${string}`;

export default function CreatePool() {
  const account = useAccount()
  const { data: walletClient } = useWalletClient()
  const [, setIsDeploying] = useState(false)

  const [useV3Migrator, setUseV3Migrator] = useState(false)

  const [formData, setFormData] = useState({
    tokenName: '',
    tokenSymbol: '',
    integratorFeeReceiver: '',
    creatorFeeReceiver: '',
    creatorFee: '',
    minUnlockDate: '',
  })

  const handleDeploy = async (e: React.FormEvent) => {
    if (!walletClient) throw new Error("Wallet client not found");
    e.preventDefault();
    setIsDeploying(true);
    try {
      if (!account.address) throw new Error("Account address not found");

      const block = await getBlock(walletClient)
      
      // Compute addresses here to ensure we get the current state
      const baseAddresses = getAddresses(84532)
      const addresses = useV3Migrator 
        ? { ...baseAddresses, migrator: V3_MIGRATOR_ADDRESS }
        : baseAddresses
      
      console.log('Using addresses:', addresses)
      console.log('useV3Migrator:', useV3Migrator)

      const drift = getDrift(walletClient);
      const deployParams = tokenParams({
        name: formData.tokenName,
        symbol: formData.tokenSymbol,
        timestamp: block.timestamp,
      })
      const rwFactory = new ReadWriteFactory(addresses.airlock, drift);
      let liqData = "0x" as `0x${string}`;
      
      if (useV3Migrator) {
        try {
          // Validate required fields
          if (!formData.integratorFeeReceiver) {
            alert("Integrator fee receiver is required for V3 migrator");
            return;
          }
          
          // Creator fee is a percentage (0-95%), convert to WAD format (multiply by 1e16 to get 1e18 scale)
          let creatorFeeWad = 0n;
          if (formData.creatorFee && formData.creatorFeeReceiver) {
            const feePercentage = parseFloat(formData.creatorFee);
            if (feePercentage < 0 || feePercentage > 95) {
              alert("Creator fee must be between 0% and 95%");
              return;
            }
            creatorFeeWad = parseUnits(formData.creatorFee, 16); // Convert percentage to WAD
          }
          
          // If creator fee is set, creator fee receiver must be set (and vice versa)
          if ((formData.creatorFee && !formData.creatorFeeReceiver) || (!formData.creatorFee && formData.creatorFeeReceiver)) {
            alert("Both creator fee and creator fee receiver must be set together");
            return;
          }
          
          const unlockTimestamp = formData.minUnlockDate ? BigInt(Math.floor(new Date(formData.minUnlockDate).getTime() / 1000)) : BigInt(Math.floor(Date.now() / 1000));
          
          liqData = encodeAbiParameters(
            [
              { name: 'integratorFeeReceiver', type: 'address' },
              { name: 'creatorFeeReceiver', type: 'address' },
              { name: 'creatorFee', type: 'uint256' },
              { name: 'minUnlockDate', type: 'uint64' }
            ],
            [
              formData.integratorFeeReceiver as `0x${string}`,
              (formData.creatorFeeReceiver || '0x0000000000000000000000000000000000000000') as `0x${string}`,
              creatorFeeWad,
              unlockTimestamp
            ]
          );
        } catch (error) {
          console.error("Error encoding migrator data:", error);
          alert("Invalid migrator parameters");
          return;
        }
      }
      const { createParams, hook, token } = rwFactory.buildConfig({ ...deployParams, liquidityMigratorData: liqData }, addresses)
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
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="useV3Migrator"
                  checked={useV3Migrator}
                  onChange={(e) => setUseV3Migrator(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="useV3Migrator" className="text-sm font-medium">
                  Use V3 Migrator
                </label>
              </div>
              <p className="text-xs text-muted-foreground">
                Migrator: {useV3Migrator ? V3_MIGRATOR_ADDRESS : getAddresses(84532).migrator}
              </p>
              
              {useV3Migrator && (
                <div className="space-y-4 p-4 rounded-md bg-background/30 border border-primary/10">
                  <h3 className="text-sm font-semibold">V3 Migrator Settings</h3>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Integrator Fee Receiver</label>
                    <input 
                      type="text"
                      value={formData.integratorFeeReceiver}
                      onChange={(e) => setFormData(prev => ({ ...prev, integratorFeeReceiver: e.target.value }))}
                      className="w-full px-4 py-2 rounded-md bg-background/50 border border-input focus:border-primary focus:ring-1 focus:ring-primary"
                      placeholder="0x..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Creator Fee Receiver</label>
                    <input 
                      type="text"
                      value={formData.creatorFeeReceiver}
                      onChange={(e) => setFormData(prev => ({ ...prev, creatorFeeReceiver: e.target.value }))}
                      className="w-full px-4 py-2 rounded-md bg-background/50 border border-input focus:border-primary focus:ring-1 focus:ring-primary"
                      placeholder="0x..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Creator Fee (%)</label>
                    <input 
                      type="number"
                      step="0.1"
                      min="0"
                      max="95"
                      value={formData.creatorFee}
                      onChange={(e) => setFormData(prev => ({ ...prev, creatorFee: e.target.value }))}
                      className="w-full px-4 py-2 rounded-md bg-background/50 border border-input focus:border-primary focus:ring-1 focus:ring-primary"
                      placeholder="0.0"
                    />
                    <p className="text-xs text-muted-foreground">Percentage of trading fees (0-95%). Doppler takes 5%.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Minimum Unlock Date</label>
                    <input 
                      type="datetime-local"
                      value={formData.minUnlockDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, minUnlockDate: e.target.value }))}
                      className="w-full px-4 py-2 rounded-md bg-background/50 border border-input focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                    <p className="text-xs text-muted-foreground">Optional: Set a minimum date for liquidity unlock</p>
                  </div>
                </div>
              )}
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
