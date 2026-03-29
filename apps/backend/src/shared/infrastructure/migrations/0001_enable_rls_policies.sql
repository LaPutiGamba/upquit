-- Enable RLS on all tenant-specific tables
ALTER TABLE "boards" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "board_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "requests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "votes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "give_to_get_progress" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "comments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subscriptions" ENABLE ROW LEVEL SECURITY;

-- Force RLS (Required because the default 'postgres' user has BYPASSRLS)
ALTER TABLE "boards" FORCE ROW LEVEL SECURITY;
ALTER TABLE "board_members" FORCE ROW LEVEL SECURITY;
ALTER TABLE "categories" FORCE ROW LEVEL SECURITY;
ALTER TABLE "requests" FORCE ROW LEVEL SECURITY;
ALTER TABLE "votes" FORCE ROW LEVEL SECURITY;
ALTER TABLE "give_to_get_progress" FORCE ROW LEVEL SECURITY;
ALTER TABLE "comments" FORCE ROW LEVEL SECURITY;
ALTER TABLE "subscriptions" FORCE ROW LEVEL SECURITY;

-- Create tenant isolation policies based on the 'app.current_tenant_id' context variable
CREATE POLICY tenant_isolation ON "boards" FOR ALL 
USING (id = current_setting('app.current_tenant_id', true)::uuid);

CREATE POLICY tenant_isolation ON "board_members" FOR ALL 
USING (board_id = current_setting('app.current_tenant_id', true)::uuid);

CREATE POLICY tenant_isolation ON "categories" FOR ALL 
USING (board_id = current_setting('app.current_tenant_id', true)::uuid);

CREATE POLICY tenant_isolation ON "requests" FOR ALL 
USING (board_id = current_setting('app.current_tenant_id', true)::uuid);

CREATE POLICY tenant_isolation ON "votes" FOR ALL 
USING (board_id = current_setting('app.current_tenant_id', true)::uuid);

CREATE POLICY tenant_isolation ON "give_to_get_progress" FOR ALL 
USING (board_id = current_setting('app.current_tenant_id', true)::uuid);

-- For tables without a direct board_id, link them through the request_id
CREATE POLICY tenant_isolation ON "comments" FOR ALL 
USING (request_id IN (SELECT id FROM "requests" WHERE board_id = current_setting('app.current_tenant_id', true)::uuid));

CREATE POLICY tenant_isolation ON "subscriptions" FOR ALL 
USING (request_id IN (SELECT id FROM "requests" WHERE board_id = current_setting('app.current_tenant_id', true)::uuid));