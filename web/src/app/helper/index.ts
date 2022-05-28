import { BN } from '@project-serum/anchor'

import { utils } from '@senswap/sen-js'
import { explorer } from 'shared/util'

export const notifySuccess = (content: string, txId: string) => {
  return window.notify({
    type: 'success',
    description: `${content} successfully. Click to view details.`,
    onClick: () => window.open(explorer(txId), '_blank'),
  })
}

export const notifyError = (er: any) => {
  console.log('er', er)
  return window.notify({
    type: 'error',
    description: er.message,
  })
}

export const undecimalizeWrapper = (value: BN, decimals: number) => {
  const valueInBigInt = BigInt(value.toString())

  return utils.undecimalize(valueInBigInt, decimals)
}
