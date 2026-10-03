# Billing and Premium

Premium has two payment sources and one source of truth.

| Source | Who handles payment | How it becomes Premium |
| --- | --- | --- |
| Web (Stripe) | Evonia Gate: checkout, customer portal, Stripe webhook | An active subscription to Gate's `premium` plan |
| iOS (App Store) | Apple, through StoreKit 2 | ClippingKK verifies the purchase and writes one `apple_iap` grant to Gate |

Gate resolves both into one `premiumEndAt` per Gate subject: the latest end date across the Stripe plan and any unexpired `premium: true` grants. ClippingKK reads only that value (`src/server/billing/premium.ts`):

- **`isPremium(userId)`** decides access for the AI routes, `aiEnhanceComment`, `personalityByAI`, `aiSummary`, webhooks, checkout and the payment status page. It throws a 503 when Gate can't answer, so an outage never looks like "Free".
- **`userPremiumEndAt`** (`premium-loader.ts`) feeds badges and the GraphQL `premiumEndAt` field. It shows Free during an outage and logs `billing: Premium display state unavailable`. RSS and MCP also fall back to Free rather than failing.

ClippingKK holds no Stripe keys. The legacy `/api/v2/stripe/webhooks` and `/api/v2/payment-sheet` endpoints answer 410.

## Code map

| Path | Role |
| --- | --- |
| `src/server/gate/client.ts` | Gate HTTP client. Logs Gate's problem details. Turns 401/403/408/429/5xx and timeouts into 503 `GATE_UNAVAILABLE`, never into a 401 that would sign readers out |
| `src/server/billing/gate.ts` | Gate billing calls: checkout, portal, cancel, plans, `subjects/state`, Stripe connection, Apple grant. `billingConfig()` requires a UUID `GATE_ENVIRONMENT_ID` |
| `src/server/billing/state.ts` | `GET /api/billing/subscriptions`: Gate's Stripe subscriptions merged with local App Store rows (`provider: 'stripe' \| 'apple'`) and the reader's StoreKit `appAccountToken` |
| `src/server/billing/apple/` | App Store verification (`verify.ts`, pinned Apple Root CA G3 in `certs.ts`), state rules (`sync.ts`), routes (`handlers.ts`) |
| `src/server/billing/diagnostics.ts` | `GET /api/billing/diagnostics` (administrators only) |

## Routes

| Route | Auth | Purpose |
| --- | --- | --- |
| `POST /api/v2/payment-subscription` | reader | Gate Stripe checkout URL. Returns 409 `ALREADY_PREMIUM` if the reader already has Premium |
| `GET /api/v2/payment-order-info?sessionId=` | reader | Checkout status plus `premiumActive`, polled by `/payment/success` |
| `POST /api/billing/portal` | reader | Stripe customer portal URL (Stripe subscribers only) |
| `GET /api/billing/subscriptions` | reader | `{premiumEndAt, appAccountToken, subscriptions[]}` |
| `POST /api/billing/apple/transactions` | reader | `{signedTransaction, signedRenewalInfo?}` from StoreKit. Returns the billing state above |
| `POST /api/billing/apple/notifications` | Apple's signature | App Store Server Notifications V2 (`/api/v2/apple/notification` is an alias) |
| `GET /api/billing/diagnostics` | administrator | Checks every piece below, one by one |

REST errors now carry `code` (for example `PREMIUM_REQUIRED`, `ALREADY_PREMIUM`, `APPLE_TRANSACTION_OTHER_ACCOUNT`, `GATE_UNAVAILABLE`).

## App Store rules

- **Ownership.**
  - The app passes the reader's `appAccountToken` to StoreKit, so a purchase made in the app names its buyer.
  - A transaction that names a different reader is refused with 409.
  - A subscription with no token (an offer code, or a purchase made outside the app) belongs to the first reader who reports it.
  - After that, `apple_subscriptions.user_id` decides who owns it.
- **Ordering.** Apple delivers the same facts through the device and through notifications, in any order. Four rules keep the stored state correct:
  - A transaction that an upgrade replaced is ignored.
  - A newer signature of the current transaction wins, which is how refunds and their reversals arrive.
  - A different transaction replaces the current one only when it ends later.
  - Renewal info applies only when it is newer.
