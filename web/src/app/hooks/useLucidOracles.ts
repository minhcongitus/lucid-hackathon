import { BN } from '@project-serum/anchor'
import util from '@senswap/sen-js/dist/utils'

import { GENERAL_DECIMAL, LPT_DECIMAL } from 'app/constants'

export type PoolPairLpData = {
  balanceIn: BN
  balanceOut: BN
  weightIn: number
  decimalIn: number
  swapFee: BN
}

export type PoolPairData = {
  balanceIn: BN
  balanceOut: BN
  weightIn: number
  weightOut: number
  decimalIn: number
  decimalOut: number
  swapFee: BN
}

export const useLucidOracles = () => {
  const calcLPOutGivenExactTokensIn = (
    tokenAmountIns: BN[],
    balanceIns: BN[],
    totalSupply: BN,
    decimalIns: number[],
    swapFee: BN,
  ) => {
    const fee = Number(
      util.undecimalize(BigInt(swapFee.toString()), GENERAL_DECIMAL),
    )
    const numTotalSupply = Number(
      util.undecimalize(BigInt(totalSupply.toString()), LPT_DECIMAL),
    )
    const numBalanceIns = balanceIns.map((value, idx) =>
      Number(util.undecimalize(BigInt(value.toString()), decimalIns[idx])),
    )
    const numAmountIns = tokenAmountIns.map((value, idx) =>
      Number(util.undecimalize(BigInt(value.toString()), decimalIns[idx])),
    )

    console.log(
      fee,
      numTotalSupply,
      numBalanceIns,
      numAmountIns,
      'numAmountIns',
    )
    const balanceRatiosWithFee = new Array(tokenAmountIns.length)
    let invariantRatioWithFees = 0
    for (let i = 0; i < tokenAmountIns.length; i++) {
      balanceRatiosWithFee[i] =
        (numBalanceIns[i] + numAmountIns[i]) / numBalanceIns[i]

      invariantRatioWithFees += balanceRatiosWithFee[i] * 0.5
    }

    let invariantRatio = 1

    for (let i = 0; i < tokenAmountIns.length; i++) {
      let amountInWithoutFee = numAmountIns[i]
      if (balanceRatiosWithFee[i] > invariantRatioWithFees) {
        let nonTaxableAmount = numBalanceIns[i] * (invariantRatioWithFees - 1)
        let taxableAmount = numAmountIns[i] - nonTaxableAmount
        amountInWithoutFee = nonTaxableAmount + taxableAmount * (1 - fee)
      }
      let balanceRatio =
        (numBalanceIns[i] + amountInWithoutFee) / numBalanceIns[i]
      invariantRatio = invariantRatio * balanceRatio ** 0.5
    }
    if (invariantRatio > 1) return numTotalSupply * (invariantRatio - 1)
    return 0
  }

  const spotPriceAfterSwapTokenInForExactBPTOut = (
    amount: BN,
    poolPairData: PoolPairLpData,
  ) => {
    const Bo = Number(
      util.undecimalize(
        BigInt(poolPairData.balanceOut.toString()),
        LPT_DECIMAL,
      ),
    )
    const Ao = Number(util.undecimalize(BigInt(amount.toString()), LPT_DECIMAL))
    const wi = poolPairData.weightIn
    const Bi = Number(
      util.undecimalize(
        BigInt(poolPairData.balanceIn.toString()),
        poolPairData.decimalIn,
      ),
    )
    const f = Number(
      util.undecimalize(
        BigInt(poolPairData.swapFee.toString()),
        GENERAL_DECIMAL,
      ),
    )

    return (
      (Math.pow((Ao + Bo) / Bo, 1 / wi) * Bi) /
      ((Ao + Bo) * (1 + f * (-1 + wi)) * wi)
    )
  }

  const calcLpForTokensZeroPriceImpact = (
    tokenAmountIns: BN[],
    balanceIns: BN[],
    totalSupply: BN,
    decimalIns: number[],
  ) => {
    const numTokenAmountIns = tokenAmountIns.map((value, idx) => {
      return Number(
        util.undecimalize(BigInt(value.toString()), decimalIns[idx]),
      )
    })

    const amountLpOut = numTokenAmountIns.reduce((totalBptOut, amountIn, i) => {
      // Calculate amount of BPT gained per token in
      const poolPairData: PoolPairLpData = {
        balanceIn: balanceIns[i],
        balanceOut: totalSupply,
        weightIn: 0.5,
        decimalIn: decimalIns[i],
        swapFee: new BN(0),
      }
      const LpPrice = spotPriceAfterSwapTokenInForExactBPTOut(
        new BN(0),
        poolPairData,
      )
      // Multiply by amountIn to get contribution to total bpt out
      const LpOut = amountIn / LpPrice
      return totalBptOut + LpOut
    }, 0)
    return amountLpOut
  }

  const calcDepositInfo = (
    amountIns: BN[],
    balanceIns: BN[],
    totalSupply: BN,
    decimalIns: number[],
    swapFee: BN,
  ) => {
    if (decimalIns.length === 0) return { lpOut: 0, impactPrice: 0 }

    const lpOut = Number(
      calcLPOutGivenExactTokensIn(
        amountIns,
        balanceIns,
        totalSupply,
        decimalIns,
        swapFee,
      ).toFixed(9),
    )

    const lpOutZeroPriceImpact = Number(
      calcLpForTokensZeroPriceImpact(
        amountIns,
        balanceIns,
        totalSupply,
        decimalIns,
      ).toFixed(9),
    )

    const impactPrice = 1 - lpOut / lpOutZeroPriceImpact

    return { lpOut, impactPrice: impactPrice || 0 }
  }

  const calcMintReceivesRemoveFullSide = (
    lptAmount: BN,
    lptSupply: BN,
    reserves: BN[],
  ) => {
    const numLptAmount = lptAmount.toNumber()
    const numLptSupply = lptSupply.toNumber()

    let lpt_rate = numLptAmount / numLptSupply
    let amounts_out: BN[] = reserves.map((reserve) => {
      return new BN(lpt_rate * Number(reserve))
    })
    return amounts_out
  }

  const calcOutGivenInSwap = (
    amountIn: number,
    balanceOut: number,
    balanceIn: number,
    swapFee: number,
  ): number => {
    // const numSwapFee = swapFee.toNumber() / GENERAL_NORMALIZED_NUMBER
    const ratioBeforeAfterBalance = balanceIn / (balanceIn + amountIn)

    return balanceOut * (1 - ratioBeforeAfterBalance) * (1 - swapFee)
  }

  return { calcDepositInfo, calcMintReceivesRemoveFullSide, calcOutGivenInSwap }
}
