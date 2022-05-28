import { useCallback, useEffect, useState } from 'react'

import { useOracles } from 'app/hooks/useOracles'
import { usePoolData } from './usePoolData'

const LPT_DECIMALS = 9
const STABLE_DECIMALS = 9

export const usePoolAmounts = (poolAddress: string) => {
  const [amounts, setAmounts] = useState({
    amount: 0,
    stableAmount: 0,
    baseAmount: 0,
    lptAmount: 0,
    lptFeeAmount: 0,
  })
  const poolData = usePoolData(poolAddress)
  const { undecimalize, undecimalizeMintAmount } = useOracles()

  const calcPrices = useCallback(async () => {
    const {
      balance,
      mint,
      stableBalance,
      lptSupply,
      baseBalance,
      baseMint,
      totalLptFee,
    } = poolData
    const amount = Number(await undecimalizeMintAmount(balance, mint))
    const stableAmount = Number(undecimalize(stableBalance, STABLE_DECIMALS))
    const baseAmount = Number(undecimalizeMintAmount(baseBalance, baseMint))
    const lptAmount = Number(undecimalize(lptSupply, LPT_DECIMALS))
    const lptFeeAmount = Number(undecimalize(totalLptFee, LPT_DECIMALS))
    return setAmounts({
      amount,
      stableAmount,
      baseAmount,
      lptAmount,
      lptFeeAmount,
    })
  }, [poolData, undecimalize, undecimalizeMintAmount])

  useEffect(() => {
    calcPrices()
  }, [calcPrices])

  return amounts
}
