CREATE TABLE "apple_subscriptions" (
	"original_transaction_id" varchar(64) PRIMARY KEY NOT NULL,
	"user_id" bigint NOT NULL,
	"product_id" varchar(255) NOT NULL,
	"environment" varchar(16) NOT NULL,
	"latest_transaction_id" varchar(64) NOT NULL,
	"app_account_token" uuid,
	"expires_at" timestamp with time zone NOT NULL,
	"grace_period_expires_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"auto_renew" boolean DEFAULT true NOT NULL,
	"transaction_signed_at" timestamp with time zone NOT NULL,
	"renewal_signed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "app_account_token" uuid;--> statement-breakpoint
CREATE INDEX "apple_subscriptions_user_id_idx" ON "apple_subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_app_account_token_key" ON "users" USING btree ("app_account_token");