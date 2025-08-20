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
} from "@whetstone-research/doppler-sdk"
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
    pools(
      where: { address: $address, chainId: $chainId }
      limit: 1
    ) {
      items {
        address
        chainId
        tick
        sqrtPrice
        liquidity
        createdAt
        baseToken { address name symbol }
        quoteToken { address name symbol }
        price
        fee
        type
        dollarLiquidity
        dailyVolume { volumeUsd }
        volumeUsd
        percentDayChange
        totalFee0
        totalFee1
        isToken0
        isCreatorCoin
        isContentCoin
        lastRefreshed
        lastSwapTimestamp
        reserves0
        reserves1
        asset {
          marketCapUsd
          migrated
          migratedAt
          v2Pool
        }
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
      const response = await client.request<{ pools: { items: any[] } }>(GET_POOL_QUERY, {
        address,
        chainId,
      })
      console.log('Full pool GraphQL response:', response)
      const p = response.pools.items?.[0]
      if (!p) return undefined as any
      // Normalize into Pool shape used by UI
      const normalized: Pool = {
        address: p.address,
        chainId: BigInt(p.chainId),
        tick: p.tick,
        sqrtPrice: BigInt(p.sqrtPrice),
        liquidity: BigInt(p.liquidity),
        createdAt: BigInt(p.createdAt),
        baseToken: p.baseToken,
        quoteToken: p.quoteToken,
        price: BigInt(p.price),
        fee: p.fee,
        type: p.type || 'v3',
        dollarLiquidity: BigInt(p.dollarLiquidity),
        dailyVolume: p.dailyVolume ? { volumeUsd: BigInt(p.dailyVolume.volumeUsd) } : null,
        asset: p.asset ? {
          marketCapUsd: BigInt(p.asset.marketCapUsd),
          migrated: p.asset.migrated,
          migratedAt: p.asset.migratedAt ? BigInt(p.asset.migratedAt) : undefined,
          v2Pool: p.asset.v2Pool ?? undefined,
        } : null,
        volumeUsd: BigInt(p.volumeUsd),
        percentDayChange: p.percentDayChange,
        totalFee0: BigInt(p.totalFee0),
        totalFee1: BigInt(p.totalFee1),
        isToken0: p.isToken0,
        isCreatorCoin: p.isCreatorCoin || false,
        isContentCoin: p.isContentCoin || false,
        lastRefreshed: p.lastRefreshed ? BigInt(p.lastRefreshed) : null,
        lastSwapTimestamp: p.lastSwapTimestamp ? BigInt(p.lastSwapTimestamp) : null,
        reserves0: BigInt(p.reserves0),
        reserves1: BigInt(p.reserves1),
        // V4 pools might have poolKey data
        poolKey: p.currency0 ? {
          currency0: p.currency0,
          currency1: p.currency1,
          fee: p.fee,
          tickSpacing: p.tickSpacing,
          hooks: p.hooks || p.address,
        } : undefined,
        currency0: p.currency0,
        currency1: p.currency1,
        tickSpacing: p.tickSpacing,
        hooks: p.hooks || p.address,
      }
      return normalized
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

  // Uniswap v4 Quoter ABI (minimal)
  const uniswapV4QuoterAbi = [
    {
      name: "quoteExactInputSingle",
      type: "function",
      stateMutability: "view",
      inputs: [
        {
          name: "key",
          type: "tuple",
          components: [
            { name: "currency0", type: "address" },
            { name: "currency1", type: "address" },
            { name: "fee", type: "uint24" },
            { name: "tickSpacing", type: "int24" },
            { name: "hooks", type: "address" },
          ],
        },
        { name: "zeroForOne", type: "bool" },
        { name: "exactAmount", type: "uint256" },
        { name: "hookData", type: "bytes" },
      ],
      outputs: [
        { name: "amountOut", type: "uint256" },
      ],
    },
  ] as const

  const resolveV4QuoterAddress = (): Address | undefined => {
    const a: any = addresses
    return (
      a?.v4Quoter ||
      a?.uniswapV4Quoter ||
      a?.quoter ||
      a?.v4?.quoter // in case nested structure
    ) as Address | undefined
  }

  // (currency sorting helper removed; rely on indexer isToken0)

  const fetchQuote = async (amountIn: bigint) => {
    if (!pool || !publicClient) return
    
    console.log('Pool type:', pool.type, 'Pool data:', pool)
    console.log('Asset migrated status:', pool.asset?.migrated)
    
    // Check if the pool has migrated to V2
    const isMigrated = pool.asset?.migrated === true
    
    if (isMigrated && pool.asset?.v2Pool) {
      // Handle migrated V2 pools
      try {
        const quoter = new Quoter(publicClient, chainId)
        
        // For V2 pools, we use a simple path
        const baseTokenAddress = getCurrencyAddress(pool.baseToken.address as Address)
        const quoteTokenAddress = getCurrencyAddress(pool.quoteToken.address as Address)
        
        // Build the path based on whether we're buying or selling
        const path = isBuying 
          ? [quoteTokenAddress, baseTokenAddress]  // Swap quote for base (buying)
          : [baseTokenAddress, quoteTokenAddress]  // Swap base for quote (selling)
        
        const amounts = await quoter.quoteExactInputV2({
          amountIn: amountIn,
          path: path,
        })
        
        // The output amount is the last element in the amounts array
        return amounts[amounts.length - 1]
      } catch (error) {
        console.error("Error fetching V2 quote:", error)
        return null
      }
    }
    
    // Check if this is a V4 pool with a hook
    // V4 pools may have type as "v4" (lowercase), "V4", "DynamicAuction", etc.
    const poolType = pool.type?.toLowerCase()
    const isV4Pool = poolType === "v4" || poolType === "dynamicauction" || 
                     poolType === "hook" || !pool.type // If type is missing, assume V4
    
    if (isV4Pool && !isMigrated) {
      try {
        // Use PoolKey directly from indexer data
        const key = {
          currency0: pool.currency0 as Address,
          currency1: pool.currency1 as Address,
          fee: pool.fee || 3000,
          tickSpacing: pool.tickSpacing || 60,
          hooks: (pool.hooks || address) as Address,
        }

        // Determine zeroForOne based on which token we're swapping from
        // We need to check if we're swapping from currency0 to currency1 or vice versa
        const zeroForOne = isBuying
          ? key.currency0.toLowerCase() === (pool.quoteToken.address as Address).toLowerCase() // quote -> base
          : key.currency0.toLowerCase() === (pool.baseToken.address as Address).toLowerCase()  // base -> quote

        // Prefer direct Uniswap v4 Quoter call
        const v4QuoterAddress = resolveV4QuoterAddress()
        if (!v4QuoterAddress) {
          console.warn("v4 Quoter address not found in addresses; falling back to SDK Quoter")
          const quoter = new Quoter(publicClient, chainId)
          const quote = await quoter.quoteExactInputV4({
            poolKey: key,
            zeroForOne,
            exactAmount: amountIn,
            hookData: "0x",
          })
          return quote.amountOut
        }

        console.log('Using Uniswap v4 Quoter:', v4QuoterAddress)
        console.log('quote params', { key, zeroForOne, amountIn: amountIn.toString(), hookData: '0x' })
        const result: any = await publicClient.readContract({
          address: v4QuoterAddress,
          abi: uniswapV4QuoterAbi,
          functionName: "quoteExactInputSingle",
          args: [key, zeroForOne, amountIn, "0x"],
        })
        const amountOut: bigint = typeof result === 'bigint' ? result : (result?.amountOut as bigint)
        return amountOut
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

    // Check if the pool has migrated to V2
    const isMigrated = pool.asset?.migrated === true
    
    if (isMigrated && pool.asset?.v2Pool) {
      // Handle migrated V2 pools
      console.log("Executing V2 swap for migrated pool")
      // For V2 swaps, we would need to use a different router approach
      // This would require implementing V2 swap commands with the UniversalRouter
      // For now, we'll throw an informative error
      throw new Error("V2 swap execution not yet implemented for migrated pools. Please use the main Pure Markets interface.")
    }

    // Check if this is a V4 pool
    // V4 pools may have type as "v4" (lowercase), "V4", "DynamicAuction", etc.
    const poolType = pool.type?.toLowerCase()
    const isV4Pool = poolType === "v4" || poolType === "dynamicauction" || 
                     poolType === "hook" || !pool.type // If type is missing, assume V4
    
    if (isV4Pool && !isMigrated) {
      try {
        // Use PoolKey directly from indexer data
        const key = {
          currency0: pool.currency0 as Address,
          currency1: pool.currency1 as Address,
          fee: pool.fee || 3000,
          tickSpacing: pool.tickSpacing || 60,
          hooks: (pool.hooks || address) as Address,
        }

        // Determine zeroForOne based on which token we're swapping from
        // We need to check if we're swapping from currency0 to currency1 or vice versa
        const zeroForOne = isBuying 
          ? key.currency0.toLowerCase() === (pool.quoteToken.address as Address).toLowerCase()
          : key.currency0.toLowerCase() === (pool.baseToken.address as Address).toLowerCase()

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
            <div className="inline-flex items-center mt-2 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
              {pool.type === 'v4' ? '🚀 Dynamic Auction' : '📊 Static Auction'}
            </div>
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
              <p className="text-sm text-muted-foreground">Auction Type</p>
              <p className="text-lg">{pool.type === 'v4' ? 'Dynamic (V4)' : 'Static (V3)'}</p>
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
