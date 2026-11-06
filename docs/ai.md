# AI features

Three Premium features write about a reader's library. Each one renders as designed typography, not
as a block of model text, and fills in field by field while the model writes.

| Feature         | Where                              | Route                        | Output schema           |
| --------------- | ---------------------------------- | ---------------------------- | ----------------------- |
| Book summary    | Book page, for the book's owner    | `/api/v2/ai/book`            | `bookSummarySchema`     |
| Passage note    | Clipping page                      | `/api/v2/ai/passage`         | `passageNoteSchema`     |
| Recommendations | "What to read next" on the library | `/api/v2/ai/recommendations` | `recommendationsSchema` |

`personalityByAI`, `aiEnhanceComment` and `Clipping.aiSummary` in GraphQL use the same prompts and
model code and still return text. No other client (iOS, CLI) calls the REST routes.

## How a result is made

1. **The client sends ids, not content.** `useAIObject` posts the AG-UI envelope with `forwardedProps`
   such as `{ bookId, force }`. The server loads the highlights and book details itself, so a reader
   cannot put anything else into a prompt or a stored result.
2. **`resultStream` looks for a stored result.** A hit replays as the same events a live run ends
   with, so the client handles one shape. A page view reads the store directly and never calls the
   model.
3. **On a miss it runs `chat({ outputSchema, stream: true })`.** The SDK validates the finished object
   against the schema before sending `structured-output.complete`. Only that object is stored.
4. **`useChat` parses the JSON as it arrives.** `partial` drives the view while the model writes.

## Grounding

The model never writes a quotation. It cites highlights and shelf books by a short `ref`, and the
server sends what each `ref` means in a `clippingkk.ai.context` event before the first word. A `ref`
that matches nothing simply renders no quote. Recommended books show a cover and rating only when
Wenqu has a book with that title and author (`findRecommendedBook`); otherwise they get a plain cover.

## Prompts

Prompts are Markdown files in `src/server/ai/prompts/`. `voice.md` goes first on every request, then
the feature's own file. `index.ts` imports them with `with { type: 'text' }`, which Turbopack inlines
into the server bundle, so nothing reads them from disk in production. Vitest does the same through a
small plugin in `vitest.config.ts`.

To change one:

1. Edit the Markdown. Instructions for a field belong here, not in the Zod schema: a length limit in
   the schema would fail a whole paid run over one long sentence.
2. Run `pnpm ai:eval`, or `pnpm ai:eval book-zh,recs-en` for some cases, and read what it writes. It
   uses public-domain text and costs a few cents. It needs `OPENAI_API_KEY` and `OPENAI_MODEL`.
3. Deploy. `promptVersions` hashes the text into every result's fingerprint, so readers get the new
   writing on their next visit. Editing `voice.md` regenerates everything once.

`{{name}}` fills a placeholder. A placeholder with no value throws rather than reaching the model.

## Caching

Results live in Redis for 30 days, keyed per reader. A result counts only when its fingerprint
matches.

| Feature         | Key                                           | Fingerprint                        |
| --------------- | --------------------------------------------- | ---------------------------------- |
| Book summary    | `ai:book-summary:v2:{user}:{book}`            | The prompt and sampled highlights  |
| Passage note    | `ai:passage-note:v2:{user}:{clipping}:{lang}` | The prompt and passage text        |
| Recommendations | `ai:recommendations:v2:{user}:{lang}`         | The prompt and the 12 shelf titles |

Another highlight in a book already on the shelf keeps the recommendations, and a new book changes
them. Asking again (`force`) sends the previous picks as `avoid`, so the reader gets different books.
A cache failure costs a regeneration, never the result.

## Failure and privacy

- The browser gets one generic `RUN_ERROR` (`AI_GENERATION_FAILED`). Provider text can quote a key
  prefix or the raw reply, so `withSafeErrors` drops it and logs only the provider's error code.
  Look for `AI provider returned an error` and its `error.type`, such as `invalid_api_key`.
- Requests set `store: false`, and reasoning summaries are off: nothing shows them, and OpenAI gates
  them on organization verification.
- Telemetry records counts and outcomes, never a reader's text. `ai.result` covers a request and
  `ai.generate` a model call, with `app.ai.results`, `app.ai.generations` and `llm.tokens.*`.
