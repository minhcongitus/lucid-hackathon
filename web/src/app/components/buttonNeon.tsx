import { ReactNode } from 'react'

import { Space, Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

type ButtonNeonProps = {
  children?: ReactNode
  loading?: boolean
  disabled?: boolean
  preffix?: ReactNode
  suffix?: ReactNode
  onClick?: () => void
}
const ButtonNeon = ({
  preffix,
  suffix,
  children,
  disabled = false,
  loading = false,
  onClick = () => {},
}: ButtonNeonProps) => {
  return (
    <button className="btn-neon" onClick={onClick}>
      <span className="btn-neon-child">
        <Space size={6}>
          {loading && <Spin spinning indicator={<LoadingOutlined />} />}
          {preffix}
          {children}
          {suffix}
        </Space>
      </span>
    </button>
  )
}

export default ButtonNeon
