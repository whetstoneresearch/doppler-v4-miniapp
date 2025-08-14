import { useParams, useSearchParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { GraphQLClient } from "graphql-request"
import { Pool } from "@/utils/graphql"
import { Address, formatEther, maxUint256, parseEther, zeroAddress } from "viem"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useAccount, usePublicClient, useBalance } from "wagmi"
import { useWalletClient } from "wagmi"
import { 
  Quoter,
  getAddresses,
  dopplerHookAbi,
  dopplerLensAbi,
  DYNAMIC_FEE_FLAG
} from "doppler-sdk"
import { CommandBuilder, V4ActionBuilder, V4ActionType } from "doppler-router"

// Minimal ABI for UniversalRouter execute function
const universalRouterAbi = [
  {
    name: "execute",
    type: "function",
    inputs: [
      { name: "commands", type: "bytes", internalType: "bytes" },
      { name: "inputs", type: "bytes[]", internalType: "bytes[]" }
    ],
    outputs: [],
    stateMutability: "payable"
  }
] as const
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const client = new GraphQLClient("https://doppler-sdk-s1ck.marble.live/")

const GET_POOL_QUERY = `
  query GetPool($address: String!, $chainId: BigInt!) {
    pool(address: $address, chainId: $chainId) {
      address
      chainId
      tick
      sqrtPrice
      liquidity
      createdAt
      baseToken {
        address
        name
        symbol
      }
      quoteToken {
        address
        name
        symbol
      }
      price
      fee
      type
      dollarLiquidity
      dailyVolume {
        volumeUsd
      }
      volumeUsd
      percentDayChange
      totalFee0
      totalFee1
      graduationPercentage
      graduationBalance
      isToken0
      lastRefreshed
      lastSwapTimestamp
      reserves0
      reserves1
      asset {
        marketCapUsd
      }
    }
  }
`

