import React from 'react'
import AuthByGithub from '@/components/auth.github'
import MetamaskButtonView from '@/components/auth/metamask'
import AppleLoginButtonView from '@/components/auth/apple'
import { AuthEvents, AuthMachine } from './auth.state'
import toast from 'react-hot-toast'

type ThirdPartEntryProps = {
  machine: AuthMachine
  onEvent: (event: AuthEvents) => void
}

function ThirdPartEntry(props: ThirdPartEntryProps) {
  const { machine, onEvent } = props
  return (
    <div className='flex flex-col w-full'>
      <MetamaskButtonView
        loading={machine.matches('metaMaskLogging')}
        disabled={false}
        onClick={() => onEvent({ type: 'METAMASK_LOGIN_AUTH' })}
      />
      <div
        onClickCapture={() => {
          onEvent({ type: 'APPLE_LOGIN' })
        }}>
        <AppleLoginButtonView
          version='v4'
          loading={machine.matches('appleAuthing')}
          disabled={false}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onError={(error: any) => {
            onEvent({ type: 'REVERT_TO_IDLE' })
            toast.error('Auth by Apple: ' + error.error)
          }}
          onSuccess={(resp) => {
            onEvent({
              type: 'APPLE_DATA_SUCCESS',
              data: resp.authorization
            })
          }}
        />
      </div>
      <AuthByGithub />
    </div>
  )
}

export default ThirdPartEntry
