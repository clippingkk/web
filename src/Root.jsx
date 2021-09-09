import React from 'react'
import PageLoading from './components/loading/loading'
import RouterContainer from './components/router-container/router'
import NotFound from './pages/not-found/not-found'
import AdminPanel from './pages/dash/[userid]/admin'
import IndexPage from './pages/index/index'
import GithubOAuthPage from './pages/auth/github'
import AuthPage from './pages/auth/auth'
import SigninPage from './pages/auth/signin'
import ClippingPage from './pages/clipping/clipping'
import ReportYearlyPage from './pages/report/yearly'
import AuthPhone from './pages/auth/phone'
import AppContainer from './AppContainer'

const PrivacyPolicy = React.lazy(() => import(/* webpackPrefetch: true */ './pages/policy/privacy'))
const DashContainer = React.lazy(() => import(/* webpackPrefetch: true */ './components/dashboard-container/container'))
const ReleasePage = React.lazy(() => import(/* webpackPrefetch: true */ './pages/release/release'))
const HomePage = React.lazy(() => import(/* webpackPrefetch: true */ './pages/home/home'))
const UploaderPage = React.lazy(() => import(/* webpackPrefetch: true */'./pages/uploader/uploader'))
const SquarePage = React.lazy(() => import(/* webpackPrefetch: true */ './pages/square/square'))
const BookPage = React.lazy(() => import(/* webpackPrefetch: true */ './pages/book/book'))

const ProfilePage = React.lazy(() => import(/* webpackPrefetch: true */ './pages/profile/profile'))
const UncheckedPage = React.lazy(() => import(/* webpackPrefetch: true */ './pages/unchecked/unchecked'))
const SettingsPage = React.lazy(() => import(/* webpackPrefetch: true */ './pages/settings/settings'))

class Root extends React.Component {
  render() {
    return (
      <AppContainer>
        <React.Suspense fallback={<PageLoading />}>
          <RouterContainer>
            <IndexPage path="/" />
            <PrivacyPolicy path="/policy/privacy" />
            <ReleasePage path="/release/:platform" />
            <ReportYearlyPage path='/report/yearly' />
            <AuthPage path="/auth">
              <AuthPhone path='phone' />
              <SigninPage path='signin' />
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
      </AppContainer>
    )
  }
}

export default Root
