CREATE TABLE "account_recovery_audit" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigint NOT NULL,
	"gate_user_id" varchar(255) NOT NULL,
	"ticket" varchar(255) NOT NULL,
	"operator" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
