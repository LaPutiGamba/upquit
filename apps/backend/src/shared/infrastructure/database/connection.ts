import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import { AsyncLocalStorage } from "node:async_hooks";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!
});

const baseDb: any = drizzle({ client: pool });
const tenantDbContext = new AsyncLocalStorage<any>();

const getCurrentDb = (): any => tenantDbContext.getStore() ?? baseDb;

export const db: any = new Proxy(
  {},
  {
    get: (_target, prop: string | symbol) => {
      const currentDb = getCurrentDb();
      const value = currentDb[prop];
      return typeof value === "function" ? value.bind(currentDb) : value;
    }
  }
);

export async function withTenant<T>(tenantId: string, cb: (tx: any) => Promise<T>): Promise<T> {
  return await baseDb.transaction(async (tx: any) => {
    await tx.execute(sql`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`);

    return await tenantDbContext.run(tx, async () => cb(tx));
  });
}
