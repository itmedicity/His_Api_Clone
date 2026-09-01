const oracledb = require("oracledb");

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

// Thick Mode required: the target DB server predates what node-oracledb's
// Thin mode protocol supports (NJS-138 otherwise). Uses the Oracle Client
// libraries already on PATH (C:\app\...\11.2.0\dbhome_1 / D:\app\...\11.2.0\client_1).
// oracledb 7.x's Thick mode requires Oracle Client 19.1+ (DPI-1050 on this
// 11.2 client), so this is pinned to 6.9.0 — the last line supporting it.
oracledb.initOracleClient();

const pools = {
  TMC: null,
  TMC_CRON: null,
  // KMC: null, // KMC pool disabled - not currently in use
};

let initPromise = null;
let initialized = false;

// `activeConnections` is the single source of truth for "how many requests
// are mid-flight right now" — populated by requestStarted()/requestFinished()
// below. scheduleRestart() and waitUntilIdle() both read it, filtered by
// pool name, so a restart only waits on / is skipped by activity on the
// pool actually being restarted.
const activeConnections = new Map();

function requestStarted(conn, poolName) {
  const id = Date.now() + "-" + Math.random();

  activeConnections.set(id, {
    pool: poolName,
    started: new Date(),
    stack: new Error().stack,
  });

  conn.__id = id;

  console.log("OPEN", activeConnections.size, poolName);

  return id;
}

function requestFinished(conn) {
  if (conn?.__id) {
    activeConnections.delete(conn.__id);
  }

  console.log("CLOSE", activeConnections.size);
}

// ORACLE POOL MANAGER
const CONFIG = {
  TMC: {
    user: process.env.ORA_USER,
    password: process.env.ORAC_PASS,
    connectString: process.env.ORA_CONN_STRING,

    poolMin: 4,
    poolMax: 10,
    poolIncrement: 2,
    poolTimeout: 60,
    queueTimeout: 60000,
    stmtCacheSize: 30,
    poolPingInterval: 30,
    callTimeout: 180000,
  },

  TMC_CRON: {
    user: process.env.ORA_USER,
    password: process.env.ORAC_PASS,
    connectString: process.env.ORA_CONN_STRING,

    poolMin: 2,
    poolMax: 5,
    poolIncrement: 2,
    poolTimeout: 60,
    queueTimeout: 60000,
    stmtCacheSize: 30,
    poolPingInterval: 60,
    callTimeout: 180000,
  },

  // KMC: {
  //   user: process.env.KMC_ORA_USER,
  //   password: process.env.KMC_ORAC_PASS,
  //   connectString: process.env.KMC_ORA_CONN_STRING,
  //
  //   poolMin: 1,
  //   poolMax: 2,
  //   poolIncrement: 1,
  //   poolTimeout: 60,
  //   queueTimeout: 60000,
  //   stmtCacheSize: 30,
  //   poolPingInterval: 60,
  //   callTimeout: 180000,
  // },
};

// CREATE POOLS
async function createPool(name) {
  if (pools[name]) {
    return pools[name];
  }
  console.log(`Creating ${name} Pool...`);

  pools[name] = await oracledb.createPool(CONFIG[name]);

  console.log(`${name} Pool Ready`);
  return pools[name];
}

//INITITALIZE

async function initializePools() {
  if (initialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    await Promise.all(Object.keys(CONFIG).map(createPool));

    initialized = true;

    console.log("=================================");
    console.log("Oracle Pools Initialized");
    console.log("=================================");
  })();

  return initPromise;
}
// GET POOL BY NAME
function getPool(name) {
  const pool = pools[name];
  if (!pool) throw new Error(`${name} Pool not initialized`);
  return pool;
}
// GET CONNECTION FROM POOL
async function getConnection(poolName) {
  if (!initialized) await initializePools();
  const pool = getPool(poolName);

  const conn = await pool.getConnection();
  requestStarted(conn, poolName);

  conn.__poolTracked = true;
  conn.__poolName = poolName;
  return conn;
}

// HELPER METHODS FOR SPECIFIC POOLS
async function getTmcConnection() {
  return getConnection("TMC");
}

async function getTmcCronConnection() {
  return getConnection("TMC_CRON");
}

// async function getKmcConnection() {
//   return getConnection("KMC");
// }

//CLOSE SINGLE CONNECTION

async function oracleConnectionClose(connection) {
  try {
    if (connection) await connection.close();
  } catch (err) {
    console.error("Connection Close Error", err);
  } finally {
    requestFinished(connection);
  }
}

// CLOSE ALL POOLS
async function closePools() {
  console.log("Closing Oracle Pools...");

  for (const key of Object.keys(pools)) {
    if (pools[key]) {
      try {
        await pools[key].close(30);

        console.log(`${key} Closed`);
      } catch (err) {
        console.error(err);
      }

      pools[key] = null;
    }
  }

  initialized = false;
  initPromise = null;
}

