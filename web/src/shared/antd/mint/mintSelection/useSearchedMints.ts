import { useCallback, useEffect, useState } from 'react'

import { useAllMintAddresses } from './useAllMintAddresses'
import TokenProvider from 'shared/tokenProvider'

let searching: NodeJS.Timeout

const tokenProvider = new TokenProvider()

export const useSearchedMints = (keyword: string = '', limit: number) => {
  const [loading, setLoading] = useState(false)
  const [searchedMints, setSearchedMints] = useState<string[]>([])
  const mints = useAllMintAddresses()

  const search = useCallback(async () => {
    if (!keyword) {
      setLoading(false)
      return setSearchedMints(mints)
    }
    if (searching) clearTimeout(searching)
    setLoading(true)
    searching = setTimeout(async () => {
      const addresses = (await tokenProvider.find(keyword, limit)).map(
        ({ address }) => address,
      )
      setLoading(false)
      return setSearchedMints(addresses)
    }, 500)
  }, [keyword, limit, mints])

  useEffect(() => {
    search()
  }, [search])

  return { searchedMints, loading }
}
