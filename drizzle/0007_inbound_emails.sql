CREATE TABLE "inbound_emails" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"email_id" varchar(128) NOT NULL,
	"user_id" bigint,
	"sender" varchar(255) DEFAULT '' NOT NULL,
	"subject" varchar(512) DEFAULT '' NOT NULL,
	"status" varchar(32) NOT NULL,
	"detail" varchar(255),
	"dmarc" varchar(16),
	"books" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"highlights" bigint DEFAULT 0 NOT NULL,
	"clippings_created" bigint DEFAULT 0 NOT NULL,
	"notes_created" bigint DEFAULT 0 NOT NULL,
	"attempts" bigint DEFAULT 1 NOT NULL,
	"received_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "inbound_emails_email_id_key" ON "inbound_emails" USING btree ("email_id");--> statement-breakpoint
CREATE INDEX "inbound_emails_user_id_received_at_idx" ON "inbound_emails" USING btree ("user_id","received_at");--> statement-breakpoint
CREATE INDEX "inbound_emails_unverified_received_at_idx" ON "inbound_emails" USING btree ("received_at") WHERE "inbound_emails"."user_id" is null;--> statement-breakpoint
CREATE INDEX "inbound_emails_unverified_sender_idx" ON "inbound_emails" USING btree ("sender") WHERE "inbound_emails"."user_id" is null;