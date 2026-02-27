// @ts-ignore
const {oracledb, getTmcConnection} = require("../../../../../config/oradbconfig");

module.exports = {
  pharmacyTmchSalePart1: async (data) => {
    let conn_ora = await getTmcConnection();

    // const ipNumberList = data.ptno.join(',');
    const fromDate = data.from;
    const toDate = data.to;

    const sql = `SELECT SUM (A.Billamt) Amt,
                                SUM (A.GrossAmt) GrossAmt,
                                SUM (A.Discount) Discount,
                                SUM (A.Comp) Comp,   
                                SUM (A.TAX) TAX
                        FROM (
                                SELECT SUM ( DECODE (Pbillmast.Bmc_Cacr, 'R', NVL (Pbilldetl.Bdn_amount, 0), 'C', NVL (Pbilldetl.Bdn_amount, 0), 0)) Billamt,
                                        SUM ( DECODE (Pbillmast.Bmc_Cacr,  'R', NVL (Pbilldetl.Bdn_amount, 0), 'C', NVL (Pbilldetl.Bdn_amount, 0), 0) + (DECODE (Pbillmast.Bmc_Cacr, 'R', NVL (Pbilldetl.Bmn_disamt, 0), 'C', NVL (Pbilldetl.Bmn_disamt, 0), 0))) GrossAmt,
                                        SUM ( DECODE (Pbillmast.Bmc_Cacr,  'R', NVL (Pbilldetl.Bmn_disamt, 0), 'C', NVL (Pbilldetl.Bmn_disamt, 0), 0))Discount,
                                        SUM ( DECODE (Pbillmast.Bmc_Cacr,   'M', NVL (Pbilldetl.Bdn_amount, 0), 0)) AS Comp,
                                        SUM ( NVL (PBILLDETL.BMN_CESS, 0) + NVL (PBILLDETL.BMN_SALETAX, 0)) TAX
                                FROM Pbillmast, Pbilldetl
                                WHERE  Pbilldetl.Bmc_Slno = Pbillmast.Bmc_Slno
                                        AND pbillmast.BMC_COLLCNCODE IS NULL
                                        AND NVL (Pbillmast.Bmc_cancel, 'N') = 'N'
                                        AND Pbillmast.Bmc_Cacr IN ('C', 'R', 'M')
                                        AND Pbillmast.BMD_DATE >= TO_DATE ('${fromDate}','dd/MM/yyyy hh24:mi:ss')
                                        AND Pbillmast.Bmd_Date <= TO_DATE ('${toDate}','dd/MM/yyyy hh24:mi:ss')
                                        AND pbillmast.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                                UNION ALL
                                SELECT SUM ( NVL (Mretdetl.MRN_AMOUNT, 0) - NVL (Mretdetl.MRN_DISAMT, 0))  * -1 Billamt,
                                        SUM (NVL (Mretdetl.MRN_AMOUNT, 0)) * -1 GrossAmt,
                                        SUM (NVL (Mretdetl.MRN_DISAMT, 0)) * -1 Discount,
                                        SUM (0) AS Comp,
                                        SUM ( NVL (MRETDETL.MRN_CESS, 0) + NVL (MRETDETL.MRN_SALETAX, 0))* -1 TAX
                                FROM Mretdetl, Pbilldetl, mretmast
                                WHERE Pbilldetl.Bmc_Slno = Mretdetl.Bmc_Slno
                                        AND Pbilldetl.IT_CODE = Mretdetl.It_code
                                        AND Pbilldetl.ITC_DOCNO = Mretdetl.Itc_docno
                                        AND mretmast.mrc_slno = Mretdetl.mrc_slno
                                        AND Pbilldetl.ITC_DOCTYPE = Mretdetl.Itc_Doctype
                                        AND Mretmast.mrc_retcncode IS NULL
                                        AND Pbilldetl.Itc_Slno = Mretdetl.Itc_slno
                                        AND NVL (Mretdetl.Mrc_cancel, 'N') = 'N'
                                        AND NVL (mretmast.Mrc_cancel, 'N') = 'N'
                                        AND Mretdetl.MRC_CACR IN ('C', 'R')
                                        AND Mretdetl.MRD_DATE >= TO_DATE ('${fromDate}','dd/MM/yyyy hh24:mi:ss')
                                        AND MRETDETL.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                                        AND Mretdetl.Mrd_Date <= TO_DATE ('${toDate}','dd/MM/yyyy hh24:mi:ss')) A`;

    try {
      const result = await conn_ora.execute(sql, {}, {outFormat: oracledb.OUT_FORMAT_OBJECT});
      // callBack(null, result.rows);
      // await result.resultSet?.getRows((err, rows) => {
      // });
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
  phamracyTmchReturnPart1: async (data) => {
    let conn_ora = await getTmcConnection();

    const ipNumberList = data.phar.join(",");
    const fromDate = data.from;
    const toDate = data.to;

    const sql = `SELECT 
                        SUM (NVL (Mretdetl.MRN_AMOUNT, 0) - NVL (MRN_DISAMT, 0)) * -1 Amt,
                        SUM (NVL (Mretdetl.MRN_AMOUNT, 0)) * -1 GrossAmt,
                        SUM (NVL (MRN_DISAMT, 0)) * -1 Discount,
                        SUM (0) AS Comp,
                        SUM (NVL (MRETDETL.MRN_CESS, 0) + NVL (MRETDETL.MRN_SALETAX, 0)) * -1 TAX
                    FROM Mretdetl, Pbillmast, Disbillmast
                    WHERE Pbillmast.Bmc_Slno = Mretdetl.Bmc_Slno
                        AND Pbillmast.Dmc_Slno = Disbillmast.Dmc_Slno
                        AND Mretdetl.MRC_CACR IN ('I')
                        AND NVL (Mretdetl.Mrc_cancel, 'N') = 'N'
                        AND NVL (Dmc_Cancel, 'N') = 'N'
                        AND Disbillmast.Dmc_Cacr <> 'M'
                        AND Disbillmast.Dmd_date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                        AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                        AND Disbillmast.Dmd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                        AND DISBILLMAST.IP_NO NOT IN (${ipNumberList})`;
    try {
      const result = await conn_ora.execute(sql, {}, {outFormat: oracledb.OUT_FORMAT_OBJECT});
      // callBack(null, );
      // await result.resultSet?.getRows((err, rows) => {
      // });
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
  phamracyTmchSalePart2: async (data) => {
    let conn_ora = await getTmcConnection();

    const fromDate = data.from;
    const toDate = data.to;

    const sql = `SELECT SUM (A.Billamt) Amt,
                            SUM (A.GrossAmt) GrossAmt,
                            SUM (A.Discount) Discount,
                            SUM (A.Comp) Comp,
                            SUM (A.TAX) TAX
                    FROM (SELECT SUM ( DECODE (Pbillmast.Bmc_Cacr, 'R', NVL (Pbilldetl.Bdn_amount, 0), 'C', NVL (Pbilldetl.Bdn_amount, 0), 0)) Billamt,
                                    SUM ( DECODE (Pbillmast.Bmc_Cacr,  'R', NVL (Pbilldetl.Bdn_amount, 0), 'C', NVL (Pbilldetl.Bdn_amount, 0), 0) + (DECODE (Pbillmast.Bmc_Cacr, 'R', NVL (Pbilldetl.Bmn_disamt, 0), 'C', NVL (Pbilldetl.Bmn_disamt, 0), 0))) GrossAmt,
                                    SUM ( DECODE (Pbillmast.Bmc_Cacr,   'R', NVL (Pbilldetl.Bmn_disamt, 0), 'C', NVL (Pbilldetl.Bmn_disamt, 0), 0)) Discount,
                                    SUM ( DECODE (Pbillmast.Bmc_Cacr,  'M', NVL (Pbilldetl.Bdn_amount, 0), 0)) AS Comp,
                                    SUM ( NVL (PBILLDETL.BMN_CESS, 0) + NVL (PBILLDETL.BMN_SALETAX, 0)) TAX
                            FROM Pbillmast, Pbilldetl
                            WHERE Pbilldetl.Bmc_Slno = Pbillmast.Bmc_Slno
                                    AND pbillmast.BMC_COLLCNCODE IS NOT NULL
                                    AND NVL (Pbillmast.Bmc_cancel, 'N') = 'N'
                                    AND Pbillmast.Bmc_Cacr IN ('C', 'R', 'M')
                                    AND Pbillmast.BMD_COLLDATE >= TO_DATE ('${fromDate}','dd/MM/yyyy hh24:mi:ss')
                                    AND Pbillmast.BMD_COLLDATE <= TO_DATE ('${toDate}','dd/MM/yyyy hh24:mi:ss')
                                    AND pbillmast.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                            UNION ALL
                            SELECT SUM ( NVL (Mretdetl.MRN_AMOUNT, 0) - NVL (Mretdetl.MRN_DISAMT, 0)) * -1 Billamt,
                                    SUM (NVL (Mretdetl.MRN_AMOUNT, 0)) * -1 GrossAmt,
                                    SUM (NVL (Mretdetl.MRN_DISAMT, 0)) * -1 Discount,
                                    SUM (0) AS Comp,
                                    SUM ( NVL (MRETDETL.MRN_CESS, 0) + NVL (MRETDETL.MRN_SALETAX, 0)) * -1 TAX
                            FROM Mretdetl, Pbilldetl, mretmast
                            WHERE Pbilldetl.Bmc_Slno = Mretdetl.Bmc_Slno
                                    AND Pbilldetl.IT_CODE = Mretdetl.It_code
                                    AND Pbilldetl.ITC_DOCNO = Mretdetl.Itc_docno
                                    AND mretmast.mrc_slno = Mretdetl.mrc_slno
                                    AND Pbilldetl.ITC_DOCTYPE = Mretdetl.Itc_Doctype
                                    AND Mretmast.mrc_retcncode IS NOT NULL
                                    AND Pbilldetl.Itc_Slno = Mretdetl.Itc_slno
                                    AND NVL (Mretdetl.Mrc_cancel, 'N') = 'N'
                                    AND NVL (mretmast.Mrc_cancel, 'N') = 'N'
                                    AND Mretdetl.MRC_CACR IN ('C', 'R')
                                    AND Mretmast.MRD_RETDATE >= TO_DATE ('${fromDate}','dd/MM/yyyy hh24:mi:ss')
                                    AND MRETDETL.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                                    AND Mretmast.Mrd_RETDate <= TO_DATE ('${toDate}','dd/MM/yyyy hh24:mi:ss')) A`;

    try {
      const result = await conn_ora.execute(sql, {}, {outFormat: oracledb.OUT_FORMAT_OBJECT});
      // callBack(null, );
      // await result.resultSet?.getRows((err, rows) => {
      // });
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
  phamracyTmchReturnPart2: async (data) => {
    let conn_ora = await getTmcConnection();

    const ipNumberList = data.phar.join(",");
    const fromDate = data.from;
    const toDate = data.to;

    const sql = `SELECT SUM (NVL (Pbilldetl.Bdn_amount, 0)) Amt,
                                SUM (NVL (Pbilldetl.Bdn_amount, 0) + NVL (Pbilldetl.Bmn_disamt, 0))
                                GrossAmt,
                                SUM (NVL (Pbilldetl.Bmn_disamt, 0)) Discount,
                                SUM (0) AS Comp,
                                SUM (NVL (PBILLDETL.BMN_CESS, 0) + NVL (PBILLDETL.BMN_SALETAX, 0)) TAX
                        FROM Pbillmast, Disbillmast, Pbilldetl
                        WHERE     pbillmast.bmc_slno = pbilldetl.bmc_slno
                                AND Pbillmast.Dmc_Slno = Disbillmast.Dmc_Slno
                                AND NVL (Pbillmast.Bmc_cancel, 'N') = 'N'
                                AND Pbillmast.Bmc_Cacr = 'I'
                                AND NVL (Dmc_Cancel, 'N') = 'N'
                                AND Disbillmast.Dmc_Cacr <> 'M'
                                AND Disbillmast.Dmd_date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                                AND Disbillmast.Dmd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Disbillmast.IP_NO NOT IN (${ipNumberList})`;

    try {
      const result = await conn_ora.execute(sql, {}, {outFormat: oracledb.OUT_FORMAT_OBJECT});
      // await result.resultSet?.getRows((err, rows) => {
      // });
      // callBack(null, );
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
  phamracyTmchSalePart3: async (data) => {
    let conn_ora = await getTmcConnection();
    const ipNumberList = data.phar.join(",");
    const fromDate = data.from;
    const toDate = data.to;

    const sql = `SELECT SUM (NVL (Pbilldetl.Bdn_amount, 0)) Amt,
                            SUM (NVL (Pbilldetl.Bdn_amount, 0) + NVL (Pbilldetl.Bmn_disamt, 0))
                            GrossAmt,
                            SUM (NVL (Pbilldetl.Bmn_disamt, 0)) Discount,
                            SUM (0) AS Comp,
                            SUM (NVL (PBILLDETL.BMN_CESS, 0) + NVL (PBILLDETL.BMN_SALETAX, 0)) TAX
                    FROM Pbillmast, Pbilldetl, Opbillmast
                    WHERE     Pbilldetl.Bmc_Slno = Pbillmast.Bmc_Slno
                            AND Pbilldetl.Opc_Slno = Opbillmast.Opc_Slno
                            AND NVL (Pbillmast.Bmc_cancel, 'N') = 'N'
                            AND Pbillmast.Bmc_Cacr = 'O'
                            AND Opbillmast.Opc_Cacr <> 'M'
                            AND NVL (Opbillmast.Opn_cancel, 'N') = 'N'
                            AND Opbillmast.Opd_date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                            AND Opbillmast.Opd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')`;

    // AND PBILLMAST.IP_NO NOT IN (${ipNumberList})
    try {
      const result = await conn_ora.execute(sql, {}, {outFormat: oracledb.OUT_FORMAT_OBJECT});
      // callBack(null, );
      // await result.resultSet?.getRows((err, rows) => {
      // });
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
  phamracyTmchReturnPart3: async (data) => {
    let conn_ora = await getTmcConnection();

    const fromDate = data.from;
    const toDate = data.to;

    const sql = `SELECT SUM (NVL (Iprefunditemdetl.Rin_Netamt, 0)) * -1 Amt,
                                SUM ( NVL (Iprefunditemdetl.Rin_Netamt, 0)  + NVL (Iprefunditemdetl.Rin_Disamt, 0)) * -1 GrossAmt,
                                SUM (NVL (Iprefunditemdetl.Rin_Disamt, 0)) * -1 Discount,
                                SUM (0) Comp,
                                SUM (0) TAX
                        FROM Iprefunditemdetl, Iprefundmast
                        WHERE  Iprefundmast.Ric_Slno = Iprefunditemdetl.Ric_Slno
                                AND Iprefunditemdetl.Ric_Type = 'PHY'
                                AND Iprefundmast.Ric_Cacr IN ('C', 'R')
                                AND NVL (Iprefundmast.Ric_Cancel, 'N') = 'N'
                                AND Iprefundmast.Rid_Date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND IPREFUNDMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                                AND Iprefundmast.Rid_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')`;

    try {
      const result = await conn_ora.execute(sql, {}, {outFormat: oracledb.OUT_FORMAT_OBJECT});
      // callBack(null, );
      // await result.resultSet?.getRows((err, rows) => {
      // });
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
