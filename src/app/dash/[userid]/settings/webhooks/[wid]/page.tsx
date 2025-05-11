import {
  FetchWebhookDocument,
  FetchWebhookQuery,
  FetchWebhookQueryVariables,
} from '@/schema/generated'
import { doApolloServerQuery } from '@/services/apollo.server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import WebhookDetailContent from './components/content'

type Props = {
  params: Promise<{ wid: string; userid: string }>
}

async function WebhookDetailPage(props: Props) {
  const [params, ck] = await Promise.all([props.params, cookies()])
  const { wid, userid } = params

  const tk = ck.get('token')?.value
  const myUid = ck.get('uid')?.value

  if (!myUid || !tk) {
    return redirect(`/dash/${userid}/profile`)
  }

  const { data } = await doApolloServerQuery<
    FetchWebhookQuery,
    FetchWebhookQueryVariables
  >({
    query: FetchWebhookDocument,
    variables: {
      id: parseInt(wid),
    },
    context: {
      headers: {
        Authorization: 'Bearer ' + tk,
      },
    },
  })

  if (!data || !data.webHook) {
    return (
      <div className="flex h-96 items-center justify-center rounded-xl border border-white/20 bg-white/50 shadow-lg backdrop-blur-lg dark:border-slate-700/20 dark:bg-slate-800/50">
        <p className="text-center text-lg text-gray-500 dark:text-gray-400">
          Webhook not found or you don&apos;t have permission to view it.
        </p>
      </div>
    )
  }

  // Transform the data to match our component props
  const webhookData = data.webHook

  return (
    <div className="container mx-auto px-4">
      <WebhookDetailContent data={webhookData} userId={userid} />
    </div>
  )
}

export default WebhookDetailPage
