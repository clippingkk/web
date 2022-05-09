import React, { useMemo } from 'react'
import { useQuery } from '@apollo/client'
import queryFetchExternalAccount from '../../schema/external-account.graphql'
import { fetchExternalAccount, fetchExternalAccountVariables } from '../../schema/__generated__/fetchExternalAccount'
import MetamaskLogo from '../icons/metamask.logo.svg'
import IconAppleLogo from '../icons/apple.logo.svg'
import GithubLogo from '../icons/github.logo.svg'
import MetamaskBindButton from './metamask.bind'
import AppleLoginBind from './apple.bind'
import GithubBindButton from './github.bind'
import { useTranslation } from 'react-i18next'

type ExternalAccountListProps = {
  uid: number
}

function ExternalAccountList(props: ExternalAccountListProps) {
  const { data } = useQuery<fetchExternalAccount, fetchExternalAccountVariables>(queryFetchExternalAccount, {
    variables: {
      id: props.uid
    }
  })

  const address = useMemo(() => {
    return data?.me.externalInfo.address ?? []
  }, [data?.me.externalInfo.address])

  const appleUnique = useMemo(() => {
    return data?.me.externalInfo.appleUnique ?? ''
  }, [data?.me.externalInfo.appleUnique])

  const { t } = useTranslation()

  return (
    <div className=''>
      <h3 className='mb-2'>
        {t('app.profile.externalAccountList')}
      </h3>
      <div className='flex items-center justify-start'>
        <MetamaskLogo size={32} />
        <div className='ml-10'>
          {address.length > 0 ? (
            <ul>
              {address.map(a => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          ) : (
            <MetamaskBindButton />
          )}
        </div>
      </div>

      <div className='flex items-center justify-start mt-4'>
        <IconAppleLogo size={32} />
        <div className='ml-10'>
          {appleUnique ? (
            <span>{t('app.common.bound')}</span>
          ) : (
            <AppleLoginBind />
          )}
        </div>
      </div>
      <div className='flex items-center justify-start mt-4'>
        <GithubLogo size={32} />
        <div className='ml-10'>
          {data?.me.externalInfo.githubBound ? (
            <span>{t('app.common.bound')}</span>
          ) : (
            <GithubBindButton />
          )}
        </div>
      </div>

    </div>
  )
}

export default ExternalAccountList
