import React from 'react'
import ReactDOM from 'react-dom'
import './utils/mixpanel'
import './utils/sentry'
import { Provider } from 'react-redux'
import { ApolloProvider } from '@apollo/client'
import Root from './Root'
import store from './store/index'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import 'emoji-mart/css/emoji-mart.css'
import './styles/tailwind.css'
import './styles/index.styl'

import './styles/icons'
import { client, request } from './services/ajax'
import { SWRConfig } from 'swr'
import './prefers-dark'
import './utils/locales'


ReactDOM.render(
  <Provider store={store}>
    <SWRConfig
      value={{
        fetcher: request
      }}
    >
      <ApolloProvider client={client}>
        <Root />
        <ToastContainer />
      </ApolloProvider>
    </SWRConfig>
  </Provider>,
  document.querySelector('#app')
)
