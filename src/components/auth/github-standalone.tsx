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
      className={`relative w-full h-16 px-6 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] flex items-center justify-center no-underline group ${className || ''}`}
    >
      <div className='flex items-center justify-center gap-3'>
        <GithubLogo className='w-5 h-5 group-hover:scale-110 transition-transform duration-200' />
        <span className='text-base font-medium text-gray-900 dark:text-zinc-50'>
          Continue with GitHub
        </span>
      </div>
    </a>
  )
}
