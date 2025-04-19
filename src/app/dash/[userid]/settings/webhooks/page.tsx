import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getApolloServerClient } from '@/services/apollo.server'
import { ProfileQuery, ProfileQueryVariables, ProfileDocument, FetchMyWebHooksDocument, FetchMyWebHooksQueryVariables, FetchMyWebHooksQuery } from '@/schema/generated'
import WebHooksContent from './content'
import { checkIsPremium } from '@/compute/user'
import WebhookCreateButton from './create-button'
import { ExternalLink, Webhook } from 'lucide-react'
import { useTranslation } from '@/i18n'

type Props = {
  params: Promise<{ userid: string }>
}
async function WebhooksPage(props: Props) {
  const [params, ck, { t }] = await Promise.all([props.params, cookies(), useTranslation()])
  const { userid } = params
  const myUid = ck.get('uid')?.value

  if (!myUid) {
    return redirect(`/dash/${userid}/profile`)
  }

  const myUidInt = myUid ? parseInt(myUid) : undefined

  const apolloClient = getApolloServerClient()
  const { data: profileResponse } = await apolloClient.query<ProfileQuery, ProfileQueryVariables>({
    query: ProfileDocument,
    fetchPolicy: 'network-only',
    variables: {
      id: myUidInt
    },
    context: {
      headers: {
        'Authorization': 'Bearer ' + ck.get('token')?.value
      },
    }
  })

  const { data: webhooksResp } = await apolloClient.query<FetchMyWebHooksQuery, FetchMyWebHooksQueryVariables>({
    query: FetchMyWebHooksDocument,
    variables: {
      id: myUidInt
    },
    context: {
      headers: {
        'Authorization': 'Bearer ' + ck.get('token')?.value
      },
    }
  })

  const isPremium = checkIsPremium(profileResponse.me.premiumEndAt)

  return (
    <>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Webhook size={24} className="text-indigo-600 dark:text-indigo-400" />
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {t('app.settings.webhook.title')}
            </h1>
            <a
              href="https://annatarhe.notion.site/Webhook-24f26f59c0764365b3deb8e4c8e770ae"
              target="_blank"
              referrerPolicy="no-referrer"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 text-indigo-700 dark:text-indigo-300 font-medium hover:text-indigo-900 dark:hover:text-indigo-200 transition-colors text-sm"
            >
              <span>{t('app.settings.webhook.docLink')}</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
        <WebhookCreateButton isPremium={isPremium} />
      </div>
      
      {/* Main Content */}
      <div className="rounded-xl overflow-hidden bg-white/30 dark:bg-slate-800/30 backdrop-blur-lg shadow-lg border border-white/20 dark:border-slate-700/20">
        <div className="space-y-6">
          <WebHooksContent
            isPremium={isPremium}
            webhooks={webhooksResp.me.webhooks}
          />
        </div>
      </div>
    </>
  )
}

export default WebhooksPage