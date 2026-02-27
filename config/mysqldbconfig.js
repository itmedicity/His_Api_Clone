const mysql = require("mysql2/promise");

const baseConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,

  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  dateStrings: true,
  timezone: "+00:00",
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
};

const pools = {
  meliora: mysql.createPool({
    ...baseConfig,
    database: process.env.MYSQL_SC_MELIORA,
  }),
  bis: mysql.createPool({
    ...baseConfig,
    database: process.env.MYSQL_SC_BIS,
  }),
  ellider: mysql.createPool({
    ...baseConfig,
    database: process.env.MYSQL_SC_ELLIDER,
  }),
};

/* --------------------------------------------------
   Connection Session Settings 
-------------------------------------------------- */
function setupSession(conn) {
  conn.query("SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED");
  conn.query("SET SESSION sql_mode = 'STRICT_ALL_TABLES'");
}

pools.meliora.on("connection", setupSession);
pools.bis.on("connection", setupSession);
pools.ellider.on("connection", setupSession);

/* --------------------------------------------------
   Query Helpers - single query
-------------------------------------------------- */
async function query(poolName, sql, params = []) {
  const pool = pools[poolName];
  if (!pool) throw new Error(`Unknown pool: ${poolName}`);
  const [rows] = await pool.query(sql, params);
  return rows;
}

/* --------------------------------------------------
   Transaction Helper (CRON-SAFE) - multi query 
-------------------------------------------------- */
async function transaction(poolName, queries = []) {
  const conn = await pools[poolName].getConnection();

  try {
    await setupSession(conn);
    await conn.beginTransaction();

    const results = [];
    for (const q of queries) {
      const [res] = await conn.query(q.sql, q.values || []);
      results.push(res);
    }

    await conn.commit();
    return results;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/* --------------------------------------------------
   Advisory Lock Helpers (CRON SINGLETON)
-------------------------------------------------- */
async function acquireLock(poolName, lockName) {
  const rows = await query(poolName, "SELECT GET_LOCK(?, 0) AS locked", [lockName]);
  return rows[0].locked === 1;
}

async function releaseLock(poolName, lockName) {
  await query(poolName, "SELECT RELEASE_LOCK(?)", [lockName]);
}

/* --------------------------------------------------
   Health Check
-------------------------------------------------- */
async function healthCheck() {
  await Promise.all([pools.meliora.query("SELECT 1"), pools.bis.query("SELECT 1"), pools.ellider.query("SELECT 1")]);
  console.log("✅ MySQL pools healthy");
}

/* --------------------------------------------------
   Graceful Shutdown (IMPORTANT)
-------------------------------------------------- */
async function closeAllPools() {
  console.log("Closing MySQL pools...");
  await Promise.all(Object.values(pools).map((p) => p.end()));
}

process.on("SIGTERM", closeAllPools);
process.on("SIGINT", closeAllPools);

module.exports = {
  pools,
  query,
  transaction,
  acquireLock,
  releaseLock,
  healthCheck,
};

/* ------------------------------USAGE EXAMPLE----------------------------------------
for multiple query or array of query  or you can use after the map 

const { transaction } = require("./mysqldbconfig");

await transaction("bis", [
  { sql: "INSERT INTO tmp_bed_update VALUES ?", values: [bulkValues] },
  { sql: "UPDATE fb_bed b JOIN tmp_bed_update t ON ..." },
]);


for single query get or post

const { query } = require("./mysqldbconfig");

const beds = await query("ellider", "SELECT * FROM fb_bed");


use of Advisory lock if needed it a cron job or large transactions may be affecting the deadloak or row loacks 


expamle of advisory lock

const { acquireLock, releaseLock } = require("./mysqldbconfig");

const locked = await acquireLock("main", "FB_BED_IMPORT_LOCK");
if (!locked) return;

try {
  await UpdateFbBedDetailMeliora();
} finally {
  await releaseLock("main", "FB_BED_IMPORT_LOCK");
}
 
 */
