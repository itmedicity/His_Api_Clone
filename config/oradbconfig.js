
const oracledb = require('oracledb');
require('dotenv').config();

// Create a pool for KMC Oracle connection
const oraKmcConnection = async () => {
    try {
        return await oracledb.createPool({
            user: process.env.KMC_ORA_USER,
            password: process.env.KMC_ORAC_PASS,
            connectString: process.env.KMC_ORA_CONN_STRING,
            poolMin: 1,
            poolMax: 4,
        });
    } catch (err) {
        console.error("Error creating Oracle pool (KMC):", err);
        throw err;
    }
};

// Get a connection from the KMC pool
const oraKmcPool = async () => {
    try {
        const pool = await oraKmcConnection();
        return await pool.getConnection();
    } catch (err) {
        console.error("Error getting connection from KMC pool:", err);
        throw err;
    }
};

// Create a pool for TMC Oracle connection
const oraConnection = async () => {
    try {
        return await oracledb.createPool({
            user: process.env.ORA_USER,
            password: process.env.ORAC_PASS,
            connectString: process.env.ORA_CONN_STRING,
            poolMin: 1,
            poolMax: 4,
        });
    } catch (err) {
        console.error("Error creating Oracle pool (TMC):", err);
        throw err;
    }
};

// Get a connection from the TMC pool
const oraPool = async () => {
    try {
        const pool = await oraConnection();
        return await pool.getConnection();
    } catch (err) {
        console.error("Error getting connection from TMC pool:", err);
        throw err;
    }
};

// Close an Oracle DB connection
const connectionClose = async (connection) => {
    if (connection) {
        try {
            await connection.close();
        } catch (err) {
            console.error("Error closing Oracle connection:", err.message);
        }
    }
};

module.exports = {
    oracledb,
    oraKmcConnection,
    oraKmcPool,
    oraConnection,
    oraPool,
    connectionClose
};



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