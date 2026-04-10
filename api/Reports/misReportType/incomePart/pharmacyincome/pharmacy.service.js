// @ts-ignore
const {oracledb, getTmcConnection} = require("../../../../../config/oradbconfig");

module.exports = {
  pharmacySalePart1: async (data) => {
    let conn_ora = await getTmcConnection();
    try {
      const result = await conn_ora.execute(
        `SELECT 
                    SUM (A.Billamt) Amt,
                    SUM (A.GrossAmt) GrossAmt,
                    SUM (A.Discount) Discount,
                    SUM (A.Comp) Comp,   
                    SUM (A.TAX) TAX
            FROM (
                SELECT 
                    SUM (DECODE (Pbillmast.Bmc_Cacr, 'R', NVL (Pbilldetl.Bdn_amount, 0), 'C', NVL (Pbilldetl.Bdn_amount, 0),  0)) Billamt,
                    SUM (DECODE (Pbillmast.Bmc_Cacr, 'R', NVL (Pbilldetl.Bdn_amount, 0), 'C', NVL (Pbilldetl.Bdn_amount, 0), 0)  + (DECODE (Pbillmast.Bmc_Cacr, 'R', NVL (Pbilldetl.Bmn_disamt, 0),  'C', NVL (Pbilldetl.Bmn_disamt, 0),  0))) GrossAmt,
                    SUM (DECODE (Pbillmast.Bmc_Cacr, 'R', NVL (Pbilldetl.Bmn_disamt, 0),  'C', NVL (Pbilldetl.Bmn_disamt, 0),  0)) Discount,
                    SUM (DECODE (Pbillmast.Bmc_Cacr,  'M', NVL (Pbilldetl.Bdn_amount, 0),  0)) AS Comp,
                    SUM (NVL (PBILLDETL.BMN_CESS, 0) + NVL (PBILLDETL.BMN_SALETAX, 0)) TAX
                FROM Pbillmast 
                JOIN Pbilldetl ON Pbilldetl.Bmc_Slno = Pbillmast.Bmc_Slno
                LEFT JOIN PATIENT ON PATIENT.PT_NO = PBILLMAST.PT_NO
                WHERE pbillmast.BMC_COLLCNCODE IS NULL
                    AND NVL(PATIENT.PTC_PTFLAG ,'N') = 'N'
                      AND NVL (Pbillmast.Bmc_cancel, 'N') = 'N'
                      AND Pbillmast.Bmc_Cacr IN ('C', 'R', 'M')
                      AND Pbillmast.BMD_DATE >= TO_DATE (:fromDate,'dd/MM/yyyy hh24:mi:ss')
                      AND Pbillmast.Bmd_Date <= TO_DATE (:toDate,'dd/MM/yyyy hh24:mi:ss')
                      AND pbillmast.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                UNION ALL
                SELECT 
                    SUM (NVL (Mretdetl.MRN_AMOUNT, 0) - NVL (Mretdetl.MRN_DISAMT, 0))  * -1 Billamt,
                    SUM (NVL (Mretdetl.MRN_AMOUNT, 0)) * -1 GrossAmt,
                    SUM (NVL (Mretdetl.MRN_DISAMT, 0)) * -1 Discount,
                    SUM (0) AS Comp,
                    SUM (NVL (MRETDETL.MRN_CESS, 0) + NVL (MRETDETL.MRN_SALETAX, 0)) * -1 TAX
                FROM Mretdetl
                JOIN Pbilldetl ON Pbilldetl.Bmc_Slno = Mretdetl.Bmc_Slno  
                JOIN mretmast ON Pbilldetl.IT_CODE = Mretdetl.It_code
                LEFT JOIN PATIENT ON PATIENT.PT_NO = MRETMAST.PT_NO
                WHERE  Pbilldetl.ITC_DOCNO = Mretdetl.Itc_docno
                    AND mretmast.mrc_slno = Mretdetl.mrc_slno
                    AND Pbilldetl.ITC_DOCTYPE = Mretdetl.Itc_Doctype
                    AND NVL(PATIENT.PTC_PTFLAG ,'N') = 'N'
                    AND Mretmast.mrc_retcncode IS NULL
                    AND Pbilldetl.Itc_Slno = Mretdetl.Itc_slno
                    AND NVL (Mretdetl.Mrc_cancel, 'N') = 'N'
                    AND NVL (mretmast.Mrc_cancel, 'N') = 'N'
                    AND Mretdetl.MRC_CACR IN ('C', 'R')
                    AND Mretdetl.MRD_DATE >= TO_DATE (:fromDate,'dd/MM/yyyy hh24:mi:ss')
                    AND MRETDETL.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                    AND Mretdetl.Mrd_Date <=TO_DATE (:toDate,'dd/MM/yyyy hh24:mi:ss')  ) A`,
        {
          fromDate: data.from,
          toDate: data.to,
        },
        {outFormat: oracledb.OUT_FORMAT_OBJECT},
      );
      // callBack(null, );
      return result.rows;
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      if (conn_ora) await conn_ora.close();
    }
  },
  phamracyReturnPart1: async (data) => {
    let conn_ora = await getTmcConnection();
    try {
      const result = await conn_ora.execute(
        `SELECT 
                    SUM (NVL (Mretdetl.MRN_AMOUNT, 0) - NVL (MRN_DISAMT, 0)) * -1 Amt,
                    SUM (NVL (Mretdetl.MRN_AMOUNT, 0)) * -1 GrossAmt,
                    SUM (NVL (MRN_DISAMT, 0)) * -1 Discount,
                    SUM (0) AS Comp,
                    SUM (NVL (MRETDETL.MRN_CESS, 0) + NVL (MRETDETL.MRN_SALETAX, 0)) * -1 TAX
            FROM Mretdetl
            JOIN Pbillmast ON Pbillmast.Bmc_Slno = Mretdetl.Bmc_Slno
            JOIN Disbillmast ON Pbillmast.Dmc_Slno = Disbillmast.Dmc_Slno
            WHERE Mretdetl.MRC_CACR IN ('I')
                    AND NVL (Mretdetl.Mrc_cancel, 'N') = 'N'
                    AND NVL (Dmc_Cancel, 'N') = 'N'
                    AND NVL(DISBILLMAST.DMC_PTFLAG ,'N') = 'N'
                    AND Disbillmast.Dmc_Cacr <> 'M'
                    AND Disbillmast.Dmd_date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                    AND Disbillmast.Dmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')`,
        {
          fromDate: data.from,
          toDate: data.to,
        },
        {outFormat: oracledb.OUT_FORMAT_OBJECT},
      );
      // callBack(null, result.rows);
      return result.rows;
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      if (conn_ora) await conn_ora.close();
    }
  },
  phamracySalePart2: async (data) => {
    let conn_ora = await getTmcConnection();
    try {
      const result = await conn_ora.execute(
        `SELECT 
            SUM (A.Billamt) Amt,
            SUM (A.GrossAmt) GrossAmt,
            SUM (A.Discount) Discount,
            SUM (A.Comp) Comp,
            SUM (A.TAX) TAX
        FROM (SELECT 
                        SUM (DECODE (Pbillmast.Bmc_Cacr, 'R', NVL (Pbilldetl.Bdn_amount, 0), 'C', NVL (Pbilldetl.Bdn_amount, 0), 0)) Billamt,
                        SUM (DECODE (Pbillmast.Bmc_Cacr, 'R', NVL (Pbilldetl.Bdn_amount, 0), 'C', NVL (Pbilldetl.Bdn_amount, 0), 0)  + (DECODE (Pbillmast.Bmc_Cacr,  'R', NVL (Pbilldetl.Bmn_disamt, 0), 'C', NVL (Pbilldetl.Bmn_disamt, 0), 0))) GrossAmt,
                        SUM (DECODE (Pbillmast.Bmc_Cacr, 'R', NVL (Pbilldetl.Bmn_disamt, 0), 'C', NVL (Pbilldetl.Bmn_disamt, 0), 0)) Discount, 
                        SUM (DECODE (Pbillmast.Bmc_Cacr, 'M', NVL (Pbilldetl.Bdn_amount, 0), 0)) AS Comp,
                        SUM (NVL (PBILLDETL.BMN_CESS, 0) + NVL (PBILLDETL.BMN_SALETAX, 0)) TAX
                FROM Pbillmast
                JOIN Pbilldetl ON Pbilldetl.Bmc_Slno = Pbillmast.Bmc_Slno
                LEFT JOIN PATIENT ON PATIENT.PT_NO = PBILLMAST.PT_NO
                    WHERE pbillmast.BMC_COLLCNCODE IS NOT NULL
                    AND NVL(PATIENT.PTC_PTFLAG,'N' ) = 'N'
                    AND NVL (Pbillmast.Bmc_cancel, 'N') = 'N'
                    AND Pbillmast.Bmc_Cacr IN ('C', 'R', 'M')
                    AND Pbillmast.BMD_COLLDATE >= TO_DATE (:fromDate,'dd/MM/yyyy hh24:mi:ss')
                    AND Pbillmast.BMD_COLLDATE <=TO_DATE (:toDate,'dd/MM/yyyy hh24:mi:ss')
                    AND pbillmast.MH_CODE IN (SELECT MH_CODE FROM multihospital)    
                UNION ALL
                SELECT 
                    SUM (NVL (Mretdetl.MRN_AMOUNT, 0) - NVL (Mretdetl.MRN_DISAMT, 0))  * -1 Billamt,
                    SUM (NVL (Mretdetl.MRN_AMOUNT, 0)) * -1 GrossAmt,
                    SUM (NVL (Mretdetl.MRN_DISAMT, 0)) * -1 Discount,
                    SUM (0) AS Comp,
                    SUM (NVL (MRETDETL.MRN_CESS, 0) + NVL (MRETDETL.MRN_SALETAX, 0)) * -1 TAX
                FROM Mretdetl
                JOIN Pbilldetl ON Pbilldetl.Bmc_Slno = Mretdetl.Bmc_Slno
                JOIN MRETMAST ON Pbilldetl.IT_CODE = Mretdetl.It_code
                LEFT JOIN PATIENT ON PATIENT.PT_NO = MRETMAST.PT_NO
                WHERE Pbilldetl.ITC_DOCNO = Mretdetl.Itc_docno
                    AND mretmast.mrc_slno = Mretdetl.mrc_slno
                    AND Pbilldetl.ITC_DOCTYPE = Mretdetl.Itc_Doctype
                    AND NVL(PATIENT.PTC_PTFLAG,'N' ) = 'N'
                    AND Mretmast.mrc_retcncode IS NOT NULL
                    AND Pbilldetl.Itc_Slno = Mretdetl.Itc_slno
                    AND NVL (Mretdetl.Mrc_cancel, 'N') = 'N'
                    AND NVL (mretmast.Mrc_cancel, 'N') = 'N'
                    AND Mretdetl.MRC_CACR IN ('C', 'R')
                    AND Mretmast.MRD_RETDATE >=TO_DATE (:fromDate,'dd/MM/yyyy hh24:mi:ss')
                    AND MRETDETL.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                    AND Mretmast.Mrd_RETDate <=TO_DATE (:toDate,'dd/MM/yyyy hh24:mi:ss') ) A`,
        {
          fromDate: data.from,
          toDate: data.to,
        },
        {outFormat: oracledb.OUT_FORMAT_OBJECT},
      );
      // callBack(null, );
      return result.rows;
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      if (conn_ora) await conn_ora.close();
    }
  },
  phamracyReturnPart2: async (data) => {
    let conn_ora = await getTmcConnection();
    try {
      const result = await conn_ora.execute(
        `SELECT 
                    SUM (NVL (Pbilldetl.Bdn_amount, 0)) Amt,
                    SUM (NVL (Pbilldetl.Bdn_amount, 0) + NVL (Pbilldetl.Bmn_disamt, 0)) GrossAmt,
                    SUM (NVL (Pbilldetl.Bmn_disamt, 0)) Discount,
                    SUM (0) AS Comp,
                    SUM (NVL (PBILLDETL.BMN_CESS, 0) + NVL (PBILLDETL.BMN_SALETAX, 0)) TAX
            FROM Pbillmast
            JOIN Disbillmast ON Pbillmast.Dmc_Slno = Disbillmast.Dmc_Slno 
            JOIN Pbilldetl ON pbillmast.bmc_slno = pbilldetl.bmc_slno
            WHERE NVL (Pbillmast.Bmc_cancel, 'N') = 'N'
                    AND NVL(DISBILLMAST.DMC_PTFLAG ,'N') = 'N'
                    AND Pbillmast.Bmc_Cacr = 'I'
                    AND NVL (Dmc_Cancel, 'N') = 'N'
                    AND Disbillmast.Dmc_Cacr <> 'M'
                    AND Disbillmast.Dmd_date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                    AND Disbillmast.Dmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')`,
        {
          fromDate: data.from,
          toDate: data.to,
        },
        {outFormat: oracledb.OUT_FORMAT_OBJECT},
      );
      // callBack(null, );
      return result.rows;
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      if (conn_ora) await conn_ora.close();
    }
  },
  phamracySalePart3: async (data) => {
    let conn_ora = await getTmcConnection();
    try {
      const result = await conn_ora.execute(
        ` SELECT 
                SUM (NVL (Pbilldetl.Bdn_amount, 0)) Amt,
                SUM (NVL (Pbilldetl.Bdn_amount, 0) + NVL (Pbilldetl.Bmn_disamt, 0)) GrossAmt,
                SUM (NVL (Pbilldetl.Bmn_disamt, 0)) Discount,
                SUM (0) AS Comp,
                SUM (NVL (PBILLDETL.BMN_CESS, 0) + NVL (PBILLDETL.BMN_SALETAX, 0)) TAX
            FROM Pbillmast
            JOIN Pbilldetl ON Pbilldetl.Bmc_Slno = Pbillmast.Bmc_Slno
            JOIN Opbillmast ON Pbilldetl.Opc_Slno = Opbillmast.Opc_Slno
            LEFT JOIN PATIENT ON PBILLMAST.PT_NO = PATIENT.PT_NO
            WHERE NVL (Pbillmast.Bmc_cancel, 'N') = 'N'
                AND NVL(PATIENT.PTC_PTFLAG , 'N') = 'N'
                AND Pbillmast.Bmc_Cacr = 'O'
                AND Opbillmast.Opc_Cacr <> 'M'
                AND NVL (Opbillmast.Opn_cancel, 'N') = 'N'
                AND Opbillmast.Opd_date >= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                AND Opbillmast.Opd_Date <= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')`,
        {
          fromDate: data.from,
          toDate: data.to,
        },
        {outFormat: oracledb.OUT_FORMAT_OBJECT},
      );
      // callBack(null, );
      return result.rows;
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      if (conn_ora) await conn_ora.close();
    }
  },
  phamracyReturnPart3: async (data) => {
    let conn_ora = await getTmcConnection();
    try {
      const result = await conn_ora.execute(
        `SELECT 
            SUM (NVL (Iprefunditemdetl.Rin_Netamt, 0)) * -1 Amt,
            SUM (NVL (Iprefunditemdetl.Rin_Netamt, 0) + NVL (Iprefunditemdetl.Rin_Disamt, 0)) * -1 GrossAmt,
            SUM (NVL (Iprefunditemdetl.Rin_Disamt, 0)) * -1 Discount,
            SUM (0) Comp,
            SUM (0) TAX
        FROM Iprefunditemdetl
        JOIN Iprefundmast ON Iprefundmast.Ric_Slno = Iprefunditemdetl.Ric_Slno
        LEFT JOIN IPADMISS ON IPADMISS.IP_NO = IPREFUNDMAST.IP_NO
        WHERE Iprefunditemdetl.Ric_Type = 'PHY'
            AND NVL(IPADMISS.IPC_PTFLAG,'N') = 'N'
            AND Iprefundmast.Ric_Cacr IN ('C', 'R')
            AND NVL (Iprefundmast.Ric_Cancel, 'N') = 'N'
            AND Iprefundmast.Rid_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
            AND IPREFUNDMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
            AND Iprefundmast.Rid_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')`,
        {
          fromDate: data.from,
          toDate: data.to,
        },
        {outFormat: oracledb.OUT_FORMAT_OBJECT},
      );
      // callBack(null, );
      return result.rows;
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      if (conn_ora) await conn_ora.close();
    }
  },
};
