import { useEffect, useMemo, useState } from 'react'
import { usePublicClient } from 'wagmi'
import { Address, Hex, isAddress, parseUnits, zeroAddress } from 'viem'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { getAddresses as getUnifiedAddresses } from '@whetstone-research/doppler-sdk'
import { dopplerLensQuoterAbi } from '@/lib/abis/dopplerLens'

type ChainOption = {
  id: number
  name: string
}

const CHAINS: ChainOption[] = [
  { id: 8453, name: 'Base Mainnet' },
  { id: 84532, name: 'Base Sepolia' },
]

// Minimal Uniswap v4 Quoter ABI for quoteExactInputSingle
const v4QuoterAbi = [
  {
    name: 'quoteExactInputSingle',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      {
        name: 'key',
        type: 'tuple',
        components: [
          { name: 'currency0', type: 'address' },
          { name: 'currency1', type: 'address' },
          { name: 'fee', type: 'uint24' },
          { name: 'tickSpacing', type: 'int24' },
          { name: 'hooks', type: 'address' },
        ],
      },
      { name: 'zeroForOne', type: 'bool' },
      { name: 'exactAmount', type: 'uint256' },
      { name: 'hookData', type: 'bytes' },
    ],
    outputs: [{ name: 'amountOut', type: 'uint256' }],
  },
] as const

function resolveDefaultV4Quoter(chainId: number): Address | undefined {
  const a: any = getUnifiedAddresses(chainId)
  return (
    a?.v4Quoter ||
    a?.uniswapV4Quoter ||
    a?.quoter
  ) as Address | undefined
}

