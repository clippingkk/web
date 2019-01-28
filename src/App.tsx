import React from 'react'
import ReactDOM from 'react-dom'
import fastclick from 'fastclick'
import Root from './Root'
import './styles/index.styl'

ReactDOM.render(
    <Root />,
    document.querySelector('#app')
)

fastclick(document.body)
