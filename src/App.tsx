import React from 'react'
import ReactDOM from 'react-dom'
import './utils/mixpanel'
import './utils/sentry'
import { Provider } from 'react-redux'
import { ApolloProvider } from '@apollo/client'
import Root from './Root'
import store from './store/index'
import './styles/tailwind.css'
import 'rc-tooltip/assets/bootstrap_white.css'
import 'animate.css'
import './styles/index.styl'

import './styles/icons'
import { client, request } from './services/ajax'
import { SWRConfig } from 'swr'
import './prefers-dark'

ReactDOM.render(
  <Provider store={store}>
    <SWRConfig
      value={{
        refreshInterval: 10000,
        fetcher: request
      }}
    >
      <ApolloProvider client={client}>
        <Root />
      </ApolloProvider>
    </SWRConfig>
  </Provider>,
  document.querySelector('#app')
)
