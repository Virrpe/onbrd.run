import { q } from '../src/lib/db';

async function main() {
  const scores = [42, 55, 63, 67, 71, 74, 78, 82, 86, 90];
  for (const s of scores) {
    await q('insert into audits(audit_id,url_hash,score,metrics,ua) values (gen_random_uuid(), $1, $2, $3, $4) on conflict do nothing',
      ['seedhash', s, {}, 'seed']);
  }
  console.log('Seeded audits:', scores.length);
}

main().then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1);});

// Additional seed data with mixed cohorts and devices
import crypto from 'crypto';

const cohorts = ['global','saas','ecommerce','content'] as const;
const devices = ['desktop','mobile'] as const;
for (let i=0;i<500;i++){
  const score = Math.round(40 + Math.random()*55); // 40-95
  const cohort = cohorts[Math.floor(Math.random()*cohorts.length)];
  const device = devices[Math.floor(Math.random()*devices.length)];
  await q('INSERT INTO audits (audit_id, url_hash, score, metrics_json, user_agent, device, cohort) VALUES ($1, $2, $3, $4, $5, $6, $7)',
    [crypto.randomUUID(), null, score, '{}', 'seed', device, cohort]);
}