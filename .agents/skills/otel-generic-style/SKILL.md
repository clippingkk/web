---
name: otel-generic-style
description: "Generic OpenTelemetry style fallback for languages without a dedicated otel-*-style skill (Go, Java/Kotlin, Ruby, Rust, .NET/C#, PHP, Elixir, plain Node, etc.). Native SDK APIs, module-scope tracers/meters, bounded spans, error recording, OTLP logs, and resource attributes."
---

# Generic OTel Style

Use this skill for any language that does not have its own `otel-*-style`
companion (Go, Java/Kotlin, Ruby, Rust, .NET/C#, PHP, Elixir, plain
Node/TypeScript without Next.js or Expo, etc.). Read `otel-onboarding-style`
first for the cross-language rules; this skill is the language-agnostic
translation of that guidance.

If a language-specific skill exists for the runtime in front of you
(`otel-python-style`, `otel-fastapi-style`, `otel-livekit-style`,
`otel-nextjs-style`, `otel-expo-style`, `otel-supabase-edge-style`), prefer
that one — it overrides this skill.

## Use the language's official OTel SDK

Pull the SDK and exporters from the OpenTelemetry project for that language.
Do not invent helper APIs around it. Examples:

- Go: `go.opentelemetry.io/otel`, `otel/sdk`, `otel/exporters/otlp/otlptrace/otlptracehttp`
- Java/Kotlin: `io.opentelemetry:opentelemetry-sdk` + `opentelemetry-exporter-otlp` (or the Java agent for auto-instrumentation)
- Ruby: `opentelemetry-sdk`, `opentelemetry-exporter-otlp`, `opentelemetry-instrumentation-all`
- Rust: `opentelemetry`, `opentelemetry_sdk`, `opentelemetry-otlp`
- .NET/C#: `OpenTelemetry`, `OpenTelemetry.Exporter.OpenTelemetryProtocol`, framework `OpenTelemetry.Instrumentation.*` packages
- PHP: `open-telemetry/sdk`, `open-telemetry/exporter-otlp`
- Elixir: `:opentelemetry`, `:opentelemetry_api`, `:opentelemetry_exporter`
- Plain Node/TS: `@opentelemetry/sdk-node` + `@opentelemetry/auto-instrumentations-node` (use `@vercel/otel` for Next.js — see `otel-nextjs-style`)

Use **HTTP OTLP exporters**, not gRPC. gRPC pulls in native bindings that break
bundlers, slim containers, and serverless cold starts.

## Acquire tracers/meters once, at module/package scope

Whatever the idiomatic "module top" is in that language — package-level vars
in Go, static fields in Java/.NET, top-of-file constants in Ruby/Node,
`@moduledoc`-level attributes in Elixir. Don't construct a fresh tracer or
meter on every call.

```go
// Go
var (
    tracer = otel.Tracer("mugline.api")
    meter  = otel.Meter("mugline.api")
    ordersSubmitted, _ = meter.Int64Counter("orders.submitted")
)
```

```java
// Java
private static final Tracer TRACER = GlobalOpenTelemetry.getTracer("mugline.api");
private static final Meter METER = GlobalOpenTelemetry.getMeter("mugline.api");
private static final LongCounter ORDERS_SUBMITTED =
    METER.counterBuilder("orders.submitted").build();
```

## Bounded work

For any function with clear start/end boundaries, open a span that covers the
whole operation and ends automatically. Use the language's built-in
construct — `defer span.End()`, `try-with-resources`, `using`, `with`, block
form, etc. Do not start a span in one place and end it manually somewhere
else for bounded work.

```go
ctx, span := tracer.Start(ctx, "order.submit")
defer span.End()
span.SetAttributes(
    attribute.String("tenant.id", tenantID),
    attribute.String("order.id", orderID),
)
```

```csharp
using var activity = ActivitySource.StartActivity("order.submit");
activity?.SetTag("tenant.id", tenantId);
activity?.SetTag("order.id", orderId);
```

Span names are conventional and low-cardinality: `domain.verb`
(`order.submit`, `payment.charge`, `voice.session`, `llm.generate_copy`).

## Error paths

Record the exception and set the span status to error on the active span,
then re-raise so the caller still sees the failure.

```go
if err != nil {
    span.RecordError(err)
    span.SetStatus(codes.Error, err.Error())
    return err
}
```

```ruby
rescue => e
  span = OpenTelemetry::Trace.current_span
  span.record_exception(e)
  span.status = OpenTelemetry::Trace::Status.error(e.message)
  raise
end
```

## Logs

If logs are claimed as OTLP-forwarded, install the OTel log bridge for that
language so existing log calls carry `trace_id` / `span_id` automatically.
Keep the existing logger (`log/slog`, Logback, `Logger`, `Serilog`,
`Logger.Logger`, etc.) — just add an OTLP handler/processor underneath.

Do not replace the project's structured logger with a bespoke one.

## Init behavior

Use the source-level public Superlog configuration pattern from
`otel-onboarding-style` in the telemetry init area. The public project token is
write-only and belongs with the endpoint in one setup block, like a PostHog
project token or Sentry DSN.

If init can run more than once (test reloads, framework restarts, multiple
entrypoints), guard provider/exporter setup so duplicate processors aren't
installed.

