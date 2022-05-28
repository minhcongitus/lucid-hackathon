import { Provider } from 'react-redux'
import {
  WalletProvider,
  UIProvider,
  MintProvider,
  AccountProvider,
} from '@senhub/providers'

import View from 'app/view'

import model from 'app/model'
import configs from 'app/configs'

import 'app/static/styles/light.less'
import 'app/static/styles/dark.less'
import PoolWatcher from './watcher/pool.watcher'

const {
  manifest: { appId },
} = configs

export const Page = () => {
  return (
    <UIProvider appId={appId} antd={{ prefixCls: appId }}>
      <WalletProvider>
        <MintProvider>
          <AccountProvider>
            <Provider store={model}>
              <PoolWatcher>
                <View />
              </PoolWatcher>
            </Provider>
          </AccountProvider>
        </MintProvider>
      </WalletProvider>
    </UIProvider>
  )
}
