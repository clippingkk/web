'use client'
import GithubLogo from '@/components/icons/github.logo.svg'
import { GithubClientID } from '@/constants/config'
import { useActionTrack } from '@/hooks/tracke'

function TrackedGithubLink() {
  const onGithubClick = useActionTrack('login:github')
  return (
    <a
      href={`https://github.com/login/oauth/authorize?client_id=${GithubClientID}&scope=user:email`}
      onClick={onGithubClick}
      title="github login"
    >
      <GithubLogo />
    </a>
  )
}

export default TrackedGithubLink