export default function QuoteDebug() {
  const [chainId, setChainId] = useState<number>(84532)
  const publicClient = usePublicClient({ chainId })

  // PoolKey fields
  const [currency0, setCurrency0] = useState<string>('0x')
  const [currency1, setCurrency1] = useState<string>('0x')
  const [fee, setFee] = useState<number>(3000)
  const [tickSpacing, setTickSpacing] = useState<number>(60)
  const [hooks, setHooks] = useState<string>(zeroAddress)

  // Quote inputs
  const [zeroForOne, setZeroForOne] = useState<boolean>(true)
  const [amountStr, setAmountStr] = useState<string>('')
  const [amountDecimals, setAmountDecimals] = useState<number>(18)
  const [hookData, setHookData] = useState<string>('0x')

  // Quoter
  const [quoterAddressOverride, setQuoterAddressOverride] = useState<string>('')
  const [useDopplerLens, setUseDopplerLens] = useState<boolean>(false)
  const defaultQuoter = useMemo(() => resolveDefaultV4Quoter(chainId), [chainId])
  const defaultDopplerLens = useMemo(() => {
    const a: any = getUnifiedAddresses(chainId)
    return a?.dopplerLens as Address | undefined
  }, [chainId])
  const quoterAddress = useDopplerLens 
    ? (quoterAddressOverride || defaultDopplerLens || '') as Address | ''
    : (quoterAddressOverride || defaultQuoter || '') as Address | ''

  // Results
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [amountOut, setAmountOut] = useState<bigint | null>(null)

  useEffect(() => {
    // Reset outputs when chain changes
    setAmountOut(null)
    setError(null)
  }, [chainId])

  const canQuote =
    !!publicClient &&
    quoterAddress !== '' &&
    isAddress(quoterAddress as string) &&
    isAddress(currency0) &&
    isAddress(currency1) &&
    amountStr.length > 0 &&
    hookData.startsWith('0x')

  const onQuote = async () => {
    if (!publicClient) return
    setLoading(true)
    setError(null)
    setAmountOut(null)
    try {
      const exactAmount = parseUnits(amountStr as `${number}` as string, amountDecimals)
      const key = {
        currency0: currency0 as Address,
        currency1: currency1 as Address,
        fee: Number(fee),
        tickSpacing: Number(tickSpacing),
        hooks: (hooks || zeroAddress) as Address,
      }

      if (useDopplerLens) {
        // Use DopplerLens for dynamic auctions
        const params = {
          poolKey: key,
          zeroForOne,
          exactAmount,
          hookData: hookData as Hex,
        }
        const result = await publicClient.readContract({
          address: quoterAddress as Address,
          abi: dopplerLensQuoterAbi,
          functionName: 'quoteDopplerLensData',
          args: [params],
        }) as { amount0: bigint; amount1: bigint }
        // For debugging, we'll just show amount0 or amount1 based on zeroForOne
        setAmountOut(zeroForOne ? result.amount1 : result.amount0)
      } else {
        // Use standard V4 quoter
        const out = await publicClient.readContract({
          address: quoterAddress as Address,
          abi: v4QuoterAbi,
          functionName: 'quoteExactInputSingle',
          args: [key, zeroForOne, exactAmount, hookData as Hex],
        })
        setAmountOut(out as bigint)
      }
    } catch (e: any) {
      setError(e?.shortMessage || e?.message || String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-primary">V4 Quote Debugger</h1>

      <div className="grid gap-6">
        <Card className="p-4 border border-primary/20 bg-card/50">
          <h2 className="text-xl font-semibold mb-4">Environment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Chain</label>
              <select
                value={chainId}
                onChange={(e) => setChainId(Number(e.target.value))}
                className="w-full mt-1 p-2 bg-background/50 border rounded"
              >
                {CHAINS.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Quoter Type</label>
              <select
                value={useDopplerLens ? 'doppler' : 'standard'}
                onChange={(e) => setUseDopplerLens(e.target.value === 'doppler')}
                className="w-full mt-1 p-2 bg-background/50 border rounded"
              >
                <option value="standard">Standard V4 Quoter</option>
                <option value="doppler">DopplerLens (Dynamic Auctions)</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Quoter Address (optional override)</label>
              <Input
                placeholder={useDopplerLens ? (defaultDopplerLens || '0x...') : (defaultQuoter || '0x...')}
                value={quoterAddressOverride}
                onChange={(e) => setQuoterAddressOverride(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Default: {useDopplerLens 
                  ? (defaultDopplerLens || 'DopplerLens not found for chain')
                  : (defaultQuoter || 'V4 Quoter not found for chain')
                }
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border border-primary/20 bg-card/50">
          <h2 className="text-xl font-semibold mb-4">PoolKey</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">currency0</label>
              <Input placeholder="0x..." value={currency0} onChange={(e) => setCurrency0(e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">currency1</label>
              <Input placeholder="0x..." value={currency1} onChange={(e) => setCurrency1(e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">fee (uint24)</label>
              <Input type="number" value={fee} onChange={(e) => setFee(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">tickSpacing (int24)</label>
              <Input type="number" value={tickSpacing} onChange={(e) => setTickSpacing(Number(e.target.value))} />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-muted-foreground">hooks</label>
              <Input placeholder={zeroAddress} value={hooks} onChange={(e) => setHooks(e.target.value)} />
            </div>
          </div>
        </Card>

        <Card className="p-4 border border-primary/20 bg-card/50">
          <h2 className="text-xl font-semibold mb-4">Quote Inputs</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">zeroForOne</label>
              <select
                value={zeroForOne ? '1' : '0'}
                onChange={(e) => setZeroForOne(e.target.value === '1')}
                className="w-full mt-1 p-2 bg-background/50 border rounded"
              >
                <option value="1">true (0 → 1)</option>
                <option value="0">false (1 → 0)</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">amount (human)</label>
              <Input type="number" placeholder="0.0" value={amountStr} onChange={(e) => setAmountStr(e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">tokenIn decimals</label>
              <Input type="number" value={amountDecimals} onChange={(e) => setAmountDecimals(Number(e.target.value))} />
            </div>
            <div className="md:col-span-3">
              <label className="text-sm text-muted-foreground">hookData (bytes)</label>
              <Input placeholder="0x" value={hookData} onChange={(e) => setHookData(e.target.value)} />
            </div>
          </div>
        </Card>

        <div className="flex items-center gap-3">
          <Button onClick={onQuote} disabled={!canQuote || loading}>
            {loading ? 'Quoting…' : 'Quote'}
          </Button>
          {!canQuote && (
            <span className="text-xs text-muted-foreground">Fill all fields with valid values to enable</span>
          )}
        </div>

        <Card className="p-4 border border-primary/20 bg-card/50">
          <h2 className="text-xl font-semibold mb-2">Result</h2>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {!error && amountOut !== null && (
            <div className="space-y-1">
              <p className="text-sm">amountOut (raw): {amountOut.toString()}</p>
              <p className="text-xs text-muted-foreground">Note: raw units. Provide tokenOut decimals to format externally.</p>
            </div>
          )}
          {!error && amountOut === null && <p className="text-sm text-muted-foreground">No quote yet.</p>}
        </Card>
      </div>
    </div>
  )
}
