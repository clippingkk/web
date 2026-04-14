import { ExternalLink, Webhook } from 'lucide-react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { checkIsPremium } from '@/compute/user'
import { COOKIE_TOKEN_KEY, USER_ID_KEY } from '@/constants/storage'
import { getTranslation } from '@/i18n'
import {
  FetchMyWebHooksDocument,
  type FetchMyWebHooksQuery,
  type FetchMyWebHooksQueryVariables,
  ProfileDocument,
  type ProfileQuery,
  type ProfileQueryVariables,
} from '@/schema/generated'
import { doApolloServerQuery } from '@/services/apollo.server'

import WebHooksContent from './content'
import WebhookCreateButton from './create-button'

type Props = {
  params: Promise<{ userid: string }>
}
async function WebhooksPage(props: Props) {
  const [params, ck, { t }] = await Promise.all([
    props.params,
    cookies(),
    getTranslation(),
  ])
  const { userid } = params
  const myUid = ck.get(USER_ID_KEY)?.value
  const tk = ck.get(COOKIE_TOKEN_KEY)?.value

  if (!myUid || !tk) {
    return redirect(`/dash/${userid}/profile`)
  }

  const myUidInt = parseInt(myUid, 10)

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
        Authorization: `Bearer ${tk}`,
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
        Authorization: `Bearer ${tk}`,
      },
    },
  })

  const isPremium = checkIsPremium(profileResponse!.me.premiumEndAt)

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-400/10 text-blue-500 ring-1 ring-blue-400/20 dark:bg-blue-400/15 dark:text-blue-300">
            <Webhook size={20} />
          </span>
          <div>
            <h1 className="bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500 bg-clip-text text-2xl font-semibold tracking-tight text-transparent">
              {t('app.settings.webhook.title')}
            </h1>
            <a
              href="https://annatarhe.notion.site/Webhook-24f26f59c0764365b3deb8e4c8e770ae"
              target="_blank"
              referrerPolicy="no-referrer"
              rel="noreferrer"
              className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-blue-500 transition-colors hover:text-blue-600 dark:text-blue-300 dark:hover:text-blue-200"
            >
              <span>{t('app.settings.webhook.docLink')}</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
        <WebhookCreateButton isPremium={isPremium} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/40 bg-white/60 shadow-sm backdrop-blur-xl dark:border-slate-800/40 dark:bg-slate-900/60">
        <div className="space-y-6 p-4 md:p-6">
          <WebHooksContent
            isPremium={isPremium}
            webhooks={webhooksResp!.me.webhooks}
            userId={userid}
          />
        </div>
      </div>
    </>
  )
}

export default WebhooksPage
