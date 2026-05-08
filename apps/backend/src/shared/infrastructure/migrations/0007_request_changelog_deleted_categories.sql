CREATE TABLE "request_changelog_deleted_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_changelog_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"category_name" varchar(200) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "rcdc_request_changelog_id_fk" FOREIGN KEY ("request_changelog_id") REFERENCES "public"."request_changelogs"("id") ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
ALTER TABLE "request_changelog_deleted_categories" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "request_changelog_deleted_categories" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY tenant_isolation ON "request_changelog_deleted_categories" FOR ALL
USING (request_changelog_id IN (SELECT id FROM "request_changelogs" WHERE request_id IN (SELECT id FROM "requests" WHERE board_id = current_setting('app.current_tenant_id', true)::uuid)));
