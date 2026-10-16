CREATE TABLE "articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_url" text NOT NULL,
	"original_title" text NOT NULL,
	"title_ko" text NOT NULL,
	"summary_ko" text NOT NULL,
	"source" text NOT NULL,
	"published_at" timestamp with time zone NOT NULL,
	"category_id" integer,
	"notion_saved" boolean DEFAULT false NOT NULL,
	"notion_page_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "articles_source_url_unique" UNIQUE("source_url")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	CONSTRAINT "categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "articles_category_id_idx" ON "articles" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "articles_published_at_idx" ON "articles" USING btree ("published_at");