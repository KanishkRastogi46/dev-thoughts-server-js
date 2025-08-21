CREATE TABLE "countries" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "country_code" (
	"id" integer PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"country_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
