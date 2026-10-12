CREATE TABLE "email_bindings" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigint NOT NULL,
	"email" varchar(255) NOT NULL,
	"verified_at" timestamp with time zone,
	"code_hash" varchar(64),
	"code_expires_at" timestamp with time zone,
	"code_attempts" bigint DEFAULT 0 NOT NULL,
	"last_imported_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reader_notes" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigint NOT NULL,
	"clipping_id" bigint,
	"title" varchar(1024) NOT NULL,
	"page_at" varchar(255) DEFAULT '' NOT NULL,
	"content" text NOT NULL,
	"data_id" varchar(64) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "email_bindings_user_id_email_key" ON "email_bindings" USING btree ("user_id","email");--> statement-breakpoint
CREATE UNIQUE INDEX "email_bindings_verified_email_key" ON "email_bindings" USING btree ("email") WHERE "email_bindings"."verified_at" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "reader_notes_data_id_key" ON "reader_notes" USING btree ("data_id");--> statement-breakpoint
CREATE INDEX "reader_notes_user_id_idx" ON "reader_notes" USING btree ("user_id");