export default function PoolDetails() {
  const { address } = useParams<{ address: string }>()
  const [searchParams] = useSearchParams()
  const account = useAccount()
  const { data: walletClient } = useWalletClient(account)
  const publicClient = usePublicClient()
  const chainId = searchParams.get('chainId') ? Number(searchParams.get('chainId')) : 84532
  const [amount, setAmount] = useState("")
  const [quotedAmount, setQuotedAmount] = useState<bigint | null>(null)
  const [isBuying, setIsBuying] = useState(true)
  const addresses = getAddresses(chainId)
  const { universalRouter } = addresses

  console.log('Pool address:', address)
  console.log('Chain ID from URL:', chainId)

  const { data: pool, isLoading, error } = useQuery({
    queryKey: ['pool', address, chainId],
    queryFn: async () => {
      console.log('Fetching pool with:', { address, chainId })
      const response = await client.request<{ pool: Pool }>(GET_POOL_QUERY, {
        address,
        chainId,
      })
      console.log('Pool response:', response)
      return response.pool
    },
  })

  const { data: baseTokenBalance } = useBalance({
    address: account.address,
    token: pool?.baseToken.address as Address,
  })

  const { data: quoteTokenBalance } = useBalance({
    address: account.address,
    token: pool?.quoteToken.address as Address,
  })

  // Helper function to properly handle currency addresses and sorting
  const getCurrencyAddress = (address: Address): Address => {
    // If it's the zero address, replace with WETH
    if (address === zeroAddress || address === "0x0000000000000000000000000000000000000000") {
      return addresses.weth || zeroAddress
    }
    return address
  }

  // Helper function to sort currencies for poolKey (currency0 < currency1)
  const sortCurrencies = (currencyA: Address, currencyB: Address): [Address, Address] => {
    const addrA = getCurrencyAddress(currencyA)
    const addrB = getCurrencyAddress(currencyB)
    
    // Convert to BigInt for comparison
    const a = BigInt(addrA)
    const b = BigInt(addrB)
    
    return a < b ? [addrA, addrB] : [addrB, addrA]
  }

  const fetchQuote = async (amountIn: bigint) => {
    if (!pool || !publicClient) return
    
    console.log('Pool type:', pool.type, 'Pool data:', pool)
    
    // Check if this is a V4 pool with a hook
    // V4 pools may have type as "v4" (lowercase), "V4", "DynamicAuction", etc.
    const poolType = pool.type?.toLowerCase()
    const isV4Pool = poolType === "v4" || poolType === "dynamicauction" || 
                     poolType === "hook" || !pool.type // If type is missing, assume V4
    
    if (isV4Pool) {
      try {
        // First, try to read poolKey from the hook contract
        const poolKeyArray = await publicClient?.readContract({
          address: address as Address,
          abi: dopplerHookAbi,
          functionName: "poolKey",
        }).catch(() => null)

        let key: {
          currency0: Address
          currency1: Address
          fee: number
          tickSpacing: number
          hooks: Address
        }

        if (!poolKeyArray) {
          // If poolKey doesn't exist, construct it from pool data
          // Ensure proper currency sorting and WETH address usage
          const [currency0, currency1] = sortCurrencies(
            pool.baseToken.address as Address,
            pool.quoteToken.address as Address
          )
          
          key = {
            currency0,
            currency1,
            fee: pool.fee || 3000, // Default fee if not provided
            tickSpacing: 60, // Default tick spacing for 0.3% fee
            hooks: address as Address // The pool address is the hook address
          }
        } else {
          // poolKey is returned as an array from the contract
          // Still need to ensure WETH is used instead of zero address
          const currency0 = getCurrencyAddress(poolKeyArray[0])
          const currency1 = getCurrencyAddress(poolKeyArray[1])
          
          key = {
            currency0,
            currency1,
            fee: poolKeyArray[2],
            tickSpacing: poolKeyArray[3],
            hooks: poolKeyArray[4],
          }
        }

        // Determine zeroForOne based on which token we're swapping from
        // We need to check if we're swapping from currency0 to currency1 or vice versa
        const baseTokenAddress = getCurrencyAddress(pool.baseToken.address as Address)
        const quoteTokenAddress = getCurrencyAddress(pool.quoteToken.address as Address)
        
        const zeroForOne = isBuying 
          ? key.currency0 === quoteTokenAddress  // Buying base with quote
          : key.currency0 === baseTokenAddress   // Selling base for quote
        
        // Use the Quoter class from the unified SDK
        const quoter = new Quoter(publicClient as any, chainId)
        const quote = await quoter.quoteExactInputV4({
          poolKey: key,
          zeroForOne: zeroForOne,
          exactAmount: amountIn,
          hookData: "0x",
        })
        
        return quote.amountOut
      } catch (error) {
        console.error("Error fetching V4 quote:", error)
        return null
      }
    } else {
      // For V3 pools, use a different quoting mechanism
      // This is a placeholder - you may need to implement V3 quoting
      console.log("V3 pool quoting not yet implemented")
      return null
    }
  }

  const executeSwap = async (amountIn: bigint) => {
    if (!pool) return
    if (!account.address || !walletClient) throw new Error("account must be connected");

    // Check if this is a V4 pool
    // V4 pools may have type as "v4" (lowercase), "V4", "DynamicAuction", etc.
    const poolType = pool.type?.toLowerCase()
    const isV4Pool = poolType === "v4" || poolType === "dynamicauction" || 
                     poolType === "hook" || !pool.type // If type is missing, assume V4
    
    if (isV4Pool) {
      try {
        // Try to read poolKey from the hook contract
        const poolKeyArray = await publicClient?.readContract({
          address: address as Address,
          abi: dopplerHookAbi,
          functionName: "poolKey",
        }).catch(() => null)

        let key: {
          currency0: Address
          currency1: Address
          fee: number
          tickSpacing: number
          hooks: Address
        }

        if (!poolKeyArray) {
          // If poolKey doesn't exist, construct it from pool data
          // Ensure proper currency sorting and WETH address usage
          const [currency0, currency1] = sortCurrencies(
            pool.baseToken.address as Address,
            pool.quoteToken.address as Address
          )
          
          key = {
            currency0,
            currency1,
            fee: pool.fee || 3000, // Default fee if not provided
            tickSpacing: 60, // Default tick spacing for 0.3% fee
            hooks: address as Address // The pool address is the hook address
          }
        } else {
          // poolKey is returned as an array from the contract
          // Still need to ensure WETH is used instead of zero address
          const currency0 = getCurrencyAddress(poolKeyArray[0])
          const currency1 = getCurrencyAddress(poolKeyArray[1])
          
          key = {
            currency0,
            currency1,
            fee: poolKeyArray[2],
            tickSpacing: poolKeyArray[3],
            hooks: poolKeyArray[4],
          }
        }

        // Determine zeroForOne based on which token we're swapping from
        // We need to check if we're swapping from currency0 to currency1 or vice versa
        const baseTokenAddress = getCurrencyAddress(pool.baseToken.address as Address)
        const quoteTokenAddress = getCurrencyAddress(pool.quoteToken.address as Address)
        
        const zeroForOne = isBuying 
          ? key.currency0 === quoteTokenAddress  // Buying base with quote
          : key.currency0 === baseTokenAddress   // Selling base for quote

        const actionBuilder = new V4ActionBuilder()
        const [actions, params] = actionBuilder.addSwapExactInSingle(key, zeroForOne, amountIn, 0n, "0x")
        .addAction(V4ActionType.SETTLE_ALL, [zeroForOne ? key.currency0 : key.currency1, maxUint256])
        .addAction(V4ActionType.TAKE_ALL, [zeroForOne ? key.currency1 : key.currency0, 0]).build()
        const [commands, inputs] = new CommandBuilder().addV4Swap(actions, params).build()

        await walletClient?.writeContract({
          address: universalRouter,
          abi: universalRouterAbi,
          functionName: "execute",
          args: [commands, inputs],
          value: zeroForOne ? amountIn : 0n
        })
      } catch (error) {
        console.error("Error executing V4 swap:", error)
        throw error
      }
    } else {
      // For V3 pools, use a different swap mechanism
      console.log("V3 pool swapping not yet implemented")
      throw new Error("V3 pool swapping not yet implemented")
    }
  }

  const formatNumber = (value: bigint) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(formatEther(value)))
  }

  const formatPercent = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value / 100)
  }

  const handleAmountChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setAmount(value)
    
    if (value && pool) {
      try {
        const amountIn = parseEther(value)
        const quote = await fetchQuote(amountIn)
        setQuotedAmount(quote ?? null)
      } catch (error) {
        console.error("Error fetching quote:", error)
        setQuotedAmount(null)
      }
    } else {
      setQuotedAmount(null)
    }
  }


  const handleTabChange = (value: string) => {
    setIsBuying(value === "buy")
    setAmount("")
    setQuotedAmount(null)
  }

  const handleSwap = () => {
    if (!amount || !quotedAmount) return
    executeSwap(parseEther(amount))
  }

  const handleMaxClick = () => {
    if (!account.address || !pool) return
    
    if (isBuying) {
      // When buying base token, use quote token balance
      if (pool.quoteToken.address === zeroAddress) {
        // ETH balance
        setAmount(formatEther(quoteTokenBalance?.value ?? 0n))
      } else {
        // ERC20 balance
        setAmount(formatEther(quoteTokenBalance?.value ?? 0n))
      }
    } else {
      // When selling base token, use base token balance
      setAmount(formatEther(baseTokenBalance?.value ?? 0n))
    }
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="text-4xl font-bold mb-8 text-primary">Loading Pool Details...</h1>
        <div className="border border-primary/20 rounded-lg p-6 bg-card/50 backdrop-blur animate-pulse">
          <div className="h-8 bg-primary/20 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-primary/20 rounded w-2/3 mb-6"></div>
          <div className="h-10 bg-primary/20 rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !pool) {
    return (
      <div className="p-8">
        <h1 className="text-4xl font-bold mb-8 text-primary">Error Loading Pool</h1>
        <div className="text-red-500">{(error as Error)?.message || 'Pool not found'}</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8 text-primary">Pool Details</h1>
      <div className="border border-primary/20 rounded-lg p-6 bg-card/50 backdrop-blur mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-semibold">
              {pool.baseToken.symbol}/{pool.quoteToken.symbol}
            </h2>
            <p className="text-muted-foreground">
              {pool.baseToken.name} / {pool.quoteToken.name}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-medium">{formatNumber(pool.dollarLiquidity)}</p>
            <p className="text-sm text-muted-foreground">Liquidity</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-lg font-medium">{formatNumber(BigInt(pool.volumeUsd))}</p>
            <p className="text-sm text-muted-foreground">24h Volume</p>
          </div>
          <div>
            <p className={`text-lg font-medium ${pool.percentDayChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatPercent(pool.percentDayChange)}
            </p>
            <p className="text-sm text-muted-foreground">24h Change</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-lg font-medium">
              {pool.asset ? formatNumber(BigInt(pool.asset.marketCapUsd)) : '$0'}
            </p>
            <p className="text-sm text-muted-foreground">Market Cap</p>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Additional Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Fee</p>
              <p className="text-lg">{pool.fee === 8388608 ? 'Dynamic' : `${(pool.fee / 10000).toFixed(2)}%`}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <p className="text-lg">{pool.type}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="text-lg">{new Date(Number(pool.createdAt) * 1000).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="text-lg font-mono text-sm break-all">{pool.address}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border border-primary/20 rounded-lg p-6 bg-card/50 backdrop-blur">
        <h2 className="text-2xl font-semibold mb-6">Swap</h2>
        
        <Tabs defaultValue="buy" className="w-full" onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buy">Buy {pool.baseToken.symbol}</TabsTrigger>
            <TabsTrigger value="sell">Sell {pool.baseToken.symbol}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="buy" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  Amount ({pool.quoteToken.symbol})
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMaxClick}
                  className="text-primary hover:text-primary/80"
                >
                  Max
                </Button>
              </div>
              <Input
                type="number"
                placeholder="0.0"
                value={amount}
                onChange={handleAmountChange}
                className="bg-background/50"
              />
              {quotedAmount !== null && (
                <p className="text-sm text-muted-foreground">
                  You will receive: {formatEther(quotedAmount)} {pool.baseToken.symbol}
                </p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="sell" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  Amount ({pool.baseToken.symbol})
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMaxClick}
                  className="text-primary hover:text-primary/80"
                >
                  Max
                </Button>
              </div>
              <Input
                type="number"
                placeholder="0.0"
                value={amount}
                onChange={handleAmountChange}
                className="bg-background/50"
              />
              {quotedAmount !== null && (
                <p className="text-sm text-muted-foreground">
                  You will receive: {formatEther(quotedAmount)} {pool.quoteToken.symbol}
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <Button 
          onClick={handleSwap}
          className="w-full mt-4"
          disabled={!amount || !quotedAmount}
        >
          Swap
        </Button>
      </div>
    </div>
  )
}
