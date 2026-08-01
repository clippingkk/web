---
name: superlog-debug
description: "Pull production observability context from the Superlog MCP to ground debugging, incident response, and 'how is this behaving in prod right now?' questions. Triggers whenever the user is investigating a bug, regression, or incident; asking about real traffic, error rates, latency, or throughput; validating a deploy; or wants the recent history of a service."
---

# Superlog production debugging

When the user is investigating something happening in production, **query their actual telemetry before reasoning about the code**. Superlog ingests OpenTelemetry traces, logs, and metrics for the user's services — the answer to "why did this 500?" / "is the deploy healthy?" / "what changed?" is almost always in there.

## When to activate

Activate as soon as the user signals they are looking into real production behavior. Examples:

- "users can't sign in" / "checkout is broken" / "this is 500ing in prod"
- "is the deploy healthy?" / "did my PR regress anything?"
- "what's our p95 on /api/foo right now?" / "how many errors in the last hour?"
- "what's been happening with the worker overnight?"
- An incident channel message, a Sentry/PagerDuty link, an on-call ping.

Skip when:

- The work is local only (worktree dev, tests, type errors, lint).
- The user already pasted the relevant logs / traces / span.
- The question is purely "how is this code structured?" with no prod angle.

## Prerequisite: the Superlog MCP must be installed

The tools below are exposed by the Superlog MCP server. If they are not available in the current agent, install it first.

For **Claude Code**:

```
claude mcp add --transport http superlog https://api.superlog.sh/mcp
```

For **Codex**:

```
codex mcp add superlog --url https://api.superlog.sh/mcp
codex mcp login superlog
```

For **Cursor and others**: copy the `mcpServers` snippet from <https://superlog.sh/> → Connect.

After install, restart the agent and authenticate via the OAuth flow the MCP triggers on first use.

## First call every session

```
superlog.get_active_project
```

If it is not the project the user is debugging, switch:

```
superlog.list_projects
superlog.set_active_project { project_id: "<id>" }
```

You can also pass `project_id` on any individual call without changing session state. If the user has multiple environments wired as separate projects (e.g. `prod` vs `staging`), confirm which one before querying.

## Tool cheatsheet

All query tools default to the active project and to the **last 1 hour**. Override with `range: { since, until }` — both accept ISO-8601 (`"2026-05-28T14:00:00Z"`) or ClickHouse expressions (`"now() - INTERVAL 30 MINUTE"`).

| Tool | Use for |
|---|---|
| `superlog.list_services` | Confirm which services emitted telemetry in the window |
| `superlog.query_logs` | Search log bodies; filter by `service`, `severity`, `resource_attrs`, `log_attrs` |
| `superlog.query_traces` | Find slow/errored spans; filter by `service`, `span_name`, `min_duration_ms`, `status_code`, `span_attrs` |
| `superlog.query_metrics` | Pull recent metric points by `metric_name` + `service` |
| `superlog.list_alerts` / `get_alert` | Check existing alerts that may already cover what the user is seeing |
| `superlog.list_dashboards` / `get_dashboard` | Find an existing dashboard for the affected surface before building queries from scratch |

### `query_logs` tips

- `severity` matches the stored OTel severity text case-insensitively. Use the short forms the SDKs actually emit — `"ERROR"`, `"WARN"`, `"INFO"`, `"DEBUG"` — **not** `"WARNING"`, which matches nothing because the stored text is `WARN`. Filter aggressively — error-only is usually the right starting point during an incident.
- `search` is a case-insensitive substring match on the log body. Cheap and effective for finding a stack trace or a specific message.
- `log_attrs` filters **per-record** attributes (e.g. `event.name`, custom structured fields the app sets on each log).
- `resource_attrs` filters **service-level** attributes from the OTel resource (e.g. `deployment.environment.name=production`, `service.version=1.42.0`). Use the current OTel semconv keys — `deployment.environment.name` superseded the old `deployment.environment`, and apps on recent SDKs only emit the new one. Each entry also accepts an optional `op` of `eq` (default), `neq`, or `not_contains`.
- The response includes a `resource_attrs` map per log, so you can read service / env / version off the result without a second call.
- Logs emitted **outside** any span will have empty `trace_id` / `span_id` strings — that is expected, not a bug. Don't conclude the trace pipeline is broken just because some logs lack trace context.

