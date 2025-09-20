import { q } from './db';

export type CohortParams = {
  score: number;
  device: 'desktop'|'mobile';
  cohort: 'global'|'saas'|'ecommerce'|'content';
  horizonDays?: number; // default 90
};

export async function getBenchmarks(p: CohortParams) {
  const horizon = p.horizonDays ?? 90;

  // Count in cohort
  const [result] = await q<{ total: number }>(
    `SELECT COUNT(*)::int AS total
     FROM audits
     WHERE created_at > NOW() - INTERVAL '${horizon} days'
       AND cohort = $1
       AND device = $2`,
    [p.cohort, p.device]
  );
  const total = result?.total || 0;

  if (!total || total < 200) {
    // Fall back to global if cohort sparse
    const [gresult] = await q<{ gtotal: number }>(
      `SELECT COUNT(*)::int AS gtotal
       FROM audits
       WHERE created_at > NOW() - INTERVAL '${horizon} days'
         AND cohort = 'global'
         AND device = $1`,
      [p.device]
    );
    const gtotal = gresult?.gtotal || 0;
    
    if (!gtotal || gtotal < 200) {
      return { count: Math.max(total ?? 0, gtotal ?? 0) || 0 };
    }
    // compute global
    return await computeStats(p.score, 'global', p.device, horizon);
  }

  return await computeStats(p.score, p.cohort, p.device, horizon);
}

async function computeStats(score: number, cohort: string, device: string, horizon: number) {
  // Median via percentile_cont, percentile via rank approximation
  const [agg] = await q<{
    count: number;
    leq: number;
    median: number;
  }>(
    `WITH pool AS (
       SELECT score
       FROM audits
       WHERE created_at > NOW() - INTERVAL '${horizon} days'
         AND cohort = $1
         AND device = $2
     )
     SELECT
       (SELECT COUNT(*) FROM pool) AS count,
       (SELECT COUNT(*) FROM pool WHERE score <= $3)::float AS leq,
       (SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY score) FROM pool)::int AS median`,
    [cohort, device, score]
  );
  
  const count = Number(agg?.count || 0);
  if (!count) return { count: 0 };
  const percentile = Math.max(0, Math.min(100, Math.round((Number(agg.leq) / count) * 100)));
  return { percentile, median: Number(agg.median), count };
}