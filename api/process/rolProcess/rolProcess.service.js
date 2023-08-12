// @ts-ignore
const { oracledb, connectionClose, oraConnection } = require('../../../config/oradbconfig');

module.exports = {

    getAllPharmacySales: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        // const ouCode = data.ouCode.join(',');
        const ouCode = data.ouCode;
        const fromDate = data.from;
        const toDate = data.to;

        const sql = `SELECT 
                        BMD_DATE,
                        OU_CODE,
                        IT_CODE,
                        ITC_DESC,
                        SUM(BDN_QTY) QTY ,
                        MAX(ITN_MRP) MRP,
                        SUM(BDN_AMOUNT) TOTAL
                     FROM (
                     SELECT 
                        TO_CHAR(BMD_DATE,'YYYY-MM') BMD_DATE,
                        PBILLDETL.OU_CODE,
                        PBILLDETL.IT_CODE,
                        PBILLDETL.BDN_QTY,
                        PBILLDETL.ITN_MRP,
                        PBILLDETL.BDN_AMOUNT,
                        MEDDESC.ITC_DESC
                     FROM PBILLDETL 
                        LEFT JOIN MEDDESC ON MEDDESC.IT_CODE=PBILLDETL.IT_CODE
                     WHERE PBILLDETL.BMD_DATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                        AND PBILLDETL.BMD_DATE <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                        AND PBILLDETL.BDC_CANCEL = 'N'
                        AND PBILLDETL.OU_CODE IN  ('${ouCode}')
                       ) MONTHTABLE
                     GROUP BY OU_CODE,IT_CODE,BMD_DATE,ITC_DESC
                     ORDER BY ITC_DESC`;
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
            console.log(error)
        } finally {
            if (conn_ora) {
                await conn_ora.close();
                await pool_ora.close();
            }
        }
    },
    getOpCountMonthWise: async (data, callBack) => {

        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        const fromDate = data.from;
        const toDate = data.to;

        const sql = `SELECT 
                        MONTHS,
                        COUNT(VS_NO) COUNT
                    FROM ( 
                    SELECT 
                        TO_CHAR(VSD_DATE , 'YYYY-MM') MONTHS,
                        VS_NO
                    FROM VISITMAST
                    WHERE VISITMAST.VSD_DATE >= TO_DATE ('${fromDate}','dd/MM/yyyy hh24:mi:ss') 
                        AND  VISITMAST.VSD_DATE <= TO_DATE ('${toDate}','dd/MM/yyyy hh24:mi:ss')
                        AND VISITMAST.VSC_PTFLAG = 'N' 
                        AND VISITMAST.VSC_CANCEL IS NULL) A 
                    GROUP BY MONTHS  
                    ORDER BY MONTHS`;
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
            console.log(error)
        } finally {
            if (conn_ora) {
                await conn_ora.close();
                await pool_ora.close();
            }
        }
    },
    getIpCountMonthWise: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        const fromDate = data.from;
        const toDate = data.to;

        const sql = `SELECT 
                        MONTHS,
                        COUNT(IP_NO) COUNT
                    FROM (     
                        SELECT 
                            TO_CHAR(IPD_DATE , 'YYYY-MM') MONTHS,
                            IP_NO
                        FROM 
                            IPADMISS 
                        WHERE IPADMISS.IPD_DATE   >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss') 
                        AND IPADMISS.IPD_DATE <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                        AND IPADMISS.IPC_PTFLAG = 'N' ) A
                    GROUP BY MONTHS  
                    ORDER BY MONTHS `;
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
            console.log(error)
        } finally {
            if (conn_ora) {
                await conn_ora.close();
                await pool_ora.close();
            }
        }
    },
}