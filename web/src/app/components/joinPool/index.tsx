import { Card, Col, Divider, Row, Space, Typography } from 'antd'
import CreatePool from 'app/view/createPool'

import './index.less'
import JoinAction from './joinAction'

type RowContentProps = {
  title?: string
  label?: string
  description?: string
}

const RowContent = ({
  title = '',
  label = '',
  description = '',
}: RowContentProps) => {
  return (
    <Space direction="vertical" style={{ textAlign: 'center' }}>
      <Typography.Title level={1} style={{ color: '#283813' }}>
        {title}
      </Typography.Title>
      <Space direction="vertical" size={0}>
        <Typography.Title
          level={5}
          style={{ fontWeight: 300, color: '#283813' }}
        >
          {label}
        </Typography.Title>
        <Typography.Title level={5} style={{ color: '#283813' }}>
          {description}
        </Typography.Title>
      </Space>
    </Space>
  )
}

const JoinPool = () => {
  return (
    <Card
      className="bg-gradient lucid-card-gradient"
      bordered={false}
      bodyStyle={{ padding: 32 }}
    >
      <Row gutter={[48, 48]} justify="space-between">
        <Col span={12}>
          <Space size={0} style={{ width: '100%' }} direction="vertical">
            <Row gutter={[12, 12]}>
              <Col flex="auto">
                <Typography.Title
                  level={2}
                  style={{ fontWeight: 300, color: '#000' }}
                >
                  HAKAPOOL
                </Typography.Title>
              </Col>
              <Col>
                <CreatePool />
              </Col>
            </Row>
            <Typography.Title style={{ color: '#000' }} level={1}>
              ALL IN ONE 1 STEP
            </Typography.Title>
            <Typography.Title level={1} style={{ fontSize: 60, color: '#000' }}>
              EASY REWARD
            </Typography.Title>
          </Space>
        </Col>
        <Col span={12}>
          <Row gutter={[32, 32]} style={{ height: '100%' }} align="middle">
            <Col>
              <Space>
                <RowContent
                  title="JOIN"
                  label="DEPOSIT"
                  description="ANY TOKEN"
                />
                <Divider style={{ minWidth: 80 }} />
                <RowContent
                  title="CLAIM"
                  label="RECEIVE"
                  description="REWARD HIGH"
                />
              </Space>
            </Col>
            <Col flex="auto">
              <JoinAction />
            </Col>
          </Row>
        </Col>
      </Row>
    </Card>
  )
}

export default JoinPool
