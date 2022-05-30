import { useState } from 'react'

import { Button, Card, Col, Row, Space, Typography } from 'antd'
import IonIcon from '@sentre/antd-ionicon'

import { useLucid } from 'app/hooks/useLucid'
import { notifyError, notifySuccess } from 'app/helper'
import { useOracles } from 'app/hooks/useOracles'
import { useSelector } from 'react-redux'
import { AppState } from 'app/model'
import configs from 'app/configs'
import { useAccountBalanceByMintAddress } from 'shared/hooks/useAccountBalance'
import { useLucidOracles } from 'app/hooks/useLucidOracles'
import { usePoolData } from 'app/hooks/pool/usePoolData'
import Selection from 'app/components/selection'
import NumericInput from 'shared/antd/numericInput'
import { MintAvatar } from 'shared/antd/mint'
import { numeric } from 'shared/util'

type BuyProps = {
  poolAddress: string
}

const {
  sol: { baseMint },
} = configs

const Sell = ({ poolAddress }: BuyProps) => {
  const [amount, setAmount] = useState('0')
  const [receive, setReceive] = useState('0')
  const [loading, setLoading] = useState(false)
  const pools = useSelector((state: AppState) => state.pools)
  const { mint } = pools[poolAddress]
  const mintAddress = mint.toBase58()
  const lucid = useLucid()
  const { decimalizeMintAmount, undecimalizeMintAmount } = useOracles()
  const { calcOutGivenInSwap } = useLucidOracles()
  const poolData = usePoolData(poolAddress)

  const { balance } = useAccountBalanceByMintAddress(mintAddress)

  const onBuy = async () => {
    setLoading(true)
    try {
      const amountBN = await decimalizeMintAmount(amount, baseMint)
      const { txId } = await lucid.sell(poolAddress, amountBN)
      return notifySuccess('Sell', txId)
    } catch (error) {
      notifyError(error)
    } finally {
      setLoading(false)
    }
  }

  const onChangeAmount = async (amount: string) => {
    setAmount(amount)
    const { balance, stableBalance, fee, stableMint, mint } = poolData
    const balanceNum = await undecimalizeMintAmount(balance, mint)
    const stableNum = await undecimalizeMintAmount(stableBalance, stableMint)
    // temp to get decimal
    const numSwapFee = await undecimalizeMintAmount(fee, stableMint)
    const receiveAmount = calcOutGivenInSwap(
      Number(amount),
      Number(stableNum),
      Number(balanceNum),
      Number(numSwapFee),
    )
    setReceive(`${receiveAmount}`)
  }

  return (
    <Row gutter={[24, 24]} justify="center">
      <Col span={24}>
        <Row>
          <Col span={24}>
            <Card
              bordered={false}
              style={{
                borderRadius: '4px 4px 0 0',
                background: 'rgb(20 20 20 / 10%)',
                boxShadow: 'unset',
              }}
            >
              <Row align="middle" justify="end">
                <Col>
                  <Space
                    onClick={() => setAmount(balance.toString())}
                    style={{ cursor: 'pointer' }}
                  >
                    <Typography.Text
                      type="secondary"
                      style={{ textDecoration: 'underline' }}
                    >
                      Available:
                    </Typography.Text>
                    <Typography.Text
                      style={{ color: '#000', textDecoration: 'underline' }}
                    >
                      {balance}
                    </Typography.Text>
                  </Space>
                </Col>
                <Col span={24} />
                <Col span={4}>
                  <Selection
                    mintAvatar={<MintAvatar mintAddress={mintAddress} />}
                    selectedMint={mintAddress}
                  />
                </Col>
                <Col span={20}>
                  <NumericInput
                    bordered={false}
                    style={{
                      color: '#000',
                      fontSize: 32,
                      textAlign: 'right',
                    }}
                    value={amount}
                    onValue={onChangeAmount}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
          <Col span={24} style={{ position: 'relative', minHeight: 2 }}>
            <IonIcon
              style={{
                position: 'absolute',
                color: '#000000',
                borderRadius: 99,
                border: '2px solid #e2f8f4',
                left: '50%',
                background: '#c9e3d9',
                top: -8,
                zIndex: 99,
              }}
              name="arrow-down-outline"
            />
          </Col>
          <Col span={24}>
            <Card
              bordered={false}
              style={{
                borderRadius: '0 0 4px 4px',
                background: 'rgb(20 20 20 / 10%)',
                boxShadow: 'unset',
              }}
            >
              <Row gutter={[24, 24]} align="middle">
                <Col span={4}>
                  <Selection
                    mintAvatar={<MintAvatar mintAddress={baseMint} />}
                    selectedMint={baseMint}
                  />
                </Col>
                <Col span={20} style={{ textAlign: 'right' }}>
                  <Typography.Text
                    style={{
                      color: '#000',
                      fontSize: 32,
                      paddingRight: 10,
                      paddingLeft: 32,
                    }}
                    ellipsis
                  >
                    {numeric(receive).format('0,0.[0000]')}
                  </Typography.Text>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Col>
      <Col span={24}>
        <Button loading={loading} type="primary" block onClick={onBuy}>
          Sell
        </Button>
      </Col>
    </Row>
  )
}

export default Sell
