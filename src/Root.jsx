import React from 'react'
import { hot } from 'react-hot-loader/root'

import PageLoading from './components/loading/loading'
import RouterContainer from './components/router-container/router';
import NotFound from './pages/not-found/not-found';
import AdminPanel from './pages/admin/admin';

const IndexPage = React.lazy(() => import(/* webpackPrefetch: true */ './pages/index/index'))
const PrivacyPolicy = React.lazy(() => import(/* webpackPrefetch: true */ './pages/policy/privacy'))
const DashContainer = React.lazy(() => import(/* webpackPrefetch: true */ './components/dashboard-container/container'))
const ReleasePage = React.lazy(() => import(/* webpackPrefetch: true */ './pages/release/release'))
const AuthPage = React.lazy(() => import(/* webpackPrefetch: true */ './pages/auth/auth'))
const SignupPage = React.lazy(() => import(/* webpackPrefetch: true */ './pages/auth/signup'))
const SigninPage = React.lazy(() => import(/* webpackPrefetch: true */ './pages/auth/signin'))
const HomePage = React.lazy(() => import(/* webpackPrefetch: true */ './pages/home/home'))
const UploaderPage = React.lazy(() => import(/* webpackPrefetch: true */'./pages/uploader/uploader'))
const ClippingPage = React.lazy(() => import(/* webpackPrefetch: true */'./pages/clipping/clipping'))
const SquarePage = React.lazy(() => import(/* webpackPrefetch: true */ './pages/square/square'))
const BookPage = React.lazy(() => import(/* webpackPrefetch: true */ './pages/book/book'))
const GithubOAuthPage = React.lazy(() => import(/* webpackPrefetch: true */ './pages/auth/github'))
const ProfilePage = React.lazy(() => import(/* webpackPrefetch: true */ './pages/profile/profile'))
const UncheckedPage = React.lazy(() => import(/* webpackPrefetch: true */ './pages/unchecked/unchecked'))
const SettingsPage = React.lazy(() => import(/* webpackPrefetch: true */ './pages/settings/settings'))

class Root extends React.Component {
  render() {
    return (
      <div>
        <React.Suspense fallback={<PageLoading />}>
          <RouterContainer>
            <IndexPage path="/" />
            <PrivacyPolicy path="/policy/privacy" />
            <ReleasePage path="/release/:platform" />
            <AuthPage path="/auth">
              <SigninPage path="signin" />
              <SignupPage path="signup" />
            </AuthPage>
            <GithubOAuthPage path="/oauth/github" />
            <DashContainer path="dash/:userid">
              <AdminPanel path="admin" />
              <HomePage path="home" />
              <UploaderPage path="upload" />
              <SquarePage path="square" />
              <ClippingPage path="/clippings/:clippingid" />
              <BookPage path="book/:bookid" />
              <ProfilePage path="profile" />
              <UncheckedPage path='/unchecked' />
              <SettingsPage path='settings' />
            </DashContainer>
            <NotFound default />
          </RouterContainer>
        </React.Suspense>
      </div>
    )
  }
}

export default hot(Root)
