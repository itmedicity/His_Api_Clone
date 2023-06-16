// @ts-ignore
const { oracledb, connectionClose, oraConnection } = require('../../../config/oradbconfig');

module.exports = {
    ipAdmissionList: async (data, callBack) => {

        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        try {
            const result = await conn_ora.execute(
                ` SELECT 
                        IP_NO,
                        PT_NO,
                        PTC_PTNAME
                    FROM IPADMISS 
                    WHERE 
                        IPD_DATE   >= TO_DATE (:date0, 'dd/MM/yyyy hh24:mi:ss') AND 
                        IPD_DATE   <= TO_DATE (:date1, 'dd/MM/yyyy hh24:mi:ss') 
                    AND IPC_PTFLAG = 'N'`,
                {
                    date0: data.from,
                    date1: data.to,
                },
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT },
            )
            await result.resultSet?.getRows((err, rows) => {
                callBack(err, rows)
            })

        } catch (error) {
            console.log(error)
        } finally {
            if (conn_ora) {
                await conn_ora.close();
                await pool_ora.close();
            }
        }
    },
}