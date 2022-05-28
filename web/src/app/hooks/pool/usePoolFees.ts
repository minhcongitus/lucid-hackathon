import { useMemo } from 'react'

import { usePoolAmounts } from './usePoolAmounts'
import { usePoolDay } from './usePoolDay'
import { usePoolPrices } from './usePoolPrices'

export const usePoolFees = (poolAddress: string) => {
  const day = usePoolDay(poolAddress)
  const poolAmounts = usePoolAmounts(poolAddress)
  const poolPrices = usePoolPrices(poolAddress)

  const totalFee = useMemo(() => {
    return poolAmounts.lptFeeAmount * poolPrices.lptPrice
  }, [poolAmounts.lptFeeAmount, poolPrices.lptPrice])
  return {
    totalFee,
    fee24h: totalFee / day,
  }
}
