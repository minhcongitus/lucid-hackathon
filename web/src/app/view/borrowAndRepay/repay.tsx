import { useCallback, useEffect, useState } from 'react'
import { Button, Col, Row } from 'antd'

import { notifyError, notifySuccess } from 'app/helper'
import { useLucid } from 'app/hooks/useLucid'

import { useOracles } from 'app/hooks/useOracles'
import { CardValue } from '../pools'
import { useWallet } from '@senhub/providers'
import { usePoolData } from 'app/hooks/pool/usePoolData'
import { numeric } from 'shared/util'
import { usePoolPrices } from 'app/hooks/pool/usePoolPrices'

const Deposit = ({ poolAddress }: { poolAddress: string }) => {
  const poolData = usePoolData(poolAddress)
  const poolPrices = usePoolPrices(poolAddress)
  const [loading, setLoading] = useState(false)
  const lucid = useLucid()
  const { undecimalize } = useOracles()
  const [lptLocked, setLptLocked] = useState('0')
  const [baseAmount, setBaseAmout] = useState('0')
  const { wallet } = useWallet()

  const fetchDebt = useCallback(async () => {
    const accouts = await lucid.getTokenAccounts(
      wallet.address,
      poolAddress,
      poolData.mint,
      poolData.baseMint,
    )
    let debt = 0
    let baseAmount = 0
    try {
      const debtAccount = await lucid.program.account.cheque.fetch(
        accouts.cheque,
      )
      //@ts-ignore
      debt = Number(undecimalize(debtAccount.borrowAmount, 9))
      baseAmount = Number(undecimalize(debtAccount.baseAmount, 9))
    } catch (error) {}
    setLptLocked(String(debt))
    setBaseAmout(String(baseAmount))
  }, [
    lucid,
    poolAddress,
    poolData.baseMint,
    poolData.mint,
    undecimalize,
    wallet.address,
  ])
  useEffect(() => {
    fetchDebt()
  }, [fetchDebt])

  const onDeposit = async () => {
    try {
      setLoading(true)
      const { txId } = await lucid.repay(poolAddress)
      return notifySuccess('Replay', txId)
    } catch (error) {
      notifyError(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Row gutter={[16, 16]} style={{ color: '#000000' }}>
      <Col span={12}>
        <CardValue
          label="DEBT"
          value={<span>{numeric(baseAmount).format('$0,0.[00]')}</span>}
        />
      </Col>
      <Col span={12}>
        <CardValue
          label="TOTAL LOCKED"
          value={
            <span>
              {numeric(Number(lptLocked) * poolPrices.lptPrice).format(
                '$0,0.[00]',
              )}
            </span>
          }
        />
      </Col>

      <Col span={24}>
        <Button loading={loading} block onClick={onDeposit} type="primary">
          Repay
        </Button>
      </Col>
    </Row>
  )
}

export default Deposit
