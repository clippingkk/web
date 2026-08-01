---
name: otel-instrument-feature
description: "Instrument any new feature, endpoint, route, handler, worker, job, CLI command, or user-facing flow with OpenTelemetry spans, metrics, and logs before it lands. Triggers on requests like 'add a new endpoint', 'implement X', 'create a handler for Y', 'build a job to Z', 'add this feature', 'wire up a new route', or any code change that introduces a new business operation."
---

# Instrument a new feature with OpenTelemetry

Use this skill whenever you are about to write — or have just finished writing — a new business operation in the user's project. A "new feature" is anything a human operator would want to find later when something looks wrong: a new HTTP route, RPC handler, GraphQL resolver, background job, queue consumer, cron task, CLI subcommand, agent tool, scheduled workflow, or any module-level function that represents a meaningful step in a user-facing flow.

Adding code that is just plumbing — a pure helper, a type, a config — does not trigger this skill. Adding code that takes a request in, does work, and produces a side effect or response does.

## Step 0 — Confirm OTel is already wired

Before instrumenting, look for an existing bootstrap. Common signs: a `telemetry.ts` / `observability.ts` / `instrumentation.ts` / `init_observability()` module, `@vercel/otel` `registerOTel(...)`, `NodeSDK`/`sdk-node` setup, Python `LoggerProvider` + `OTLPLogExporter`, `superlogHeaders(...)`, or an inlined `https://intake.superlog.sh` endpoint with an `sl_public_` token.

If you cannot find a bootstrap, do not invent one inside the new feature file. Tell the user the project still needs OTel wiring and that this is the job of the `superlog-onboard` skill — then continue with the feature implementation, leaving a single brief TODO at the bootstrap site (not on every span/metric/log call site). Do not block on this.

If a bootstrap exists, read the applicable companion skill before writing code:

- `otel-onboarding-style` — general OTel taste and attribute conventions.
- `otel-python-style` — Python.
- `otel-fastapi-style` — FastAPI.
- `otel-livekit-style` — LiveKit agents.
- `otel-nextjs-style` — Next.js / Vercel.
- `otel-expo-style` — Expo / React Native.
- `otel-supabase-edge-style` — Supabase Edge Functions.
- `otel-generic-style` — anything else (Go, Java, Ruby, Rust, .NET, PHP, Elixir, plain Node, …).

Match the local convention. If the file you are editing already uses `withSpan` from `@superlog/otel-helpers`, keep using it; if it uses `tracer.startActiveSpan` directly, keep using that. Do not introduce a second style alongside the existing one.

## Step 1 — Decide what the new feature needs

For each new operation, walk this checklist explicitly before you write the instrumentation. The answer to each question may be "no, and here's why" — that is fine, but answer it.

### Span — almost always yes

Wrap the operation in a single span whose name is `domain.verb` (`order.submit`, `interview.create`, `email.send`, `job.reconcile`, `agent.run`, `voice.session`, `llm.generate_copy`). The span lives at the entry point of the feature, not inside helpers.

Skip a custom span only when the operation is entirely covered by an existing auto-instrumentation (HTTP server entry, DB query, framework lifecycle) and adds no business-meaningful work on top. If in doubt, add the span — auto-instrumentation almost never has the right name or attributes for a domain operation.

Attributes to set on the span (only what is available, no PII):

- Entity IDs the operator searches by: `tenant.id`, `workspace.id`, `org.id`, `user.id`, `order.id`, `job.id`, `request.id`. Use bounded IDs only — never raw email/phone/full request bodies.
- Bounded categorical dimensions: `outcome` (`success`/`failure`/`skipped`), channel, kind, route, action.
- Counts and sizes where they help explain latency: `batch.size`, `items.count`, `payload.bytes`.
- For LLM call sites that provider instrumentation does not already cover: `gen_ai.provider.name`, `gen_ai.request.model`, `app.gen_ai.use_case`, `app.gen_ai.call_site`. Do not duplicate attributes OpenInference/provider instrumentation already captures.

On the error path, record the exception and set the span status to error. Then re-raise — do not swallow.

### Metric — yes if this is a meaningful state transition or has latency that matters

Three categories. Decide which apply to the new feature:

