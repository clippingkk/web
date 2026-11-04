CREATE TABLE "book_comments" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"book_id" varchar(255) NOT NULL,
	"created_by" bigint NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE INDEX "book_comments_book_id_id_idx" ON "book_comments" USING btree ("book_id","id");--> statement-breakpoint
CREATE INDEX "book_comments_created_by_idx" ON "book_comments" USING btree ("created_by");