### `query_traces` tips

- **HTTP status codes are in `span_attrs`, not in `status_code`.** OTel's `status_code` is the semantic OK/ERROR/UNSET — and by OTel HTTP semconv, only 5xx server responses auto-flip a span to ERROR. To find 4xx responses, use:

  ```
  span_attrs: [{ key: "http.response.status_code", value: "404" }]
  ```

- The `status_code` filter takes the enum form (`STATUS_CODE_OK`, `STATUS_CODE_ERROR`, `STATUS_CODE_UNSET`), but the value the response returns on each span is the title-case form (`"Ok"`, `"Error"`, `"Unset"`) — don't try to equality-match the response against the enum.
- For "slow X requests" use `service` + `span_name` + `min_duration_ms: 1000`.
- For route-level filtering use `span_attrs` with `http.route` (the template, e.g. `/api/users/:id`) — not the raw URL, which has high cardinality.
- For database calls, filter by an HTTP-style client span pointing at the DB host, or by `db.system` if the app's instrumentation emits it (some SDKs don't — check `span_attrs` on a sample span first).
- Each returned span includes both `span_attrs` and `resource_attrs`, so you can read the service version, env, and instance off the result directly.

### `query_metrics` tips

- Always pass `metric_name` (and usually `service`). The call works without them but returns whatever was most recently written, which is rarely what you want.
- Each returned point has `kind` (`gauge`/`sum`/`histogram`/`summary`), `metric_name`, `unit`, `service`, plus the per-point `attributes` (the series dimensions — route, status, tenant, etc.) and `resource_attrs`. Use `attributes` to disambiguate which series a point belongs to.
- **gauge/sum** points carry a scalar `value`. **histogram/summary** points have no scalar value: they carry `count` and `sum` instead (and histograms also carry `min`/`max`). So for a histogram, average = `sum / count`, and `value` is `null` — that's expected, read `count`/`sum`/`min`/`max`.
- For rates, pull the underlying counter over two time windows and diff yourself rather than expecting the MCP to compute it. For latency percentiles, build a dashboard widget (the dashboard query layer reconstructs histogram quantiles); the raw `query_metrics` points won't give you p95 directly.

## Investigation playbooks

### "Is X broken in prod right now?"

1. `list_services` over the last 30 minutes — is the service even reporting? Silence is a signal.
2. `query_logs` with `service: "<svc>"`, `severity: "ERROR"`, last 30 minutes. Quote a sample stack trace verbatim to the user.
3. `query_traces` with `service: "<svc>"`, `status_code: "STATUS_CODE_ERROR"` and/or `span_attrs` filtering on `http.response.status_code` to catch 4xx.
4. If errors cluster on a route, pull the slowest recent traces for that route and read `SpanAttributes` for the failing operation (DB statement, downstream URL, exception message).

### "This endpoint is slow"

1. `query_traces` with `service`, plus either `span_name` or `span_attrs: [{ key: "http.route", value: "/api/foo" }]`, plus `min_duration_ms: 1000`, last hour.
2. Sort/eyeball the slowest spans and expand `span_attrs` (and `resource_attrs` for service version / env). Look for: long DB calls (high duration with `http.host` pointing at the DB or `db.system` set), downstream HTTP fanout, queue waits.
3. If you find a slow child operation, re-query that span name directly to see if it is globally slow or just slow on this route.

### "Did my deploy regress anything?"

