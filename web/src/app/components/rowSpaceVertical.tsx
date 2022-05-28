import { Space } from 'antd'
import { ReactNode } from 'react'

type RowSpaceVerticalProps = {
  label: ReactNode
  value: ReactNode
  size?: number
}
const RowSpaceVertical = ({
  label,
  value,
  size = 8,
}: RowSpaceVerticalProps) => {
  return (
    <Space size={size} direction="vertical" style={{ width: '100%' }}>
      {label}
      {value}
    </Space>
  )
}

export default RowSpaceVertical
