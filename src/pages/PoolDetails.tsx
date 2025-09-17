import { useParams, useSearchParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { GraphQLClient } from "graphql-request"
import { Pool } from "@/utils/graphql"
import { Address, formatEther, formatUnits, Hex, maxUint256, parseAbi, parseEther, parseUnits, zeroAddress } from "viem"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useAccount, usePublicClient, useBalance, useSwitchChain } from "wagmi"
import { useWalletClient } from "wagmi"
import { 
  Quoter,
} from "@whetstone-research/doppler-sdk"
import { getAddresses } from "@whetstone-research/doppler-sdk"
import { CommandBuilder, V4ActionBuilder, V4ActionType } from "doppler-router"
import { dopplerLensQuoterAbi } from "@/lib/abis/dopplerLens"
import { airlockAbi } from "@whetstone-research/doppler-sdk"


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

// DN404 ABI (extended for freezing + introspection)
const dn404Abi = [
  // Existing mirror function to locate the ERC721 mirror
  {
    name: 'mirrorERC721',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
  // New freeze function on Doppler DN404 base ERC20
  {
    name: 'freezeTokenIDsByIndex',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'tokenIDIndexes', type: 'uint256[]' },
    ],
    outputs: [],
  },
  // Public getter for frozen balances mapping
  {
    name: 'frozenBalances',
    type: 'function',
    stateMutability: 'view',
    inputs: [ { name: 'owner', type: 'address' } ],
    outputs: [ { name: '', type: 'uint256' } ],
  },
  // decimals() read is not needed for freeze math (UNIT is not decimals); omitted
] as const

// ERC721 ABI for NFT functions
const erc721Abi = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'tokenOfOwnerByIndex',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'index', type: 'uint256' },
    ],
    outputs: [{ name: 'tokenId', type: 'uint256' }],
  },
  {
    name: 'tokenByIndex',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'index', type: 'uint256' },
    ],
    outputs: [{ name: 'tokenId', type: 'uint256' }],
  },
  {
    name: 'totalSupply',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'tokenURI',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    name: 'ownerOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }],
  },
] as const
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// V4 Dynamic Fee Flag - indicates a pool uses dynamic fees
const DYNAMIC_FEE_FLAG = 0x800000 // 8388608 in decimal

// Universal Router action constants used when settling from router balance
const CONTRACT_BALANCE = BigInt("0x8000000000000000000000000000000000000000000000000000000000000000")
const OPEN_DELTA = 0n

const client = new GraphQLClient("https://multicurve-testnet.marble.live/")

const GET_POOL_QUERY = `
  query GetPool($address: String!, $chainId: Float!) {
    pools(
      where: { address: $address }
      limit: 1
    ) {
      items {
        address
        chainId
        tick
        sqrtPrice
        liquidity
        createdAt
        baseToken { address name symbol image tokenUriData }
        quoteToken { address name symbol }
        price
        fee
        type
        dollarLiquidity
        volumeUsd
        percentDayChange
        totalFee0
        totalFee1
        isToken0
        isCreatorCoin
        isContentCoin
        lastRefreshed
        lastSwapTimestamp
        poolKey
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
    # Try to get V4 pool config if it's a dynamic auction
    v4PoolConfig(hookAddress: $address, chainId: $chainId) {
      hookAddress
      isToken0
      numTokensToSell
      minProceeds
      maxProceeds
      startingTime
      endingTime
      startingTick
      endingTick
      epochLength
      gamma
      numPdSlugs
    }
  }
`

