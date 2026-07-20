CREATE TABLE IF NOT EXISTS "clippings" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"title" varchar(1024) NOT NULL,
	"content" text NOT NULL,
	"book_id" varchar(255) DEFAULT '' NOT NULL,
	"page_at" varchar(255) DEFAULT '' NOT NULL,
	"data_id" varchar(255) NOT NULL,
	"seq" bigint DEFAULT 0 NOT NULL,
	"created_by" bigint NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"nouns" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"source" bigint DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "collections" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"clip_id" bigint NOT NULL,
	"user_id" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "comments" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"belongs_to" bigint NOT NULL,
	"created_by" bigint NOT NULL,
	"content" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"reply_to" bigint DEFAULT -1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "devices" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"device_id" varchar(255) NOT NULL,
	"device_name" varchar(255) NOT NULL,
	"app_version" varchar(255) NOT NULL,
	"ios_device_token" varchar(255) NOT NULL,
	"os" varchar(32) NOT NULL,
	"os_version" varchar(255) NOT NULL,
	"user_id" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "external_accounts" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigint NOT NULL,
	"wechat_openid" varchar(255) DEFAULT '' NOT NULL,
	"wechat_unionid" varchar(255) DEFAULT '' NOT NULL,
	"github_access_token" varchar(1024) DEFAULT '' NOT NULL,
	"apple_unique" varchar(255) DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nfts" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"address" varchar(255) NOT NULL,
	"owner" bigint NOT NULL,
	"chain" varchar(32) NOT NULL,
	"nfts" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nouns" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"noun" varchar(64) NOT NULL,
	"book_id" varchar(255) DEFAULT '' NOT NULL,
	"clipping_id" bigint DEFAULT -1 NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"updaters" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"scope" bigint DEFAULT 0 NOT NULL,
	"user_nouns" bigint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "orders" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"order_id" varchar(255) NOT NULL,
	"sku" varchar(255) NOT NULL,
	"subscription_id" varchar(255) DEFAULT '' NOT NULL,
	"stripe_customer_id" varchar(255) NOT NULL,
	"order_created_at" timestamp with time zone DEFAULT now(),
	"amount" real NOT NULL,
	"currency" varchar(32) NOT NULL,
	"user_orders" bigint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reactions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"symbol" varchar(255) NOT NULL,
	"creator" bigint NOT NULL,
	"target" bigint DEFAULT 0 NOT NULL,
	"target_id" bigint DEFAULT -1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_connects" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"owner" bigint NOT NULL,
	"target" bigint NOT NULL,
	"connect_type" bigint DEFAULT 0 NOT NULL,
	"reason" varchar(255) DEFAULT 'user will' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(255) DEFAULT '' NOT NULL,
	"pwd" varchar(255) NOT NULL,
	"avatar" varchar(1024) DEFAULT '' NOT NULL,
	"checked" boolean NOT NULL,
	"bio" varchar(2048) DEFAULT '' NOT NULL,
	"domain" varchar(255) DEFAULT '' NOT NULL,
	"stripe_customer_id" varchar(255) DEFAULT '' NOT NULL,
	"premium_end_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "web3_addresses" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"address" varchar(255) NOT NULL,
	"user_address" bigint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "web_hook_records" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"request_method" varchar(16) DEFAULT 'GET' NOT NULL,
	"request_url" varchar(2048) NOT NULL,
	"request_headers" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"request_body" text DEFAULT '' NOT NULL,
	"request_ip" varchar(255) DEFAULT '' NOT NULL,
	"response_status" bigint DEFAULT 0 NOT NULL,
	"response_headers" text DEFAULT '{}' NOT NULL,
	"response_body" text DEFAULT '' NOT NULL,
	"start_time" timestamp with time zone DEFAULT now() NOT NULL,
	"end_time" timestamp with time zone DEFAULT now() NOT NULL,
	"error_message" varchar(2048) DEFAULT '' NOT NULL,
	"web_hook_records" bigint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "web_hooks" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"owner" bigint NOT NULL,
	"step" bigint NOT NULL,
	"hook_url" varchar(2048) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "clipping_data_iduq" ON "clippings" USING btree ("data_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "clippings_created_by_idx" ON "clippings" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "clippings_book_id_idx" ON "clippings" USING btree ("book_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "external_accounts_user_id_key" ON "external_accounts" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "nfts_address_chain_key" ON "nfts" USING btree ("address","chain");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_connects_owner_target_connect_type_key" ON "user_connects" USING btree ("owner","target","connect_type");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "web3_addresses_address_key" ON "web3_addresses" USING btree ("address");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "web_hooks_owner_step_key" ON "web_hooks" USING btree ("owner","step");
