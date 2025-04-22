import { Button } from "@/components/ui/button"
import { useAccount, useBalance, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { Link } from "react-router-dom"

export function Navbar() {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: balance } = useBalance({
    address: address,
  })

  const truncateAddress = (addr: string) => {
    return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : ''
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container py-3 px-4 mx-auto">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-lg font-bold bg-gradient-to-r from-blue-500 via-violet-500 to-purple-500 bg-clip-text text-transparent">
              Doppler Pools
            </span>
          </Link>

          {isConnected && address ? (
            <div className="flex items-center gap-4">
              <div className="flex h-9 items-center justify-center rounded-md border bg-muted/50 px-4 text-sm text-muted-foreground">
                <span className="text-primary">
                  {balance?.formatted ? Number(balance.formatted).toFixed(4) : '0.0000'} ETH
                </span>
              </div>
              <div className="flex h-9 items-center justify-center rounded-md border bg-muted/50 px-4 text-sm text-muted-foreground">
                {truncateAddress(address)}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => disconnect()}
                className="h-9"
              >
                Disconnect
              </Button>
            </div>
          ) : (
            <Button 
              onClick={() => connect({ connector: injected() })}
              variant="outline"
              className="relative overflow-hidden group"
            >
              <span className="relative z-10">Connect Wallet</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-violet-500/20 to-purple-500/20 group-hover:opacity-100 opacity-0 transition-opacity duration-300" />
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}