CREATE TABLE IF NOT EXISTS "sessions" (
	"created_at" bigint NOT NULL,
	"updated_at" bigint,
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid NOT NULL,
	"account_id" integer NOT NULL,
	"account_public_id" uuid NOT NULL,
	"session_token" varchar(255) NOT NULL,
	"device" varchar(255) NOT NULL,
	"os" varchar(255) NOT NULL,
	"expires_at" bigint NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "created_at" bigint NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "updated_at" bigint;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "public_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "first_name" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "last_name" varchar;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "email" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "email_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "role" varchar DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "password_hash" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "last_login_at" bigint;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "mobile" varchar(20);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "public_id_idx_ses" ON "sessions" USING btree ("public_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "account_id_idx" ON "sessions" USING btree ("account_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "session_token_idx" ON "sessions" USING btree ("session_token");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "expires_at_idx" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "public_id_idx_acc" ON "accounts" USING btree ("public_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "email_idx" ON "accounts" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "role_mobile_idx" ON "accounts" USING btree ("role","mobile") WHERE "accounts"."mobile" is not null;