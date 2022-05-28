import { ReactNode, useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { Button, Card, Col, Image, Row, Space, Typography } from 'antd'
import PoolCard from './poolCard'
import JoinPool from 'app/components/joinPool'

import { AppState } from 'app/model'
import IonIcon from '@sentre/antd-ionicon'

import IcoRank from 'app/static/images/ico-rank.svg'
import { useBestPoolAddress } from 'app/hooks/pool/useBestPoolData'
import { numeric } from 'shared/util'
import { useMyLiquidity } from 'app/hooks/pool/useMyLiquidity'
import { useOracles } from 'app/hooks/useOracles'
import { useAccountBalanceByMintAddress } from 'shared/hooks/useAccountBalance'
import { usePoolData } from 'app/hooks/pool/usePoolData'
import { notifyError, notifySuccess } from 'app/helper'
import { useLucid } from 'app/hooks/useLucid'

type CardValueProps = { label?: string; value?: ReactNode; action?: ReactNode }
export const CardValue = ({ label = '', value, action }: CardValueProps) => {
  return (
    <Card
      bordered={false}
      className="lucid-card-gradient"
      style={{
        textAlign: 'center',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Space direction="vertical">
        <Typography.Title level={1} style={{ color: '#579B04' }}>
          {value}
        </Typography.Title>
        <Typography.Text style={{ color: '#000' }}>{label}</Typography.Text>
        {action}
      </Space>
    </Card>
  )
}

const ActionClaim = () => {
  const bestPoolAddress = useBestPoolAddress()
  const { lptMint } = usePoolData(bestPoolAddress)
  const { balance } = useAccountBalanceByMintAddress(lptMint.toBase58())
  const [loading, setLoading] = useState(false)
  const { decimalizeMintAmount } = useOracles()
  const lucid = useLucid()

  const claim = useCallback(async () => {
    try {
      setLoading(true)
      const amountBN = await decimalizeMintAmount(balance, lptMint)
      const { txId } = await lucid.removeLiquidity(bestPoolAddress, amountBN)
      return notifySuccess('Deposited', txId)
    } catch (error) {
      notifyError(error)
    } finally {
      setLoading(false)
    }
  }, [balance, bestPoolAddress, decimalizeMintAmount, lptMint, lucid])

  return (
    <Button type="text" onClick={claim} loading={loading}>
      <Typography.Text style={{ color: '#000', textDecoration: 'underline' }}>
        CLAIM ALL <IonIcon name="chevron-forward-outline" />
      </Typography.Text>
    </Button>
  )
}

const Pools = () => {
  const pools = useSelector((state: AppState) => state.pools)
  const betsPool = useBestPoolAddress()
  const [tvl, setTvl] = useState('0')
  const myLiquidity = useMyLiquidity(betsPool)
  const { undecimalize } = useOracles()

  const calcTVL = useCallback(() => {
    let tvl = 0
    for (const pool of Object.values(pools)) {
      tvl += Number(undecimalize(pool.stableBalance, 9)) * 2
    }
    setTvl(tvl.toString())
  }, [pools, undecimalize])
  useEffect(() => {
    calcTVL()
  }, [calcTVL])

  return (
    <Row gutter={[48, 48]}>
      <Col span={24}>
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={8}>
            <Space direction="vertical">
              <Typography.Title level={2} style={{ color: '#ABFC47' }}>
                THE AUTO
              </Typography.Title>
              <Typography.Text>
                A single deposit generates yield from Hakapool positions, the
                highest quality yield sources in the Sentre ecosystem.
              </Typography.Text>
            </Space>
          </Col>
          <Col xs={24} lg={8}>
            <Row gutter={[12, 12]}>
              <Col span={24}>
                <CardValue
                  label="TOTAL VALUE LOCK"
                  value={<span>{numeric(tvl).format('$0,0.00[00]a')}</span>}
                />
              </Col>
              <Col span={24}>
                <CardValue
                  label="TOTAL POOLS"
                  value={<span>{Object.keys(pools).length}</span>}
                />
              </Col>
            </Row>
          </Col>
          <Col xs={24} lg={8}>
            <CardValue
              label="YOUR POSITION"
              value={<span>${numeric(myLiquidity).format('0,0.00[00]')}</span>}
              action={<ActionClaim />}
            />
          </Col>
        </Row>
      </Col>

      {/* Join Pool */}
      <Col span={24}>
        <JoinPool />
      </Col>

      <Col span={18}>
        <Row gutter={[24, 24]} justify="center" align="middle">
          {Object.keys(pools).map((poolAddress, i) => (
            <Col span={24} key={poolAddress} className="wrap-card-pool">
              {i === 0 && (
                <Image
                  className="ico-number-one"
                  src={IcoRank}
                  alt="number one"
                />
              )}
              <PoolCard rank={i} poolAddress={poolAddress} />
            </Col>
          ))}
        </Row>
      </Col>
      <Col span={6}>
        <Space direction="vertical" size={12} style={{ textAlign: 'right' }}>
          <Space direction="vertical" size={4}>
            <Typography.Title level={5} style={{ color: '#ABFC47' }}>
              CREATE LIQUIDIY POOL
            </Typography.Title>
            <Typography.Title level={4} style={{ color: '#ABFC47' }}>
              NOT HARDER
            </Typography.Title>
          </Space>
          <Typography.Text>
            A single deposit generates yield from Hakapool positions, the
            highest quality yield sources in the Sentre ecosystem.
          </Typography.Text>
        </Space>
      </Col>
      <Col span={24} />
    </Row>
  )
}

export default Pools
