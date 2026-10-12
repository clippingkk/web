# Email import (Kindle notebook exports)

Readers can email a Kindle notebook export to ClippingKK. The Kindle app on iPhone and iPad sends
one as an HTML attachment, with a subject like
`iPhone Notebook export for 经略幽燕：宋辽战争军事灾难的战略分析 (曾瑞龙)`. Its highlights become
the reader's clippings, and the notes they typed go to `reader_notes`, shown under
Settings → Notes.

- **Inbound mail:** [Resend receiving](https://resend.com/docs/dashboard/receiving/create-receiving-webhook).
  Resend accepts the mail and calls `POST /api/v3/inbound/resend` with an `email.received` event.
- **Who it imports for:** only a sender address the reader has bound and verified under
  Settings → Email import (`/dash/<you>/settings/email`).
- **Any other sender** gets nothing imported. The unbound sender is logged as an error, and the
  sender gets a reply with the notebook attached as a JSON file
  ([Replies to unverified senders](#replies-to-unverified-senders)).
- **Every email the worker handles is recorded** in `inbound_emails`, with what became of it
  ([Email history](#email-history)). An event the webhook can't read never reaches the worker and
  is only logged.

## Flow

1. Resend posts `email.received` to `/api/v3/inbound/resend` (`src/server/email-import/webhook.ts`).
   - The event carries the envelope and attachment metadata, but not the file.
   - The route checks the Svix signature with `RESEND_WEBHOOK_SECRET`. A bad signature gets `401`.
   - It queues a BullMQ job `import-email` with the id `email-import-<email_id>`, so a redelivery
     doesn't import twice, then answers `200`.
2. The worker runs `importEmail` (`src/server/email-import/import.ts`):
   1. It ignores mail not addressed to `INBOUND_EMAIL_ADDRESS`, and all mail while that is unset.
   2. It looks up the sender with `findVerifiedBinding`. With no verified binding:
      - it logs `Email import sender is not bound to any reader` (ERROR, sender masked);
      - it stops there, before any call to Resend or any download, when the sender has used up its
        replies (a read-only check, so it spends nothing) or the day's 1,000 fetches of strangers'
        mail are spent.
   3. It loads the email from Resend.
      - It reads the DMARC result from the `Authentication-Results` headers
        (`src/server/email-import/authentication.ts`) and counts it (`pass`, `fail`, `none`, …,
        or `absent`) in the `app.email_import.authentication` metric. The parsing is strict:
        - every header differing only in case is read;
        - comments and quoted strings are ignored, and only a `dmarc=` that starts a result counts;
        - if several results are found, any one that isn't a pass wins;
        - with `EMAIL_IMPORT_AUTHSERV_ID` set, results stamped by any other server are ignored.
      - Only `dmarc=pass` goes on. Anything else (`fail`, `none`, `temperror`, …, or no result)
        drops the mail: nothing is imported and nothing is answered. Setting
        `EMAIL_IMPORT_ALLOW_MISSING_DMARC=1` also lets through mail that has no result.
   4. It downloads the HTML attachments. If there are none, it reads the HTML body.
      - Verified sender: up to 5 attachments, 10 MB each.
      - Any other sender: 1 attachment, up to 5 MB.
   5. It parses each one with `parseKindleNotebook` (`kindle-notebook.ts`). An email with no
      notebook is dropped and answered with nothing.
   6. **Verified sender:** it saves the highlights through `insertClippings`
      (`src/server/clippings/create.ts`), the same path as the `createClippings` mutation, and saves
      the notes to `reader_notes`.
   7. **Any other sender:** it replies with the notebook as JSON, within the limits below.
3. Permanent problems (no notebook, failed DMARC, a reply limit) end the job. Transient ones
   (Resend or download errors, database) throw, and the job retries 5 times with exponential
   backoff starting at 30s.
4. Every attempt, finished or thrown, is written to `inbound_emails` (below).

### Replies to unverified senders

`src/server/email-import/reply.ts`. Pending (unverified) bindings count as unverified.

- **The reply:**
  - Sent from `MAIL_FROM`, threaded with `In-Reply-To` on the received message.
  - A short English and Chinese note saying nothing was imported and how to bind the address.
  - The attachment is `<book title>.json`, or `kindle-notebook.json` for several books:

    ```json
    {
      "clippings": [{ "title", "author", "content", "pageAt", "createdAt" }],
      "notes": [{ "title", "author", "content", "pageAt" }]
    }
    ```

    The fields are the ones the import would store: `createdAt` is the email's receive time plus
    the entry's index in milliseconds.
- **Limits:** only an email that is actually answered counts, so forged and notebook-less mail
  spend nobody's allowance. That means it passed DMARC and held a notebook.
  - Before fetching, a sender that has used up its replies is turned away by a read-only check.
  - A separate cap of 1,000 fetches a day of strangers' mail bounds the work done for them.
  - An email counts once, even when its job is retried.
  - All three counters are checked before any is bumped. A full global allowance therefore doesn't
    use up a sender's own, and a sender at its limit doesn't use up the global one.
  - Counters are kept in Redis per UTC day and month, under a hash of the sender's address.
  - Over a limit, nothing is fetched or sent, and a WARN with `reply.limit` is logged.

  | Limit | Value |
  |---|---|
  | Per sender address, per day | 5 |
  | Per sender address, per month | 30 |
  | All senders together, per day | 500 |
  | Strangers' emails fetched, per day | 1,000 |
- **Duplicates:** a retried job resends with the same Resend idempotency key, so the reader gets one
  reply.

### How a notebook becomes clippings

- **Title:** the export's `bookTitle`, cut at the first `(` like the My Clippings.txt importer, so
  both name a book the same way.
- **Book:** the reader's most recent same-title clipping that matched a book. Failing that, the
  first Wenqu search hit whose title contains the notebook's title, or the other way round
  (ignoring case, spacing and punctuation). Failing that, `'0'` (unmatched, fixable from the book
  page): leaving clippings unmatched is better than filing them under the wrong book.
- **`pageAt`:** the page number when the heading has one, else `#<location>`, the same format as
  the .txt importer.
- **`createdAt`:** the time Resend received the email, plus the entry's index in milliseconds, so
  the export's order is kept.
- **Visibility:** public, the same default as the upload page.
- **Duplicates are skipped** when either is true:
  - the same content and `pageAt` already exist (the `data_id` unique index), or
  - a same-title clipping with the same text already exists, deleted ones included. The .txt
    export writes location ranges (`#197-199`) where the HTML has only the start (`#197`), so this
    second check is what stops a .txt import followed by an email import from doubling up. It
    also means a highlight whose exact text recurs on another page of the same book is kept once.
- **Highlight or note:** a heading with a colour span (`annotation_*`/`highlight_*`) is a highlight.
  A heading without one is a note. A heading with no text after it is a bookmark, and is skipped.
- **Linking a note:** a note is linked (`clipping_id`) to the highlight directly before it, unless
  a chapter heading or a bookmark comes between. This is a heuristic.

## Email history

`src/server/email-import/records.ts`. `importEmail` keeps one row per Resend `email_id` in
`inbound_emails`, updated after every attempt:

- **What a row holds:** the sender (the full normalized address, or the raw From header when it
  holds none), the subject, when Resend received it, the status, the DMARC result, the notebook
  titles, the highlight count, and how many clippings and notes were created.
- **Status:** the attempt's outcome (`imported`, `replied`, `reply_limited`, `not_addressed`,
  `unreadable_sender`, `failed_authentication`, `missing`, `no_notebook`). A thrown attempt is
  `retrying`, or `failed` on the last of the 5; `detail` then holds the error's first line.
  `detail` also names the reply limit that stopped a stranger.
- **Retries:** a later attempt overwrites the status, and its created counts add to the earlier
  ones, since saving a notebook isn't one transaction.
- **Best effort:** a failure to write the row is logged as a WARN and never fails or repeats an
  import.
- **`user_id`** is the reader whose **verified** address sent the email, found when the attempt
  ran. Mail from a pending address has none, since anyone can claim an address.
- **Readers** see their latest 50 under Settings → Email import, without `detail`. Mail forged in
  their name that failed DMARC shows up there too, which is how they learn why it wasn't imported.
- **Administrators** see every row without a reader, with the details, at
  `/dash/<you>/admin/inbound-emails`.
- **Retention:** rows are kept until account deletion. Deleting an account deletes its rows and
  the reader-less rows from its verified addresses. Strangers' rows are never purged.

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
  `email_bindings(email) WHERE verified_at IS NOT NULL` enforces this. Adding an address someone
  else holds still mails a code. The `EMAIL_ALREADY_BOUND` refusal only comes at verify time, to
  someone who proved they own the address, so the add step can't be used to probe which addresses
  are bound.
- **Account deletion:** deleting an account deletes its bindings, its notes and its email history
  ([Email history](#email-history)).

| Route | Purpose |
|---|---|
| `GET /api/v3/email-bindings` | The reader's addresses |
| `POST /api/v3/email-bindings` `{ email }` | Add an address, or re-send its code |
| `POST /api/v3/email-bindings/:id/verify` `{ code }` | Verify an address |
| `DELETE /api/v3/email-bindings/:id` | Remove an address |

Errors carry a `code` (`EMAIL_ALREADY_BOUND`, `TOO_MANY_EMAIL_BINDINGS`, `INVALID_CODE`, …). The
settings page maps each code to a translated message.

## Setup

1. Run the migrations **before** deploying: `pnpm db:migrate`, which adds
   `drizzle/0006_email_import.sql` and `drizzle/0007_inbound_emails.sql`. The startup schema check
   exits when `email_bindings`, `reader_notes` or `inbound_emails` is missing.
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
EMAIL_IMPORT_ALLOW_MISSING_DMARC=0          # 1 also imports mail with no DMARC result
EMAIL_IMPORT_AUTHSERV_ID=mx.resend.com      # whatever Resend's own header starts with
```

Without `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET` or `INBOUND_EMAIL_ADDRESS`, the webhook answers
`503` and Resend retries. Without `INBOUND_EMAIL_ADDRESS`, the settings page also says email import
isn't available.

After deploying, send yourself a notebook export and open the received email's headers in the
Resend dashboard:

- **If it has an `Authentication-Results` header**, set `EMAIL_IMPORT_AUTHSERV_ID` to the first
  word of its value (the server that stamped it). Results from any other server are then ignored,
  including a fake header a sender wrote into their own message.
- **If it has none**, nothing will import, and `app.email_import.authentication` shows
  `dmarc="absent"`. Imports only resume with `EMAIL_IMPORT_ALLOW_MISSING_DMARC=1`; read the limits
  below before you set it.

## Limits

- Anyone can forge a From header, and the From address is the only credential. Only a DMARC pass
  is accepted, which stops forgeries even from domains without a DMARC policy. The cost is that a
  reader whose own domain publishes no DMARC record can't import until it does. Major providers
  such as iCloud, Gmail and Outlook publish one.
- With `EMAIL_IMPORT_ALLOW_MISSING_DMARC=1`, mail with no DMARC result is accepted and logged as
  a WARN each time. A forger who knows a reader's bound address could then add highlights to their
  library, and anyone could have a JSON reply sent to an address they type in, within the reply
  limits.
- ClippingKK only sees the headers Resend chooses to expose. It can't tell a forged
  `Authentication-Results` header from a real one if Resend drops its own header and keeps only
  the sender's. Pinning `EMAIL_IMPORT_AUTHSERV_ID` closes that gap as long as Resend removes
  sender-written headers that claim its own name, which RFC 8601 requires of receiving servers.
- A spam wave from many addresses can use up the day's 1,000 fetches of strangers' mail. After
  that, unverified senders get no reply that day. Verified readers are unaffected.
- The worker shares one queue (default concurrency 1) with exports, so an import can wait behind
  a long Notion export.
- Notes are listed, newest first, on a plain settings page for now (the latest 100).
