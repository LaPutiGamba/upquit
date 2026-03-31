import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!
});

export const db: any = drizzle({ client: pool });

export async function withTenant<T>(tenantId: string, cb: (tx: any) => Promise<T>): Promise<T> {
  return await db.transaction(async (tx: any) => {
    await tx.execute(sql`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`);

    return await cb(tx);
  });
}
