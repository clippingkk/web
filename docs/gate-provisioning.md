# ClippingKK on Evonia Gate

Gate owns sign-in, verification/reset email, product roles, and new Stripe billing. ClippingKK keeps numeric user IDs, profiles, and reading data. There are no paid subscriptions to import. Athena (`../../athena/webapp`) supplied the integration reference; its global identity deletion behavior is deliberately not used.

## Deploy Gate first

Apply Gate's additive migration using its documented serialized migration process. `gate_billing_account.environment_id` is nullable for historical accounts. Before another product with existing billing creates new checkout sessions, assign each old account to its verified environment. Do not guess, duplicate customers, or change existing Stripe subscriptions. ClippingKK has no historical billing accounts.

Configure `RESEND_API_KEY` and `MAIL_FROM` in Gate. Use a sender verified in Resend. Gate's `/account/recovery` sends email verification/password reset links. Verification expires after an hour; reset links expire after an hour, and password reset revokes Gate browser sessions. Password changes and social-account management happen in Gate. No ClippingKK passwords are imported.

Configure GitHub, Google, and Apple in Gate's organization/project settings. Use the callback URLs shown there. Phone, WeChat, and wallet login remain legacy API features only. Existing users with unmatched phone/relay/provider emails need assisted recovery.

## Register ClippingKK

Create a project and environments in Gate. Register a confidential web OIDC client:

- Scopes: `openid profile email offline_access`. Register `offline_access` before starting login; it enables refresh grants.
- Production callback: `https://clippingkk.annatarhe.com/api/auth/callback`.
- Development callback: `http://localhost:3101/api/auth/callback`.
- Post-logout origins: `https://clippingkk.annatarhe.com/`, `http://localhost:3101/`. Ordinary ClippingKK logout does not use global Gate logout.
- Add `https://clippingkk.annatarhe.com` to Gate's `GATE_ALLOWED_AUDIENCES`; use the same value in `GATE_RESOURCE`. Override both for custom origins.

Create roles:

| Slug | Permissions |
| --- | --- |
| `clippingkk-member` | `profile:read`, `clippingkk:write` |
| `clippingkk-admin` | `profile:read`, `clippingkk:write`, `clippingkk:admin` |

The first successful link provisions the member role once. Subsequent logins do not restore revoked roles. Bind administrator identities explicitly in Gate; being a Gate platform administrator does not make someone a ClippingKK administrator. Migrate intended `ROOT_USERS` administrators after their first Gate link.

Create a project-restricted service key with `project:read`, `project:update`, `billing:read`, `billing:manage`, and `credential:manage`. `project:update` is used only to provision the member binding. Keep the key on the server. A key used for project deletion must be authorized for every environment in which this product has a billing account; a pinned key cannot erase another environment's subscriptions. Prefer separate Gate projects for independently operated staging and production deployments.

Create an active `premium` plan with `entitlements: { "premium": true }`, using the current ClippingKK Stripe price for that environment. Configure the environment Stripe connection and its webhook at `/api/v1/webhooks/stripe/{environmentId}`. Enable Stripe's customer portal. Remove the old ClippingKK webhook destination; the old endpoint now returns 410. Payment confirmation remains pending until Gate has processed the webhook and resolved Premium access.

## ClippingKK environment and migration

```dotenv
APP_ORIGIN=https://clippingkk.annatarhe.com
GATE_BASE_URL=https://evonia-gate.annatarhe.com
GATE_CLIENT_ID=...
GATE_CLIENT_SECRET=...
GATE_PROJECT_ID=...
GATE_ENVIRONMENT_ID=...
GATE_API_KEY=...
GATE_RESOURCE=https://clippingkk.annatarhe.com
LEGACY_AUTH_ENABLED=1
RUN_WORKER=true
```

