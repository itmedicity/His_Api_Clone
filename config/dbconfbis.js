const { createPool } = require("mysql");

const bispool = createPool({
    // @ts-ignore
    port: process.env.DB_PORT,
    host: process.env.DB_HOST_BIS,
    user: process.env.DB_USER,
    password: process.env.BIS_DB_PASS,
    database: process.env.BIS_SQL_DB,
    connectionLimit: 10,
    dateStrings: true
});


module.exports = bispool;
