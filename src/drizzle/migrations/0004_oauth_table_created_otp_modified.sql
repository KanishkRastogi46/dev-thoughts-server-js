CREATE TABLE "oauth_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"provider" text DEFAULT 'google',
	"identifier" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "oauth_users_identifier_unique" UNIQUE("identifier")
);
--> statement-breakpoint
ALTER TABLE "otps" ALTER COLUMN "expires_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "otps" ALTER COLUMN "expires_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "otps" ALTER COLUMN "last_otp_time" DROP DEFAULT;