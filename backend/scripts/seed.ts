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