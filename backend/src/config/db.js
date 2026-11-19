const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

require('dotenv').config();

let pgPool = null;
let sqliteDb = null;
let activeEngine = 'sqlite'; // 'postgres' or 'sqlite'

// Configuration for PostgreSQL
const pgConfig = {
  connectionString: process.env.DATABASE_URL,
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432', 10),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '',
  database: process.env.PGDATABASE || 'courier_management',
  connectionTimeoutMillis: 3000,
};

async function testPostgresConnection() {
  try {
    const pool = new Pool(process.env.DATABASE_URL ? { connectionString: process.env.DATABASE_URL } : pgConfig);
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return pool;
  } catch (err) {
    return null;
  }
}

function initSqlite() {
  const dbPath = path.resolve(__dirname, '../../courier_db.sqlite');
  return new sqlite3.Database(dbPath);
}

// Convert PostgreSQL $1, $2, ... to SQLite ? ONLY when query parameters are supplied
function pgToSqliteSql(sql, params) {
  if (!params || params.length === 0) {
    return sql;
  }
  let sqliteSql = sql.replace(/\$(\d+)/g, '?');
  sqliteSql = sqliteSql.replace(/NOW\(\)/gi, "CURRENT_TIMESTAMP");
  return sqliteSql;
}

const db = {
  getEngine: () => activeEngine,
  isPostgres: () => activeEngine === 'postgres',

  async init() {
    if (process.env.USE_POSTGRES === 'true' || process.env.DATABASE_URL || process.env.PGPASSWORD) {
      console.log('Testing connection to PostgreSQL...');
      const pool = await testPostgresConnection();
      if (pool) {
        pgPool = pool;
        activeEngine = 'postgres';
        console.log(`[DB] Successfully connected to PostgreSQL (${pgConfig.database}@${pgConfig.host}:${pgConfig.port})`);
        return activeEngine;
      } else {
        console.warn('[DB] PostgreSQL connection attempt failed or password not configured. Falling back to embedded SQLite database.');
      }
    }

    sqliteDb = initSqlite();
    activeEngine = 'sqlite';
    console.log('[DB] Using local SQLite database (backend/courier_db.sqlite) with PostgreSQL-compatible schema.');
    return activeEngine;
  },

  async query(text, params = []) {
    if (activeEngine === 'postgres' && pgPool) {
      const start = Date.now();
      const res = await pgPool.query(text, params);
      const duration = Date.now() - start;
      if (process.env.DEBUG_SQL === 'true') {
        console.log('[SQL-PG]', { text, duration, rows: res.rowCount });
      }
      return res;
    } else {
      return new Promise((resolve, reject) => {
        const sqliteText = pgToSqliteSql(text, params);
        const trimmed = sqliteText.trim();
        const isSelect = /^(SELECT|PRAGMA)/i.test(trimmed);

        if (isSelect) {
          sqliteDb.all(sqliteText, params, (err, rows) => {
            if (err) return reject(err);
            resolve({ rows: rows || [], rowCount: (rows || []).length });
          });
        } else {
          // For INSERT ... RETURNING, UPDATE ... RETURNING
          if (/RETURNING/i.test(sqliteText)) {
            sqliteDb.all(sqliteText, params, (err, rows) => {
              if (err) return reject(err);
              resolve({ rows: rows || [], rowCount: (rows || []).length });
            });
          } else {
            sqliteDb.run(sqliteText, params, function (err) {
              if (err) return reject(err);
              resolve({
                rows: [],
                rowCount: this.changes,
                lastID: this.lastID,
              });
            });
          }
        }
      });
    }
  },

  async getClient() {
    if (activeEngine === 'postgres' && pgPool) {
      return await pgPool.connect();
    }
    // For SQLite, return wrapper
    return {
      query: (text, params) => db.query(text, params),
      release: () => {},
    };
  },
};

module.exports = db;
