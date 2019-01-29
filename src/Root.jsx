import React from 'react'
import { hot } from 'react-hot-loader'
import { BrowserRouter } from 'react-router-dom';
import { Route, Switch } from 'react-router'
import styles from './Root.css'

import IndexPage from './pages/index/index'
import PrivacyPolicy from './pages/policy/privacy'
import ReleasePage from './pages/release/release'

const Root = () => {
    return (
      <div className={styles.container}>
        <BrowserRouter>
          <Switch>
            <Route exact path="/" component={IndexPage}/>
            <Route exact path="/policy/privacy" component={PrivacyPolicy} />
            <Route exact path="/release/:platform" component={ReleasePage} />
          </Switch>
        </BrowserRouter>
      </div>
    )
}

export default hot(module)(Root)
