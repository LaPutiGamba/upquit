import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import { AsyncLocalStorage } from "node:async_hooks";
import pg from "pg";
import * as schema from "./schema.js";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!
});

type AppDatabase = NodePgDatabase<typeof schema>;
type TransactionCallback = Parameters<AppDatabase["transaction"]>[0];
type TenantDatabase = Parameters<TransactionCallback>[0];
export type CurrentDatabase = AppDatabase | TenantDatabase;

const baseDb: AppDatabase = drizzle({ client: pool, schema });
const tenantDbContext = new AsyncLocalStorage<TenantDatabase>();

const getCurrentDb = (): CurrentDatabase => tenantDbContext.getStore() ?? baseDb;

export const db: CurrentDatabase = new Proxy({} as CurrentDatabase, {
  get: (_target, prop: string | symbol) => {
    const currentDb = getCurrentDb();
    const value = Reflect.get(currentDb as object, prop);
    return typeof value === "function" ? value.bind(currentDb) : value;
  }
});

export async function withTenant<T>(tenantId: string, cb: (tx: TenantDatabase) => Promise<T>): Promise<T> {
  return await baseDb.transaction(async (tx) => {
    await tx.execute(sql`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`);

    return await tenantDbContext.run(tx, async () => cb(tx));
  });
}
