import { useLazyQuery } from '@apollo/client';
import React, { useEffect } from 'react'
import githubLoginQuery from '../../schema/login.graphql'
import { githubLogin, githubLoginVariables } from '../../schema/__generated__/githubLogin';
import { useAuthSuccessed } from '../../hooks/hooks';

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
    <main className='w-full h-full from-blue-400 to-purple-400 bg-gradient-to-br via-green-400 min-h-screen flex justify-center items-center'>
      <p className='p-10 bg-gray-300 bg-opacity-40 rounded text-4xl backdrop-blur-lg'>
        authing
      </p>
    </main>
  )
}

export default GithubOAuth
