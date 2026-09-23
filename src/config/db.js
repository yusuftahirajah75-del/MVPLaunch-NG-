/**
 * MVPLaunch NG - Database Pool & Query Interface
 * Implements node-postgres (pg) connection pooling with parameterized queries.
 */
const { Pool } = require('pg');
const env = require('./env');

const poolConfig = env.DATABASE_URL
  ? {
      connectionString: env.DATABASE_URL,
      ssl: env.DB_SSL ? { rejectUnauthorized: false } : false,
      max: env.DB_POOL_MAX,
      idleTimeoutMillis: env.DB_POOL_IDLE_TIMEOUT,
      connectionTimeoutMillis: env.DB_POOL_CONN_TIMEOUT
    }
  : {
      host: env.DB_HOST,
      port: env.DB_PORT,
      database: env.DB_NAME,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      ssl: env.DB_SSL ? { rejectUnauthorized: false } : false,
      max: env.DB_POOL_MAX,
      idleTimeoutMillis: env.DB_POOL_IDLE_TIMEOUT,
      connectionTimeoutMillis: env.DB_POOL_CONN_TIMEOUT
    };

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('[PostgreSQL] Unexpected error on idle client:', err.message);
});

/**
 * Execute parameterized SQL query
 * @param {string} text 
 * @param {Array} params 
 * @returns {Promise<import('pg').QueryResult>}
 */
async function query(text, params = []) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (env.NODE_ENV === 'development' && duration > 200) {
      console.warn(`[Slow Query] (${duration}ms): ${text}`);
    }
    return res;
  } catch (error) {
    if (env.NODE_ENV === 'development') {
      console.error('[DB Query Error]:', { text, params, error: error.message });
    }
    throw error;
  }
}

/**
 * Acquire a dedicated client for multi-statement ACID transactions
 */
async function getClient() {
  const client = await pool.connect();
  const queryOriginal = client.query.bind(client);
  const releaseOriginal = client.release.bind(client);

  // Set timeout to prevent leaked transactions
  const timeout = setTimeout(() => {
    console.error('[DB Client] Client checked out for more than 5 seconds!');
  }, 5000);

  client.release = () => {
    clearTimeout(timeout);
    return releaseOriginal();
  };

  return client;
}

/**
 * Execute a callback within an isolated ACID transaction
 * @param {Function} callback 
 */
async function transaction(callback) {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Health check ping
 */
async function testConnection() {
  try {
    const result = await query('SELECT NOW() as current_time');
    return { success: true, timestamp: result.rows[0].current_time };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = {
  pool,
  query,
  getClient,
  transaction,
  testConnection
};
