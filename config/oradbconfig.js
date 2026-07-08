const oracledb = require("oracledb");

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

// Thin Mode
// Do NOT call initOracleClient()

const pools = {
  TMC: null,
  TMC_CRON: null,
  KMC: null,
};

let initPromise = null;
// let restarting = false;
let initialized = false;
// restart lock GLOBAL VARIABLES

let restartPromise = null;
let isRestarting = false;
let activeRequests = 0;
let lastRestart = null;
const activeConnections = new Map();
// let shuttingDown = false;

// TRACK ACTIVE REQUESTS
// function requestStarted(source = "") {
//   activeRequests++;
//   // console.log("START", activeRequests);
//   console.log(`START ${activeRequests} ${source}`);
// }

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

// function requestFinished(source = "") {
//   activeRequests--;
//   // console.log("END", activeRequests);
//   console.log(`END ${activeRequests} ${source}`);
//}
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
    poolMax: 10,
    poolIncrement: 2,
    poolTimeout: 60,
    queueTimeout: 60000,
    stmtCacheSize: 30,
    poolPingInterval: 60,
    callTimeout: 180000,
  },

  KMC: {
    user: process.env.KMC_ORA_USER,
    password: process.env.KMC_ORAC_PASS,
    connectString: process.env.KMC_ORA_CONN_STRING,

    poolMin: 1,
    poolMax: 2,
    poolIncrement: 1,
    poolTimeout: 60,
    queueTimeout: 60000,
    stmtCacheSize: 30,
    poolPingInterval: 60,
    callTimeout: 180000,
  },
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
    await Promise.all([createPool("TMC"), createPool("TMC_CRON"), createPool("KMC")]);

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

async function getKmcConnection() {
  return getConnection("KMC");
}

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

// Wait Until All Reports Finish
async function waitUntilIdle(timeout = 30000) {
  // 30 seconds
  const start = Date.now();
  console.log("Open Connections");

  for (const [, c] of activeConnections) {
    console.log(c.pool);
    console.log(c.started);
    console.log(c.stack);
  }

  // while (activeRequests > 0) {
  //   console.log(`Waiting... Active Requests : ${activeRequests}`);

  //   await new Promise((r) => setTimeout(r, 1000));

  //   if (Date.now() - start > timeout) {
  //     console.warn("Timeout waiting.");

  //     break;
  //   }
  // }
}

// CREATE NEW POOLS (FOR RESTART)
async function buildNewPools() {
  return {
    TMC: await oracledb.createPool(CONFIG.TMC),
    TMC_CRON: await oracledb.createPool(CONFIG.TMC_CRON),
    KMC: await oracledb.createPool(CONFIG.KMC),
  };
}
// POOL SWAP (FOR RESTART)
async function swapPools(newPools) {
  const oldPools = {...pools};

  pools.TMC = newPools.TMC;

  pools.TMC_CRON = newPools.TMC_CRON;

  pools.KMC = newPools.KMC;

  return oldPools;
}

// CLOSE OLD POOLS (FOR RESTART)
async function destroyPools(oldPools) {
  for (const name of Object.keys(oldPools)) {
    try {
      if (oldPools[name]) {
        console.log(`Closing ${name}`);

        await oldPools[name].close(300);
      }
    } catch (err) {
      console.error(err);
    }
  }
}

async function restartPools() {
  if (restartPromise) return restartPromise;

  restartPromise = (async () => {
    if (isRestarting) return;

    isRestarting = true;

    console.log("================================");

    console.log("Oracle Restart Started");

    console.log("================================");

    try {
      await waitUntilIdle();

      const newPools = await buildNewPools();

      const oldPools = await swapPools(newPools);

      await destroyPools(oldPools);

      lastRestart = new Date();

      console.log("Restart Success");
    } catch (err) {
      console.error(err);

      throw err;
    } finally {
      restartPromise = null;

      isRestarting = false;
    }
  })();

  return restartPromise;
}

// POOL STATISTICS

function printPoolStats() {
  Object.keys(pools).forEach((name) => {
    const p = pools[name];

    if (!p) return;

    console.log({
      pool: name,
      open: p.connectionsOpen,
      inUse: p.connectionsInUse,
    });
  });
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

  setInterval(async () => {
    try {
      const ok1 = await healthCheck("TMC");
      const ok2 = await healthCheck("TMC_CRON");
      const ok3 = await healthCheck("KMC");
    } catch (err) {
      console.error(err);
    }
  }, 60000); // every 10 minutes
}

// SCHEDULED RESTART
function scheduleRestart(hours = 3) {
  console.log(`Pool restart every ${hours} hours`);

  setInterval(
    async () => {
      if (activeRequests === 0) {
        await restartPools();
      } else {
        console.log(
          "Skipping restart, active reports",

          activeRequests,
        );
      }
    },
    hours * 60 * 60 * 1000,
  );
}

module.exports = {
  oracledb,
  initializePools,
  closePools,
  oracleConnectionClose,
  getTmcConnection,
  getTmcCronConnection,
  getKmcConnection,
  restartPools,
  healthCheck,
  printPoolStats,
  scheduleRestart,
  startHealthMonitor,
};
