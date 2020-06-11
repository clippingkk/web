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
import './styles/index.styl'

import './styles/icons'
import { client } from './services/ajax'

ReactDOM.render(
  <Provider store={store}>
    <ApolloProvider client={client}>
      <Root />
    </ApolloProvider>
  </Provider>,
  document.querySelector('#app')
)
