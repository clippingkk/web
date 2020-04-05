import * as sentry from '@sentry/browser'

const IS_PROD = process.env.NODE_ENV === 'production'

if (IS_PROD) {
  sentry.init({ dsn: 'https://76acd61ea02341739aa86941f5a931be@sentry.io/1251804' });
}

export function log(err: Error | string, ext: any) {
  if (!IS_PROD) {
    console.log(err, ext)
    return
  }
  sentry.captureException(err)
}
