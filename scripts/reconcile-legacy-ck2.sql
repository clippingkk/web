-- One-off reconciliation of the production `ck2` database with the Drizzle baseline.
--
-- `ck2` was created by the legacy Go/Ent backend and predates drizzle/0000_wealthy_clea.sql,
-- so it carries Ent naming (`create_time`, `web3addresses`) and Ent's convention of
-- supplying every value from application code instead of using column defaults.
-- drizzle-kit never ran against it: there is no `drizzle.__drizzle_migrations` ledger.
--
-- Because 0000 uses CREATE TABLE IF NOT EXISTS, running `pnpm db:migrate` first would
-- adopt the Ent tables untouched and additionally create an empty `web3_addresses`
-- shadowing the real data. This script brings `ck2` up to the 0000 baseline so that
-- `pnpm db:migrate` then applies 0000-0003 exactly as designed.
--
-- This is NOT a migration. It must never run against a database created from 0000.
-- Run once, against production only:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/reconcile-legacy-ck2.sql

BEGIN;

-- Ent column names -> Drizzle names.
ALTER TABLE devices       RENAME COLUMN create_time TO created_at;
ALTER TABLE devices       RENAME COLUMN update_time TO updated_at;
ALTER TABLE nfts          RENAME COLUMN create_time TO created_at;
ALTER TABLE nfts          RENAME COLUMN update_time TO updated_at;
ALTER TABLE nouns         RENAME COLUMN create_time TO created_at;
ALTER TABLE nouns         RENAME COLUMN update_time TO updated_at;
ALTER TABLE orders        RENAME COLUMN create_time TO created_at;
ALTER TABLE orders        RENAME COLUMN update_time TO updated_at;
ALTER TABLE user_connects RENAME COLUMN create_time TO created_at;
ALTER TABLE user_connects RENAME COLUMN update_time TO updated_at;
ALTER TABLE web3addresses RENAME COLUMN create_time TO created_at;
ALTER TABLE web3addresses RENAME COLUMN update_time TO updated_at;

-- web_hook_records already carries created_at/updated_at; the Ent pair duplicates them
-- to within a millisecond. Drizzle does not know about them, so it omits them on insert
-- and their NOT NULL without default rejects every write.
ALTER TABLE web_hook_records DROP COLUMN create_time;
ALTER TABLE web_hook_records DROP COLUMN update_time;

-- Ent table name -> Drizzle name, indexes included so 0000 does not create duplicates.
ALTER TABLE web3addresses RENAME TO web3_addresses;
ALTER INDEX web3addresses_pkey        RENAME TO web3_addresses_pkey;
ALTER INDEX web3addresses_address_key RENAME TO web3_addresses_address_key;

ALTER INDEX nfts_address_chain                     RENAME TO nfts_address_chain_key;
ALTER INDEX userconnects_owner_target_connect_type RENAME TO user_connects_owner_target_connect_type_key;
ALTER INDEX webhook_owner_step                     RENAME TO web_hooks_owner_step_key;

-- Defaults the Drizzle schema assumes. For an omitted column drizzle emits the literal
-- DEFAULT keyword rather than injecting now(), so a NOT NULL column without a database
-- default rejects every insert with 23502.
ALTER TABLE clippings        ALTER COLUMN created_at SET DEFAULT now(), ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE collections      ALTER COLUMN created_at SET DEFAULT now(), ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE comments         ALTER COLUMN created_at SET DEFAULT now(), ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE devices          ALTER COLUMN created_at SET DEFAULT now(), ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE nfts             ALTER COLUMN created_at SET DEFAULT now(), ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE nouns            ALTER COLUMN created_at SET DEFAULT now(), ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE orders           ALTER COLUMN created_at SET DEFAULT now(), ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE reactions        ALTER COLUMN created_at SET DEFAULT now(), ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE user_connects    ALTER COLUMN created_at SET DEFAULT now(), ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE users            ALTER COLUMN created_at SET DEFAULT now(), ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE web3_addresses   ALTER COLUMN created_at SET DEFAULT now(), ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE web_hook_records ALTER COLUMN created_at SET DEFAULT now(), ALTER COLUMN updated_at SET DEFAULT now();

ALTER TABLE orders           ALTER COLUMN order_created_at SET DEFAULT now();
ALTER TABLE web_hook_records ALTER COLUMN start_time SET DEFAULT now(), ALTER COLUMN end_time SET DEFAULT now();

ALTER TABLE nfts             ALTER COLUMN nfts            SET DEFAULT '[]'::jsonb;
ALTER TABLE nouns            ALTER COLUMN updaters        SET DEFAULT '[]'::jsonb;
ALTER TABLE web_hook_records ALTER COLUMN request_headers SET DEFAULT '{}'::jsonb;

-- Nullability the Drizzle schema declares.
ALTER TABLE nouns ALTER COLUMN user_nouns DROP NOT NULL;

ALTER TABLE clippings ALTER COLUMN nouns SET DEFAULT '[]'::jsonb;
UPDATE clippings SET nouns = '[]'::jsonb WHERE nouns IS NULL;
ALTER TABLE clippings ALTER COLUMN nouns SET NOT NULL;

COMMIT;
