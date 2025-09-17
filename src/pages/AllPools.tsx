import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { usePools, PoolFilter } from "@/hooks/usePools"
import { Pool } from "@/utils/graphql"
import { formatEther } from "viem"
import { useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

function PoolCard({ pool }: { pool: Pool }) {
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

  const normalizedType = pool.type?.toLowerCase()
  const isMulticurve = normalizedType === 'multicurve'
  const isV4Like = isMulticurve || normalizedType === 'v4' || normalizedType === 'dynamicauction' || normalizedType === 'hook' || !pool.type
  const poolTypeBadge = isMulticurve ? '🌀 Multicurve' : isV4Like ? '🚀 Dynamic' : '📊 Static'

  return (
    <div className="border border-primary/20 rounded-lg p-6 bg-card/50 backdrop-blur hover:border-primary/40 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-semibold">
            {pool.baseToken.symbol}/{pool.quoteToken.symbol}
          </h2>
          <p className="text-muted-foreground">
            {pool.baseToken.name} / {pool.quoteToken.name}
          </p>
          <div className="inline-flex items-center mt-2 px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
            {poolTypeBadge}
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-medium">{formatNumber(pool.dollarLiquidity)}</p>
          <p className="text-sm text-muted-foreground">Liquidity</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-lg font-medium">
            {pool.dailyVolume ? formatNumber(BigInt(pool.dailyVolume.volumeUsd)) : '$0'}
          </p>
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

      <Link to={`/pool/${pool.address}?chainId=${pool.chainId}`}>
        <Button variant="secondary" className="w-full">View Details</Button>
      </Link>
    </div>
  )
}

export default function AllPools() {
  const [poolFilter, setPoolFilter] = useState<PoolFilter>("all")
  const { data: pools, isLoading, error } = usePools(poolFilter)

  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="text-4xl font-bold mb-8 text-primary">Loading Pools...</h1>
        <div className="grid gap-6">
          <div className="border border-primary/20 rounded-lg p-6 bg-card/50 backdrop-blur animate-pulse">
            <div className="h-8 bg-primary/20 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-primary/20 rounded w-2/3 mb-6"></div>
            <div className="h-10 bg-primary/20 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-4xl font-bold mb-8 text-primary">Error Loading Pools</h1>
        <div className="text-red-500">{(error as Error).message}</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-primary">Active Pools</h1>
      </div>
      
      <Tabs value={poolFilter} onValueChange={(value) => setPoolFilter(value as PoolFilter)} className="mb-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="all">All Pools</TabsTrigger>
          <TabsTrigger value="static">📊 Static Only</TabsTrigger>
          <TabsTrigger value="dynamic">🚀 Dynamic Only</TabsTrigger>
          <TabsTrigger value="multicurve">🌊 Multicurve</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="grid gap-6">
        {pools?.items?.map((pool) => (
          <PoolCard key={pool.address} pool={pool} />
        ))}
      </div>
      <Link to="/create" className="fixed bottom-8 right-8">
        <Button className="shadow-lg shadow-primary/20 hover:shadow-primary/40">
          Create New Pool
        </Button>
      </Link>
    </div>
  )
}
