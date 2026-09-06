import { getServerEnv } from '../env'
export function gateConfig() {
  const env = getServerEnv()
  const baseUrl = env.GATE_BASE_URL.replace(/\/+$/, '')
  return {
    baseUrl,
    issuer: `${baseUrl}/api/auth`,
    jwksUrl: `${baseUrl}/.well-known/jwks.json`,
    clientId: env.GATE_CLIENT_ID,
    clientSecret: env.GATE_CLIENT_SECRET,
    projectId: env.GATE_PROJECT_ID,
    environmentId: env.GATE_ENVIRONMENT_ID,
    apiKey: env.GATE_API_KEY,
    resource: env.GATE_RESOURCE,
    appOrigin: new URL(env.APP_ORIGIN).origin,
    redirectUri: `${new URL(env.APP_ORIGIN).origin}/api/auth/callback`,
    scopes: 'openid profile email offline_access',
  }
}
