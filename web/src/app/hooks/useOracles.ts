import { useCallback } from 'react'
import { Address, BN, web3 } from '@project-serum/anchor'
import { useMint } from '@senhub/providers'
import util from '@senswap/sen-js/dist/utils'

export const useOracles = () => {
  const { getDecimals } = useMint()

  const decimalizeMintAmount = useCallback(
    async (amount: number | string, mintAddress: Address) => {
      const decimals = await getDecimals(
        new web3.PublicKey(mintAddress).toString(),
      )
      return new BN(util.decimalize(amount, decimals).toString())
    },
    [getDecimals],
  )

  const undecimalizeMintAmount = useCallback(
    async (amount: BN, mintAddress: Address) => {
      const decimals = await getDecimals(
        new web3.PublicKey(mintAddress).toString(),
      )
      return util.undecimalize(BigInt(amount.toString()), decimals)
    },
    [getDecimals],
  )

  const decimalize = useCallback(
    (amount: number | string, decimals: number) => {
      return new BN(util.decimalize(amount, decimals).toString())
    },
    [],
  )

  const undecimalize = useCallback((amount: BN, decimals: number) => {
    return util.undecimalize(BigInt(amount.toString()), decimals)
  }, [])

  return {
    decimalize,
    undecimalize,
    decimalizeMintAmount,
    undecimalizeMintAmount,
  }
}