- **Business counter** — every meaningful outcome: `orders.submitted`, `jobs.completed`, `emails.delivered`, `interviews.started`, `payments.failed`. Tag with low-cardinality dimensions (`tenant.id`, `outcome`, `channel`). Never tag with raw user/order IDs.
- **Performance histogram** — duration of the operation if a human would care about its tail. Reuse the span's existing timing rather than measuring twice when the SDK exposes it; otherwise record from `time.perf_counter` / `performance.now()` around the same boundary the span wraps.
- **Cost** — for LLM call sites only, and only when provider instrumentation does not already capture token usage. Use `llm.tokens.input` / `llm.tokens.output` counters with `unit="tokens"`. Do not add `llm.cost_usd` or any app-side pricing metric — Superlog computes cost centrally from provider/model/token data.

Acquire the meter and create instruments at module scope. Never create a meter or instrument inside the hot path.

### Log — yes if a human would want a narrative trail

Use logs for narrative ("starting batch reconcile", "retry 2 of 3 after 5xx") and for exceptional events that need attention. Use the project's existing logger — do not introduce a new logging library and do not wrap log calls in a helper.

An `error`-level log must mean the operation cannot recover without manual intervention. Recoverable conditions go at `warn` or below.

Logs emitted inside the span automatically pick up `trace_id` / `span_id` if the bootstrap's log bridge is wired correctly. Do not start a throwaway span around a log call to force correlation.

### Attributes vs metric dimensions

Span attributes can be high-cardinality (specific IDs, counts). Metric dimensions cannot — keep them bounded. If you find yourself wanting to tag a metric with `order.id` or `request.id`, that data belongs on the span, not the counter.

## Step 2 — Write the instrumentation alongside the feature

Add the span at the entry point of the new operation. Do not sprinkle micro-spans across every helper inside it — one well-named span with rich attributes beats five generic ones. Sub-spans are useful only when there is a real sub-operation a human would want to isolate (an external API call, a DB transaction with non-obvious latency, a distinct phase like `parse` / `validate` / `dispatch`).

Add counters at the success and failure boundaries of the operation, with `outcome` tagged. Add a histogram where latency tail matters. Add logs at the start/end of long-running narratives and on exceptional branches.

Do not add backwards-compatibility shims, feature flags, or "telemetry on/off" toggles around individual call sites. The SDK already has a no-op path when no provider is registered; that is the only switch needed.

Do not invent helper APIs like `recordCounter`, `sendSuperlogSpan`, `withTelemetry`, `trackEvent`. Use the native OTel APIs (or the published `withSpan` from `@superlog/otel-helpers` in TS/JS, where the local style already uses it).

## Step 3 — Verify the new feature emits what you claimed

Run the feature end-to-end through the project's normal entry point — hit the route with `curl`, invoke the CLI subcommand, enqueue the job, trigger the agent tool. A unit test that mocks the tracer does not count; the goal is to see the real OTLP payload leave the process.

If the dev server logs OTLP exporter activity (or the project has a debug exporter), confirm:

- The span you added shows up with the name and attributes you claimed.
- Counters you added incremented at least once.
- A log line emitted inside the operation arrived with `trace_id` / `span_id` populated.

If the bootstrap uses a generated `sl_public_` token and signup is not finished yet, ingest will return 401/403 — that is expected. The signal you care about here is "the SDK produced a payload and tried to send it", not "ingest accepted it."

If only spans appear and metrics/logs do not, the bootstrap has a wiring gap. That is a `superlog-onboard` problem, not this skill's — flag it to the user and continue with the feature work.

## Hard rules

- Never put PII in span attributes, metric dimensions, or log fields: no emails, phone numbers, passwords, tokens, full request bodies, plaintext message content.
- Never tag metrics with raw user/order/request IDs. Those go on spans.
- Never invent a wrapper API for telemetry; use the native OTel SDK and the local style's conventions.
- Never start a throwaway span solely to make a log line carry `trace_id`. Fix the bridge instead, or accept the uncorrelated log.
- Never add LLM cost math or pricing tables at call sites. Superlog computes cost centrally.
- Do not block the feature on a missing bootstrap — leave a single TODO and tell the user to run `superlog-onboard`.