// Wait until ONE named pool's in-flight requests finish. Scoped per-pool so
// restarting TMC_CRON, say, doesn't block on unrelated TMC activity.
async function waitUntilIdle(poolName, timeout = 30000) {
  const start = Date.now();

  const isBusy = () => {
    for (const [, c] of activeConnections) {
      if (c.pool === poolName) return true;
    }
    return false;
  };

  while (isBusy()) {
    console.log(`Waiting for ${poolName} to go idle before restart...`);

    if (Date.now() - start > timeout) {
      console.warn(`Timeout waiting for ${poolName} connections to finish.`);
      break;
    }

    await new Promise((r) => setTimeout(r, 1000));
  }
}

// PER-POOL RESTART STATE
// Each pool restarts independently. A recoverable error on one pool (e.g.
// TMC_CRON) only rebuilds that pool now, instead of tearing down every pool
// (including TMC, which serves live traffic) like the old restartPools()
// used to.
const restartState = Object.fromEntries(Object.keys(CONFIG).map((name) => [name, {promise: null, isRestarting: false, lastRestart: null}]));

// RESTART A SINGLE NAMED POOL
async function restartPool(name) {
  const state = restartState[name];
  if (!state) throw new Error(`Unknown pool: ${name}`);

  if (state.promise) return state.promise;

  state.promise = (async () => {
    state.isRestarting = true;

    console.log("================================");
    console.log(`Oracle Restart Started: ${name}`);
    console.log("================================");

    try {
      await waitUntilIdle(name);

      const newPool = await oracledb.createPool(CONFIG[name]);
      const oldPool = pools[name];

      pools[name] = newPool;

      if (oldPool) {
        try {
          console.log(`Closing old ${name} pool`);
          await oldPool.close(300);
        } catch (err) {
          console.error(err);
        }
      }

      state.lastRestart = new Date();

      console.log(`Restart Success: ${name}`);
    } catch (err) {
      console.error(err);

      throw err;
    } finally {
      state.promise = null;
      state.isRestarting = false;
    }
  })();

  return state.promise;
}

// RESTART POOLS - restarts one named pool, or every configured pool when no
// name is given (used by the manual /api/restart admin endpoint).
async function restartPools(name) {
  if (name) return restartPool(name);
  return Promise.all(Object.keys(CONFIG).map(restartPool));
}

// POOL STATISTICS

function printPoolStats() {
  const stats = [];

  Object.keys(pools).forEach((name) => {
    const p = pools[name];

    if (!p) return;

    const stat = {
      pool: name,
      open: p.connectionsOpen,
      inUse: p.connectionsInUse,
    };

    console.log(stat);
    stats.push(stat);
  });

  return stats;
}

// hEALTH cHECK

async function healthCheck(poolName) {
  let conn = null;

  try {
    conn = await getConnection(poolName);

    await conn.execute("SELECT 1 FROM DUAL");

    return true;
  } catch (err) {
    console.error(`${poolName} Health Failed`);
    console.error(err);

    return false;
  } finally {
    await oracleConnectionClose(conn);
    conn = null;
  }
}

function startHealthMonitor() {
  console.log("Health Monitor Started");

  setInterval(
    async () => {
      try {
        for (const name of Object.keys(CONFIG)) {
          await healthCheck(name);
        }
      } catch (err) {
        console.error(err);
      }
    },
    10 * 60 * 1000, // every 10 minutes
  );
}

// SCHEDULED RESTART
// Restarts each configured pool roughly every `hours` hours. If a pool is
// still busy at the scheduled time, it isn't just skipped until the next
// full interval (which could mean it never restarts on a continuously busy
// system) — it's retried on a shorter cadence until an idle window shows up.
const pendingRestartRetry = new Set();

function scheduleRestart(hours = 3) {
  const intervalMs = hours * 60 * 60 * 1000;
  const retryMs = 5 * 60 * 1000;

  function isPoolBusy(name) {
    for (const [, c] of activeConnections) {
      if (c.pool === name) return true;
    }
    return false;
  }

  function attemptRestart(name) {
    if (isPoolBusy(name)) {
      if (pendingRestartRetry.has(name)) return;
      pendingRestartRetry.add(name);

      console.log(`Skipping restart for ${name}, active connections present. Retrying in ${retryMs / 60000} min`);

      setTimeout(() => {
        pendingRestartRetry.delete(name);
        attemptRestart(name);
      }, retryMs);

      return;
    }

    restartPool(name).catch((err) => console.error(`Scheduled restart failed for ${name}:`, err));
  }

  console.log(`Pool restart every ${hours} hours`);

  setInterval(() => {
    Object.keys(CONFIG).forEach(attemptRestart);
  }, intervalMs);
}

module.exports = {
  oracledb,
  initializePools,
  closePools,
  oracleConnectionClose,
  getTmcConnection,
  getTmcCronConnection,
  // getKmcConnection,
  restartPools,
  healthCheck,
  printPoolStats,
  scheduleRestart,
  startHealthMonitor,
};
