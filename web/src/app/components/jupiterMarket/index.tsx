import { Fragment, useCallback, useEffect, useState } from 'react'
import IonIcon from '@sentre/antd-ionicon'

import { Button, Col, Modal, Row } from 'antd'
import { useLucid } from 'app/hooks/useLucid'
import { notifySuccess } from 'app/helper'
import { useAccount } from '@senhub/providers'
import BN from 'bn.js'
import { MintAvatar } from 'shared/antd/mint'

const JupiterMarket = () => {
  const [visible, setVisible] = useState(false)
  const [jupiters, setJupiters] = useState<any>([])
  const lucid = useLucid()
  const { accounts } = useAccount()

  const fetchJupiters = useCallback(async () => {
    const jupiters = await lucid.program.account.jupiter.all()
    setJupiters(jupiters)
  }, [lucid.program.account.jupiter])

  useEffect(() => {
    fetchJupiters()
  }, [fetchJupiters])

  const onCreateJupiter = async () => {
    try {
      const txid = await lucid.initializeJupiter()
      notifySuccess('Create', txid.txId)
    } catch (error) {}
  }

  const onClaimJupiter = async (jupiter: any) => {
    try {
      const account = Object.values(accounts)[0]
      const txid = await lucid.swapJupiter(
        jupiter.account.baseMint,
        account.mint,
        new BN(0),
        new BN('1000000000000000'),
      )
      if (txid) {
        notifySuccess('Claim 1000k', txid)
      }
    } catch (error) {}
  }

  return (
    <Fragment>
      <Button type="primary" onClick={() => setVisible(true)}>
        Open Jupiter Market
      </Button>
      <Modal
        visible={visible}
        onCancel={() => setVisible(false)}
        footer={false}
        closeIcon={<IonIcon name="close-outline" />}
        title="Create new jupiter"
      >
        <Button type="primary" onClick={() => onCreateJupiter()}>
          New
        </Button>{' '}
        <Row gutter={[16, 16]}>
          {jupiters.map((jupiter: any) => {
            return (
              <Col span={24}>
                <MintAvatar mintAddress={jupiter.account.baseMint.toBase58()} />
                {jupiter.account.baseMint.toBase58()}
                <Button type="primary" onClick={() => onClaimJupiter(jupiter)}>
                  Claim 1000k
                </Button>
              </Col>
            )
          })}
        </Row>
      </Modal>
    </Fragment>
  )
}

export default JupiterMarket
