import { connection } from 'next/server'

import { gateConfig } from '../gate/config'

/**
 * RFC 9728 Protected Resource Metadata for the MCP endpoint. The resource is
 * `GATE_RESOURCE` — the audience Gate already stamps on ClippingKK's access
 * tokens — and Gate is the authorization server MCP clients sign in with.
 */
export async function protectedResourceMetadata() {
  // Reads server env: must not run at build time, where there is none.
  await connection()
  const gate = gateConfig()
  return Response.json(
    {
      resource: gate.resource,
      authorization_servers: [gate.issuer],
      bearer_methods_supported: ['header'],
      scopes_supported: ['openid', 'profile'],
      resource_name: 'ClippingKK',
      resource_documentation: `${gate.appOrigin}/dash`,
    },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
      },
    }
  )
}
