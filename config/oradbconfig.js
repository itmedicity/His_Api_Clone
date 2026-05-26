const oracledb = require("oracledb");
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

let poolKMC;
let poolTMC;
let poolTMCCRON;
let initPromise;

/**
 * Initializes the Oracle connection pools for TMC and KMC.
 * The pools are configured with a minimum size of 2, a maximum size of 10, an increment of 2, and a timeout of 60 seconds.
 * If the initialization is successful, a log message is printed to the console.
 * If an error occurs during initialization, an error message is logged to the console and re-thrown.
 */

async function initializePools() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    if (!poolTMC) {
      poolTMC = await oracledb.createPool({
        user: process.env.ORA_USER,
        password: process.env.ORAC_PASS,
        connectString: process.env.ORA_CONN_STRING,
        poolAlias: "TMC_POOL",
        poolMin: 4,
        poolMax: 10,
        poolIncrement: 2,
        poolTimeout: 60,
        queueTimeout: 60000,
        stmtCacheSize: 30,
        poolPingInterval: 30,
        callTimeout: 180000,
      });
      console.log("TMC Oracle pool initialized");
    }

    if (!poolTMCCRON) {
      poolTMCCRON = await oracledb.createPool({
        user: process.env.ORA_USER,
        password: process.env.ORAC_PASS,
        connectString: process.env.ORA_CONN_STRING,
        poolAlias: "TMC_CRONE_POOL",
        poolMin: 2,
        poolMax: 10,
        poolIncrement: 2,
        queueTimeout: 60000,
        stmtCacheSize: 30,
        poolPingInterval: 60,
        poolTimeout: 60,
        callTimeout: 120000,
      });
      console.log("TMC Oracle_CRONE pool initialized");
    }

    if (!poolKMC) {
      poolKMC = await oracledb.createPool({
        user: process.env.KMC_ORA_USER,
        password: process.env.KMC_ORAC_PASS,
        connectString: process.env.KMC_ORA_CONN_STRING,
        poolAlias: "KMC_POOL",
        poolMin: 1,
        poolMax: 2,
        poolIncrement: 1,
        poolTimeout: 60,
        queueTimeout: 60000,
        stmtCacheSize: 30,
        poolPingInterval: 60,
        callTimeout: 120000,
      });
      console.log("KMC Oracle pool initialized");
    }
  })();

  return initPromise;
}

// Get connection

async function getTmcConnection() {
  if (!poolTMC) await initializePools();
  return poolTMC.getConnection();
}

async function getTmcCronConnection() {
  if (!poolTMCCRON) await initializePools();
  return poolTMCCRON.getConnection();
}

async function getKmcConnection() {
  if (!poolKMC) await initializePools();
  return poolKMC.getConnection();
}

// Close pool connection

async function closeConnection() {
  try {
    if (poolTMC) await poolTMC.close(10);
    if (poolKMC) await poolKMC.close(10);
    if (poolTMCCRON) await poolTMCCRON.close(10);
    console.log(" Oracle pools closed");
  } catch (err) {
    console.error("Error closing Oracle pools:", err);
  }
}

// close single connection

const oracleConnectionClose = async (conn_ora) => {
  try {
    if (conn_ora) {
      await conn_ora.close();
    }
  } catch (error) {
    console.log("Error Closing Oracle Connection", error);
  }
};

// safe pool restart

async function restartPools() {
  console.log("♻️ Starting Oracle pool restart...");

  try {
    // Prevent restart if busy
    if (poolTMC?.connectionsInUse > 0) {
      console.log("⚠️ Skipping restart, connections still in use");
      return;
    }

    // Create new pools
    const newTMC = await oracledb.createPool({
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
    });

    const newTMCCRON = await oracledb.createPool({
      user: process.env.ORA_USER,
      password: process.env.ORAC_PASS,
      connectString: process.env.ORA_CONN_STRING,
      poolMin: 2,
      poolMax: 10,
      poolIncrement: 2,
      queueTimeout: 60000,
      stmtCacheSize: 30,
      poolPingInterval: 60,
      poolTimeout: 60,
      callTimeout: 120000,
    });

    const newKMC = await oracledb.createPool({
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
      callTimeout: 120000,
    });

    // Swap pools
    const oldTMC = poolTMC;
    const oldTMCCRON = poolTMCCRON;
    const oldKMC = poolKMC;

    poolTMC = newTMC;
    poolTMCCRON = newTMCCRON;
    poolKMC = newKMC;

    console.log("🔄 Pools swapped successfully");

    // Close old pools
    if (oldTMC) await oldTMC.close(10);
    if (oldTMCCRON) await oldTMCCRON.close(10);
    if (oldKMC) await oldKMC.close(10);

    console.log("✅ Old pools closed");
  } catch (err) {
    console.error("❌ Pool restart failed:", err);
  }
}

// scheduled restart  at 2 am

function scheduleNightlyRestart() {
  const now = new Date();
  const nextRun = new Date();

  nextRun.setHours(2, 0, 0, 0);

  if (nextRun <= now) {
    nextRun.setDate(nextRun.getDate() + 1);
  }

  const delay = nextRun - now;

  console.log(`⏰ Next pool restart in ${Math.round(delay / 60000)} minutes`);

  setTimeout(() => {
    restartPools();
    // Repeat every 24 hours
    setInterval(restartPools, 24 * 60 * 60 * 1000);
  }, delay);
}

// function scheduleTestRestart() {
//   console.log("⏰ Running pool restart every 2 minutes (TEST MODE)");

//   setInterval(
//     async () => {
//       console.log("♻️ Triggering test pool restart...");
//       await restartPools();
//     },
//     2 * 60 * 1000,
//   ); // 2 minutes
// }

/**
 * Pool stats logging
 */
setInterval(() => {
  console.log("📊 Oracle Pool Stats", {
    TMC_open: poolTMC?.connectionsOpen,
    TMC_inUse: poolTMC?.connectionsInUse,
    CRON_open: poolTMCCRON?.connectionsOpen,
    CRON_inUse: poolTMCCRON?.connectionsInUse,
    KMC_open: poolKMC?.connectionsOpen,
    KMC_inUse: poolKMC?.connectionsInUse,
  });
}, 5000);

/**
 * Initialize + Start Scheduler
 */
initializePools().then(() => {
  scheduleNightlyRestart();
  // scheduleTestRestart();
});

module.exports = {
  oracledb,
  initializePools,
  getTmcConnection,
  getKmcConnection,
  getTmcCronConnection,
  closeConnection,
  oracleConnectionClose,
};
