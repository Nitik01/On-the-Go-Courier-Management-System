const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function runMigration() {
  console.log('[MIGRATION] Initializing database...');
  const engine = await db.init();

  const schemaFile = engine === 'postgres' ? 'schema.sql' : 'schema_sqlite.sql';
  const schemaPath = path.join(__dirname, schemaFile);
  const sql = fs.readFileSync(schemaPath, 'utf8');

  console.log(`[MIGRATION] Executing ${schemaFile} on ${engine.toUpperCase()} engine...`);

  if (engine === 'postgres') {
    await db.query(sql);
  } else {
    // SQLite: execute statements in sequence
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const stmt of statements) {
      await db.query(stmt);
    }
  }

  console.log('[MIGRATION] Database schema created successfully!');
}

if (require.main === module) {
  runMigration()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('[MIGRATION ERROR]', err);
      process.exit(1);
    });
}

module.exports = runMigration;
