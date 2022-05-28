import { Button, Col, Row, Space, Typography } from 'antd'
import { useState } from 'react'
import { MintSelection } from 'shared/antd/mint'
import NumericInput from 'shared/antd/numericInput'
import { useOracles } from 'app/hooks/useOracles'
import { useLucid } from 'app/hooks/useLucid'
import { notifyError, notifySuccess } from 'app/helper'

import config from 'app/configs'
import { BN } from 'bn.js'
import { numeric } from 'shared/util'
import { useAccountBalanceByMintAddress } from 'shared/hooks/useAccountBalance'

export const ModalContent = () => {
  const [mint, setMint] = useState('')
  const [amount, setAmount] = useState('0')
  const [price, setPrice] = useState('0')
  const [loading, setLoading] = useState(false)
  const { decimalizeMintAmount, decimalize } = useOracles()
  const lucid = useLucid()
  const { balance } = useAccountBalanceByMintAddress(mint)

  const onCreate = async () => {
    const FEE = new BN(10_000_000) // 1%
    try {
      setLoading(true)
      const stableAmount = Number(amount) * Number(price)
      const amountBN = await decimalizeMintAmount(amount, mint)
      const stableAmountBN = decimalize(stableAmount, 9)
      const { txId } = await lucid.initializePool(
        mint,
        config.sol.baseMint,
        FEE,
        amountBN,
        stableAmountBN,
        new BN(0),
      )
      notifySuccess('Create Pool', txId)
    } catch (error) {
      notifyError(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Row gutter={[24, 24]}>
      <Col span={24} style={{ textAlign: 'center' }}>
        <Typography.Title level={5} style={{ color: '#000000' }}>
          New HackaPool
        </Typography.Title>
      </Col>
      <Col span={24}>
        <Row gutter={[0, 0]} justify="space-between">
          <Col>
            <Space direction="vertical">
              <Typography.Text type="secondary" className="caption">
                Token Amount
              </Typography.Text>
              <MintSelection
                style={{
                  background: '#F4FCEB',
                  color: '#000000',
                  borderRadius: 32,
                  height: 40,
                  width: 135,
                }}
                value={mint}
                onChange={setMint}
              />
            </Space>
          </Col>
          <Col>
            <Space direction="vertical">
              <Typography.Text type="secondary" className="caption">
                Enter Price
              </Typography.Text>
              <NumericInput
                bordered={false}
                style={{
                  color: '#000000',

                  fontSize: '20px',
                  fontWeight: 700,
                  width: 90,
                }}
                value={price}
                onValue={setPrice}
              />
            </Space>
          </Col>
          <Col>
            <Space direction="vertical">
              <Typography.Text type="secondary" className="caption">
                Amount
              </Typography.Text>
              <NumericInput
                bordered={false}
                style={{
                  color: '#000000',

                  fontSize: '20px',
                  fontWeight: 700,
                  width: 90,
                }}
                value={amount}
                onValue={setAmount}
              />
              <Typography.Text
                style={{ color: '#000000' }}
                onClick={() => setAmount(balance.toString())}
              >
                Available: {numeric(balance).format('0,0.[000]')}
              </Typography.Text>
            </Space>
          </Col>
        </Row>
      </Col>
      <Col span={24}>
        <Row gutter={[8, 8]}>
          <Col span={24}>
            <Typography.Title level={5} style={{ color: '#000000' }}>
              Review
            </Typography.Title>
          </Col>
          <Col span={24}>
            <Row>
              <Col flex="auto">
                <Typography.Text style={{ color: '#000000' }}>
                  Total amount in the pool
                </Typography.Text>
              </Col>
              <Col>
                <Typography.Title level={4} style={{ color: '#000000' }}>
                  {numeric(amount).format('0,0.[000]')}
                </Typography.Title>
              </Col>
            </Row>
          </Col>
          <Col span={24}>
            <Row>
              <Col flex="auto">
                <Typography.Text style={{ color: '#000000' }}>
                  Price token
                </Typography.Text>
              </Col>
              <Col>
                <Typography.Title level={4} style={{ color: '#000000' }}>
                  {numeric(price).format('0,0.[000]')}
                </Typography.Title>
              </Col>
            </Row>
          </Col>
        </Row>
      </Col>
      <Col span={24}>
        <Button type="primary" block onClick={onCreate} disabled={loading}>
          Create
        </Button>
      </Col>
    </Row>
  )
}
