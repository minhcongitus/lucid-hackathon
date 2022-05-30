import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useMint } from '@senhub/providers'

import { Button, Card, Col, Row, Space, Typography } from 'antd'
import { MintSelection } from 'shared/antd/mint'

import { notifyError, notifySuccess } from 'app/helper'
import { useLucid } from 'app/hooks/useLucid'
import { AppState } from 'app/model'
import { useOracles } from 'app/hooks/useOracles'
import { useAccountBalanceByMintAddress } from 'shared/hooks/useAccountBalance'
import { numeric } from 'shared/util'
import NumericInput from 'shared/antd/numericInput'
import { BN } from 'bn.js'
import { useLucidOracles } from 'app/hooks/useLucidOracles'
import { BASE_TOKEN_DECIMAL } from 'app/constants'

const Deposit = ({
  poolAddress,
  closeModal,
}: {
  poolAddress: string
  closeModal: () => void
}) => {
  const pools = useSelector((state: AppState) => state.pools)
  const {
    baseMint,
    mint,
    lptMint,
    balance,
    baseBalance,
    lptSupply,
    fee,
    stableBalance,
  } = pools[poolAddress]
  const [amount, setAmount] = useState('0')
  const [baseAmount, setBaseAmount] = useState('0')
  const [loading, setLoading] = useState(false)
  const [estimatedLP, setEstimatedLP] = useState(0)

  const lucid = useLucid()
  const { decimalizeMintAmount } = useOracles()
  const mintBalance = useAccountBalanceByMintAddress(mint.toBase58())
  const baseBalanceOfAddress = useAccountBalanceByMintAddress(
    baseMint.toBase58(),
  )
  const lptBalance = useAccountBalanceByMintAddress(lptMint.toBase58())
  const { calcDepositInfo } = useLucidOracles()
  const { getDecimals } = useMint()

  const onDeposit = async () => {
    try {
      setLoading(true)
      const amountBN = await decimalizeMintAmount(amount, mint)
      const baseBN = await decimalizeMintAmount(baseAmount, baseMint)
      const { txId } = await lucid.addLiquidity(
        poolAddress,
        amountBN,
        new BN(0),
        baseBN,
      )
      closeModal()
      return notifySuccess('Deposited', txId)
    } catch (error) {
      notifyError(error)
    } finally {
      setLoading(false)
    }
  }

  const onChangeTokenAmount = async (value: string) => {
    setAmount(value)
    const amountBN = await decimalizeMintAmount(value, mint)
    const baseAmountBN = await decimalizeMintAmount(baseAmount, baseMint)
    // const amountBN = await decimalizeMintAmount(amount, lptMint)
    const amountIns = [amountBN, baseAmountBN]
    const balanceIns = [balance, baseBalance]
    const tokeDecimals = await getDecimals(mint.toBase58())
    const decimalIns = [tokeDecimals, BASE_TOKEN_DECIMAL]
    const lpt = calcDepositInfo(
      amountIns,
      balanceIns,
      lptSupply,
      decimalIns,
      fee,
    )
    setEstimatedLP(lpt.lpOut)
  }

  const onChangeBaseAmount = async (value: string) => {
    setBaseAmount(value)
    const amountBN = await decimalizeMintAmount(amount, mint)
    const baseAmountBN = await decimalizeMintAmount(value, baseMint)
    // const amountBN = await decimalizeMintAmount(amount, lptMint)
    const amountIns = [amountBN, baseAmountBN]
    const balanceIns = [balance, stableBalance]
    const tokeDecimals = await getDecimals(mint.toBase58())
    const decimalIns = [tokeDecimals, BASE_TOKEN_DECIMAL]
    const lpt = calcDepositInfo(
      amountIns,
      balanceIns,
      lptSupply,
      decimalIns,
      fee,
    )
    setEstimatedLP(lpt.lpOut)
  }

  return (
    <Row gutter={[16, 16]} style={{ color: '#000000' }}>
      {/* Mint Token */}
      <Col span={24}>
        <Card
          bordered={false}
          style={{
            borderRadius: '4px 4px 0 0',
            background: 'rgb(20 20 20 / 10%)',
            boxShadow: 'unset',
          }}
        >
          <Row justify="end" align="middle">
            <Col>
              <Space
                onClick={() => setAmount(mintBalance.balance.toString())}
                size={6}
                style={{ cursor: 'pointer' }}
              >
                <Typography.Text
                  type="secondary"
                  style={{ textDecoration: 'underline' }}
                >
                  Available:
                </Typography.Text>
                <Typography.Text
                  style={{ color: '#000000', textDecoration: 'underline' }}
                >
                  {numeric(mintBalance.balance).format('0,0')}
                </Typography.Text>
              </Space>
            </Col>
            <Col span={24} />
            <Col span={8}>
              <MintSelection
                style={{
                  background: '#F4FCEB',
                  color: '#000000',
                  borderRadius: 32,
                  height: 40,
                  width: 135,
                }}
                disabled
                value={mint.toBase58()}
              />
            </Col>
            <Col span={16}>
              <NumericInput
                bordered={false}
                style={{
                  color: '#000000',
                  fontSize: 32,
                  fontWeight: 700,
                  textAlign: 'right',
                }}
                value={amount}
                onValue={onChangeTokenAmount}
              />
            </Col>
          </Row>
        </Card>
      </Col>
      {/* Base Token */}
      <Col span={24}>
        <Card
          bordered={false}
          style={{
            borderRadius: '0 0 4px 4px',
            background: 'rgb(20 20 20 / 10%)',
            boxShadow: 'unset',
          }}
        >
          <Row justify="end" align="middle">
            <Col>
              <Space
                onClick={() =>
                  setBaseAmount(baseBalanceOfAddress.balance.toString())
                }
                size={6}
                style={{ cursor: 'pointer' }}
              >
                <Typography.Text
                  type="secondary"
                  style={{ textDecoration: 'underline' }}
                >
                  Available:
                </Typography.Text>
                <Typography.Text
                  style={{ color: '#000000', textDecoration: 'underline' }}
                >
                  {numeric(baseBalanceOfAddress.balance).format('0,0')}
                </Typography.Text>
              </Space>
            </Col>
            <Col span={24} />
            <Col span={8}>
              <MintSelection
                style={{
                  background: '#F4FCEB',
                  color: '#000000',
                  borderRadius: 32,
                  height: 40,
                  width: 135,
                }}
                disabled
                value={baseMint.toBase58()}
              />
            </Col>
            <Col span={16}>
              <NumericInput
                bordered={false}
                style={{
                  color: '#000000',
                  fontSize: 32,
                  fontWeight: 700,
                  textAlign: 'right',
                }}
                value={baseAmount}
                onValue={onChangeBaseAmount}
              />
            </Col>
          </Row>
        </Card>
      </Col>
      {/* Review */}
      <Col span={24}>
        <Typography.Title style={{ color: '#000000' }} level={4}>
          Review
        </Typography.Title>
      </Col>
      <Col span={24}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Row>
            <Col flex="auto">
              <Typography.Text style={{ color: '#000000' }}>
                My supply
              </Typography.Text>
            </Col>
            <Col>
              <Typography.Title level={4} style={{ color: '#000000' }}>
                {numeric(lptBalance.balance).format('0,0.[000]')}
              </Typography.Title>
            </Col>
          </Row>
          <Row>
            <Col flex="auto">
              <Typography.Text style={{ color: '#000000' }}>
                You will receive
              </Typography.Text>
            </Col>
            <Col>
              <Typography.Title level={4} style={{ color: '#000000' }}>
                {numeric(estimatedLP).format('0,0.[000]')}
              </Typography.Title>
            </Col>
          </Row>
        </Space>
      </Col>
      <Col span={24}>
        <Button loading={loading} block onClick={onDeposit} type="primary">
          Deposit
        </Button>
      </Col>
    </Row>
  )
}

export default Deposit
