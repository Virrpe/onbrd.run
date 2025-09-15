// Minimal Neon/Supabase PG client
import { Pool } from 'pg';
const connectionString = process.env.DATABASE_URL!;
export const pool = new Pool({ connectionString, max: 3 });
export async function q<T = any>(sql: string, params: any[] = []) {
  const c = await pool.connect();
  try { const r = await c.query<T>(sql, params); return r.rows; }
  finally { c.release(); }
}