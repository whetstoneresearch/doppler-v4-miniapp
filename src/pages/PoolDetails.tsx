import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { GraphQLClient } from "graphql-request"
import { Pool } from "@/utils/graphql"
import { Address, formatEther, maxUint256, parseEther, zeroAddress } from "viem"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { DOPPLER_V4_ADDRESSES, dopplerAbi, universalRouterAbi } from "doppler-v4-sdk"
import { getDrift } from "@/utils/drift"
import { useAccount, usePublicClient, useBalance } from "wagmi"
import { useWalletClient } from "wagmi"
import { ReadQuoter } from "doppler-v4-sdk/dist/entities/quoter/ReadQuoter"
import { CommandBuilder, V4ActionBuilder, V4ActionType } from "doppler-router"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const client = new GraphQLClient("https://doppler-v4-poc.ponder-dev.com/")

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
      graduationThreshold
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
  const account = useAccount()
  const { data: walletClient } = useWalletClient(account)
  const publicClient = usePublicClient()
  const chainId = 84532 // Base Goerli chain ID
  const [amount, setAmount] = useState("")
  const [quotedAmount, setQuotedAmount] = useState<bigint | null>(null)
  const [isBuying, setIsBuying] = useState(true)
  const { v4Quoter, universalRouter } = DOPPLER_V4_ADDRESSES[chainId]

  console.log(address)

  const { data: pool, isLoading, error } = useQuery({
    queryKey: ['pool', address],
    queryFn: async () => {
      const response = await client.request<{ pool: Pool }>(GET_POOL_QUERY, {
        address,
        chainId,
      })
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

  const fetchQuote = async (amountIn: bigint) => {
    if (!pool) return
    const drift = getDrift(walletClient)
    const quoter = new ReadQuoter(v4Quoter, drift)

    const poolKey = await publicClient?.readContract({
      address: address as Address,
      abi: dopplerAbi,
      functionName: "poolKey",
    })

    if (!poolKey) return

    const key = {
      currency0: poolKey[0],
      currency1: poolKey[1],
      fee: poolKey[2],
      tickSpacing: poolKey[3],
      hooks: poolKey[4],
    }

    const zeroForOne = isBuying ? true : false

    const quote = await quoter.quoteExactInputV4({
      poolKey: key,
      zeroForOne: zeroForOne,
      exactAmount: amountIn,
      hookData: "0x",
    })

    return quote?.amountOut
  }

  const executeSwap = async (amountIn: bigint) => {
    if (!pool) return
    if (!account.address || !walletClient) throw new Error("account must be connected");


    const poolKey = await publicClient?.readContract({
      address: address as Address,
      abi: dopplerAbi,
      functionName: "poolKey",
    })

    if (!poolKey) return

    const key = {
      currency0: poolKey[0],
      currency1: poolKey[1],
      fee: poolKey[2],
      tickSpacing: poolKey[3],
      hooks: poolKey[4],
    }

    const zeroForOne = isBuying ? true : false

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
            <p className="text-lg font-medium">{formatNumber(BigInt(pool.asset.marketCapUsd ?? 0))}</p>
            <p className="text-sm text-muted-foreground">Market Cap</p>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Additional Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Fee</p>
              <p className="text-lg">{pool.fee === 8388608 ? 'Dynamic' : `${pool.fee}%`}</p>
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