import { addResolversToSchema } from '@graphql-tools/schema'
import { buildClientSchema, type IntrospectionQuery } from 'graphql'

import introspection from '@/schema/schema.json'

import { requireLegacyAuth } from '../auth'
import { ApiError } from '../errors'
import { requireProductWrite } from '../gate/authz'
import { cookieValue, assertSameOrigin } from '../gate/security'
import { resolvers } from './resolvers'

export const graphQLSchema = addResolversToSchema({
  schema: buildClientSchema(introspection as unknown as IntrospectionQuery),
  resolvers,
  updateResolversInPlace: true,
})

const legacyFields = new Set([
  'auth',
  'mpAuth',
  'loginByApple',
  'githubAuth',
  'loginByWeb3',
  'signup',
  'loginV3',
  'bindAppleUnique',
  'bindWeb3Address',
  'authByPhone',
  'bindWechat',
  'wechatBindKey',
  'sendResetTempCode',
  'resetPassword',
  'bindPhone',
  'sendOneTimePasscode',
  'encodeCliToken',
])
for (const type of [
  graphQLSchema.getQueryType(),
  graphQLSchema.getMutationType(),
]) {
  for (const field of Object.values(type?.getFields() ?? {})) {
    const resolve = field.resolve
    if (!resolve) continue
    if (legacyFields.has(field.name))
      field.deprecationReason = 'Legacy clients only; use Gate OIDC.'
    field.resolve = async (source, args, context, info) => {
      if (legacyFields.has(field.name)) {
        requireLegacyAuth()
        if (cookieValue(context.request))
          throw new ApiError(
            'Use Gate account management.',
            410,
            'LEGACY_AUTH_DISABLED'
          )
      }
      if (type === graphQLSchema.getMutationType()) {
        if (cookieValue(context.request)) assertSameOrigin(context.request)
        if (context.userId && field.name !== 'removeMyAccount')
          await requireProductWrite(context.userId)
      }
      return resolve(source, args, context, info)
    }
  }
}
