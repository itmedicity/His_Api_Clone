// @ts-ignore
const {oracledb, getTmcConnection} = require("../../../config/oradbconfig");

module.exports = {
  getAllPharmacySales: async (data) => {
    let conn_ora = await getTmcConnection();
    // const ouCode = data.ouCode.join(',');
    try {
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
      const result = await conn_ora.execute(sql, {}, {outFormat: oracledb.OUT_FORMAT_OBJECT});
      return await result.resultSet?.getRows((err, rows) => rows);
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      if (conn_ora) {
        await conn_ora.close();
      }
    }
  },
  getOpCountMonthWise: async (data) => {
    let conn_ora = await getTmcConnection();
    try {
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
      const result = await conn_ora.execute(sql, {}, {outFormat: oracledb.OUT_FORMAT_OBJECT});
      // await result.resultSet?.getRows((err, rows) => {
      // })
      return result.rows;
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      if (conn_ora) {
        await conn_ora.close();
      }
    }
  },
  getIpCountMonthWise: async (data) => {
    let conn_ora = await getTmcConnection();
    try {
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
                        WHERE IPADMISS.IPD_DATE   >= TO_DATE (:frDate, 'dd/MM/yyyy hh24:mi:ss') 
                        AND IPADMISS.IPD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                        AND IPADMISS.IPC_PTFLAG = 'N' ) A
                    GROUP BY MONTHS  
                    ORDER BY MONTHS `;
      const result = await conn_ora.execute(sql, {frDate: fromDate, toDate: toDate}, {outFormat: oracledb.OUT_FORMAT_OBJECT});
      //   await result.resultSet?.getRows((err, rows) => {
      // });
      // callBack(null, result.rows);
      return result.rows;
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      if (conn_ora) {
        await conn_ora.close();
        // await pool_ora.close();
      }
    }
  },
};