## Resource attributes

Set on the OTel resource for every service:

- `service.name`
- `service.version` (when available)
- `deployment.environment.name`
- `vcs.repository.url.full` — canonical https URL of the repo
- `vcs.ref.head.revision` — best-effort commit SHA from build env
  (`GITHUB_SHA`, `VERCEL_GIT_COMMIT_SHA`, `RAILWAY_GIT_COMMIT_SHA`,
  `SOURCE_COMMIT`, `GIT_COMMIT`, `HEROKU_SLUG_COMMIT`, …)

Do not shell out to `git` from the running process. Use the OTel
semantic-convention keys exactly — do not invent `git.repo` / `app.repo_url`.

## Metrics

Counters for additive totals: requests, events, jobs, errors, business
state transitions. Histograms for distributions: duration, latency, payload
size, queue depth.

Low-cardinality attributes only — tenant/org/project, operation/use case,
provider/model, outcome. Do not put raw user IDs or request IDs in metric
tags.

For LLM token/cost telemetry, follow the `gen_ai.*` / `app.gen_ai.*`
convention from `otel-onboarding-style`. Do not add app-side `llm.cost_usd`
metrics — Superlog computes cost centrally.

## When no OTel SDK exists

Some runtimes have no usable OpenTelemetry SDK — older languages (Perl,
Bash/shell, Lua, Crystal, Nim, Zig), niche runtimes, restricted edge
environments, or languages whose "SDK" is abandoned/pre-alpha and would be
worse than rolling your own. In that case, emit OTLP/HTTP JSON directly.
The wire format is stable, documented, and small.

Rules for a hand-rolled OTLP emitter:

- **Speak OTLP/HTTP+JSON, not a vendor format.** POST to
  `https://intake.superlog.sh/v1/traces`, `/v1/metrics`, `/v1/logs` with
  `Content-Type: application/json` and the public project token in the
  **`x-api-key`** header (`x-api-key: sl_public_...`). Ingest reads only
  `x-api-key` or `Authorization: Bearer <token>` (literal `Bearer ` prefix) —
  any other header name 401s on every request even when the token is valid. Body
  shape follows the OTLP proto-to-JSON
  mapping (`resourceSpans` / `resourceMetrics` / `resourceLogs` →
  `scopeSpans` → `spans`, with `traceId`/`spanId` as lowercase hex).
- **Keep the shim tiny and OTel-shaped.** Expose names a future SDK port
  could drop into: `startSpan(name)`, `setAttributes`, `recordException`,
  `endSpan`, `counter.add`, `histogram.record`. Don't invent
  `sendSuperlogEvent` or `recordCounter` — those are exactly what the style
  forbids elsewhere.
- **Generate IDs correctly.** 16-byte trace IDs and 8-byte span IDs as
  lowercase hex; use the runtime's CSPRNG. Timestamps are nanoseconds since
  Unix epoch (`time.UnixNano()` equivalent — beware language defaults that
  give ms or µs).
- **Batch and flush.** Buffer spans/metrics/logs in memory, flush on a small
  interval (a few seconds) and on process exit. Drop on overflow rather
  than blocking the hot path. For a CLI or short-lived script, do a final
  synchronous flush before exit.
- **Resource attributes still apply.** Set `service.name`,
  `service.version`, `deployment.environment.name`,
  `vcs.repository.url.full`, `vcs.ref.head.revision` once on the resource
  and reuse it on every export envelope.
- **Use the same public config as SDK-based services.** Keep the endpoint and
  public project token in one setup block, and set resource attributes on every export
  envelope. If signup is still in progress, initialize cleanly and note that
  ingest may reject the generated token until the browser flow claims it.
- **Trace context propagation uses W3C `traceparent`.** Read it from
  inbound HTTP headers if the runtime is a server; emit it on outbound
  requests as `traceparent: 00-<trace-id>-<span-id>-01`.

For shell scripts and one-shot tools, even a single `curl` POST to
`/v1/traces` with a hand-built JSON body is acceptable — that's still
OTLP, and it composes with everything else in the user's pipeline.

If the language *does* have an SDK but it doesn't load in this particular
runtime (bundler, edge, restricted FFI), the same shim approach applies.
The Supabase Edge skill is one worked example.

## Auto-instrumentation

Where the language has a packaged auto-instrumentation story, use it as the
floor:

- Java: the OpenTelemetry Java agent (`-javaagent:opentelemetry-javaagent.jar`)
- .NET: `OpenTelemetry.Instrumentation.AspNetCore` / `Http` / `SqlClient` etc.
- Ruby: `opentelemetry-instrumentation-all`
- Node: `@opentelemetry/auto-instrumentations-node`
- Go: framework-specific `otelhttp`, `otelgin`, `otelpgx`, `otelsql` wrappers (Go has no global agent)
- PHP: the `open-telemetry/opentelemetry-auto-*` extensions
- Elixir: `:opentelemetry_phoenix`, `:opentelemetry_ecto`, `:opentelemetry_cowboy`

Then add custom spans, metrics, and logs around business operations the
auto-instrumentation can't see — the operations a human operator would
actually want to inspect when something looks wrong.
