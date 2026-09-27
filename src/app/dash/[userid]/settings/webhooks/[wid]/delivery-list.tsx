import Badge from '@annatarhe/lake-ui/badge'
import { CircleCheck, CircleX } from 'lucide-react'

import type { FetchWebhookQuery } from '@/gql/graphql'
import { getTranslation } from '@/i18n'
import { formatDate } from '@/utils/format-date'

type Delivery = FetchWebhookQuery['webHook']['records']['records'][number]

function pretty(body?: string | null) {
  if (!body) return ''
  try {
    return JSON.stringify(JSON.parse(body), null, 2)
  } catch {
    return body
  }
}

async function DeliveryList({ deliveries }: { deliveries: Delivery[] }) {
  const { t, i18n } = await getTranslation(undefined, 'settings')
  return (
    <ul className="rounded-lake-panel border-lake-line bg-lake-surface border">
      {deliveries.map((delivery) => {
        const ok =
          delivery.responseStatus >= 200 && delivery.responseStatus < 300
        const ms =
          new Date(delivery.endTime).getTime() -
          new Date(delivery.startTime).getTime()
        return (
          <li
            key={delivery.id}
            className="border-lake-line border-b last:border-b-0"
          >
            <details className="group">
              <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 px-5 py-4 marker:hidden">
                {ok ? (
                  <CircleCheck
                    className="text-lake-success size-4"
                    aria-hidden="true"
                  />
                ) : (
                  <CircleX
                    className="text-lake-danger size-4"
                    aria-hidden="true"
                  />
                )}
                <Badge
                  tone={ok ? 'success' : 'danger'}
                  variant="soft"
                  size="sm"
                >
                  {delivery.responseStatus
                    ? t('webhooks.detail.status', {
                        status: delivery.responseStatus,
                      })
                    : t('webhooks.detail.failed')}
                </Badge>
                <span className="type-meta">
                  {formatDate(delivery.startTime, i18n.language, 'medium')}
                </span>
                {Number.isFinite(ms) && ms >= 0 ? (
                  <span className="type-meta">
                    {t('webhooks.detail.duration', { ms })}
                  </span>
                ) : null}
                <span className="text-lake-accent-text ml-auto text-sm group-open:hidden">
                  {t('webhooks.detail.showBody')}
                </span>
                <span className="text-lake-accent-text ml-auto hidden text-sm group-open:inline">
                  {t('webhooks.detail.hideBody')}
                </span>
              </summary>
              <div className="grid gap-4 px-5 pb-5 lg:grid-cols-2">
                {delivery.errorMessage ? (
                  <p className="text-lake-danger text-sm lg:col-span-2">
                    {delivery.errorMessage}
                  </p>
                ) : null}
                <div className="flex min-w-0 flex-col gap-2">
                  <p className="type-eyebrow">{t('webhooks.detail.request')}</p>
                  <pre className="rounded-lake-control bg-lake-surface-muted text-lake-fg max-h-80 overflow-auto p-3 font-mono text-xs">
                    {pretty(delivery.requestBody)}
                  </pre>
                </div>
                <div className="flex min-w-0 flex-col gap-2">
                  <p className="type-eyebrow">
                    {t('webhooks.detail.response')}
                  </p>
                  <pre className="rounded-lake-control bg-lake-surface-muted text-lake-fg max-h-80 overflow-auto p-3 font-mono text-xs">
                    {pretty(delivery.responseBody)}
                  </pre>
                </div>
              </div>
            </details>
          </li>
        )
      })}
    </ul>
  )
}

export default DeliveryList
