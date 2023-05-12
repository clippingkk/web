'use client'
import React, { useEffect } from 'react'
import { useAuthSuccessed } from '../../../hooks/hooks';
import { useGithubLoginLazyQuery } from '../../../schema/generated';
import { Metadata } from 'next'
import { generateMetadata as authGenerateMetadata } from '../../../components/og/og-with-auth'

export function generateMetadata(urlPath: string): Metadata {
  return authGenerateMetadata('auth/github')
}

function GithubOAuthContent() {
  const [exec, resp] = useGithubLoginLazyQuery()

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

export default GithubOAuthContent
