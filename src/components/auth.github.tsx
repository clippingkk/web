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
      title='github login'
      className='px-16 py-3 rounded-sm hover:shadow-lg bg-white flex justify-center items-center hover:scale-105 duration-150 mt-4'
    >
      <GithubLogo />
      <span className=' inline-block ml-4 text-slate-950'>Github</span>
    </a>
  )
}

export default AuthByGithub
