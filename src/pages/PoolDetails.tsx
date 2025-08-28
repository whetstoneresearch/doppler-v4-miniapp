import { useParams, useSearchParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { GraphQLClient } from "graphql-request"
import { Pool } from "@/utils/graphql"
import { Address, formatEther, Hex, maxUint256, parseEther, zeroAddress } from "viem"
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

// DN404 ABI for mirrorERC721 function
const dn404Abi = [
  {
    name: 'mirrorERC721',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
] as const

// ERC721 ABI for NFT functions
const erc721Abi = [
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
    # Try to get V4 pool config if it's a dynamic auction
    v4PoolConfig(hookAddress: $address) {
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
  const publicClient = usePublicClient({ chainId })
  const [amount, setAmount] = useState("")
  const [quotedAmount, setQuotedAmount] = useState<bigint | null>(null)
  const [isBuying, setIsBuying] = useState(true)
  const [nftAddress, setNftAddress] = useState<Address | null>(null)
  const [nftData, setNftData] = useState<Array<{
    tokenId: number
    owner: Address
    imageUrl: string
    metadata: any
  }>>([])
  const [loadingNfts, setLoadingNfts] = useState(false)
  const [nftTotalSupply, setNftTotalSupply] = useState<number>(0)
  const [showOnlyMine, setShowOnlyMine] = useState<boolean>(false)
  const addresses = getAddresses(chainId)
  const { universalRouter } = addresses

  console.log('Pool address:', address)
  console.log('Chain ID from URL:', chainId)

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
      const response = await client.request<{ pools: { items: any[] }, v4PoolConfig?: any }>(GET_POOL_QUERY, {
        address,
        chainId,
      })
      console.log('Full pool GraphQL response:', response)
      const p = response.pools.items?.[0]
      if (!p) return undefined as any
      
      // Check if we have V4 pool config data (for dynamic auctions)
      const v4Config = response.v4PoolConfig
      
      // For V4 dynamic auctions, derive currency0 and currency1 from baseToken/quoteToken
      // based on isToken0 from v4Config
      let currency0 = p.currency0
      let currency1 = p.currency1
      
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
      
      // Normalize into Pool shape used by UI
      const normalized: Pool & { v4Config?: any } = {
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
        poolKey: (currency0 && currency1) ? {
          currency0: currency0,
          currency1: currency1,
          fee: p.fee,
          tickSpacing: p.tickSpacing,
          hooks: p.hooks || p.address,
        } : undefined,
        currency0: currency0,
        currency1: currency1,
        tickSpacing: p.tickSpacing,
        hooks: p.hooks || p.address,
        // Add V4 config if available
        v4Config: v4Config || undefined,
      }
      return normalized
    },
  })

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
      a?.quoter
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
        // Use PoolKey directly from indexer data, but handle missing currency fields
        // For dynamic auctions, currency0/currency1 might not be set, so derive from base/quote tokens
        let currency0 = pool.currency0
        let currency1 = pool.currency1
        
        if (!currency0 || !currency1) {
          // Fallback: derive from base/quote tokens
          // In Uniswap V4, token0 is always the smaller address (lexicographically)
          const baseTokenAddr = pool.baseToken?.address as Address
          const quoteTokenAddr = pool.quoteToken?.address as Address
          
          // Sort addresses to determine token0 and token1
          const sorted = [baseTokenAddr, quoteTokenAddr].sort((a, b) => 
            a.toLowerCase() < b.toLowerCase() ? -1 : 1
          )
          
          currency0 = sorted[0]
          currency1 = sorted[1]
        }
        
        if (!currency0 || !currency1) {
          console.error("Cannot determine currency0/currency1 for V4 pool")
          return null
        }
        
        // Build the pool key with properly sorted addresses
        const key = {
          currency0: currency0 as Address,
          currency1: currency1 as Address,
          fee: pool.fee || DYNAMIC_FEE_FLAG, // Dynamic auctions use DYNAMIC_FEE_FLAG
          tickSpacing: pool.tickSpacing || 8, // Default to 8 - common for Doppler V4 auctions
          hooks: (pool.hooks || address) as Address,
        }

        // Check if this is a dynamic auction (has v4Config or hooks address)
        const isDynamicAuction = pool.v4Config || (pool.hooks && pool.hooks !== zeroAddress)
        
        if (isDynamicAuction) {
          // Use DopplerLens for dynamic auctions
          const dopplerLensAddress = addresses.dopplerLens
          
          if (!dopplerLensAddress) {
            console.error("DopplerLens address not found in addresses")
            return null
          }
          
          // For DopplerLens, we need to use isToken0 from the V4 config
          // The test shows: zeroForOne: !isToken0
          const isToken0 = pool.v4Config?.isToken0 ?? pool.isToken0 ?? true
          const zeroForOne = !isToken0
          
          console.log('Using DopplerLens:', dopplerLensAddress)
          console.log('Dynamic auction quote params', { 
            key, 
            isToken0,
            zeroForOne, 
            amountIn: amountIn.toString(), 
            hookData: '0x' 
          })
          
          const params = {
            poolKey: key,
            zeroForOne,
            exactAmount: amountIn,
            hookData: "0x" as `0x${string}`,
          }
          
          try {
            // DopplerLens uses the revert-with-data pattern
            // We use simulateContract which handles reverts properly
            const { result } = await publicClient.simulateContract({
              address: dopplerLensAddress as Address,
              abi: dopplerLensQuoterAbi,
              functionName: "quoteDopplerLensData",
              args: [params],
            })
            
            // DopplerLens returns amount0 and amount1 - we need the appropriate one
            // If buying (swapping quote for base), we want the base amount out
            // If selling (swapping base for quote), we want the quote amount out
            const amountOut = isBuying 
              ? (isToken0 ? result.amount0 : result.amount1)  // Getting base token
              : (isToken0 ? result.amount1 : result.amount0)  // Getting quote token
              
            console.log('DopplerLens result:', result, 'amountOut:', amountOut)
            return amountOut
          } catch (error: any) {
            // The quoter might revert with the result in the error data
            // This is expected behavior for V4 quoters
            console.log('DopplerLens simulation error (expected):', error)
            
            // Try to parse the result from the error if it contains return data
            if (error?.data) {
              console.log('Attempting to parse revert data:', error.data)
              // The error data might contain the encoded result
              // For now, log it and return null - may need custom parsing
              return null
            }
            
            console.error('Failed to parse DopplerLens quote:', error)
            return null
          }
        } else {
          // Standard V4 pool (not dynamic auction)
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

          // Use standard Uniswap v4 Quoter
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
        }
      } catch (error) {
        console.error("Error fetching V4 quote:", error)
        return null
      }
    } else {
      // For V3 pools, use the unified SDK's Quoter
      try {
        console.log("Fetching V3 quote for pool:", pool.address)
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
        
        console.log("V3 quote result:", quote)
        return quote.amountOut
      } catch (error) {
        console.error("Error fetching V3 quote:", error)
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
    const isV4Pool = poolType === "v4" || poolType === "dynamicauction" || 
                     poolType === "hook" || !pool.type // If type is missing, assume V4
    
    if (isV4Pool && !isMigrated) {
      try {
        // Use PoolKey directly from indexer data, but handle missing currency fields
        // For dynamic auctions, currency0/currency1 might not be set, so derive from base/quote tokens
        let currency0 = pool.currency0
        let currency1 = pool.currency1
        
        if (!currency0 || !currency1) {
          // Fallback: derive from base/quote tokens
          // In Uniswap V4, token0 is always the smaller address (lexicographically)
          const baseTokenAddr = pool.baseToken?.address as Address
          const quoteTokenAddr = pool.quoteToken?.address as Address
          
          // Sort addresses to determine token0 and token1
          const sorted = [baseTokenAddr, quoteTokenAddr].sort((a, b) => 
            a.toLowerCase() < b.toLowerCase() ? -1 : 1
          )
          
          currency0 = sorted[0]
          currency1 = sorted[1]
        }
        
        if (!currency0 || !currency1) {
          console.error("Cannot determine currency0/currency1 for V4 pool")
          return null
        }
        
        // Build the pool key with properly sorted addresses
        const key = {
          currency0: currency0 as Address,
          currency1: currency1 as Address,
          fee: pool.fee || DYNAMIC_FEE_FLAG, // Dynamic auctions use DYNAMIC_FEE_FLAG
          tickSpacing: pool.tickSpacing || 8, // Default to 8 - common for Doppler V4 auctions
          hooks: (pool.hooks || address) as Address,
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

        const actionBuilder = new V4ActionBuilder()
        const [actions, params] = actionBuilder.addSwapExactInSingle(key, zeroForOne, amountIn, 0n, "0x")
        .addAction(V4ActionType.SETTLE_ALL, [zeroForOne ? key.currency0 : key.currency1, maxUint256])
        .addAction(V4ActionType.TAKE_ALL, [zeroForOne ? key.currency1 : key.currency0, 0]).build()
        const [commands, inputs] = new CommandBuilder().addV4Swap(actions, params).build()

        const txHash = await walletClient?.writeContract({
          address: universalRouter,
          abi: universalRouterAbi,
          functionName: "execute",
          args: [commands, inputs],
          value: zeroForOne ? amountIn : 0n
        })
        if (txHash) {
          const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash })
          if (receipt.status === 'success' && isBuying && nftAddress) {
            await new Promise((r) => setTimeout(r, 2000))
            const prevSupply = nftTotalSupply
            try {
              const latestSupplyBn = await publicClient.readContract({
                address: nftAddress,
                abi: erc721Abi,
                functionName: 'totalSupply',
              })
              const latestSupply = Number(latestSupplyBn)
              if (latestSupply > prevSupply) {
                // Only fetch up to 100 to stay within the gallery limit
                const start = Math.max(prevSupply + 1, 1)
                const end = Math.min(latestSupply, 100)
                // Fetch and append newly minted NFTs
                const nftPromises: Promise<{
                  tokenId: number
                  owner: Address
                  imageUrl: string
                  metadata: any
                } | null>[] = []
                for (let tokenId = start; tokenId <= end; tokenId++) {
                  nftPromises.push((async () => {
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
                        } catch (err) {
                          console.error('Error fetching metadata for token', tokenId, err)
                        }
                      }
                      return { tokenId, owner: owner as Address, imageUrl, metadata }
                    } catch (err) {
                      console.error('Error fetching new NFT data for token', tokenId, err)
                      return null
                    }
                  })())
                }
                const results = await Promise.all(nftPromises)
                const newItems = results.filter(Boolean) as typeof nftData
                if (newItems.length) {
                  setNftData((prev) => [...prev, ...newItems])
                }
                setNftTotalSupply(latestSupply)
              }
            } catch (e) {
              console.error('Error refreshing NFTs after buy (V4):', e)
            }
          }
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
        
        // If buying with ETH, we need to wrap it first
        const isEthInput = isBuying && quoteTokenAddress === addresses.weth
        if (isEthInput) {
          commandBuilder.addWrapEth(universalRouter, amountIn)
        }
        
        // Add the V3 swap command
        commandBuilder.addV3SwapExactIn(
          account.address as Address,  // recipient
          amountIn,                     // amountIn
          0n,                          // amountOutMinimum (0 for now, should calculate slippage)
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
          if (receipt.status === 'success' && isBuying && nftAddress) {
            await new Promise((r) => setTimeout(r, 2000))
            const prevSupply = nftTotalSupply
            try {
              const latestSupplyBn = await publicClient.readContract({
                address: nftAddress,
                abi: erc721Abi,
                functionName: 'totalSupply',
              })
              const latestSupply = Number(latestSupplyBn)
              if (latestSupply > prevSupply) {
                const start = Math.max(prevSupply + 1, 1)
                const end = Math.min(latestSupply, 100)
                const nftPromises: Promise<{
                  tokenId: number
                  owner: Address
                  imageUrl: string
                  metadata: any
                } | null>[] = []
                for (let tokenId = start; tokenId <= end; tokenId++) {
                  nftPromises.push((async () => {
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
                        } catch (err) {
                          console.error('Error fetching metadata for token', tokenId, err)
                        }
                      }
                      return { tokenId, owner: owner as Address, imageUrl, metadata }
                    } catch (err) {
                      console.error('Error fetching new NFT data for token', tokenId, err)
                      return null
                    }
                  })())
                }
                const results = await Promise.all(nftPromises)
                const newItems = results.filter(Boolean) as typeof nftData
                if (newItems.length) {
                  setNftData((prev) => [...prev, ...newItems])
                }
                setNftTotalSupply(latestSupply)
              }
            } catch (e) {
              console.error('Error refreshing NFTs after buy (V3):', e)
            }
          }
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
        setNftTotalSupply(nftCount)
        console.log('Total NFT supply:', nftCount)
        
        // Fetch data for each NFT
        const nftPromises = []
        for (let tokenId = 1; tokenId <= Math.min(nftCount, 100); tokenId++) { // Limit to 100 for performance
          nftPromises.push(
            (async () => {
              try {
                // Get owner
                const owner = await publicClient.readContract({
                  address: nftAddress,
                  abi: erc721Abi,
                  functionName: 'ownerOf',
                  args: [BigInt(tokenId)],
                })
                
                // Get tokenURI
                const tokenURI = await publicClient.readContract({
                  address: nftAddress,
                  abi: erc721Abi,
                  functionName: 'tokenURI',
                  args: [BigInt(tokenId)],
                })
                
                // Fetch metadata from URI
                let imageUrl = ''
                let metadata = null
                
                if (tokenURI) {
                  try {
                    // Handle IPFS URIs
                    let metadataUrl = tokenURI
                    if (tokenURI.startsWith('ipfs://')) {
                      metadataUrl = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/')
                    }
                    
                    const response = await fetch(metadataUrl)
                    metadata = await response.json()
                    
                    // Get image URL from metadata
                    if (metadata.image) {
                      imageUrl = metadata.image
                      if (imageUrl.startsWith('ipfs://')) {
                        imageUrl = imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/')
                      }
                    }
                  } catch (error) {
                    console.error('Error fetching metadata for token', tokenId, error)
                  }
                }
                
                return {
                  tokenId,
                  owner: owner as Address,
                  imageUrl,
                  metadata,
                }
              } catch (error) {
                console.error('Error fetching NFT data for token', tokenId, error)
                return null
              }
            })()
          )
        }
        
        const results = await Promise.all(nftPromises)
        const validResults = results.filter(r => r !== null) as typeof nftData
        setNftData(validResults)
      } catch (error) {
        console.error('Error fetching NFT data:', error)
      } finally {
        setLoadingNfts(false)
      }
    }
    
    fetchNftData()
  }, [nftAddress, publicClient])

  const handleSwap = () => {
    if (!amount || !quotedAmount) return
    executeSwap(parseEther(amount))
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
                {pool.type === 'v4' ? '🚀 Dynamic Auction' : '📊 Static Auction'}
              </div>
              {nftMirrorAddress && (
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-500">
                  🎨 Doppler404
                </div>
              )}
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

      {/* NFT Gallery for Doppler404 tokens */}
      {nftAddress && (
        <div className="border border-primary/20 rounded-lg p-6 bg-card/50 backdrop-blur">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">NFT Collection</h2>
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
          </div>
          
          {loadingNfts ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading NFTs...</p>
            </div>
          ) : ((showOnlyMine && account?.address) ? nftData.filter(n => n.owner.toLowerCase() === (account.address as string).toLowerCase()).length > 0 : nftData.length > 0) ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {(showOnlyMine && account?.address ? nftData.filter(n => n.owner.toLowerCase() === (account.address as string).toLowerCase()) : nftData).map((nft) => (
                <div key={nft.tokenId} className="flex flex-col space-y-2">
                  <div className="aspect-square rounded-lg overflow-hidden bg-background/50 border border-input">
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
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-sm font-medium">#{nft.tokenId}</p>
                    <p className="text-xs text-muted-foreground">
                      {truncateAddress(nft.owner)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No NFTs found</p>
            </div>
          )}
          
          {((showOnlyMine && account?.address) ? nftData.filter(n => n.owner.toLowerCase() === (account.address as string).toLowerCase()).length : nftData.length) > 0 && (
            <p className="text-xs text-muted-foreground mt-4 text-center">
              {showOnlyMine && account?.address ? (
                <>Showing {nftData.filter(n => n.owner.toLowerCase() === (account.address as string).toLowerCase()).length} of {nftData.length} NFTs</>
              ) : (
                <>Showing {nftData.length} NFTs {nftData.length >= 100 && '(limited to first 100)'} </>
              )}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
