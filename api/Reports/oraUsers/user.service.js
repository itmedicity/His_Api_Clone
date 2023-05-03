// @ts-ignore
const { oraPool, oracledb, connectionClose } = require('../../../config/oradbconfig');

module.exports = {
    oraUsers: async (callBack) => {
        (await oraPool()).execute(
            `SELECT 
                us_code,
                usc_name,
                usc_alias,
                usc_status,
                bill_user,
                usc_default_mhcode
            FROM USERS`,
            [],
            { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT },
            (err, results) => {
                if (err) {
                    callBack(err)
                    connectionClose(oraPool)
                }

                if (results) {
                    results.resultSet?.getRows((err, rows) => {
                        callBack(err, rows)
                        connectionClose(oraPool)
                    })
                }
            }
        );
    }
}