Set `DATABASE_URL` and `REDIS_URL` as usual. Keep the existing `JWT_SECRET` while `LEGACY_AUTH_ENABLED=1`; the flag defaults to `0`. Retain provider/legacy encryption secrets only while old clients need them. Browser APIs use the same origin; `NEXT_PUBLIC_API_HOST` must not redirect browser authentication to an older backend.

Apply the committed ClippingKK SQL migrations before starting the application. No destructive user backfill runs. Users authenticate through Gate once: a unique case-insensitive verified email match attaches their original numeric account. Conflicts and deleted accounts fail closed. Local name/avatar/bio/domain remain product-owned; a later Gate email change cannot change the subject binding.

Gate-unlinked legacy clients retain non-billing functionality while compatibility is enabled. Linked legacy clients use Gate permissions and Premium access. Legacy payment sheets return `GATE_UPGRADE_REQUIRED`; they cannot issue local Premium access. Turn off `LEGACY_AUTH_ENABLED` after clients migrate. Keep schema compatibility fields until those consumers retire.

## Assisted account recovery

Verify ownership of **both** the old ClippingKK account and the target Gate identity outside this command and retain evidence under a support ticket. The command does not infer proof from a claimed email and never merges profiles or transfers an existing binding.

```sh
node --env-file=.env.local scripts/recover-gate-account.mjs --user-id 42 --gate-subject gate-subject-id --ticket support-123 --operator support-operator --verified
```

Review the preview, then repeat with `--apply`. The binding and `account_recovery_audit` entry commit together. The user's next verified Gate login provisions member access. Use the intended environment's database; never run migration tests against production.

## Deletion and operations

Deletion disables the local account and writes `account_deletions` in one transaction. All sessions and legacy tokens check that active account before granting access. With `RUN_WORKER=true`, the worker retries pending deletion every 15 seconds, revokes ClippingKK sessions, removes Gate access to this project, cancels its subscriptions, and removes local owned/dependent data. Gate's shared identity, browser sessions, other projects, and accounting records survive. A later registration gets a new numeric account.

A 202 means queued, not completed. Inspect `account_deletions.completed_at` for completion. Pending rows survive a process restart and Gate/Redis failures. Logs record retries without email, tokens, or content; investigate sustained retries. A deployment without a worker must not expose account deletion.

Monitor `auth.gate.*`, `auth.account.delete`, and `payment.gate.*` operations, failed callbacks, refresh failures, Gate availability, and deletion backlog. Rollback should retain the additive database schema and Gate data; do not revive deleted accounts or switch billing back to local extension logic.

## Reproducible contracts and validation

Gate's production OpenAPI snapshot is vendored in `openapi/gate.json`. After an intentional Gate API change, regenerate Gate's snapshot, copy it here, and run `pnpm gate:generate`. The generator uses a scoped TypeScript 5.9 compiler API dependency; application checks continue using TypeScript 7.

Run `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, and `pnpm build`. Gate has its own test/typecheck/lint/build and OpenAPI snapshot checks. Database tests run against in-memory PGlite, never operator databases. Complete live OIDC, delivered mail, Redis rotation, Stripe test checkout/cancellation, and browser QA with provisioned test credentials before production deployment.

### Validation recorded for this change

- ClippingKK: 107 tests pass, TypeScript passes, lint completes with existing/generated-code warnings, formatting passes, and production build passes. GraphQL regeneration produces no contract diff.
- Gate: 79 tests pass; TypeScript, lint, formatting, and production build pass. OpenAPI snapshot and ClippingKK client bindings are regenerated.
- Browser: local sign-in and pricing layouts checked at mobile and desktop widths. Gate was intentionally unconfigured for this UI check; no checkout session was created.
- Database coverage uses PGlite. Redis rotation and Stripe responses are mocked. Real OIDC/provider sign-in, PostgreSQL/Redis concurrency, delivered Resend mail, and Stripe test-mode checkout/webhooks remain rollout verification steps requiring a provisioned test environment. No production accounts, migrations, or deployments were changed.
