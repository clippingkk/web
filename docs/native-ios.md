# ClippingKK iOS and Gate

The native app (`ClippingKK N1`) uses this application's `/api/v2/graphql` and `/api/auth/native/*` endpoints. Gate remains the OIDC provider, and this backend is the OAuth client. No Gate service key, client secret, access token or refresh token ever reaches the device. The design follows Athena (`../../athena/webapp/docs/native-ios.md`).

The device holds one opaque credential, `ck_ios_` followed by 43 base64url characters. The WidgetKit extension shares it through the app group. It cannot refresh anything itself, which is why refresh happens here.

## Configure and release

1. Register a **native** client in Gate for each environment. See "The iOS native client" in [gate-provisioning.md](gate-provisioning.md).
2. Set `GATE_NATIVE_CLIENT_ID` on this backend. The web client settings are unchanged. While it is empty, `POST /api/auth/native/start` answers 503.
3. Deploy this backend before releasing the iOS build. There is no database migration.
4. iOS selects the backend with the `CK_API_ORIGIN` build setting: Debug uses `http://localhost:3101`, Release uses `https://clippingkk-api.annatarhe.com`. A physical device cannot reach `localhost`; build with `CK_API_ORIGIN=http://<mac-name>.local:3101` or an HTTPS tunnel.

## Native API

Responses use the standard `{status, msg, data}` envelope (`{status, msg, error}` on failure) with `Cache-Control: no-store`. Request bodies are JSON, limited to 8 KiB, and reject unknown fields. Credentials never appear in URLs.

| Endpoint | Request | `data` |
| --- | --- | --- |
| `POST /api/auth/native/start` | `{challenge}` (PKCE S256, 43 chars) | `{transactionId, state, authorizationUrl}` |
| `POST /api/auth/native/exchange` | `{transactionId, state, code, verifier}` | `{token, expiresAt, user}`; `expiresAt` is Unix milliseconds |
| `GET /api/auth/native/session` | `Authorization: Bearer ck_ios_…` | `{user: {id, name, email, avatar}}`; `id` is the numeric ClippingKK id |
| `POST /api/auth/native/logout` | native bearer | `{ok: true}`, always |

GraphQL and every other authenticated route accept the same `Authorization: Bearer ck_ios_…` header.

### Sign-in

1. The app generates a PKCE verifier and sends only its S256 challenge to `start`.
2. The server creates `state` and `nonce`, stores the transaction in Redis for 10 minutes under the hash of its id, and returns Gate's authorization URL. The URL carries the native client id, the fixed redirect URI `com.annatarhe.clippingkk://oauth/callback`, and `resource`.
3. The app opens the URL in `ASWebAuthenticationSession`, checks `state` on the callback, and posts the code and verifier to `exchange`.
4. The server verifies `state` and the PKCE binding, then consumes the transaction atomically, so exactly one exchange reaches Gate. A failed exchange is retried by starting a new sign-in.
5. The ID token is verified against the **native** client id as audience (ES256, issuer, expiry, nonce, `azp`). The account is linked or created exactly as for web (`ensureLocalUser`, then `provisionMember`), so an existing user keeps their numeric id.

### Sessions

A native session is an ordinary Gate session (`src/server/gate/session.ts`) with `kind: 'native'` and the `clientId` it was issued to. It therefore shares the web session's behaviour:

- Redis is keyed by the SHA-256 of the credential, so a Redis dump holds nothing usable.
- A fixed 30-day lifetime. The Gate access token is refreshed within 60 seconds of expiry, serialized across instances by a Redis lock, and written back compare-and-set so a logout during refresh is never undone.
- Every read revalidates the local account (exists, same Gate subject, not deleted) and the `profile:read` permission.
- Refresh and revocation are made as the native client, without a secret. A refresh token is bound to the client it was issued to.
- The `kind` check keeps the two apart: a native session id never works as a `ck-session` cookie, nor the reverse.

`src/server/auth.ts` checks for a native credential before the cookie and before legacy credentials, and never falls back. The iOS app therefore works with `LEGACY_AUTH_ENABLED=0`.

### Status codes the app relies on

| Status | Meaning | App behaviour |
| --- | --- | --- |
| 401 | The session ended, was revoked, or the account was deleted; also any malformed `ck_ios_` value | Clears the credential and shows sign-in |
| 503 | Gate or Redis is unavailable, a refresh is in flight, or Gate rejected this server's service key | Keeps the credential; the request can be retried |
| 403 | Gate denied the product permission | Keeps the credential |

Keep these distinct. An outage reported as 401 would sign out every iOS user and blank every widget. That is why a Gate 401 on the service key is mapped to 503 in `requireProductPermission`.

## Account deletion

iOS deletes through the GraphQL `removeMyAccount` mutation, like web, which needs `RUN_WORKER=true`. Disabling the account fails the next session read; the worker's `destroyUserSessions` then removes every remaining session, native ones included, through the shared per-user index.

## Checks

`pnpm test:server` covers the native flow in `src/server/gate/__tests__/native.test.ts` (start, exchange, replay, missing refresh token, error mapping, refresh and revoke as the native client) and the credential ordering in `src/server/__tests__/auth-native.test.ts`. Tests use fake Gate responses. Live sign-in, consent, refresh and logout against a registered non-production client remain release checks.