export default function PoolDetails() {
  const { address } = useParams<{ address: string }>()
  const [searchParams] = useSearchParams()
  const account = useAccount()
  const { switchChain, chains, isPending: isSwitching } = useSwitchChain()
  const { data: walletClient } = useWalletClient(account)
  const chainId = searchParams.get('chainId') ? Number(searchParams.get('chainId')) : 84532
  const publicClient = usePublicClient({ chainId }) as any
  const [amount, setAmount] = useState("")
  const [quotedAmount, setQuotedAmount] = useState<bigint | null>(null)
  const [lastQuoteReliable, setLastQuoteReliable] = useState<boolean>(false)
  const [isBuying, setIsBuying] = useState(true)
  // Default slippage in basis points (e.g., 100 = 1%)
  const DEFAULT_SLIPPAGE_BPS = 100n
  const [isApproving, setIsApproving] = useState(false)
  const [needsApproval, setNeedsApproval] = useState<boolean>(false)
  const [tokenInDecimals, setTokenInDecimals] = useState<number>(18)
  const [baseDecimals, setBaseDecimals] = useState<number>(18)
  const [nftAddress, setNftAddress] = useState<Address | null>(null)
  const [nftData, setNftData] = useState<Array<{
    tokenId: number
    owner: Address
    imageUrl: string
    metadata: any
  }>>([])
  // User-owned NFTs (derived from balanceOf + tokenOfOwnerByIndex)
  const [myNftData, setMyNftData] = useState<Array<{
    tokenId: number
    owner: Address
    imageUrl: string
    metadata: any
  }>>([])
  // Triggers refetch of All NFTs list
  const [nftReloadNonce, setNftReloadNonce] = useState<number>(0)
  const [loadingNfts, setLoadingNfts] = useState(false)
  // Total supply no longer used for rendering; user-owned list drives UI
  const [showOnlyMine, setShowOnlyMine] = useState<boolean>(false)
  // DN404 freezing-related state
  const [frozenBalanceRaw, setFrozenBalanceRaw] = useState<bigint | null>(null)
  // Note: UNIT (tokens per NFT) is not exposed on-chain; default to 1000e18 for Doppler404
  const DN404_DEFAULT_UNIT = parseEther('1000')
  const [ownedIdsOrdered, setOwnedIdsOrdered] = useState<number[] | null>(null)
  const [supportsTokenOfOwnerByIndex, setSupportsTokenOfOwnerByIndex] = useState<boolean>(false)
  const [freezeMode, setFreezeMode] = useState<boolean>(false)
  // Advanced stats removed
  const [selectedTokenIds, setSelectedTokenIds] = useState<Set<number>>(new Set())
  // Freeze Next N flow removed; selection-only via tokenOfOwnerByIndex
  const [isFreezing, setIsFreezing] = useState<boolean>(false)
  // Metadata URI fetch status for base token (from indexer)
  const [metadataUriError, setMetadataUriError] = useState<string | null>(null)
  const addresses = getAddresses(chainId)
  const { universalRouter } = addresses


  // Auto-switch wallet network to chainId from query if connected and supported
  useEffect(() => {
    if (!account?.isConnected) return
    if (!chainId) return
    if (!chains?.some((c) => c.id === chainId)) return
    if (account.chainId === chainId) return
    if (isSwitching) return
    try {
      switchChain?.({ chainId })
    } catch (e) {
      console.error('Failed to request network switch', e)
    }
  }, [account?.isConnected, account?.chainId, chainId, chains, isSwitching, switchChain])

  const { data: pool, isLoading, error } = useQuery({
    queryKey: ['pool', address, chainId],
    queryFn: async () => {
      console.log('Fetching pool with:', { address, chainId })
      console.log("here?")
      const response = await client.request<{ pools: { items: any[] }, v4PoolConfig?: any }>(GET_POOL_QUERY, {
        address,
        chainId,
      })
      console.log(response)
      console.log('Full pool GraphQL response:', response)
      const p = response.pools.items?.[0]
      if (!p) return undefined as any
      
      // Check if we have V4 pool config data (for dynamic auctions)
      const v4Config = response.v4PoolConfig
      
      // Resolve metadata (image and website URL) from indexer token fields
      const resolveMetadataUri = (token: any): { raw?: string; http?: string; json?: string; websiteUrl?: string } => {
        // Prefer explicit image fields from indexer, then tokenUriData
        const imageUri: string | undefined = token?.image || token?.tokenUriData?.image || token?.tokenUriData?.image_hash
        const tokenJson = token?.tokenUriData ? JSON.stringify(token.tokenUriData, null, 2) : undefined
        // Try to surface a project URL if present in metadata
        const websiteCandidate: string | undefined = (
          token?.tokenUriData?.url ||
          token?.tokenUriData?.external_url ||
          token?.tokenUriData?.website ||
          token?.url
        )
        const normalize = (u?: string) => (u && typeof u === 'string' && u.startsWith('ipfs://')) ? u.replace('ipfs://', 'https://ipfs.io/ipfs/') : u
        const http = normalize(imageUri)
        const websiteUrl = normalize(websiteCandidate)
        if (!imageUri || typeof imageUri !== 'string') {
          // No image; still return JSON and website if available
          const base: { json?: string; websiteUrl?: string } = {}
          if (tokenJson) base.json = tokenJson
          if (websiteUrl) base.websiteUrl = websiteUrl
          return base
        }
        return { raw: imageUri, http, json: tokenJson, websiteUrl }
      }
      const meta = resolveMetadataUri(p.baseToken)
      console.log('Base token details:', {
        address: p.baseToken?.address,
        name: p.baseToken?.name,
        symbol: p.baseToken?.symbol,
        image: p.baseToken?.image,
        tokenUriData: p.baseToken?.tokenUriData,
        resolved: meta,
      })
      console.log('Quote token details:', {
        address: p.quoteToken?.address,
        name: p.quoteToken?.name,
        symbol: p.quoteToken?.symbol,
        image: p.quoteToken?.image,
        tokenUriData: p.quoteToken?.tokenUriData,
      })

      // Normalize into Pool shape used by UI
      const rawPoolKey = p.poolKey
      const indexerPoolKey = (() => {
        if (!rawPoolKey) return undefined
        try {
          return typeof rawPoolKey === 'string' ? JSON.parse(rawPoolKey) : rawPoolKey
        } catch (err) {
          console.warn('Failed to parse poolKey from indexer', err)
          return undefined
        }
      })()

      const normalizedPoolKey = (indexerPoolKey && typeof indexerPoolKey === 'object'
        && 'currency0' in indexerPoolKey && 'currency1' in indexerPoolKey)
        ? {
            currency0: (indexerPoolKey as any).currency0 as string,
            currency1: (indexerPoolKey as any).currency1 as string,
            fee: (() => {
              const raw = (indexerPoolKey as any).fee
              if (raw === undefined || raw === null) return undefined
              const value = typeof raw === 'number' ? raw : Number(raw)
              return Number.isFinite(value) ? value : undefined
            })(),
            tickSpacing: (() => {
              const raw = (indexerPoolKey as any).tickSpacing
              if (raw === undefined || raw === null) return undefined
              const value = typeof raw === 'number' ? raw : Number(raw)
              return Number.isFinite(value) ? value : undefined
            })(),
            hooks: (indexerPoolKey as any).hooks as string | undefined,
          }
        : undefined

      // For V4 dynamic auctions, derive currency0 and currency1 from baseToken/quoteToken
      // based on isToken0 from v4Config, unless the indexer already provided them
      let currency0 = normalizedPoolKey?.currency0 || p.currency0
      let currency1 = normalizedPoolKey?.currency1 || p.currency1

      if (!currency0 && !currency1 && v4Config) {
        // For dynamic auctions, we need to derive currencies from base/quote tokens
        // In Uniswap V4, token0 is always the smaller address (lexicographically)
        const baseTokenAddr = p.baseToken?.address as Address
        const quoteTokenAddr = p.quoteToken?.address as Address

        // Sort addresses to determine token0 and token1
        // token0 is always the smaller address
        const sorted = [baseTokenAddr, quoteTokenAddr].sort((a, b) =>
          a.toLowerCase() < b.toLowerCase() ? -1 : 1
        )

        currency0 = sorted[0]
        currency1 = sorted[1]
      }

      const normalized: (Pool & { v4Config?: any }) & { metadataUriRaw?: string; metadataUriHttp?: string; metadataJson?: string; websiteUrl?: string } = {
        address: p.address,
        chainId: BigInt(p.chainId),
        tick: p.tick,
        sqrtPrice: BigInt(p.sqrtPrice),
        liquidity: BigInt(p.liquidity),
        createdAt: BigInt(p.createdAt),
        baseToken: p.baseToken,
        quoteToken: p.quoteToken,
        price: BigInt(p.price),
        fee: normalizedPoolKey?.fee ?? p.fee,
        type: p.type || 'v3',
        dollarLiquidity: BigInt(p.dollarLiquidity),
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
        poolKey: normalizedPoolKey,
        currency0: normalizedPoolKey?.currency0 || currency0,
        currency1: normalizedPoolKey?.currency1 || currency1,
        tickSpacing: normalizedPoolKey?.tickSpacing ?? p.tickSpacing,
        hooks: (normalizedPoolKey?.hooks as string | undefined) || p.hooks || p.address,
        // Add V4 config if available
        v4Config: v4Config || undefined,
        metadataUriRaw: meta.raw,
        metadataUriHttp: meta.http,
        metadataJson: meta.json,
        websiteUrl: meta.websiteUrl,
      }
      return normalized
    },
  })

  // Validate the metadata URI returned by the indexer (if any) and surface a UI error
  useEffect(() => {
    const run = async () => {
      try {
        setMetadataUriError(null)
        const uri = (pool as any)?.metadataUriHttp as string | undefined
        if (!uri) return
        const res = await fetch(uri, { method: 'GET' })
        if (!res.ok) {
          setMetadataUriError(`Failed to fetch metadata URI (HTTP ${res.status})`)
          return
        }
        const ct = res.headers.get('content-type') || ''
        const isImage = ct.includes('image/')
        const isJson = ct.includes('application/json')
        if (!isImage && !isJson) {
          setMetadataUriError('Metadata URI returned unexpected content-type')
          return
        }
      } catch (e: any) {
        setMetadataUriError('Failed to fetch metadata URI')
      }
    }
    run()
  }, [(pool as any)?.metadataUriHttp])

  // Determine if the pool can be migrated by simulating Airlock.migrate(asset)
  const { data: canMigrate, isLoading: isCheckingMigrate } = useQuery({
    queryKey: ['canMigrate', chainId, address, pool?.baseToken.address],
    enabled: !!pool?.baseToken?.address && !!publicClient,
    queryFn: async () => {
      try {
        const from = (account?.address as Address) || zeroAddress
        await publicClient.simulateContract({
          account: from,
          address: addresses.airlock as Address,
          abi: airlockAbi as any,
          functionName: 'migrate',
          args: [pool!.baseToken.address as Address],
        })
        return true
      } catch (e) {
        // Any revert means not migratable right now
        return false
      }
    }
  })

  // Removed advanced pool-type derived stats
  // Removed hookAddress usage (advanced stats removed)
  

  // Removed quote token decimals effect (advanced stats removed)

  useEffect(() => {
    const run = async () => {
      try {
        if (!pool || !publicClient) return
        const decAbi = parseAbi(['function decimals() view returns (uint8)'])
        const d = await publicClient.readContract({ address: pool.baseToken.address as Address, abi: decAbi, functionName: 'decimals' }) as number
        setBaseDecimals(d || 18)
      } catch {
        setBaseDecimals(18)
      }
    }
    run()
  }, [publicClient, pool?.baseToken.address])

  // Determine if auction has not started yet (for V4 dynamic auctions)
  const auctionStartTime = pool?.v4Config?.startingTime ? Number(pool.v4Config.startingTime) : undefined
  const nowSec = Math.floor(Date.now() / 1000)
  const auctionNotStarted = typeof auctionStartTime === 'number' && nowSec < auctionStartTime

  // Check if the base token is a DN404 token with NFT mirror
  const { data: nftMirrorAddress } = useQuery({
    queryKey: ['nftMirror', pool?.baseToken.address],
    queryFn: async () => {
      if (!pool?.baseToken.address || !publicClient) return null
      
      try {
        const nftAddress = await publicClient.readContract({
          address: pool.baseToken.address as Address,
          abi: dn404Abi,
          functionName: 'mirrorERC721',
        })
        
        // Check if the returned address is valid (not zero address)
        if (nftAddress && nftAddress !== zeroAddress) {
          return nftAddress
        }
      } catch (error) {
        // Token doesn't have mirrorERC721 function, not a DN404
      }
      
      return null
    },
    enabled: !!pool?.baseToken.address && !!publicClient,
  })

  // Derive nftAddress from detection; if not Doppler404, ensure it's null
  useEffect(() => {
    if (nftMirrorAddress) {
      setNftAddress(nftMirrorAddress as Address)
    } else {
      setNftAddress(null)
    }
  }, [nftMirrorAddress])

  // Load DN404 freeze-related data (decimals, frozen balance, and ownedIds if supported)
  useEffect(() => {
    const loadFreezeData = async () => {
      try {
        if (!publicClient || !pool?.baseToken.address || !account?.address) return

        // No reliable on-chain read for UNIT (tokens per NFT). We assume 1000.

        // Read frozen balance
        try {
          const fb = await publicClient.readContract({
            address: pool.baseToken.address as Address,
            abi: dn404Abi,
            functionName: 'frozenBalances',
            args: [account.address as Address],
          })
          setFrozenBalanceRaw(BigInt(fb as any))
        } catch {
          setFrozenBalanceRaw(null)
        }

        // Prefer standard ERC721Enumerable-style on the ERC721 mirror: tokenOfOwnerByIndex
        try {
          if (!nftMirrorAddress) throw new Error('No NFT mirror to get balance')
          const bal = await publicClient.readContract({
            address: nftMirrorAddress as Address,
            abi: erc721Abi,
            functionName: 'balanceOf',
            args: [account.address as Address],
          })
          const count = typeof bal === 'bigint' ? Number(bal) : Number(bal as any)
          if (count > 0) {
            const calls = Array.from({ length: Math.min(count, 512) }, (_, i) => ({
              address: nftMirrorAddress as Address,
              abi: erc721Abi,
              functionName: 'tokenOfOwnerByIndex' as const,
              args: [account.address as Address, BigInt(i)],
            }))
            const res = await publicClient.multicall({ contracts: calls })
            const ids: number[] = []
            for (const r of res) {
              if (r.status === 'success' && typeof r.result === 'bigint') {
                ids.push(Number(r.result))
              } else {
                throw new Error('tokenOfOwnerByIndex failed')
              }
            }
            setOwnedIdsOrdered(ids)
            setSupportsTokenOfOwnerByIndex(true)
          } else {
            setOwnedIdsOrdered([])
            setSupportsTokenOfOwnerByIndex(true)
          }
        } catch {
          setOwnedIdsOrdered(null)
          setSupportsTokenOfOwnerByIndex(false)
        }
      } catch (e) {
        console.error('Error loading DN404 freeze data', e)
      }
    }
    if (pool?.baseToken.address && account?.address) {
      loadFreezeData()
    }
  }, [publicClient, pool?.baseToken.address, account?.address, nftMirrorAddress])

  const { data: baseTokenBalance, refetch: refetchBaseTokenBalance } = useBalance({
    address: account.address,
    token: pool?.baseToken.address as Address,
  })

  const { data: quoteTokenBalance, refetch: refetchQuoteTokenBalance } = useBalance({
    address: account.address,
    token: pool?.quoteToken.address as Address,
  })

  // If Doppler404, read user's NFT balance from the ERC721 mirror
  const { data: nftBalanceOf, refetch: refetchNftBalanceOf } = useQuery({
    queryKey: ['nftBalanceOf', chainId, nftMirrorAddress, account.address],
    enabled: !!publicClient && !!nftMirrorAddress && !!account?.address,
    queryFn: async () => {
      try {
        const bal = await publicClient.readContract({
          address: nftMirrorAddress as Address,
          abi: erc721Abi,
          functionName: 'balanceOf',
          args: [account.address as Address],
        })
        return typeof bal === 'bigint' ? Number(bal) : Number(bal as any)
      } catch {
        return 0
      }
    },
    staleTime: 30_000,
  })

  // Minimal ERC20 ABI for approvals and allowances
  const erc20Abi = [
    {
      name: 'allowance',
      type: 'function',
      stateMutability: 'view',
      inputs: [ { name: 'owner', type: 'address' }, { name: 'spender', type: 'address' } ],
      outputs: [ { name: '', type: 'uint256' } ],
    },
    {
      name: 'approve',
      type: 'function',
      stateMutability: 'nonpayable',
      inputs: [ { name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' } ],
      outputs: [ { name: '', type: 'bool' } ],
    },
  ] as const

  // Permit2 typed data + ABI for allowance nonce lookup
  const permit2Abi = parseAbi([
    'function allowance(address user, address token, address spender) external view returns (uint160 amount, uint48 expiration, uint48 nonce)'
  ])

  const PERMIT2_EIP712_DOMAIN = (permit2Address: Address) => ({
    name: 'Permit2',
    chainId,
    verifyingContract: permit2Address,
  })

  // Detect tokenIn decimals for correct amount parsing
  useEffect(() => {
    const run = async () => {
      try {
        if (!pool || !publicClient) return
        const tokenIn = getTokenInAddress()
        if (!tokenIn || tokenIn === zeroAddress) {
          setTokenInDecimals(18)
          console.log('[DECIMALS] tokenIn is native/WETH; using 18')
          return
        }
        const decAbi = parseAbi(['function decimals() view returns (uint8)'])
        const d = await publicClient.readContract({ address: tokenIn, abi: decAbi, functionName: 'decimals' }) as number
        setTokenInDecimals(d || 18)
        console.log('[DECIMALS] tokenIn:', tokenIn, 'decimals:', d)
      } catch (e) {
        console.warn('[DECIMALS] failed; defaulting to 18', e)
        setTokenInDecimals(18)
      }
    }
    run()
  }, [publicClient, pool?.baseToken.address, pool?.quoteToken.address, isBuying])

  // Helper: refresh user's NFT list using balanceOf + tokenOfOwnerByIndex
  const refreshUserNfts = async () => {
    try {
      if (!nftAddress || !publicClient || !account?.address) return

      // Read user's balance
      const bal = await publicClient.readContract({
        address: nftAddress as Address,
        abi: erc721Abi,
        functionName: 'balanceOf',
        args: [account.address as Address],
      })
      const count = typeof bal === 'bigint' ? Number(bal) : Number(bal as any)

      if (count === 0) {
        setOwnedIdsOrdered([])
        setMyNftData([])
        setSupportsTokenOfOwnerByIndex(true)
        return
      }

      // Fetch token IDs via tokenOfOwnerByIndex in chunks
      const CHUNK = 512
      const tokenIds: number[] = []
      for (let start = 0; start < count; start += CHUNK) {
        const end = Math.min(start + CHUNK, count)
        const calls = [] as any[]
        for (let i = start; i < end; i++) {
          calls.push({
            address: nftAddress as Address,
            abi: erc721Abi,
            functionName: 'tokenOfOwnerByIndex' as const,
            args: [account.address as Address, BigInt(i)],
          })
        }
        const res = await publicClient.multicall({ contracts: calls })
        for (let i = 0; i < res.length; i++) {
          const r = res[i]
          if (r.status === 'success' && typeof r.result === 'bigint') {
            tokenIds.push(Number(r.result))
          }
        }
      }

      // Update ownedIdsOrdered to align freeze view
      setOwnedIdsOrdered(tokenIds)
      setSupportsTokenOfOwnerByIndex(true)

      // Fetch metadata for each owned token
      const nftPromises: Promise<{
        tokenId: number
        owner: Address
        imageUrl: string
        metadata: any
      } | null>[] = tokenIds.map((tokenId) => (async () => {
        try {
          const tokenURI = await publicClient.readContract({
            address: nftAddress as Address,
            abi: erc721Abi,
            functionName: 'tokenURI',
            args: [BigInt(tokenId)],
          })
          let imageUrl = ''
          let metadata: any = null
          if (tokenURI) {
            try {
              let metadataUrl = tokenURI as string
              if (metadataUrl.startsWith('ipfs://')) {
                metadataUrl = metadataUrl.replace('ipfs://', 'https://ipfs.io/ipfs/')
              }
              const response = await fetch(metadataUrl)
              metadata = await response.json()
              if (metadata?.image) {
                imageUrl = metadata.image
                if (imageUrl.startsWith('ipfs://')) {
                  imageUrl = imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/')
                }
              }
            } catch (err) {
              console.error('Error fetching metadata for token', tokenId, err)
            }
          }
          return { tokenId, owner: account.address as Address, imageUrl, metadata }
        } catch (e) {
          console.error('Error building my NFT item for token', tokenId, e)
          return null
        }
      })())

      const ownedItems = (await Promise.all(nftPromises)).filter(Boolean) as Array<{ tokenId: number; owner: Address; imageUrl: string; metadata: any }>
      setMyNftData(ownedItems)
    } catch (e) {
      console.error('refreshUserNfts failed', e)
    }
  }

  // Helper: resolve tokenIn address for current buy/sell direction
  const getTokenInAddress = (): Address | null => {
    if (!pool) return null
    const baseTokenAddress = getCurrencyAddress(pool.baseToken.address as Address)
    const quoteTokenAddress = getCurrencyAddress(pool.quoteToken.address as Address)
    return isBuying ? quoteTokenAddress : baseTokenAddress
  }

  // Pre-check allowance or permit requirement when selling
  useEffect(() => {
    const check = async () => {
      try {
        setNeedsApproval(false)
        if (!publicClient || !account.address || !pool) return
        if (!amount) return
        if (isBuying) return // approvals needed for selling ERC20 (base token)

        const tokenIn = getTokenInAddress()
        if (!tokenIn || tokenIn === zeroAddress) return

        let required: bigint = 0n
        try {
          required = parseUnits(amount, tokenInDecimals)
        } catch {
          required = 0n
        }

        // Prefer checking Permit2 allowance for the universalRouter (spender)
        try {
          const [permitAmount] = await publicClient.readContract({
            address: addresses.permit2 as Address,
            abi: permit2Abi,
            functionName: 'allowance',
            args: [account.address as Address, tokenIn, universalRouter as Address],
          }) as unknown as [bigint, bigint, bigint]

          if (permitAmount < required) {
            setNeedsApproval(true)
            return
          }
        } catch {
          // Fallback: check ERC20 allowance to Universal Router (some flows allow direct transferFrom)
          try {
            const allowance = await publicClient.readContract({
              address: tokenIn,
              abi: erc20Abi,
              functionName: 'allowance',
              args: [account.address as Address, universalRouter as Address],
            }) as bigint
            if (allowance < required) {
              setNeedsApproval(true)
              return
            }
          } catch {
            setNeedsApproval(true)
            return
          }
        }
      } catch (e) {
        console.warn('Allowance check failed, defaulting to require approval', e)
        setNeedsApproval(!isBuying)
      }
    }
    check()
  }, [amount, isBuying, pool?.address, account.address, publicClient, chainId])

  // Helper function to properly handle currency addresses and sorting
  const getCurrencyAddress = (address: Address): Address => {
    // If it's the zero address, replace with WETH
    if (address === zeroAddress) {
      return addresses.weth || zeroAddress
    }
    return address
  }
  
  // Helper function to encode the path for V3 swaps
  const encodePath = (path: Address[], fee: number): Hex => {
    const FEE_SIZE = 3
    let encoded = "0x"
    for (let i = 0; i < path.length - 1; i++) {
      encoded += path[i].slice(2)
      encoded += fee.toString(16).padStart(2 * FEE_SIZE, "0")
    }
    encoded += path[path.length - 1].slice(2)
    return encoded.toLowerCase() as Hex
  }

  // Uniswap v4 Quoter ABI (minimal)
  const uniswapV4QuoterAbi = [
    {
      name: "quoteExactInputSingle",
      type: "function",
      stateMutability: "view",
      inputs: [
        {
          name: "params",
          type: "tuple",
          components: [
            {
              name: "poolKey",
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
        },
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
      a?.quoter
    ) as Address | undefined
  }

  const resolvePoolKey = () => {
    if (!pool?.poolKey?.currency0 || !pool.poolKey?.currency1) return null
    const feeRaw = pool.poolKey.fee ?? pool.fee ?? DYNAMIC_FEE_FLAG
    const feeParsed = typeof feeRaw === 'number' ? feeRaw : Number(feeRaw)
    const fee = Number.isFinite(feeParsed) ? feeParsed : DYNAMIC_FEE_FLAG
    const tickSpacingRaw = pool.poolKey.tickSpacing ?? pool.tickSpacing ?? 2
    const tickSpacingParsed = typeof tickSpacingRaw === 'number' ? tickSpacingRaw : Number(tickSpacingRaw)
    const tickSpacing = Number.isFinite(tickSpacingParsed) ? tickSpacingParsed : 2
    return {
      currency0: pool.poolKey.currency0 as Address,
      currency1: pool.poolKey.currency1 as Address,
      fee,
      tickSpacing,
      hooks: (pool.poolKey.hooks || pool.hooks || pool.address) as Address,
    }
  }

  // (currency sorting helper removed; rely on indexer isToken0)

  const fetchQuote = async (amountIn: bigint) => {
    if (!pool || !publicClient) return
    
    console.log('[QUOTE] poolType:', pool.type, 'migrated:', pool.asset?.migrated, 'amountIn:', amountIn.toString())
    
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
        console.error('Error fetching V2 quote:', error)
        return null
      }
    }
    
    // Check if this is a V4 pool with a hook
    // V4 pools may have type as 'v4' (lowercase), 'V4', 'DynamicAuction', etc.
    const poolType = pool.type?.toLowerCase()
    const isMulticurvePool = poolType === 'multicurve'
    const isV4Pool = poolType === 'v4' || poolType === 'dynamicauction' || 
                     poolType === 'hook' || isMulticurvePool || !pool.type // If type is missing, assume V4
    
    if (isV4Pool && !isMigrated) {
      try {
        const key = resolvePoolKey()
        if (!key) {
          console.error('Cannot resolve pool key for V4 pool')
          return null
        }

        // Determine swap direction based on sorted addresses
        const baseTokenAddr = pool.baseToken?.address?.toLowerCase()
        const curr0Lower = key.currency0.toLowerCase()

        // Determine if base token is currency0 or currency1
        const isBaseToken0 = baseTokenAddr === curr0Lower

        // For buying (quote -> base), we're swapping FROM quote TO base
        // For selling (base -> quote), we're swapping FROM base TO quote
        const zeroForOne = isBuying 
          ? !isBaseToken0  // If buying and base is token1, swap 0->1. If base is token0, swap 1->0
          : isBaseToken0   // If selling and base is token0, swap 0->1. If base is token1, swap 1->0

        // Dynamic auctions + multicurve: use SDK Uniswap V4 Quoter helper (identical args to Lens)
        const isDynamicAuction = !!pool.v4Config
        const shouldUseSdkQuoter = isDynamicAuction || isMulticurvePool
        if (shouldUseSdkQuoter) {
          try {
            const quoter = new Quoter(publicClient, chainId)
            const quote = await quoter.quoteExactInputV4Quoter({
              poolKey: key,
              zeroForOne,
              exactAmount: amountIn,
              hookData: '0x',
            })
            console.log('[QUOTE][V4][Quoter] amountOut:', quote.amountOut.toString())
            setLastQuoteReliable(true)
            return quote.amountOut
          } catch (e) {
            const context = isMulticurvePool ? '[QUOTE][Multicurve]' : '[QUOTE][DynamicAuction]'
            console.error(`${context} SDK quoter failed`, e)
          }

          if (isDynamicAuction) {
            // Fallback: DopplerLens (indicative only)
            const dopplerLensAddress = addresses?.dopplerLens
            if (!dopplerLensAddress) {
              console.error('DopplerLens address not found in addresses')
              return null
            }
            const params = { poolKey: key, zeroForOne, exactAmount: amountIn, hookData: '0x' as `0x${string}` }
            try {
              const { result } = await publicClient.simulateContract({ address: dopplerLensAddress as Address, abi: dopplerLensQuoterAbi, functionName: 'quoteDopplerLensData', args: [params] })
              const amountOut = zeroForOne ? result.amount1 : result.amount0
              console.log('[QUOTE][V4][Lens] amountOut (indicative):', amountOut.toString())
              setLastQuoteReliable(false)
              return amountOut
            } catch (error) {
              console.error('DopplerLens quote simulation failed', error)
              return null
            }
          }
          // For multicurve pools we fall through to the standard V4 path below if the SDK helper fails
        }

        if (!isDynamicAuction) {
          // Standard V4 pool (not dynamic auction)
          const v4QuoterAddress = resolveV4QuoterAddress()
          if (!v4QuoterAddress) {
            console.warn('v4 Quoter address not found in addresses; falling back to SDK Quoter')
            const quoter = new Quoter(publicClient, chainId)
            const quote = await quoter.quoteExactInputV4({
              poolKey: key,
              zeroForOne,
              exactAmount: amountIn,
              hookData: '0x',
            })
            setLastQuoteReliable(true)
            return quote.amountOut
          }
          console.log('Using Uniswap v4 Quoter:', v4QuoterAddress)
          const quoterParams = {
            poolKey: key,
            zeroForOne,
            exactAmount: amountIn,
            hookData: '0x' as Hex,
          }
          console.log('quote params', quoterParams)
          const result = await publicClient.readContract({
            address: v4QuoterAddress,
            abi: uniswapV4QuoterAbi,
            functionName: 'quoteExactInputSingle',
            args: [quoterParams],
          }) as any
          const amountOut: bigint = typeof result === "bigint" ? result : (result?.amountOut as bigint)
          setLastQuoteReliable(true)
          return amountOut
        }
      } catch (error) {
        console.error('Error fetching V4 quote:', error)
        return null
      }
    } else {
      // For V3 pools, use the unified SDK's Quoter
      try {
        console.log('Fetching V3 quote for pool:', pool.address)
        const quoter = new Quoter(publicClient, chainId)
        
        const baseTokenAddress = getCurrencyAddress(pool.baseToken.address as Address)
        const quoteTokenAddress = getCurrencyAddress(pool.quoteToken.address as Address)
        
        // For V3, we need to determine the correct token order
        const [tokenIn, tokenOut] = isBuying 
          ? [quoteTokenAddress, baseTokenAddress]  // Buying: swap quote for base
          : [baseTokenAddress, quoteTokenAddress]  // Selling: swap base for quote
        
        const quote = await quoter.quoteExactInputV3({
          tokenIn,
          tokenOut,
          amountIn,
          fee: pool.fee,
          sqrtPriceLimitX96: 0n,
        })
        
        console.log('V3 quote result:', quote)
        setLastQuoteReliable(true)
        return quote.amountOut
      } catch (error) {
        console.error('Error fetching V3 quote:', error)
        return null
      }
    }
  }

  const executeSwap = async (amountIn: bigint) => {
    if (!pool) return
    if (!account.address || !walletClient) throw new Error("account must be connected");
    if (!publicClient) throw new Error("public client not available")

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
    const isMulticurvePool = poolType === 'multicurve'
    const isDynamicAuction = !!pool.v4Config
    const shouldUseSdkSwap = isDynamicAuction || isMulticurvePool
    const isV4Pool = poolType === "v4" || poolType === "dynamicauction" || 
                     poolType === "hook" || isMulticurvePool || !pool.type // If type is missing, assume V4
    
    if (isV4Pool && !isMigrated) {
      try {
        const key = resolvePoolKey()
        if (!key) {
          console.error('Cannot resolve pool key for V4 pool during swap')
          return null
        }

        // Determine swap direction based on sorted addresses
        const baseTokenAddr = pool.baseToken?.address?.toLowerCase()
        const curr0Lower = key.currency0.toLowerCase()

        // Determine if base token is currency0 or currency1
        const isBaseToken0 = baseTokenAddr === curr0Lower

        // For buying (quote -> base), we're swapping FROM quote TO base
        // For selling (base -> quote), we're swapping FROM base TO quote
        const zeroForOne = isBuying 
          ? !isBaseToken0  // If buying and base is token1, swap 0->1. If base is token0, swap 1->0
          : isBaseToken0   // If selling and base is token0, swap 0->1. If base is token1, swap 1->0

        console.log('[SWAP][V4] isBaseToken0:', isBaseToken0)

        // Enforce slippage based on the actual Quoter-derived amountOut (works for dynamic now)
        const minOut = (lastQuoteReliable && quotedAmount) ? (quotedAmount * (10000n - DEFAULT_SLIPPAGE_BPS)) / 10000n : 0n
        console.log('[SWAP][V4] amountIn:', amountIn.toString(), 'quotedAmount:', quotedAmount?.toString(), 'minOut:', minOut.toString())

        const hookData: Hex = '0x'
        const inputCurrency = zeroForOne ? key.currency0 : key.currency1
        const outputCurrency = zeroForOne ? key.currency1 : key.currency0
        const isNativeInput = inputCurrency.toLowerCase() === zeroAddress.toLowerCase()
        const wethLower = addresses.weth?.toLowerCase()
        const expectsWethInput = wethLower ? inputCurrency.toLowerCase() === wethLower : false
        const outputsWeth = wethLower ? outputCurrency.toLowerCase() === wethLower : false
        const shouldWrapForWeth = expectsWethInput && isBuying
        const shouldUnwrapOutput = outputsWeth && !isBuying

        const buildV4Actions = () => {
          const actionBuilder = new V4ActionBuilder()
          if (shouldWrapForWeth) {
            actionBuilder.addAction(V4ActionType.SETTLE, [inputCurrency, CONTRACT_BALANCE, false])
            actionBuilder.addSwapExactInSingle(key, zeroForOne, OPEN_DELTA, minOut, hookData)
          } else {
            actionBuilder.addSwapExactInSingle(key, zeroForOne, amountIn, minOut, hookData)
            actionBuilder.addAction(V4ActionType.SETTLE_ALL, [inputCurrency, maxUint256])
          }
          if (shouldUnwrapOutput && universalRouter) {
            actionBuilder.addAction(V4ActionType.TAKE, [outputCurrency, universalRouter as Address, OPEN_DELTA])
          } else {
            actionBuilder.addAction(V4ActionType.TAKE_ALL, [outputCurrency, 0])
          }
          return actionBuilder.build()
        }

        let actions: Hex | undefined
        let params: Hex[] | undefined

        if (shouldUseSdkSwap) {
          try {
            ;[actions, params] = buildV4Actions()
          } catch (builderError) {
            const context = isMulticurvePool ? '[SWAP][Multicurve]' : '[SWAP][DynamicAuction]'
            console.error(`${context} SDK swap builder failed`, builderError)
          }
        }

        if (!actions || !params) {
          ;[actions, params] = buildV4Actions()
        }

        // Build commands, prepending Permit2 permit if selling ERC20
        const builder = new CommandBuilder()
        if (!isBuying) {
          const tokenIn = getTokenInAddress() as Address
          if (tokenIn && tokenIn !== zeroAddress) {
            // Prepare and sign Permit2 if needed
            const required = amountIn
            const permit2Addr = addresses.permit2 as Address
            // Fetch current nonce for (user, token, spender=universalRouter)
            const [, , nonce] = await publicClient.readContract({
              address: permit2Addr,
              abi: permit2Abi,
              functionName: 'allowance',
              args: [account.address as Address, tokenIn, universalRouter as Address],
            }) as unknown as [bigint, bigint, bigint]
            const nowSec = BigInt(Math.floor(Date.now() / 1000))
            const permit = {
              details: {
                token: tokenIn,
                amount: required,
                expiration: nowSec + 3600n, // 1 hour
                nonce: BigInt(nonce),
              },
              spender: universalRouter as Address,
              sigDeadline: nowSec + 3600n,
            }
            const signature = await walletClient.signTypedData({
              account: account.address as Address,
              domain: PERMIT2_EIP712_DOMAIN(permit2Addr),
              types: {
                PermitDetails: [
                  { name: 'token', type: 'address' },
                  { name: 'amount', type: 'uint160' },
                  { name: 'expiration', type: 'uint48' },
                  { name: 'nonce', type: 'uint48' },
                ],
                PermitSingle: [
                  { name: 'details', type: 'PermitDetails' },
                  { name: 'spender', type: 'address' },
                  { name: 'sigDeadline', type: 'uint256' },
                ],
              },
              primaryType: 'PermitSingle',
              message: permit as any,
            })
            builder.addPermit2Permit(permit as any, signature as Hex)
          }
        }

        const shouldWrapInput = isNativeInput || shouldWrapForWeth

        let commandBuilderWithLiquidity = builder
        if (shouldWrapInput) {
          commandBuilderWithLiquidity = builder.addWrapEth(universalRouter, amountIn)
        }

        let commandBuilderWithSwap = commandBuilderWithLiquidity.addV4Swap(actions, params)

        if (shouldUnwrapOutput) {
          commandBuilderWithSwap = commandBuilderWithSwap.addUnwrapWeth(account.address as Address, 0n)
        }

        const [commands, inputs] = commandBuilderWithSwap.build()

        // Determine if the input currency is native (requires sending `value`)
        console.log('[SWAP][V4] key:', key, 'zeroForOne:', zeroForOne, 'isNativeInput:', isNativeInput, 'shouldWrapForWeth:', shouldWrapForWeth, 'shouldUnwrapOutput:', shouldUnwrapOutput, 'hookData:', hookData)

        const txHash = await walletClient?.writeContract({
          address: universalRouter,
          abi: universalRouterAbi,
          functionName: "execute",
          args: [commands, inputs],
          value: shouldWrapInput ? amountIn : 0n
        })
        if (txHash) {
          const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash })
          if (receipt.status === 'success' && nftAddress) {
            // Refresh user's NFT view after any buy or sell affecting DN404
            await new Promise((r) => setTimeout(r, 1000))
            await refreshUserNfts()
            try {
              const fb = await publicClient.readContract({
                address: pool.baseToken.address as Address,
                abi: dn404Abi,
                functionName: 'frozenBalances',
                args: [account.address as Address],
              })
              setFrozenBalanceRaw(BigInt(fb as any))
            } catch {}
            setNftReloadNonce((x) => x + 1)
          }
          // Refresh balances after successful swap
          try { await refetchBaseTokenBalance() } catch {}
          try { await refetchQuoteTokenBalance() } catch {}
          try { await refetchNftBalanceOf() } catch {}
        }
      } catch (error) {
        console.error("Error executing V4 swap:", error)
        throw error
      }
    } else {
      // For V3 pools, use the CommandBuilder's V3 swap
      try {
        console.log("Executing V3 swap for pool:", pool.address)
        
        const baseTokenAddress = getCurrencyAddress(pool.baseToken.address as Address)
        const quoteTokenAddress = getCurrencyAddress(pool.quoteToken.address as Address)
        
        // Build the path for V3 swap (tokenIn -> tokenOut)
        const [tokenIn, tokenOut] = isBuying 
          ? [quoteTokenAddress, baseTokenAddress]  // Buying: swap quote for base
          : [baseTokenAddress, quoteTokenAddress]  // Selling: swap base for quote
        
        // Encode the path for V3 (includes the fee tier)
        const encodedPath = encodePath([tokenIn, tokenOut], pool.fee)
        
        // Build the command for UniversalRouter
        const commandBuilder = new CommandBuilder()

        // If selling ERC20, prepend Permit2 permit + transferFrom
        if (!isBuying) {
          const tokenIn = getTokenInAddress() as Address
          if (tokenIn && tokenIn !== zeroAddress) {
            const required = amountIn
            const permit2Addr = addresses.permit2 as Address
            const [, , nonce] = await publicClient.readContract({
              address: permit2Addr,
              abi: permit2Abi,
              functionName: 'allowance',
              args: [account.address as Address, tokenIn, universalRouter as Address],
            }) as unknown as [bigint, bigint, bigint]
            const nowSec = BigInt(Math.floor(Date.now() / 1000))
            const permit = {
              details: {
                token: tokenIn,
                amount: required,
                expiration: nowSec + 3600n,
                nonce: BigInt(nonce),
              },
              spender: universalRouter as Address,
              sigDeadline: nowSec + 3600n,
            }
            const signature = await walletClient.signTypedData({
              account: account.address as Address,
              domain: PERMIT2_EIP712_DOMAIN(permit2Addr),
              types: {
                PermitDetails: [
                  { name: 'token', type: 'address' },
                  { name: 'amount', type: 'uint160' },
                  { name: 'expiration', type: 'uint48' },
                  { name: 'nonce', type: 'uint48' },
                ],
                PermitSingle: [
                  { name: 'details', type: 'PermitDetails' },
                  { name: 'spender', type: 'address' },
                  { name: 'sigDeadline', type: 'uint256' },
                ],
              },
              primaryType: 'PermitSingle',
              message: permit as any,
            })
            commandBuilder.addPermit2Permit(permit as any, signature as Hex)
            // Ensure router has tokens to execute V3 swap
            commandBuilder.addPermit2TransferFrom(tokenIn, universalRouter as Address, required)
          }
        }
        
        // If buying with ETH, we need to wrap it first
        const isEthInput = isBuying && quoteTokenAddress === addresses.weth
        if (isEthInput) {
          commandBuilder.addWrapEth(universalRouter, amountIn)
        }
        
        // Compute minOut based on last quote and default slippage
        const minOut = quotedAmount ? (quotedAmount * (10000n - DEFAULT_SLIPPAGE_BPS)) / 10000n : 0n
        console.log('[SWAP][V3] amountIn:', amountIn.toString(), 'quotedAmount:', quotedAmount?.toString(), 'minOut:', minOut.toString())

        // Add the V3 swap command
        commandBuilder.addV3SwapExactIn(
          account.address as Address,  // recipient
          amountIn,                     // amountIn
          minOut,                      // amountOutMinimum based on quote - slippage
          encodedPath,                  // path with fees
          false                        // don't unwrap ETH at the end
        )

        const [commands, inputs] = commandBuilder.build()
        
        const txHash = await walletClient?.writeContract({
          address: universalRouter,
          abi: universalRouterAbi,
          functionName: "execute",
          args: [commands, inputs],
          value: isEthInput ? amountIn : 0n
        })
        if (txHash) {
          const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash })
          if (receipt.status === 'success' && nftAddress) {
            await new Promise((r) => setTimeout(r, 1000))
            await refreshUserNfts()
            try {
              const fb = await publicClient.readContract({
                address: pool.baseToken.address as Address,
                abi: dn404Abi,
                functionName: 'frozenBalances',
                args: [account.address as Address],
              })
              setFrozenBalanceRaw(BigInt(fb as any))
            } catch {}
            setNftReloadNonce((x) => x + 1)
          }
          // Refresh balances after successful swap
          try { await refetchBaseTokenBalance() } catch {}
          try { await refetchQuoteTokenBalance() } catch {}
          try { await refetchNftBalanceOf() } catch {}
        }
        console.log("V3 swap executed successfully")
      } catch (error) {
        console.error("Error executing V3 swap:", error)
        throw error
      }
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
        const amountIn = parseUnits(value, tokenInDecimals)
        console.log('[INPUT] tokenInDecimals:', tokenInDecimals, 'parsed amountIn:', amountIn.toString())
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

  // All other NFT logic uses nftAddress; nothing runs if not Doppler404.

  // Fetch NFT data when we have an NFT address
  useEffect(() => {
    const fetchNftData = async () => {
      if (!nftAddress || !publicClient) return
      
      setLoadingNfts(true)
      try {
        // Get total supply
        const totalSupply = await publicClient.readContract({
          address: nftAddress,
          abi: erc721Abi,
          functionName: 'totalSupply',
        })
        
        const nftCount = Number(totalSupply)
        console.log('Total NFT supply:', nftCount)
        
        // Prefer ERC721Enumerable's tokenByIndex to enumerate all token IDs
        const LIMIT = Math.min(nftCount, 100) // cap for performance
        let tokenIds: number[] = []
        try {
          const calls = Array.from({ length: LIMIT }, (_, i) => ({
            address: nftAddress,
            abi: erc721Abi,
            functionName: 'tokenByIndex' as const,
            args: [BigInt(i)],
          }))
          const res = await publicClient.multicall({ contracts: calls })
          for (const r of res) {
            if (r.status === 'success' && typeof r.result === 'bigint') {
              tokenIds.push(Number(r.result))
            }
          }
          // Fallback: if none returned, fall back to naive 1..LIMIT
          if (tokenIds.length === 0) throw new Error('tokenByIndex returned no results')
        } catch (e) {
          console.warn('tokenByIndex unavailable or failed, falling back to contiguous IDs', e)
          tokenIds = Array.from({ length: LIMIT }, (_, i) => i + 1)
        }

        // Fetch data for each discovered tokenId
        const nftPromises = tokenIds.map((tokenId) => (async () => {
          try {
            const owner = await publicClient.readContract({
              address: nftAddress,
              abi: erc721Abi,
              functionName: 'ownerOf',
              args: [BigInt(tokenId)],
            })
            const tokenURI = await publicClient.readContract({
              address: nftAddress,
              abi: erc721Abi,
              functionName: 'tokenURI',
              args: [BigInt(tokenId)],
            })
            let imageUrl = ''
            let metadata: any = null
            if (tokenURI) {
              try {
                let metadataUrl = tokenURI as string
                if (metadataUrl.startsWith('ipfs://')) {
                  metadataUrl = metadataUrl.replace('ipfs://', 'https://ipfs.io/ipfs/')
                }
                const response = await fetch(metadataUrl)
                metadata = await response.json()
                if (metadata?.image) {
                  imageUrl = metadata.image
                  if (imageUrl.startsWith('ipfs://')) {
                    imageUrl = imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/')
                  }
                }
              } catch (error) {
                console.error('Error fetching metadata for token', tokenId, error)
              }
            }
            return { tokenId, owner: owner as Address, imageUrl, metadata }
          } catch (error) {
            console.error('Error fetching NFT data for token', tokenId, error)
            return null
          }
        })())

        const results = await Promise.all(nftPromises)
        const validResults = results.filter((r): r is { tokenId: number; owner: Address; imageUrl: string; metadata: any } => r !== null)
        setNftData(validResults)
      } catch (error) {
        console.error('Error fetching NFT data:', error)
      } finally {
        setLoadingNfts(false)
      }
    }
    
    fetchNftData()
  }, [nftAddress, publicClient, nftReloadNonce])

  // Keep user's NFT list up-to-date whenever address or nftAddress changes
  useEffect(() => {
    if (!nftAddress || !account?.address) return
    refreshUserNfts()
  }, [nftAddress, account?.address])

  // DN404 freeze helpers and actions
  const frozenNftCount = (() => {
    if (frozenBalanceRaw === null) return null
    try {
      return Number(frozenBalanceRaw / DN404_DEFAULT_UNIT)
    } catch {
      return null
    }
  })()

  // Derive user's NFTs when needed (we compute directly where required to avoid unused warnings)

  const tokenIdToIndex = (tokenId: number): number | null => {
    if (!ownedIdsOrdered) return null
    const idx = ownedIdsOrdered.indexOf(tokenId)
    return idx >= 0 ? idx : null
  }

  const toggleSelectToken = (tokenId: number) => {
    setSelectedTokenIds(prev => {
      const next = new Set(prev)
      if (next.has(tokenId)) next.delete(tokenId)
      else next.add(tokenId)
      return next
    })
  }

  const onFreezeSelected = async () => {
    if (!walletClient || !publicClient || !pool?.baseToken.address) return
    if (selectedTokenIds.size === 0) return
    setIsFreezing(true)
    try {
      let indexes: bigint[] = []
      if (supportsTokenOfOwnerByIndex && nftMirrorAddress) {
        // First try to resolve using our cached ordering
        const selectedArray = Array.from(selectedTokenIds)
        const initialIdxs: Array<number | null> = selectedArray.map((tid) => tokenIdToIndex(tid))

        // If any are missing, build a fresh owner index map by scanning the mirror
        let resolvedIdxs: number[] = []
        if (initialIdxs.every((v) => typeof v === 'number')) {
          resolvedIdxs = initialIdxs as number[]
        } else {
          // Build a full tokenId -> index map for the owner
          const bal = await publicClient.readContract({
            address: nftMirrorAddress as Address,
            abi: erc721Abi,
            functionName: 'balanceOf',
            args: [account.address as Address],
          })
          const count = typeof bal === 'bigint' ? Number(bal) : Number(bal as any)

          const CHUNK = 512
          const map = new Map<number, number>()
          for (let start = 0; start < count; start += CHUNK) {
            const end = Math.min(start + CHUNK, count)
            const calls = [] as any[]
            for (let i = start; i < end; i++) {
              calls.push({
                address: nftMirrorAddress as Address,
                abi: erc721Abi,
                functionName: 'tokenOfOwnerByIndex' as const,
                args: [account.address as Address, BigInt(i)],
              })
            }
            const res = await publicClient.multicall({ contracts: calls })
            for (let i = 0; i < res.length; i++) {
              const r = res[i]
              if (r.status === 'success' && typeof r.result === 'bigint') {
                const tokenId = Number(r.result)
                map.set(tokenId, start + i)
              }
            }
          }

          // Try resolving again from the map
          resolvedIdxs = selectedArray
            .map((tid) => {
              const idx = map.get(tid)
              return typeof idx === 'number' ? idx : null
            })
            .filter((v): v is number => v !== null)

          // Update local cache if we built a more complete set
          if (map.size > 0) {
            const ordered = Array.from(map.entries())
              .sort((a, b) => a[1] - b[1])
              .map(([tid]) => tid)
            setOwnedIdsOrdered(ordered)
          }
        }

        if (resolvedIdxs.length === 0) {
          throw new Error('Could not resolve token indices for selection. Try toggling Freeze mode off/on or refreshing the page.')
        }

        indexes = resolvedIdxs.map((n) => BigInt(n))
      } else {
        throw new Error('This token does not expose owned indices; use Freeze Next N instead')
      }

      const txHash = await walletClient.writeContract({
        address: pool.baseToken.address as Address,
        abi: dn404Abi,
        functionName: 'freezeTokenIDsByIndex',
        args: [indexes],
      })
      await publicClient.waitForTransactionReceipt({ hash: txHash })

      // Refresh freeze data
      try {
        const fb = await publicClient.readContract({
          address: pool.baseToken.address as Address,
          abi: dn404Abi,
          functionName: 'frozenBalances',
          args: [account.address as Address],
        })
        setFrozenBalanceRaw(BigInt(fb as any))
      } catch {}
      // Refresh ordering (may change after freeze)
      try {
        if (supportsTokenOfOwnerByIndex && nftMirrorAddress) {
          const bal = await publicClient.readContract({
            address: nftMirrorAddress as Address,
            abi: erc721Abi,
            functionName: 'balanceOf',
            args: [account.address as Address],
          })
          const count = typeof bal === 'bigint' ? Number(bal) : Number(bal as any)
          const n = Math.min(count, 512)
          if (n > 0) {
            const calls = Array.from({ length: n }, (_, i) => ({
              address: nftMirrorAddress as Address,
              abi: erc721Abi,
              functionName: 'tokenOfOwnerByIndex' as const,
              args: [account.address as Address, BigInt(i)],
            }))
            const res = await publicClient.multicall({ contracts: calls })
            const ids: number[] = []
            for (const r of res) {
              if (r.status === 'success' && typeof r.result === 'bigint') {
                ids.push(Number(r.result))
              } else {
                throw new Error('tokenOfOwnerByIndex refresh failed')
              }
            }
            setOwnedIdsOrdered(ids)
          } else {
            setOwnedIdsOrdered([])
          }
        }
      } catch {}
      setSelectedTokenIds(new Set())
      await refreshUserNfts()
      setNftReloadNonce((x) => x + 1)
      // Also refresh balances shown in Swap section
      try { await refetchBaseTokenBalance() } catch {}
      try { await refetchQuoteTokenBalance() } catch {}
      try { await refetchNftBalanceOf() } catch {}
    } catch (e) {
      console.error('Freeze selected failed', e)
      alert(e instanceof Error ? e.message : 'Freeze failed')
    } finally {
      setIsFreezing(false)
    }
  }

  // No Freeze Next N; all freezing is selection-based

  const handleSwap = () => {
    if (!amount || !quotedAmount) return
    try {
      const ai = parseUnits(amount, tokenInDecimals)
      console.log('[SWAP] Parsed amountIn with decimals', tokenInDecimals, '->', ai.toString())
      executeSwap(ai)
    } catch (e) {
      console.error('[SWAP] Failed to parse amountIn with decimals', tokenInDecimals, e)
    }
  }

  const handleApprove = async () => {
    if (!pool || !account.address || !walletClient || !publicClient) return
    const tokenIn = getTokenInAddress()
    if (!tokenIn || tokenIn === zeroAddress) return
    const required = (() => { try { return parseUnits(amount || '0', tokenInDecimals) } catch { return 0n } })()
    if (required === 0n) return

    setIsApproving(true)
    try {
      // Prefer Permit2 signature approval
      try {
        const permit2Addr = addresses.permit2 as Address
        const [, , nonce] = await publicClient.readContract({
          address: permit2Addr,
          abi: permit2Abi,
          functionName: 'allowance',
          args: [account.address as Address, tokenIn, universalRouter as Address],
        }) as unknown as [bigint, bigint, bigint]
        const nowSec = BigInt(Math.floor(Date.now() / 1000))
        const permit = {
          details: {
            token: tokenIn,
            amount: required,
            expiration: nowSec + 3600n, // 1 hour
            nonce: BigInt(nonce),
          },
          spender: universalRouter as Address,
          sigDeadline: nowSec + 3600n,
        }
        await walletClient.signTypedData({
          account: account.address as Address,
          domain: PERMIT2_EIP712_DOMAIN(permit2Addr),
          types: {
            PermitDetails: [
              { name: 'token', type: 'address' },
              { name: 'amount', type: 'uint160' },
              { name: 'expiration', type: 'uint48' },
              { name: 'nonce', type: 'uint48' },
            ],
            PermitSingle: [
              { name: 'details', type: 'PermitDetails' },
              { name: 'spender', type: 'address' },
              { name: 'sigDeadline', type: 'uint256' },
            ],
          },
          primaryType: 'PermitSingle',
          message: permit as any,
        })
        setNeedsApproval(false)
        return
      } catch (e) {
        console.warn('Permit2 signature failed, falling back to ERC20 approve', e)
      }

      // Fallback to on-chain ERC20 approve to Universal Router
      const txHash = await walletClient.writeContract({
        address: tokenIn as Address,
        abi: erc20Abi,
        functionName: 'approve',
        args: [universalRouter as Address, required],
      })
      await publicClient.waitForTransactionReceipt({ hash: txHash })
      setNeedsApproval(false)
    } catch (e) {
      console.error('Approval failed', e)
    } finally {
      setIsApproving(false)
    }
  }

  // Helper function to truncate addresses
  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
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

  const normalizedPoolType = pool.type?.toLowerCase()
  const isMulticurvePool = normalizedPoolType === 'multicurve'
  const isV4LikePool = isMulticurvePool || normalizedPoolType === 'v4' || normalizedPoolType === 'dynamicauction' || normalizedPoolType === 'hook' || !pool.type
  const poolTypeBadgeLabel = isMulticurvePool
    ? '🌀 Multicurve'
    : isV4LikePool
      ? '🚀 Dynamic Auction'
      : '📊 Static Auction'
  const auctionTypeLabel = isMulticurvePool
    ? 'Multicurve (V4)'
    : isV4LikePool
      ? 'Dynamic (V4)'
      : 'Static (V3)'

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
            <div className="flex gap-2 mt-2">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                {poolTypeBadgeLabel}
              </div>
              {nftMirrorAddress && (
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-500">
                  🎨 Doppler404
                </div>
              )}
              {/* Migration status badge */}
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500">
                {pool.asset?.migrated
                  ? '✅ Migrated'
                  : isCheckingMigrate
                    ? '⏳ Checking migration…'
                    : (canMigrate ? '🟢 Migratable' : '🟡 Not Migratable Yet')}
              </div>
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
              <p className="text-lg">{auctionTypeLabel}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Metadata URI</p>
              <div className="text-sm space-y-1">
                { (pool as any).metadataUriHttp && (
                  <a
                    href={(pool as any).metadataUriHttp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline break-all"
                  >
                    {(pool as any).metadataUriHttp}
                  </a>
                )}
                { !(pool as any).metadataUriHttp && (pool as any).metadataUriRaw && (
                  <p className="break-all">{(pool as any).metadataUriRaw}</p>
                )}
                { !(pool as any).metadataUriHttp && !(pool as any).metadataUriRaw && (pool as any).metadataJson && (
                  <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-all text-xs bg-muted/30 p-2 rounded">
                    {(pool as any).metadataJson}
                  </pre>
                )}
                { !(pool as any).metadataUriHttp && !(pool as any).metadataUriRaw && !(pool as any).metadataJson && (
                  <p className="text-lg">—</p>
                )}
                { metadataUriError && (pool as any).metadataUriHttp && (
                  <div className="mt-2 border border-red-500/30 bg-red-500/10 text-red-600 rounded px-2 py-1 text-xs">
                    {metadataUriError}
                  </div>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Website URL</p>
              <div className="text-sm space-y-1">
                {(pool as any).websiteUrl ? (
                  <a
                    href={(pool as any).websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline break-all"
                  >
                    {(pool as any).websiteUrl}
                  </a>
                ) : (
                  <p className="text-lg">—</p>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Migration</p>
              <p className="text-lg">
                {pool.asset?.migrated
                  ? 'Already migrated'
                  : isCheckingMigrate
                    ? 'Checking…'
                    : (canMigrate ? 'Eligible to migrate' : 'Not eligible yet')}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="text-lg">{new Date(Number(pool.createdAt) * 1000).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pool Address</p>
              <p className="text-lg font-mono text-sm break-all">{pool.address}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Token Address</p>
              <p className="text-lg font-mono text-sm break-all">{pool.baseToken.address}</p>
            </div>
            {nftMirrorAddress && (
              <div>
                <p className="text-sm text-muted-foreground">NFT Collection (ERC721)</p>
                <p className="text-lg font-mono text-sm break-all">{nftMirrorAddress}</p>
                <p className="text-xs text-muted-foreground mt-1">This is a Doppler404 token with NFT functionality</p>
              </div>
            )}
          </div>

          {account?.address && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Your Balances</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{pool.baseToken.symbol} (ERC20)</p>
                  <p className="text-lg">
                    {baseTokenBalance?.formatted
                      ? `${Number(baseTokenBalance.formatted).toLocaleString(undefined, { maximumFractionDigits: 6 })} ${pool.baseToken.symbol}`
                      : `0 ${pool.baseToken.symbol}`}
                  </p>
                </div>
                {nftMirrorAddress && (
                  <div>
                    <p className="text-sm text-muted-foreground">Mirror NFTs</p>
                    <p className="text-lg">{typeof nftBalanceOf === 'number' ? nftBalanceOf : '—'}</p>
                  </div>
                )}
                {nftMirrorAddress && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Frozen (DN404)</p>
                    <p className="text-lg">
                      {frozenBalanceRaw !== null
                        ? `${Number(formatUnits(frozenBalanceRaw, baseDecimals)).toLocaleString(undefined, { maximumFractionDigits: 6 })} ${pool.baseToken.symbol}`
                        : '—'}
                      {typeof frozenNftCount === 'number' ? ` (${frozenNftCount} NFTs)` : ''}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          
        </div>
      </div>

      <div className="border border-primary/20 rounded-lg p-6 bg-card/50 backdrop-blur">
        <h2 className="text-2xl font-semibold mb-6">Swap</h2>
        {auctionNotStarted && (
          <div className="mb-4 p-3 border rounded-md bg-amber-50/80 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
            Auction has not started yet.
            {auctionStartTime && (<> Starts at {new Date(auctionStartTime * 1000).toLocaleString()}. </>)} Quotes may be indicative; swaps are disabled until start.
          </div>
        )}
        
        <Tabs defaultValue="buy" className="w-full" onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buy">Buy {pool.baseToken.symbol}</TabsTrigger>
            <TabsTrigger value="sell">Sell {pool.baseToken.symbol}</TabsTrigger>
          </TabsList>
          {account?.address && (
            <div className="mt-2 text-xs text-muted-foreground flex items-center gap-4 justify-end">
              <span>
                Balance: <span className="text-foreground font-medium">
                  {baseTokenBalance?.formatted
                    ? `${Number(baseTokenBalance.formatted).toLocaleString(undefined, { maximumFractionDigits: 6 })} ${pool.baseToken.symbol}`
                    : `0 ${pool.baseToken.symbol}`}
                </span>
              </span>
              {nftMirrorAddress && (
                <>
                  <span>
                    NFTs: <span className="text-foreground font-medium">{typeof nftBalanceOf === 'number' ? nftBalanceOf : '—'}</span>
                  </span>
                  <span>
                    Frozen: <span className="text-foreground font-medium">
                      {typeof frozenNftCount === 'number' ? `${frozenNftCount} NFTs` : '—'}
                      {frozenBalanceRaw !== null ? ` (${Number(formatUnits(frozenBalanceRaw, baseDecimals)).toLocaleString(undefined, { maximumFractionDigits: 6 })} ${pool.baseToken.symbol})` : ''}
                    </span>
                  </span>
                </>
              )}
            </div>
          )}
          
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
                disabled={auctionNotStarted}
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
                disabled={auctionNotStarted}
              />
              {quotedAmount !== null && (
                <p className="text-sm text-muted-foreground">
                  You will receive: {formatEther(quotedAmount)} {pool.quoteToken.symbol}
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {(!isBuying && needsApproval) ? (
          <Button 
            onClick={handleApprove}
            className="w-full mt-4"
            disabled={!amount || isApproving || auctionNotStarted}
          >
            {isApproving ? 'Approving…' : 'Approve'}
          </Button>
        ) : (
          <Button 
            onClick={handleSwap}
            className="w-full mt-4"
            disabled={!amount || !quotedAmount || auctionNotStarted}
          >
            Swap
          </Button>
        )}
      </div>

      {/* NFT Gallery for Doppler404 tokens */}
      {nftAddress && (
        <div className="border border-primary/20 rounded-lg p-6 bg-card/50 backdrop-blur">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">NFT Collection</h2>
            <div className="flex items-center gap-4">
              {typeof frozenNftCount === 'number' && (
                <div className="text-sm text-muted-foreground">
                  Frozen: <span className="font-medium text-foreground">{frozenNftCount}</span>
                </div>
              )}
              {account?.address && (
                <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showOnlyMine}
                    onChange={(e) => setShowOnlyMine(e.target.checked)}
                    className="h-4 w-4 accent-primary"
                  />
                  Only my NFTs
                </label>
              )}
              {account?.address && (
                <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={freezeMode}
                    onChange={(e) => {
                      setFreezeMode(e.target.checked)
                      // Reset selections when toggling freeze mode to avoid stale UI state
                      setSelectedTokenIds(new Set())
                      if (e.target.checked) setShowOnlyMine(true)
                    }}
                    className="h-4 w-4 accent-primary"
                  />
                  Freeze mode
                </label>
              )}
            </div>
          </div>

          {freezeMode && (
            <div className="mb-4 p-3 border rounded-md bg-background/40">
              {supportsTokenOfOwnerByIndex ? (
                <p className="text-xs text-muted-foreground">
                  Select specific NFTs to freeze, then click Freeze Selected. Frozen NFTs are the first items in your owned list.
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  This token does not expose owner index enumeration; freezing selection is unavailable.
                </p>
              )}
              {supportsTokenOfOwnerByIndex && (
                <div className="mt-2">
                  <Button onClick={onFreezeSelected} disabled={isFreezing || selectedTokenIds.size === 0}>
                    {isFreezing ? 'Freezing...' : `Freeze Selected (${selectedTokenIds.size})`}
                  </Button>
                </div>
              )}
            </div>
          )}
          
          {loadingNfts ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading NFTs...</p>
            </div>
          ) : (((showOnlyMine && account?.address) ? myNftData.length : nftData.length) > 0) ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {(() => {
                const baseList = (showOnlyMine && account?.address) ? [...myNftData] : [...nftData]
                baseList.sort((a, b) => {
                  const ia = tokenIdToIndex(a.tokenId)
                  const ib = tokenIdToIndex(b.tokenId)
                  const ai = ia === null ? Number.MAX_SAFE_INTEGER : ia
                  const bi = ib === null ? Number.MAX_SAFE_INTEGER : ib
                  return ai - bi
                })
                return baseList
              })().map((nft) => {
                const isMine = account?.address && nft.owner.toLowerCase() === (account.address as string).toLowerCase()
                const idx = isMine ? tokenIdToIndex(nft.tokenId) : null
                const isFrozen = typeof idx === 'number' && typeof frozenNftCount === 'number' && idx < frozenNftCount
                const selected = selectedTokenIds.has(nft.tokenId)
                return (
                <div key={nft.tokenId} className="flex flex-col space-y-2">
                  <div
                    className={`relative aspect-square rounded-lg overflow-hidden bg-background/50 border ${selected ? 'border-primary ring-2 ring-primary/50' : 'border-input'} ${freezeMode && isMine && supportsTokenOfOwnerByIndex ? 'cursor-pointer' : ''}`}
                    onClick={() => {
                      if (freezeMode && isMine && supportsTokenOfOwnerByIndex) {
                        toggleSelectToken(nft.tokenId)
                      }
                    }}
                    role={freezeMode && isMine && supportsTokenOfOwnerByIndex ? 'button' : undefined}
                    aria-pressed={freezeMode && isMine && supportsTokenOfOwnerByIndex ? (selected ? true : false) : undefined}
                    tabIndex={freezeMode && isMine && supportsTokenOfOwnerByIndex ? 0 : -1}
                    onKeyDown={(e) => {
                      if ((e.key === 'Enter' || e.key === ' ') && freezeMode && isMine && supportsTokenOfOwnerByIndex) {
                        e.preventDefault()
                        toggleSelectToken(nft.tokenId)
                      }
                    }}
                  >
                    {nft.imageUrl ? (
                      <img 
                        src={nft.imageUrl} 
                        alt={`NFT #${nft.tokenId}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                          const parent = (e.target as HTMLImageElement).parentElement
                          if (parent) {
                            const placeholder = document.createElement('div')
                            placeholder.className = 'w-full h-full flex items-center justify-center text-muted-foreground'
                            placeholder.textContent = `#${nft.tokenId}`
                            parent.appendChild(placeholder)
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        #{nft.tokenId}
                      </div>
                    )}
                    {freezeMode && isMine && supportsTokenOfOwnerByIndex && (
                      <button
                        className={`absolute top-2 left-2 p-1 rounded bg-background/80 border text-xs ${selected ? 'border-primary text-primary' : 'border-muted-foreground/40 text-foreground/80'}`}
                        onClick={(e) => { e.stopPropagation(); toggleSelectToken(nft.tokenId) }}
                        title={selected ? 'Unselect' : 'Select for freeze'}
                      >
                        {selected ? 'Selected' : 'Select'}
                      </button>
                    )}
                    {isFrozen && (
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-primary/80 text-white text-xs">Frozen</div>
                    )}
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-sm font-medium">#{nft.tokenId}</p>
                    <p className="text-xs text-muted-foreground">
                      {truncateAddress(nft.owner)}
                    </p>
                    {freezeMode && isMine && typeof idx === 'number' && (
                      <p className="text-[10px] text-muted-foreground">Index: {idx}</p>
                    )}
                  </div>
                </div>
              )})}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No NFTs found</p>
            </div>
          )}
          
          {(((showOnlyMine && account?.address) ? myNftData.length : nftData.length) > 0) && (
            <p className="text-xs text-muted-foreground mt-4 text-center">
              {showOnlyMine && account?.address
                ? <>Showing {myNftData.length} of {nftData.length} NFTs</>
                : <>Showing {nftData.length} NFTs {nftData.length >= 100 && '(limited to first 100)'} </>
              }
            </p>
          )}
        </div>
      )}
    </div>
  )
}
