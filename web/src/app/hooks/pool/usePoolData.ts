import { AppState } from 'app/model'
import { useSelector } from 'react-redux'

export const usePoolData = (poolAddress: string) => {
  const poolData = useSelector((state: AppState) => state.pools[poolAddress])
  return poolData
}
