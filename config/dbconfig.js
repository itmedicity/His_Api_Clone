const { createPool } = require("mysql");

const pool = createPool({
    // @ts-ignore
    port: process.env.DB_PORT,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.MYSQL_DB,
    connectionLimit: 10,
    dateStrings: true
});



const mysqlpool = createPool({
    // @ts-ignore
    port: process.env.MLDB_PORT,
    host: process.env.MLDB_HOST,
    user: process.env.MLDB_USER,
    password: process.env.MLDB_PASS,
    database: process.env.MLMYSQL_DB,
    connectionLimit: 10,
    dateStrings: true
});



module.exports = { pool, mysqlpool };


