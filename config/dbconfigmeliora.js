const { createPool } = require("mysql");

const mysqlpool = createPool({
    // @ts-ignore
    port: process.env.DB_PORT,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.MLMYSQL_DB,
    connectionLimit: 10,
    dateStrings: true
});


module.exports = mysqlpool;