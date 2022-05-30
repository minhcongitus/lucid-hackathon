import { useCallback, useEffect, useState } from 'react'
import TokenProvider from 'shared/tokenProvider'

const tokenProvider = new TokenProvider()

export const useAllMintAddresses = () => {
  const [allMintAddresses, setAllMintAddresses] = useState<string[]>([])

  const getRecommendedMintAddresses = useCallback(async () => {
    const allMintAddresses = (await tokenProvider.all()).map(
      ({ address }) => address,
    )
    const addresses = allMintAddresses.filter((mintAddress) =>
      allMintAddresses.includes(mintAddress),
    )
    return setAllMintAddresses(addresses)
  }, [])

  useEffect(() => {
    getRecommendedMintAddresses()
  }, [getRecommendedMintAddresses])

  return allMintAddresses
}
