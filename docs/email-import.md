# Email import (Kindle notebook exports)

Readers can email a Kindle notebook export to ClippingKK. The Kindle app on iPhone and iPad sends
one as an HTML attachment, with a subject like
`iPhone Notebook export for 经略幽燕：宋辽战争军事灾难的战略分析 (曾瑞龙)`. Its highlights become
the reader's clippings, and the notes they typed go to `reader_notes`, shown under
Settings → Notes.

- **Inbound mail:** [Resend receiving](https://resend.com/docs/dashboard/receiving/create-receiving-webhook).
  Resend accepts the mail and calls `POST /api/v3/inbound/resend` with an `email.received` event.
- **Who it imports for:** only a sender address the reader has bound and verified under
  Settings → Email import (`/dash/<you>/settings/email`). Mail from any other address is logged as
  an error and dropped. Nothing is ever sent back to the sender.

## Flow

1. Resend posts `email.received` to `/api/v3/inbound/resend` (`src/server/email-import/webhook.ts`).
   - The event carries the envelope and attachment metadata, but not the file.
   - The route checks the Svix signature with `RESEND_WEBHOOK_SECRET`. A bad signature gets `401`.
   - It queues a BullMQ job `import-email` with the id `email-import-<email_id>`, so a redelivery
     doesn't import twice, then answers `200`.
2. The worker runs `importEmail` (`src/server/email-import/import.ts`):
   1. It ignores mail not addressed to `INBOUND_EMAIL_ADDRESS`, when that is set.
   2. It looks up the sender with `findVerifiedBinding`. With no verified binding it logs
      `Email import sender is not bound to any reader` (ERROR, sender masked) and stops.
   3. It loads the email from Resend. If the `Authentication-Results` header says `dmarc=fail`, it
      drops the mail.
   4. It downloads up to 5 HTML attachments (10 MB each). If there are none, it reads the HTML body.
   5. It parses each one with `parseKindleNotebook` (`kindle-notebook.ts`).
   6. It saves the highlights through `insertClippings` (`src/server/clippings/create.ts`), the
      same path as the `createClippings` mutation, and saves the notes to `reader_notes`.
3. Permanent problems (unbound sender, no notebook, failed DMARC) end the job. Transient ones
   (Resend or download errors, database) throw, and the job retries 5 times with exponential
   backoff starting at 30s.

### How a notebook becomes clippings

- **Title:** the export's `bookTitle`, cut at the first `(` like the My Clippings.txt importer, so
  both name a book the same way.
- **Book:** the reader's most recent same-title clipping that matched a book. Failing that, the
  first Wenqu search hit. Failing that, `'0'` (unmatched).
- **`pageAt`:** the page number when the heading has one, else `#<location>`, the same format as
  the .txt importer.
- **`createdAt`:** the time Resend received the email, plus the entry's index in milliseconds, so
  the export's order is kept.
- **Visibility:** public, the same default as the upload page.
- **Duplicates are skipped** when either is true:
  - the same content and `pageAt` already exist (the `data_id` unique index), or
  - a same-title clipping with the same text already exists, deleted ones included. The .txt
    export writes location ranges (`#197-199`) where the HTML has only the start (`#197`), so this
    second check is what stops a .txt import followed by an email import from doubling up.
- **Highlight or note:** a heading with a colour span (`annotation_*`/`highlight_*`) is a highlight.
  A heading without one is a note. A heading with no text after it is a bookmark, and is skipped.
- **Linking a note:** a note is linked (`clipping_id`) to the highlight directly before it, unless
  a chapter heading or a bookmark comes between. This is a heuristic.

## Sender addresses

`src/server/email-import/bindings.ts`, with REST routes under `/api/v3/email-bindings` (cookie
session only).

- **Limit:** at most 10 addresses per reader, pending ones included. Addresses are compared
  lowercased and exactly, so `you+kindle@…` is a different address from `you@…`.
- **Adding:** adding an address mails a 6-digit code to it (`sendEmailBindingCode`).
  - Adding a pending address again sends a fresh code.
  - Sending is limited to 5 per reader and 3 per address per hour.
- **Codes:**
  - A code expires after 30 minutes and allows 5 attempts.
  - It is stored as a sha256. That hash is not what protects it; the expiry and the attempt cap are.
- **Ownership:** a verified address belongs to one reader. A partial unique index on
  `email_bindings(email) WHERE verified_at IS NOT NULL` enforces this.
- **Account deletion:** deleting an account deletes its bindings and notes.

| Route | Purpose |
|---|---|
| `GET /api/v3/email-bindings` | The reader's addresses |
| `POST /api/v3/email-bindings` `{ email }` | Add an address, or re-send its code |
| `POST /api/v3/email-bindings/:id/verify` `{ code }` | Verify an address |
| `DELETE /api/v3/email-bindings/:id` | Remove an address |

Errors carry a `code` (`EMAIL_ALREADY_BOUND`, `TOO_MANY_EMAIL_BINDINGS`, `INVALID_CODE`, …). The
settings page maps each code to a translated message.

## Setup

1. Run the migration **before** deploying: `pnpm db:migrate`, which adds
   `drizzle/0006_email_import.sql`. The startup schema check exits when `email_bindings` or
   `reader_notes` is missing.
2. In Resend, set up receiving:
   - Use a receiving domain, ideally a dedicated subdomain rather than the sending
     `no-reply-clippingkk` one, or the `<id>.resend.app` address Resend gives you.
   - Add a webhook for the event `email.received` pointing at
     `https://<APP_ORIGIN>/api/v3/inbound/resend`.
3. Configure:

```dotenv
RESEND_API_KEY=re_...                       # also used to fetch received mail and attachments
RESEND_WEBHOOK_SECRET=whsec_...             # the webhook's signing secret
INBOUND_EMAIL_ADDRESS=kindle@import.example # shown to readers; other recipients are ignored
```

Without `RESEND_API_KEY` or `RESEND_WEBHOOK_SECRET`, the webhook answers `503` and Resend
retries. Without `INBOUND_EMAIL_ADDRESS`, the settings page says email import isn't available.

## Limits

- Anyone can forge a From header. The DMARC check stops mail whose own domain rejects it.
  Otherwise, a forger who knows a reader's bound address can add highlights to that reader's
  library.
- The worker shares one queue (default concurrency 1) with exports, so an import can wait behind
  a long Notion export.
- Notes are listed, newest first, on a plain settings page for now (the latest 100).
