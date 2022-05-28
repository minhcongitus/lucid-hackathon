import { useSelector } from 'react-redux'
import { Fragment, useState } from 'react'
import IonIcon from '@sentre/antd-ionicon'

import { Button, Card, Col, Collapse, Row, Space, Typography } from 'antd'
import { MintAvatar, MintName, MintSymbol } from 'shared/antd/mint'
import CardContent from './cardContent'
import BuyAndSell from '../buyAndSell'

import { AppState } from 'app/model'
import { usePoolFees } from 'app/hooks/pool/usePoolFees'
import { numeric } from 'shared/util'

import './style.less'
import DepositAndWithdraw from '../depositAndWithdraw'
import { usePoolTvl } from 'app/hooks/pool/usePoolTvl'
import useAPR from 'app/hooks/pool/useAPR'
import { useMyLiquidity } from 'app/hooks/pool/useMyLiquidity'
import BorrowAnhRepay from '../borrowAndRepay'

type PoolCardProps = { rank: number; poolAddress: string }

const PoolCard = ({ rank, poolAddress }: PoolCardProps) => {
  const [activeKey, setActiveKey] = useState<string>()
  const poolData = useSelector((state: AppState) => state.pools[poolAddress])
  const fee = usePoolFees(poolAddress)
  const tvl = usePoolTvl(poolAddress)
  const apr = useAPR(poolAddress)
  const myLiquidity = useMyLiquidity(poolAddress)

  const onActive = () => {
    if (activeKey) return setActiveKey(undefined)
    return setActiveKey(poolAddress)
  }

  return (
    <Fragment>
      <Card
        bordered={false}
        className={`pool-card top-${rank + 1}`}
        onClick={onActive}
      >
        <Row gutter={[24, 24]} align="middle">
          <Col>
            <Typography.Title level={5}>{rank + 1}</Typography.Title>
          </Col>
          <Col>
            <MintAvatar mintAddress={poolData.mint.toBase58()} size={48} />
          </Col>
          <Col span={4}>
            <Space direction="vertical">
              <Typography.Title level={5} ellipsis>
                <MintName mintAddress={poolData.mint.toBase58()} />
              </Typography.Title>
              <Typography.Title
                level={5}
                className="symbol"
                style={{ color: '#000' }}
              >
                <MintSymbol mintAddress={poolData.mint.toBase58()} />
              </Typography.Title>
            </Space>
          </Col>
          <Col span={3}>
            <CardContent
              primary
              label="APY"
              value={numeric(apr).format('0.00[00]%')}
            />
          </Col>
          <Col span={4}>
            <CardContent
              label="Total Fee"
              value={numeric(fee.totalFee).format('0,0.00[00]')}
              mintAddress={poolData.baseMint.toBase58()}
            />
          </Col>
          <Col span={4}>
            <CardContent
              label="Total Value Locked"
              value={numeric(tvl).format('0,0.00[00]a')}
              mintAddress={poolData.baseMint.toBase58()}
            />
          </Col>
          <Col span={4}>
            <CardContent
              label="Your Liquidity"
              value={numeric(Number(myLiquidity)).format('0,0.00[00]')}
              mintAddress={poolData.baseMint.toBase58()}
            />
          </Col>
          <Col>
            <Button
              type="text"
              style={{ padding: 0, background: 'transparent' }}
              onClick={() => {}}
            >
              <IonIcon
                name={activeKey ? 'chevron-up-outline' : 'chevron-down-outline'}
                style={{ fontSize: 32 }}
              />
            </Button>
          </Col>
        </Row>
      </Card>
      <Collapse activeKey={activeKey} className="lucid-expand-card">
        <Collapse.Panel header={null} key={poolAddress} showArrow={false}>
          <Row gutter={[24, 24]}>
            <Col>
              <BuyAndSell poolAddress={poolAddress} />
            </Col>
            <Col>
              <DepositAndWithdraw poolAddress={poolAddress} />
            </Col>
            <Col>
              <BorrowAnhRepay poolAddress={poolAddress} />
            </Col>
          </Row>
        </Collapse.Panel>
      </Collapse>
    </Fragment>
  )
}

export default PoolCard
