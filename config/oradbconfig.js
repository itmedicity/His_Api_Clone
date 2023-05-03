const oracledb = require('oracledb');

const oraConnection = async () => {
    return await oracledb.createPool({
        user: process.env.ORA_USER,
        password: process.env.ORAC_PASS,
        connectString: process.env.ORA_CONN_STRING,
        poolMin: 1,
        poolMax: 4,
    });


}

const oraPool = async () => {
    let oraclePool = await oraConnection()
    return await oraclePool.getConnection()
}

const connectionClose = async (connection) => {
    (await connection()).close(
        function (err) {
            if (err)
                console.error(err.message);
        });
}

module.exports = {
    oraConnection,
    oraPool,
    oracledb,
    connectionClose
}