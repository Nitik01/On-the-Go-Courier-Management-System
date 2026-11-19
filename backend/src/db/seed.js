const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function runSeed() {
  console.log('[SEED] Initializing database...');
  const engine = await db.init();

  const seedFile = engine === 'postgres' ? 'seed.sql' : 'seed_sqlite.sql';
  const seedPath = path.join(__dirname, seedFile);
  const sql = fs.readFileSync(seedPath, 'utf8');

  console.log(`[SEED] Executing ${seedFile} on ${engine.toUpperCase()} engine...`);

  if (engine === 'postgres') {
    await db.query(sql);
  } else {
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const stmt of statements) {
      await db.query(stmt);
    }
  }

  console.log('[SEED] Demo data loaded successfully!');
}

if (require.main === module) {
  runSeed()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('[SEED ERROR]', err);
      process.exit(1);
    });
}

module.exports = runSeed;
