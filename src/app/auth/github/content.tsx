'use client'
import { useEffect } from 'react'

import LoadingIcon from '@/components/icons/loading.svg'
import { useAuthSuccessed } from '@/hooks/hooks'
import { useGithubLoginLazyQuery } from '@/schema/generated'

type GithubOAuthContentProps = {
  code: string
}

function GithubOAuthContent(props: GithubOAuthContentProps) {
  const { code } = props
  const [exec, resp] = useGithubLoginLazyQuery()

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
    <div className="bg-opacity-40 rounded-sm bg-gray-300 p-10 text-4xl backdrop-blur-lg">
      {resp.loading && <LoadingIcon className="animate-spin" />}
      {resp.error && (
        <div className="h-96 max-w-sm overflow-y-auto">
          {resp.error.message}
        </div>
      )}
    </div>
  )
}

export default GithubOAuthContent
