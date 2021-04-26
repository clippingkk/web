import * as Sentry from "@sentry/react"
import { Integrations } from "@sentry/tracing"

const IS_PROD = process.env.NODE_ENV === 'production'

if (IS_PROD) {
  Sentry.init({
    dsn: 'https://76acd61ea02341739aa86941f5a931be@sentry.io/1251804',
    integrations: [new Integrations.BrowserTracing()],
    tracesSampleRate: 0.2,
  })
}

export function log(err: Error | string, ext: any) {
  if (!IS_PROD) {
    console.log(err, ext)
    return
  }
  Sentry.captureException(err)
}
