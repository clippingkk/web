import { useLazyQuery } from '@apollo/client';
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux';
import { toGithubLogin } from '../../store/user/type';
import githubLoginQuery from '../../schema/login.graphql'
import { githubLogin, githubLoginVariables } from '../../schema/__generated__/githubLogin';
import { useAuthSuccessed } from './hooks';

function GithubOAuth() {
  const [exec, resp] = useLazyQuery<githubLogin, githubLoginVariables>(githubLoginQuery)

  useAuthSuccessed(resp.called, resp.loading, resp.error, resp.data?.githubAuth)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code')
    if (!code) {
      console.log('no code')
      // TODO: redirect
      return
    }

    exec({
      variables: {
        code
      }
    })

  }, [])

  return (
    <main>
      authing
    </main>
  )
}

export default GithubOAuth
