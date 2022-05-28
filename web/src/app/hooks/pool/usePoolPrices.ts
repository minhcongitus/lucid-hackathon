import { useCallback, useEffect, useState } from 'react'

import { usePoolAmounts } from './usePoolAmounts'

export const usePoolPrices = (poolAddress: string) => {
  const poolAmounts = usePoolAmounts(poolAddress)
  const [poolPrices, setPoolPrices] = useState({
    mintPrice: 0,
    lptPrice: 0,
  })

  const calcPrices = useCallback(async () => {
    const { amount, stableAmount, lptAmount } = poolAmounts
    const mintPrice = stableAmount / amount
    const lptPrice = (mintPrice * amount + stableAmount) / lptAmount
    return setPoolPrices({
      mintPrice,
      lptPrice,
    })
  }, [poolAmounts])

  useEffect(() => {
    calcPrices()
  }, [calcPrices])

  return poolPrices
}
