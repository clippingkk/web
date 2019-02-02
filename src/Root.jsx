import React from 'react'
import { hot } from 'react-hot-loader/root'
import { Router } from '@reach/router'
import styles from './Root.css'

import IndexPage from './pages/index/index'
import PrivacyPolicy from './pages/policy/privacy'
import DashContainer from './components/dashboard-container/container'
import ReleasePage from './pages/release/release'
import AuthPage from './pages/auth/auth';
import HomePage from './pages/home/home';
import UploaderPage from './pages/uploader/uploader';
import ClippingPage from './pages/clipping/clipping';

@hot
class Root extends React.Component {
  render() {
    return (
      <div className={styles.container}>
        <Router>
          <IndexPage path="/" />
          <PrivacyPolicy path="/policy/privacy" />
          <ReleasePage path="/release/:platform" />
          <AuthPage path="/auth" />
          <DashContainer path="dash/:userid">
            <HomePage path="home" />
            <UploaderPage path="upload" />
            <ClippingPage path="/clippings/:clippingid" />
          </DashContainer>
        </Router>
      </div>
    )
  }
}

export default Root
