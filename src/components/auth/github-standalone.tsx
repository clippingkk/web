'use client'
import { GithubClientID } from '@/constants/config'
import { useActionTrack } from '@/hooks/tracke'

import GithubLogo from '../icons/github.logo.svg'

interface GithubStandaloneLoginButtonProps {
  className?: string
}

export default function GithubStandaloneLoginButton({
  className,
}: GithubStandaloneLoginButtonProps) {
  const onGithubClick = useActionTrack('login:github')

  return (
    <a
      href={`https://github.com/login/oauth/authorize?client_id=${GithubClientID}&scope=user:email`}
      onClick={onGithubClick}
      className={`group relative flex h-16 w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-6 no-underline shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800 ${className || ''}`}
    >
      <div className="flex items-center justify-center gap-3">
        <GithubLogo className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
        <span className="text-base font-medium text-gray-900 dark:text-zinc-50">
          Continue with GitHub
        </span>
      </div>
    </a>
  )
}
