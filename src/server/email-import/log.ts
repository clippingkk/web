import { logs, SeverityNumber } from '@opentelemetry/api-logs'

/** Logging shared by the email import's modules. */

const logger = logs.getLogger('clippingkk.web.email-import')

export function log(
  severity: 'INFO' | 'WARN' | 'ERROR',
  body: string,
  attributes: Record<string, string | number>
) {
  logger.emit({
    severityNumber: SeverityNumber[severity],
    severityText: severity,
    body,
    attributes,
  })
  // Container logs stay useful when no collector is configured.
  const line = `email-import: ${body} ${JSON.stringify(attributes)}`
  if (severity === 'ERROR') console.error(line)
  else if (severity === 'WARN') console.warn(line)
}

/** `reader@icloud.com` → `r***@icloud.com`: enough to trace, not to harvest. */
export function maskEmail(email: string) {
  const at = email.lastIndexOf('@')
  return at < 1 ? '***' : `${email[0]}***${email.slice(at)}`
}
