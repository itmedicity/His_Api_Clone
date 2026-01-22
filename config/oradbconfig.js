const oracledb = require("oracledb");
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

let poolKMC;
let poolTMC;
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
        poolMax: 10,
        poolIncrement: 2,
        poolTimeout: 60,
      });
      console.log("TMC Oracle pool initialized");
    }

    if (!poolKMC) {
      poolKMC = await oracledb.createPool({
        user: process.env.KMC_ORA_USER,
        password: process.env.KMC_ORAC_PASS,
        connectString: process.env.KMC_ORA_CONN_STRING,
        poolAlias: "KMC_POOL",
        poolMin: 2,
        poolMax: 10,
        poolIncrement: 2,
        poolTimeout: 60,
      });
      console.log("KMC Oracle pool initialized");
    }
  })();

  return initPromise;
}

/**
 * Retrieves a connection from the TMC Oracle connection pool.
 * If the pool has not been initialized yet, it will be initialized before retrieving the connection.
 * @returns {Promise<import('oracledb').PoolConnection>} A promise that resolves to an Oracle connection object.
 */
async function getTmcConnection() {
  if (!poolTMC) await initializePools();
  return poolTMC.getConnection();
}

/**
 * Retrieves a connection from the KMC Oracle connection pool.
 * If the pool has not been initialized yet, it will be initialized before retrieving the connection.
 * @returns {Promise<import('oracledb').PoolConnection>} A promise that resolves to an Oracle connection object.
 */
async function getKmcConnection() {
  if (!poolKMC) await initializePools();
  return poolKMC.getConnection();
}

async function closeConnection() {
  try {
    if (poolTMC) await poolTMC.close(10);
    if (poolKMC) await poolKMC.close(10);
    console.log(" Oracle pools closed");
  } catch (err) {
    console.error("Error closing Oracle pools:", err);
  }
}

module.exports = {
  oracledb,
  initializePools,
  getTmcConnection,
  getKmcConnection,
  closeConnection,
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
