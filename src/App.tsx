import React from 'react'
import ReactDOM from 'react-dom'
import './utils/sentry'
import { Provider } from 'react-redux'
import Root from './Root'
import store from './store/index'
// import 'normalize.css'
import './styles/tailwind.css'
import 'rc-tooltip/assets/bootstrap_white.css'
// import '@fortawesome/fontawesome-free/css/all.css'
import './styles/index.styl'
import './styles/icons'
import './utils/mixpanel'

ReactDOM.render(
  <Provider store={store}>
    <Root />
  </Provider>,
  document.querySelector('#app')
)

// ;(fastclick as any).attach(document.body)
