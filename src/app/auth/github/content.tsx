'use client'
import { useLazyQuery } from '@apollo/client/react'
import { useEffect } from 'react'

import LoadingIcon from '@/components/icons/loading.svg'
import { GithubLoginDocument } from '@/gql/graphql'
import { useAuthSuccessed } from '@/hooks/hooks'

type GithubOAuthContentProps = {
  code: string
}

function GithubOAuthContent(props: GithubOAuthContentProps) {
  const { code } = props
  const [exec, resp] = useLazyQuery(GithubLoginDocument)

  useAuthSuccessed(resp.called, resp.loading, resp.error, resp.data?.githubAuth)
  useEffect(() => {
    if (!code) {
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
