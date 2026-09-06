CREATE TABLE "account_deletions" (
	"user_id" bigint PRIMARY KEY NOT NULL,
	"gate_user_id" varchar(255),
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "gate_user_id" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "gate_provisioned_at" timestamp with time zone;--> statement-breakpoint
CREATE UNIQUE INDEX "users_gate_user_id_key" ON "users" USING btree ("gate_user_id");