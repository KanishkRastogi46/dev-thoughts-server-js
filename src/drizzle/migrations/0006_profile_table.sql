CREATE TABLE "profile" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"bio" text,
	"avatar" text,
	"role" text DEFAULT 'user' NOT NULL,
	"country" text,
	"code" text,
	"posts" integer[] DEFAULT '{}',
	"comments" integer[] DEFAULT '{}',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "profile_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "comments" RENAME COLUMN "user" TO "profile";--> statement-breakpoint
ALTER TABLE "posts" RENAME COLUMN "user" TO "profile";--> statement-breakpoint
ALTER TABLE "comments" DROP CONSTRAINT "comments_user_users_id_fk";
--> statement-breakpoint
ALTER TABLE "posts" DROP CONSTRAINT "posts_user_users_id_fk";
--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profile_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_profile_profile_id_fk" FOREIGN KEY ("profile") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_profile_profile_id_fk" FOREIGN KEY ("profile") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;