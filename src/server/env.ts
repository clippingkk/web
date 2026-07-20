import { z } from 'zod'

const optionalUrl = z.string().url().optional().or(z.literal(''))

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  QUEUE_REDIS_URL: z.string().min(1).optional(),
  JWT_SECRET: z.string().min(8),
  APP_ORIGIN: z.string().url().default('http://localhost:3101'),
  CORS_ALLOWED_ORIGINS: z.string().default('http://localhost:3101'),
  ROOT_USERS: z.string().default('1'),
  RUN_WORKER: z.enum(['true', 'false']).default('false'),
  DEBUG: z.enum(['true', 'false']).default('false'),
  GIT_COMMIT: z.string().default(''),

  WECHAT_APP_ID: z.string().optional(),
  WECHAT_SECRET: z.string().optional(),
  X_BASIC_AES_KEY: z.string().default('27fa3e2b4bb2a'),
  X_BASIC_AES_IV: z.string().default('091DD8C6AE176803467822616FC7F35E'),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  CF_TURNSTILE_SECRET: z.string().optional(),
  LEAN_CLOUD_HOST: z
    .string()
    .url()
    .default('https://clippingkk-lc.annatarhe.cn'),
  LEAN_CLOUD_APP_ID: z.string().optional(),
  LEAN_CLOUD_APP_KEY: z.string().optional(),
  APPLE_AUTH_REDIRECT_URI: optionalUrl,
  APPLE_AUTH_TEAM_ID: z.string().optional(),
  APPLE_AUTH_KEY_ID: z.string().optional(),
  APPLE_AUTH_SERVICE_ID: z.string().optional(),
  APPLE_AUTH_APP_PKG: z.string().optional(),
  APPLE_AUTH_PRIVATE_KEY_BASE64: z.string().optional(),

  STRIPE_SECRET: z.string().optional(),
  STRIPE_WEBHOOK_ENDPOINT_SECRET: z.string().optional(),
  WENQU_ENDPOINT: z.string().url().default('https://wenqu.annatarhe.cn/api/v1'),
  WENQU_TOKEN: z.string().optional(),
  PROMPTPAL_ENDPOINT: z
    .string()
    .url()
    .default('https://prompt-pal.annatarhe.com'),
  PROMPTPAL_API_TOKEN: z.string().optional(),
  MORALIS_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  S3_ENDPOINT: z.string().url().default('https://s3.bitiful.net'),
  S3_REGION: z.string().default('cn-east-1'),
  S3_BUCKET: z.string().optional(),
  S3_HOST: optionalUrl,
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  SENTRY_DSN: optionalUrl,
  OTEL_EXPORTER_OTLP_ENDPOINT: optionalUrl,
})

export type ServerEnv = z.infer<typeof envSchema> & {
  corsAllowedOrigins: Set<string>
  rootUsers: Set<number>
  runWorker: boolean
  debug: boolean
}

let parsedEnv: ServerEnv | undefined

export function getServerEnv(): ServerEnv {
  if (parsedEnv) return parsedEnv

  const values = envSchema.parse(process.env)
  parsedEnv = {
    ...values,
    corsAllowedOrigins: new Set(
      values.CORS_ALLOWED_ORIGINS.split(',').map((value) => value.trim())
    ),
    rootUsers: new Set(
      values.ROOT_USERS.split(',')
        .map((value) => Number.parseInt(value.trim(), 10))
        .filter(Number.isFinite)
    ),
    runWorker: values.RUN_WORKER === 'true',
    debug: values.DEBUG === 'true',
  }
  return parsedEnv
}

export function requireEnv<K extends keyof ServerEnv>(
  key: K
): NonNullable<ServerEnv[K]> {
  const value = getServerEnv()[key]
  if (value === undefined || value === '') {
    throw new Error(`${String(key)} is required for this integration`)
  }
  return value as NonNullable<ServerEnv[K]>
}

export function resetServerEnvForTests() {
  parsedEnv = undefined
}
