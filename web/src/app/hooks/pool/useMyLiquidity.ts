import { usePoolData } from './usePoolData'
import { usePoolPrices } from './usePoolPrices'
import { useAccountBalanceByMintAddress } from 'shared/hooks/useAccountBalance'

export const useMyLiquidity = (poolAddress: string) => {
  const poolData = usePoolData(poolAddress)
  const poolPrices = usePoolPrices(poolAddress)
  const myLpt =
    useAccountBalanceByMintAddress(poolData.lptMint.toBase58()) || {}
  return (myLpt?.balance || 0) * poolPrices.lptPrice
}
