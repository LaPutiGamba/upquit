CREATE TABLE "request_categories" (
	"request_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	CONSTRAINT "request_categories_request_id_category_id_pk" PRIMARY KEY("request_id", "category_id"),
	CONSTRAINT "request_categories_request_id_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."requests"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "request_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE INDEX "request_categories_category_id_idx" ON "request_categories" USING btree ("category_id");
--> statement-breakpoint
ALTER TABLE "request_categories" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "request_categories" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY tenant_isolation ON "request_categories" FOR ALL
USING (request_id IN (SELECT id FROM "requests" WHERE board_id = current_setting('app.current_tenant_id', true)::uuid));
--> statement-breakpoint
INSERT INTO "request_categories" ("request_id", "category_id")
SELECT "id", "category_id"
FROM "requests"
WHERE "category_id" IS NOT NULL
ON CONFLICT DO NOTHING;
--> statement-breakpoint
ALTER TABLE "requests" DROP COLUMN IF EXISTS "category_id";