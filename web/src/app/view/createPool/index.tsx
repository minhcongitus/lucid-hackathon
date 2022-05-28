import { Fragment, useState } from 'react'
import IonIcon from '@sentre/antd-ionicon'

import { Button, Modal } from 'antd'
import { ModalContent } from './modalContent'

const CreatePool = () => {
  const [visible, setVisible] = useState(false)

  return (
    <Fragment>
      <Button type="primary" onClick={() => setVisible(true)}>
        New
      </Button>
      <Modal
        visible={visible}
        onCancel={() => setVisible(false)}
        footer={false}
        closeIcon={<IonIcon name="close-outline" />}
        className="lucid-modal-gradient"
      >
        <ModalContent />
      </Modal>
    </Fragment>
  )
}

export default CreatePool
