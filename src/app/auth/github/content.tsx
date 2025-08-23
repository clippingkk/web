'use client'
import { useEffect } from 'react'
import LoadingIcon from '@/components/icons/loading.svg'
import { useLazyQuery } from '@apollo/client/react'
import { GithubLoginDocument, type GithubLoginQuery } from '@/gql/graphql'
import { useAuthSuccessed } from '@/hooks/hooks'

type GithubOAuthContentProps = {
  code: string
}

function GithubOAuthContent(props: GithubOAuthContentProps) {
  const { code } = props
  const [exec, resp] = useLazyQuery<GithubLoginQuery>(GithubLoginDocument)

  useAuthSuccessed(resp.called, resp.loading, resp.error, resp.data?.githubAuth)
  useEffect(() => {
    if (!code) {
      console.log('no code')
      // TODO: redirect
      return
    }

    exec({
      variables: {
        code,
      },
    })
  }, [code, exec])

  return (
    <div className='p-10 bg-gray-300 bg-opacity-40 rounded-sm text-4xl backdrop-blur-lg'>
      {resp.loading && <LoadingIcon className='animate-spin' />}
      {resp.error && (
        <div className='max-w-sm h-96 overflow-y-auto'>
          {resp.error.message}
        </div>
      )}
    </div>
  )
}

export default GithubOAuthContent
