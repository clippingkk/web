import React, { useEffect } from 'react'
import { connect } from 'react-redux';
import { toGithubLogin } from '../../store/user/type';

interface IGithubLoginProps {
  githubLogin: (code: string) => void
}

function GithubOAuth({ githubLogin }: IGithubLoginProps) {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code')
    if (!code) {
      console.log('no code')
      // TODO: redirect
      return
    }

    githubLogin(code)
  }, [])

  return (
    <main>
      authing
    </main>
  )
}

export default connect(null, (dispatch) => ({
  githubLogin(code: string) {
    return dispatch(toGithubLogin(code))
  }
}))(GithubOAuth)
