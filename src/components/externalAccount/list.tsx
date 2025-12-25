import { useMemo } from 'react'
import { useTranslation } from '@/i18n/client'
import { useFetchExternalAccountQuery } from '@/schema/generated'
import IconAppleLogo from '../icons/apple.logo.svg'
import GithubLogo from '../icons/github.logo.svg'
/* METAMASK DISABLED
import MetamaskLogo from '../icons/metamask.logo.svg'
*/
import AccountCard from './account-card'
import AppleLoginBind from './apple.bind'
import GithubBindButton from './github.bind'
/* METAMASK DISABLED
import dynamic from 'next/dynamic'

const MetamaskBindButton = dynamic(() => import('./metamask.bind'), { ssr: false })
*/

type ExternalAccountListProps = {
  uid: number
}

function ExternalAccountList(props: ExternalAccountListProps) {
  const { data } = useFetchExternalAccountQuery({
    variables: {
      id: props.uid,
    },
  })

  /* METAMASK DISABLED
  const address = useMemo(() => {
    return data?.me.externalInfo.address ?? []
  }, [data?.me.externalInfo.address])
  */

  const appleUnique = useMemo(() => {
    return data?.me.externalInfo.appleUnique ?? ''
  }, [data?.me.externalInfo.appleUnique])

  const { t } = useTranslation()

  return (
    <div className='w-full'>
      <h3 className='mb-4 text-xl font-bold text-gray-800 dark:text-gray-200'>
        {t('app.profile.externalAccountList')}
      </h3>

      <div className='flex flex-col gap-4'>
        {/* METAMASK DISABLED
        <AccountCard
          icon={<MetamaskLogo size={24} />}
          title='Metamask'
          isBound={address.length > 0}
          accountInfo={address}
          bindComponent={<MetamaskBindButton />}
        />
        */}

        <AccountCard
          icon={<IconAppleLogo size={24} />}
          title='Apple'
          isBound={!!appleUnique}
          accountInfo={t('app.common.bound')}
          bindComponent={<AppleLoginBind />}
        />

        <AccountCard
          icon={<GithubLogo size={24} />}
          title='GitHub'
          isBound={!!data?.me.externalInfo.githubBound}
          accountInfo={t('app.common.bound')}
          bindComponent={<GithubBindButton />}
        />
      </div>
    </div>
  )
}

export default ExternalAccountList
