'use client'
import { GithubClientID } from '../constants/config'
import { useActionTrack } from '../hooks/tracke'
import GithubLogo from './icons/github.logo.svg'

function AuthByGithub() {
  const onGithubClick = useActionTrack('login:github')
  return (
    <a
      href={`https://github.com/login/oauth/authorize?client_id=${GithubClientID}&scope=user:email`}
      onClick={onGithubClick}
      title="github login"
      className="mt-4 flex items-center justify-center rounded-sm bg-white px-16 py-3 duration-150 hover:scale-105 hover:shadow-lg"
    >
      <GithubLogo />
      <span className="ml-4 inline-block text-slate-950">Github</span>
    </a>
  )
}

export default AuthByGithub
