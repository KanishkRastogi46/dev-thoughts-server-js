CREATE TYPE "public"."user_roles_enum" AS ENUM('admin', 'user');--> statement-breakpoint
CREATE TABLE "otps" (
	"id" serial PRIMARY KEY NOT NULL,
	"user" integer NOT NULL,
	"otp" text NOT NULL,
	"reason" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp DEFAULT now() + interval '5 minutes' NOT NULL,
	"last_otp_time" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "userRoles" (
	"id" serial PRIMARY KEY NOT NULL,
	"role" "user_roles_enum"[] NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone_no" text NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"last_login" timestamp,
	"role" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_phone_no_unique" UNIQUE("phone_no"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "otps" ADD CONSTRAINT "otps_user_users_id_fk" FOREIGN KEY ("user") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_userRoles_id_fk" FOREIGN KEY ("role") REFERENCES "public"."userRoles"("id") ON DELETE cascade ON UPDATE cascade;