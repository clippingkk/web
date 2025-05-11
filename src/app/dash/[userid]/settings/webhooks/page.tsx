import { checkIsPremium } from '@/compute/user'
import { useTranslation } from '@/i18n'
import {
  FetchMyWebHooksDocument,
  FetchMyWebHooksQuery,
  FetchMyWebHooksQueryVariables,
  ProfileDocument,
  ProfileQuery,
  ProfileQueryVariables,
} from '@/schema/generated'
import { doApolloServerQuery } from '@/services/apollo.server'
import { ExternalLink, Webhook } from 'lucide-react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import WebHooksContent from './content'
import WebhookCreateButton from './create-button'

type Props = {
  params: Promise<{ userid: string }>
}
async function WebhooksPage(props: Props) {
  const [params, ck, { t }] = await Promise.all([
    props.params,
    cookies(),
    useTranslation(),
  ])
  const { userid } = params
  const myUid = ck.get('uid')?.value
  const tk = ck.get('token')?.value

  if (!myUid || !tk) {
    return redirect(`/dash/${userid}/profile`)
  }

  const myUidInt = myUid ? parseInt(myUid) : undefined

  const { data: profileResponse } = await doApolloServerQuery<
    ProfileQuery,
    ProfileQueryVariables
  >({
    query: ProfileDocument,
    fetchPolicy: 'network-only',
    variables: {
      id: myUidInt,
    },
    context: {
      headers: {
        Authorization: 'Bearer ' + tk,
      },
    },
  })

  const { data: webhooksResp } = await doApolloServerQuery<
    FetchMyWebHooksQuery,
    FetchMyWebHooksQueryVariables
  >({
    query: FetchMyWebHooksDocument,
    variables: {
      id: myUidInt,
    },
    context: {
      headers: {
        Authorization: 'Bearer ' + tk,
      },
    },
  })

  const isPremium = checkIsPremium(profileResponse.me.premiumEndAt)

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Webhook size={24} className="text-indigo-600 dark:text-indigo-400" />
          <div>
            <h1 className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent">
              {t('app.settings.webhook.title')}
            </h1>
            <a
              href="https://annatarhe.notion.site/Webhook-24f26f59c0764365b3deb8e4c8e770ae"
              target="_blank"
              referrerPolicy="no-referrer"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 text-sm font-medium text-indigo-700 transition-colors hover:text-indigo-900 dark:text-indigo-300 dark:hover:text-indigo-200"
            >
              <span>{t('app.settings.webhook.docLink')}</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
        <WebhookCreateButton isPremium={isPremium} />
      </div>

      {/* Main Content */}
      <div className="overflow-hidden rounded-xl border border-white/20 bg-white/30 shadow-lg backdrop-blur-lg dark:border-slate-700/20 dark:bg-slate-800/30">
        <div className="space-y-6">
          <WebHooksContent
            isPremium={isPremium}
            webhooks={webhooksResp.me.webhooks}
            userId={userid}
          />
        </div>
      </div>
    </>
  )
}

export default WebhooksPage
