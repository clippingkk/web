-- PGroonga ships with ghcr.io/rawback-app/db, the PostgreSQL production runs (docs/database.md).
-- Creating it needs a superuser; on a database that already has it this is a no-op for any role.
CREATE EXTENSION IF NOT EXISTS pgroonga;--> statement-breakpoint
-- IF NOT EXISTS so that a large table can be indexed CONCURRENTLY ahead of `pnpm db:migrate`,
-- which runs in a transaction and would otherwise block writes to it while the index builds.
CREATE INDEX IF NOT EXISTS "clippings_search_pgroonga" ON "clippings" USING pgroonga ((array["title"::text, "content"])) WITH (tokenizer='TokenBigramSplitSymbolAlphaDigit');--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_search_pgroonga" ON "users" USING pgroonga ((array["name"::text, "domain"::text])) WITH (tokenizer='TokenBigramSplitSymbolAlphaDigit');
