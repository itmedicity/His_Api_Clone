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
        poolMin: 2,
        poolMax: 6,
        poolIncrement: 1,
        queueTimeout: 60000,
      });
      console.log("TMC Oracle pool initialized");
    }

    if (!poolTMCCRON) {
      poolTMCCRON = await oracledb.createPool({
        user: process.env.ORA_USER,
        password: process.env.ORAC_PASS,
        connectString: process.env.ORA_CONN_STRING,
        poolAlias: "TMC_CRONE_POOL",
        poolMin: 1,
        poolMax: 3,
        poolIncrement: 1,
        queueTimeout: 60000,
      });
      console.log("TMC Oracle_CRONE pool initialized");
    }

    if (!poolKMC) {
      poolKMC = await oracledb.createPool({
        user: process.env.KMC_ORA_USER,
        password: process.env.KMC_ORAC_PASS,
        connectString: process.env.KMC_ORA_CONN_STRING,
        poolAlias: "KMC_POOL",
        poolMin: 2,
        poolMax: 6,
        poolIncrement: 1,
        queueTimeout: 60000,
      });
      console.log("KMC Oracle pool initialized");
    }
  })();

  return initPromise;
}

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

const oracleConnectionClose = async (conn_ora) => {
  try {
    if (conn_ora) {
      await conn_ora.close();
    }
  } catch (error) {
    console.log("Error Closing Oracle Connection", error);
  }
};

setInterval(() => {
  console.log("Oracle Pool Stats", {
    open: poolTMC?.connectionsOpen,
    inUse: poolTMC?.connectionsInUse,
    open_cron: poolTMCCRON?.connectionsOpen,
    inUse_cron: poolTMCCRON?.connectionsInUse,
  });
}, 30000);

module.exports = {
  oracledb,
  initializePools,
  getTmcConnection,
  getKmcConnection,
  getTmcCronConnection,
  closeConnection,
  oracleConnectionClose,
};

// // Create a pool for KMC Oracle connection
// const oraKmcConnection = async () => {
//   try {
//     return await oracledb.createPool({
//       user: process.env.KMC_ORA_USER,
//       password: process.env.KMC_ORAC_PASS,
//       connectString: process.env.KMC_ORA_CONN_STRING,
//       poolMin: 1,
//       poolMax: 4,
//     });
//   } catch (err) {
//     console.error("Error creating Oracle pool (KMC):", err);
//     throw err;
//   }
// };

// // Get a connection from the KMC pool
// const oraKmcPool = async () => {
//   try {
//     const pool = await oraKmcConnection();
//     return await pool.getConnection();
//   } catch (err) {
//     console.error("Error getting connection from KMC pool:", err);
//     throw err;
//   }
// };

// // Create a pool for TMC Oracle connection
// const oraConnection = async () => {
//   try {
//     return await oracledb.createPool({
//       user: process.env.ORA_USER,
//       password: process.env.ORAC_PASS,
//       connectString: process.env.ORA_CONN_STRING,
//       poolMin: 1,
//       poolMax: 4,
//     });
//   } catch (err) {
//     console.error("Error creating Oracle pool (TMC):", err);
//     throw err;
//   }
// };

// // Get a connection from the TMC pool
// const oraPool = async () => {
//   try {
//     const pool = await oraConnection();
//     return await pool.getConnection();
//   } catch (err) {
//     console.error("Error getting connection from TMC pool:", err);
//     throw err;
//   }
// };

// // Close an Oracle DB connection
// const connectionClose = async (connection) => {
//   if (connection) {
//     try {
//       await connection.close();
//     } catch (err) {
//       console.error("Error closing Oracle connection:", err.message);
//     }
//   }
// };

// module.exports = {
//   oracledb,
//   oraKmcConnection,
//   oraKmcPool,
//   oraConnection,
//   oraPool,
//   connectionClose,
// };

// const oracledb = require('oracledb');

// const oraConnection = async () => {
//     return await oracledb.createPool({
//         user: process.env.ORA_USER,
//         password: process.env.ORAC_PASS,
//         connectString: process.env.ORA_CONN_STRING,
//         poolMin: 1,
//         poolMax: 4,
//     });

// }

// const oraPool = async () => {
//     let oraclePool = await oraConnection()
//     return await oraclePool.getConnection()
// }

// const connectionClose = async (connection) => {
//     (await connection()).close(
//         function (err) {
//             if (err)
//                 console.error(err.message);
//         });
// }

// module.exports = {
//     oraConnection,
//     oraPool,
//     oracledb,
//     connectionClose
// }