- **Access end.** Access lasts until `max(expiresDate, gracePeriodExpiresDate)` and ends at once on revocation. Each reader has one Gate grant, `{feature: 'premium', value: true, source: 'apple_iap', sourceReference: 'clippingkk:apple'}`, whose `expiresAt` is the latest end across their App Store subscriptions. Ending access writes an `expiresAt` of now.
- **Gate failures.** The grant is written inside the same database transaction. If Gate refuses it, nothing is stored and a 503 asks the app (or Apple) to retry.
- **Environments.**
  - Production and sandbox purchases are accepted; App Review and TestFlight buy in the sandbox against production.
  - Set `APPLE_IAP_ALLOW_SANDBOX=0` to refuse sandbox purchases.
  - Unsigned Xcode StoreKit-testing data is accepted only when `APPLE_IAP_ALLOW_XCODE=1` and `NODE_ENV` is not `production`.
- **Account deletion.** Deleting an account removes its App Store rows. Gate removes its grants. Apple keeps billing until the reader cancels in the App Store; the iOS app tells them so.

## Setup checklist

### Gate (per environment)

1. **Premium plan.** Create an active plan with key `premium`, entitlements `{ "premium": true }` (a boolean), and the environment's Stripe price.
2. **Stripe connection.** Configure the environment's Stripe connection, and enable Stripe's customer portal.
3. **Stripe webhook.** In Stripe, send these events to `https://<gate>/api/v1/webhooks/stripe/{environmentId}`:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
4. **Service key.** Give the service key `billing:read` and `billing:write` (see [gate-provisioning.md](gate-provisioning.md)). If the key is pinned to an environment, that environment must be `GATE_ENVIRONMENT_ID`; otherwise every billing call fails with 403.
5. **Grant resolution.** Use a Gate release that resolves grants with the "latest end wins" rule (EvoniaAI/gate `fix(billing): resolve Premium and grants deterministically`). Earlier releases let an App Store grant *replace* a longer Stripe period.

### App Store Connect

1. **Subscription group.** Create an auto-renewable subscription group, "ClippingKK Premium", containing:
   - `com.annatarhe.clippingkk.premium.monthly`
   - `com.annatarhe.clippingkk.premium.yearly`

   Leave Family Sharing off.
2. **Notification URLs.** Set App Store Server Notifications **Version 2** for both Production and Sandbox to `https://clippingkk.annatarhe.com/api/billing/apple/notifications`.
3. **Apple ID.** Copy the app's Apple ID (App Information) into `APPLE_IAP_APP_APPLE_ID`.

### ClippingKK

```dotenv
GATE_PROJECT_ID=...
GATE_ENVIRONMENT_ID=...            # a UUID; required for every billing call
GATE_API_KEY=...
APPLE_IAP_BUNDLE_ID=com.annatarhe.clippingkk.ClippingKK-N1
APPLE_IAP_APP_APPLE_ID=...         # required to verify production purchases
APPLE_IAP_PRODUCT_IDS=com.annatarhe.clippingkk.premium.monthly,com.annatarhe.clippingkk.premium.yearly
APPLE_IAP_ALLOW_SANDBOX=1
```

1. Run `pnpm db:migrate` before starting the new image. Migration `0005` adds `users.app_account_token` and `apple_subscriptions`, and the container refuses to boot without them.
2. The server must reach `ocsp.apple.com`. Verification checks certificate revocation, and an OCSP outage returns 503 so the client retries.

### Verify

1. Signed in as a ClippingKK administrator, open `/api/billing/diagnostics`. Every check should be `ok`:
   - **`gate.config`**: `GATE_*` variables are set.
   - **`gate.plan`**: the `premium` plan exists, is active, has a price, and grants `premium: true`.
   - **`gate.stripe`**: the Stripe connection exists.
   - **`gate.premium_state`**: the key and environment pinning work.
   - **`apple.config`**: the App Store variables are set.

   When a check fails, the server log line starting `gate:` carries Gate's problem title and `requestId`.
2. Test the web purchase:
   1. Buy with a Stripe test card.
   2. `/payment/success` turns Premium on once Gate has processed `customer.subscription.created`.
   3. The Premium badge and the AI features unlock together.
3. Test the App Store purchase:
   1. Buy in TestFlight (sandbox).
   2. The app unlocks immediately.
   3. `/settings/orders` on the web lists an App Store subscription.
   4. Cancelling in the App Store shows "Ends …" after the next notification.
