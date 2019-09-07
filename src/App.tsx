import React from 'react'
import ReactDOM from 'react-dom'
import './utils/sentry'
import './utils/firebase'
import { Provider } from 'react-redux'
import fastclick from 'fastclick'
import Root from './Root'
import store from './store/index'
// import 'normalize.css'
import './styles/tailwind.css'
// import '@fortawesome/fontawesome-free/css/all.css'
import './styles/index.styl'
import './styles/icons'

ReactDOM.render(
  <Provider store={store}>
    <Root />
  </Provider>,
  document.querySelector('#app')
)

// ;(fastclick as any).attach(document.body)
