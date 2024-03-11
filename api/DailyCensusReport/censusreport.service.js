const pool = require('../../config/dbconfig');
const { oraConnection, oracledb } = require('../../config/oradbconfig');
module.exports = {

    GetElliderCensusCount: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();

        // const nsList = (data?.census_ns_code?.length > 0 && data.census_ns_code.join(',')) || null;
        // const nsList = data.census_ns_code
        const fromDate = data.from;
        const toDate = data.to;
        const sql = ` SELECT NS_CODE,SUM(AD) AD,SUM(DC) DC,SUM(DT) DT,SUM(TOT) TOT FROM  (
            SELECT 
                  B.NS_CODE,COUNT(IP.IP_NO) AS AD,0 DC,0 DT,0 TOT
            FROM  IPADMISS IP,BED B
            WHERE B.BD_CODE=IP.BD_CODE AND 
                  IPD_DATE >= TO_DATE ('${fromDate}',  'dd/MM/yyyy hh24:mi:ss')
                  AND IPD_DATE <= TO_DATE('${toDate}', 'dd/MM/yyyy hh24:mi:ss') 
                  AND B.NS_CODE IN (SELECT NS_CODE FROM NURSTATION WHERE NSC_STATUS='Y') AND IPC_PTFLAG = 'N'
            GROUP BY B.NS_CODE
        UNION ALL
            SELECT 
                  B.NS_CODE,0 AD,COUNT(IP.IP_NO) AS DC,0 DT,0 TOT
            FROM  IPADMISS IP,BED B
            WHERE B.BD_CODE=IP.BD_CODE AND 
                  IPD_DISC >= TO_DATE('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                  AND IPD_DISC <= TO_DATE('${toDate}', 'dd/MM/yyyy hh24:mi:ss') 
                  AND B.NS_CODE IN (SELECT NS_CODE FROM NURSTATION WHERE NSC_STATUS='Y') AND IPC_PTFLAG = 'N'
            GROUP BY B.NS_CODE
        UNION ALL
            SELECT 
                  B.NS_CODE,0 AD,0 DC,COUNT(IP.IP_NO) AS DT,0 TOT
                  FROM IPADMISS IP,BED B
            WHERE B.BD_CODE=IP.BD_CODE AND 
                  IPD_DISC >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                  AND IPD_DISC <= TO_DATE('${toDate}', 'dd/MM/yyyy hh24:mi:ss') AND IPC_STATUS='E' 
                  AND B.NS_CODE IN (SELECT NS_CODE FROM NURSTATION WHERE NSC_STATUS='Y') AND IPC_PTFLAG = 'N'
            GROUP BY B.NS_CODE
        UNION ALL
            SELECT 
                  B.NS_CODE,0 AD,0 DC,0 DT,COUNT(IP.IP_NO) TOT
                  FROM ipadmiss IP,BED B
            WHERE B.BD_CODE=IP.BD_CODE AND 
                    IPC_STATUS IS NULL
                  AND B.NS_CODE in (SELECT NS_CODE FROM NURSTATION WHERE NSC_STATUS='Y') AND IPC_PTFLAG = 'N'
                  GROUP BY  B.NS_CODE    

         ) M GROUP BY NS_CODE`;
        try {
            const result = await conn_ora.execute(
                sql,
                {},
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT },
            )
            await result.resultSet?.getRows((err, rows) => {
                callBack(err, rows)

            })
        } catch (error) {
            return callBack(error)
        } finally {
            if (conn_ora) {
                await conn_ora.close();
                await pool_ora.close();
            }
        }
    },


}