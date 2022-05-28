import { Route } from 'react-router-dom'
import { useEffect } from 'react'

import { Row, Col, Button } from 'antd'
import Pools from './pools'
import { useAppRouter } from 'app/hooks/useAppRouter'
import { useUI } from '@senhub/providers'
import JupiterMarket from 'app/components/jupiterMarket'

import Background from 'app/static/images/bg_lucid.svg'

const View = () => {
  const { appRoute } = useAppRouter()
  const { setBackground } = useUI()

  useEffect(() => {
    setBackground({ light: Background, dark: Background })
  }, [setBackground])

  const onCreateNewToken = async () => {}

  return (
    <Row gutter={[24, 24]} align="middle" justify="center">
      <Col style={{ maxWidth: 1200 }} span={24}>
        <Button onClick={() => onCreateNewToken()}>
          Create new Token for test
        </Button>
        <JupiterMarket />
        <Route exact path={`${appRoute}`} component={Pools} />
      </Col>
    </Row>
  )
}

export default View
