const { oraConnection, oracledb } = require('../../config/oradbconfig');
module.exports = {
    GetProcedureList: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        const sql = `SELECT 
                            PRODESCRIPTION.PD_CODE,PRODESCRIPTION.PDC_DESC
                     FROM 
                            PRODESCRIPTION
                     WHERE 
                            PRODESCRIPTION.PDC_STATUS='Y' AND PDC_DESC LIKE:procname`;
        try {
            const result = await conn_ora.execute(
                sql,
                {
                    procname: '%' + data.PDC_DESC + '%'
                },
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT },
            )
            await result.resultSet?.getRows((err, rows) => {
                callBack(err, rows)
            })
        }
        catch (error) {
            return callBack(error)
        } finally {
            if (conn_ora) {
                await conn_ora.close();
                await pool_ora.close();
            }
        }

    },
}




