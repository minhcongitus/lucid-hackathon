import { usePoolData } from './usePoolData'

const SECOND_PER_DATE = 24 * 60 * 60

export const usePoolDay = (poolAddress: string) => {
  const pool = usePoolData(poolAddress)

  const currentTime = Math.floor(new Date().getTime() / 1000)
  const startTime = pool.startTime.toNumber()

  let date = (currentTime - startTime) / SECOND_PER_DATE
  if (date < 1) date = 1

  return date
}
