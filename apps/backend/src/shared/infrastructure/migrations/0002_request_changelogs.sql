CREATE TABLE "request_changelogs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"field" varchar(100) NOT NULL,
	"old_value" text,
	"new_value" text,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "request_changelogs_request_id_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."requests"("id") ON DELETE no action ON UPDATE no action,
	CONSTRAINT "request_changelogs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action
);
--> statement-breakpoint
ALTER TABLE "request_changelogs" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "request_changelogs" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY tenant_isolation ON "request_changelogs" FOR ALL
USING (request_id IN (SELECT id FROM "requests" WHERE board_id = current_setting('app.current_tenant_id', true)::uuid));