import React from 'react'
import ReactDOM from 'react-dom'
import fastclick from 'fastclick'
import Root from './Root'
import './styles/index.styl'
import 'normalize.css'

ReactDOM.render(
    <Root />,
    document.querySelector('#app')
);

(fastclick as any).attach(document.body)
