// const pool = require('../../config/dbconfig');
const {getTmcConnection, oracledb} = require("../../../../config/oradbconfig");
module.exports = {
  getOpdatas: async (data, callBack) => {
    // console.log("data", data);

    let conn_ora = await getTmcConnection();
    const sql = `
                         SELECT DATEE "DATEE",
                         SUM(NEW_REG) "NEW_REG",
                         SUM(R_VISIT) "R_VISIT",
                         SUM(TOTAL) "TOTAL"
                         FROM (
                         SELECT DATEE,
                         SUM(NR) AS NEW_REG, 
                         (SUM(RV) + SUM(CV)) AS R_VISIT, 
                         (SUM(NR) + SUM(RV) + SUM(CV)) AS TOTAL
                         FROM (
                         SELECT CASE WHEN VSC_ENT = 'N' THEN 1 ELSE 0 END AS NR,
                         CASE WHEN VSC_ENT = 'V' THEN 1 ELSE 0 END AS RV,
                         CASE WHEN VSC_ENT = 'C' THEN 1 ELSE 0 END AS CV,
                         TO_CHAR(VSD_DATE, 'yyyy-mm-dd') AS DATEE
                       FROM VISITMAST 
                         WHERE VSD_DATE >= TO_DATE(:FROM_DATE, 'dd/MM/yyyy hh24:mi:ss')
                         AND VSD_DATE <= TO_DATE(:TO_DATE, 'dd/MM/yyyy hh24:mi:ss')
                         AND VSC_PTFLAG = 'N' 
                         AND VSC_CANCEL IS NULL)GROUP BY DATEE)
                         GROUP BY DATEE
                         ORDER BY DATEE`;

    // ` SELECT
    //             VISIT_DATE,
    //             SUM(N) "NEW",
    //             SUM(V) "VISIT"
    //          FROM (
    //                  SELECT
    //                         DECODE(VSC_ENT,'N',1,0 ) N,
    //                         DECODE(VSC_ENT,'V',1,0,'C',1,0 ) V,
    //                         TO_CHAR(VSD_DATE, 'yyyy-mm-dd') AS VISIT_DATE
    //                  FROM VISITMAST
    //                         WHERE ( VSD_DATE >= TO_DATE(:FROM_DATE, 'dd/MM/yyyy hh24:mi:ss') AND VSD_DATE <= TO_DATE(:TO_DATE, 'dd/MM/yyyy hh24:mi:ss') )
    //                         AND VSC_PTFLAG = 'N'
    //                         AND VSC_CANCEL IS NULL) GROUP BY VISIT_DATE`;
    try {
      const result = await conn_ora.execute(
        sql,
        {
          FROM_DATE: data.fromdate,
          TO_DATE: data.todate,
        },
        {outFormat: oracledb.OUT_FORMAT_OBJECT},
      );
      callBack(null, result.rows);
    } catch (error) {
      return callBack(error);
    } finally {
      if (conn_ora) await conn_ora.close();
    }
  },

  getCashcredit: async (data, callBack) => {
    let conn_ora = await getTmcConnection();
    const sql = `                   
                     SELECT DATEE"DATEE",SUM(N_REG)"N_REG",SUM(R_VST)"R_VST",SUM(REFUND)"REFUND",SUM(N_REG + R_VST)"TOTAL"
                     FROM (SELECT TO_CHAR(RECEIPTMAST.RPD_DATE,'yyyy-mm-dd') DATEE,
                     SUM(DECODE(RECEIPTMAST.RPC_ENT,'N',RPN_NETAMT,0)) N_REG,
                     SUM(DECODE(RECEIPTMAST.RPC_ENT,'V',RPN_NETAMT,0))R_VST,
                     SUM(RECEIPTMAST.RPN_REFUND) REFUND
                     FROM RECEIPTMAST
                     WHERE  (nvl(RECEIPTMAST.RPC_CANCEL,'N') = 'N') AND receiptmast.rpc_cacr in ('C','R') and 
                     RECEIPTMAST.RPD_DATE >=to_date(:FROM_DATE,'dd/MM/yyyy hh24:mi:ss')  AND
                     receiptmast.rpd_date <= to_date(:TO_DATE,'dd/MM/yyyy hh24:mi:ss')
                     GROUP BY Rpd_date having SUM(nvl(RPN_NETAMT,0)) <> 0 )
                     GROUP BY DATEE
                     ORDER BY DATEE`;
    try {
      const result = await conn_ora.execute(
        sql,
        {
          FROM_DATE: data.fromdate,
          TO_DATE: data.todate,
        },
        {outFormat: oracledb.OUT_FORMAT_OBJECT},
      );
      callBack(null, result.rows);
    } catch (error) {
      return callBack(error);
    } finally {
      if (conn_ora) await conn_ora.close();
    }
  },

  getIpAddmissionCount: async (data, callBack) => {
    let conn_ora = await getTmcConnection();
    const sql = `                   
                 SELECT 
            ADM_DATE, 
            SUM(COUNT) ADM_COUNT
            FROM (
            SELECT 
                TO_CHAR(IPADMISS.IPD_DATE,'YYYY-MM-DD') ADM_DATE ,
                COUNT(IP_NO) COUNT
            FROM IPADMISS 
            WHERE ( IPADMISS.IPD_DATE >= TO_DATE(:FROM_DATE,'dd/MM/yyyy hh24:mi:ss') AND
             IPADMISS.IPD_DATE <= TO_DATE(:TO_DATE,'dd/MM/yyyy hh24:mi:ss'))
            AND (IPADMISS.IPC_PTFLAG ='N')
            GROUP BY IPADMISS.IPD_DATE) GROUP BY ADM_DATE`;
    try {
      const result = await conn_ora.execute(
        sql,
        {
          FROM_DATE: data.fromdate,
          TO_DATE: data.todate,
        },
        {outFormat: oracledb.OUT_FORMAT_OBJECT},
      );
      callBack(null, result.rows);
    } catch (error) {
      return callBack(error);
    } finally {
      if (conn_ora) await conn_ora.close();
    }
  },

  getDischargeCount: async (data, callBack) => {
    let conn_ora = await getTmcConnection();
    const sql = `                   
                  SELECT 
                DIS_DATE ,
                SUM(DIS_COUNT) DIS_COUNT 
           FROM(
                SELECT 
                    TO_CHAR(TRUNC(IPADMISS.IPD_DISC),'YYYY-MM-DD') DIS_DATE,
                    COUNT(IPADMISS.IPD_DISC) DIS_COUNT
                    FROM IPADMISS
                WHERE (IPADMISS.IPD_DISC  >= TO_DATE(:FROM_DATE, 'dd/MM/yyyy hh24:mi:ss') AND IPADMISS.IPD_DISC <= TO_DATE(:TO_DATE, 'dd/MM/yyyy hh24:mi:ss'))
                    AND (IPADMISS.IPC_PTFLAG =  'N')
                GROUP BY IPADMISS.IPD_DISC)
           GROUP BY DIS_DATE`;
    try {
      const result = await conn_ora.execute(
        sql,
        {
          FROM_DATE: data.fromdate,
          TO_DATE: data.todate,
        },
        {outFormat: oracledb.OUT_FORMAT_OBJECT},
      );
      callBack(null, result.rows);
    } catch (error) {
      return callBack(error);
    } finally {
      if (conn_ora) await conn_ora.close();
    }
  },
};
