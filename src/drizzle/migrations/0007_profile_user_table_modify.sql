ALTER TABLE "users" DROP CONSTRAINT "users_country_countries_id_fk";
--> statement-breakpoint
ALTER TABLE "profile" ALTER COLUMN "country" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "country";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "posts";