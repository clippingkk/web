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
import './utils/leancloud'

ReactDOM.render(
  <Provider store={store}>
    <SWRConfig
      value={{
        fetcher: request
      }}
    >
      <ApolloProvider client={client}>
        <Root />
        <ToastContainer
          theme={'light'}
        />
      </ApolloProvider>
    </SWRConfig>
  </Provider>,
  document.querySelector('#app')
)

// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/service-worker.js')
//       .then(registration => {
//         console.log('SW registered: ', registration)
//       }).catch(registrationError => {
//         console.log('SW registration failed: ', registrationError)
//       });
//   });
// }
