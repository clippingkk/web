import Badge from '@annatarhe/lake-ui/badge'

import { getTranslation } from '@/i18n'
import type { InboundEmailSummary } from '@/server/email-import/records'
import { formatDateTime } from '@/utils/format-date'

import { INBOUND_EMAIL_TONE } from './inbound-email-status'

type InboundEmailListProps = {
  emails: InboundEmailSummary[]
  /** Readers get a hint per status; administrators get the raw details. */
  audience: 'reader' | 'admin'
}

/** Inbound emails, newest first, with what became of each one. */
async function InboundEmailList({ emails, audience }: InboundEmailListProps) {
  const { t, i18n } = await getTranslation(undefined, 'settings')
  const known = (key: string) => i18n.exists(key, { ns: 'settings' })

  return (
    <ul className="rounded-lake-panel border-lake-line bg-lake-surface border">
      {emails.map((email) => {
        const hint = `email.history.hint.${email.status}`
        const limit = `admin.inbound.limit.${email.detail}`
        const facts = [
          email.detail &&
            (email.status === 'reply_limited' && known(limit)
              ? t(limit)
              : email.detail),
          email.dmarc && t('admin.inbound.dmarc', { value: email.dmarc }),
          email.attempts > 1 &&
            t('admin.inbound.attempts', { value: email.attempts }),
        ].filter((fact): fact is string => Boolean(fact))
        return (
          <li
            key={email.id}
            className="border-lake-line flex flex-col gap-1.5 border-b px-5 py-4 last:border-b-0"
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <Badge
                tone={INBOUND_EMAIL_TONE[email.status] ?? 'neutral'}
                variant="soft"
                size="sm"
              >
                {t(`email.status.${email.status}`)}
              </Badge>
              <time dateTime={email.receivedAt} className="type-meta">
                {formatDateTime(email.receivedAt, i18n.language)}
              </time>
              <span className="type-meta min-w-0 break-all">
                {email.sender}
              </span>
            </div>
            <p className="text-lake-fg text-sm font-medium break-words">
              {email.subject || t('email.history.noSubject')}
            </p>
            {email.books.length ? (
              <p className="font-reading text-lake-fg-muted text-sm break-words">
                {email.books.join(' · ')}
              </p>
            ) : null}
            {email.status === 'imported' ? (
              <p className="type-meta">
                {t('email.history.summary', {
                  highlights: email.highlights,
                  created: email.clippingsCreated,
                  notes: email.notesCreated,
                })}
              </p>
            ) : null}
            {email.status === 'replied' ? (
              <p className="type-meta">
                {t('email.history.replied', { value: email.highlights })}
              </p>
            ) : null}
            {audience === 'reader' && known(hint) ? (
              <p className="text-lake-fg-muted text-sm">{t(hint)}</p>
            ) : null}
            {audience === 'admin' && facts.length ? (
              <p className="type-meta flex flex-wrap gap-x-3 gap-y-1">
                {facts.map((fact) => (
                  <span key={fact} className="break-all">
                    {fact}
                  </span>
                ))}
              </p>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}

export default InboundEmailList