1. Note the deploy timestamp (ask the user if not obvious).
2. `query_logs` `severity: "ERROR"` for the affected service across two equal windows: one before, one after. Compare counts and unique error signatures.
3. `query_metrics` for the request rate, error rate, and latency metrics over both windows.
4. `query_traces` `status_code: "STATUS_CODE_ERROR"` post-deploy, scoped by `resource_attrs: [{ key: "service.version", value: "<new-version>" }]` if the app tags releases. The returned spans carry `resource_attrs`, so you can confirm which version emitted each error.

### "What was this service doing overnight?"

1. `list_services` with the overnight `range` to confirm continuous reporting.
2. `query_logs` `severity: "ERROR"` then `severity: "WARN"` across the window — read for clusters and time-of-day patterns.
3. `query_metrics` on the service's key business counters to spot drops or spikes.

### "Are users hitting this code path?"

1. `query_traces` with `service` + `span_name` (or `span_attrs` filtering on a custom business attribute like `feature.flag` or `tenant.id`).
2. If counts are zero, double-check the span name and attribute keys against the source — typos here are the #1 cause of false negatives.

## Output discipline

- **Lead with the finding**, not the methodology. "47 ERROR logs in `api` in the last 15 min, all `TimeoutError` from `db.query`" beats a paragraph about which tool you called.
- **Quote real evidence**: timestamps, trace IDs, span IDs, exact error messages. The user should be able to pivot from your answer into the Superlog UI for any of them.
- **State the window**: "in the last 30 min" / "since 14:00 UTC". A finding without a window is not actionable.
- **Distinguish zero from unknown**. "Zero matching spans" means the query ran and returned nothing — call that out explicitly. "I couldn't query because the active project isn't this service's project" is a different sentence; say so.
- **Don't over-recommend**. If telemetry shows the service is healthy, say so plainly and stop. Don't manufacture a "next step" to look busy.

## Pairing with other context

The Superlog MCP only sees what the user's apps export as OpenTelemetry. It does **not** see:

- Row-level database state — query the DB directly (or via a Postgres/MySQL MCP if installed).
- Cloud-provider host/container logs that never made it into the OTel pipeline (CloudWatch, GCP Logging, Fly logs, Railway logs, etc.).
- Queue depth (SQS, RabbitMQ, …) unless the app explicitly emits a metric for it.
- Anything the app simply never instrumented.

If the MCP returns nothing for a service, **don't conclude the service is silent** — first check whether telemetry is reaching ingest at all. A missing/misconfigured exporter, a wrong `service.name`, or a project-mismatched ingest key all show up as "MCP sees nothing" even when the service is alive and noisy at the host level. The `superlog-onboard` skill covers the install side if the user needs to fix that.

One specific failure to rule out first: **every ingest request is 401-ing even though the token is valid.** The token is sent under the wrong header name. Ingest reads the token only from `x-api-key: <token>` or `Authorization: Bearer <token>` (literal `Bearer ` prefix required); anything else — `api-key`, `x-superlog-token`, or `Authorization: <token>` without `Bearer ` — returns 401 on every request, so the install looks broken when the key is actually fine. A quick way to confirm the key works independently of the app's exporter config:

```bash
curl -i -X POST https://intake.superlog.sh/v1/traces \
  -H "x-api-key: sl_public_..." \
  -H "content-type: application/json" --data '{"resourceSpans":[]}'
# 2xx → key is valid; the app is sending the wrong header. Fix the exporter to use x-api-key.
# 401 → the token itself is wrong/revoked.
```

## Hard rules

- **Read-only by default.** `query_*` and `list_*` calls are safe. `create_alert`, `update_dashboard`, `delete_*`, etc. mutate the user's account — never invoke those without an explicit ask, and even then confirm the exact change first.
- **Don't echo full ingest tokens or secrets** that show up in span/log attributes back to chat. Truncate if you must reference them.
- **Don't switch the active project silently.** If you call `set_active_project`, tell the user you did and why.
- **Match the scope of the question.** A user asking "is prod ok?" wants a 2-line answer, not a 12-query sweep. Escalate depth only as the investigation requires it.
