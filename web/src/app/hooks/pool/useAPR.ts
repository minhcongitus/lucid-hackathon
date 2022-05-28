import { useMemo } from 'react'
import { usePoolAmounts } from './usePoolAmounts'
import { usePoolDay } from './usePoolDay'

const useAPR = (poolAddress: string) => {
  const amounts = usePoolAmounts(poolAddress)
  const day = usePoolDay(poolAddress)

  const apr = useMemo(() => {
    const feePerDay = amounts.lptFeeAmount / day
    const roi = feePerDay / amounts.lptAmount
    return Number(Number(roi * 365 * 100).toFixed(6))
  }, [amounts.lptAmount, amounts.lptFeeAmount, day])

  return apr
}
export default useAPR
