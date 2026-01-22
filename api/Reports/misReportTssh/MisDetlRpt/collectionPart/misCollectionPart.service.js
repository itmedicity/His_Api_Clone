// @ts-nocheck
const {oracledb, getTmcConnection} = require("../../../../../config/oradbconfig");

module.exports = {
  creditInsuranceBillDetlPart1: async (data, callBack) => {
    let conn_ora = await getTmcConnection();

    // const ipNumberList = (data?.ptno?.length > 0 && data?.ptno?.join(',')) || null;
    const fromDate = data.from;
    const toDate = data.to;

    const sql = `SELECT '' Ptname,
                            '' PtNo,
                            '' BillNo,
                            0 Amt,
                            0 Taxamt,
                            '' Customer,
                            '' UserName
                    FROM dual`;
    try {
      const result = await conn_ora.execute(sql, {}, {outFormat: oracledb.OUT_FORMAT_OBJECT});
      callBack(err, result.rows);
    } catch (error) {
      console.log(error);
    } finally {
      if (conn_ora) await conn_ora.close();
    }
  },
  creditInsuranceBillDetlPart2: async (data, callBack) => {
    let conn_ora = await getTmcConnection();

    // const ipNumberList = data.ptno.join(',');
    // const ipNumberList = (data?.ptno?.length > 0 && data?.ptno?.join(',')) || null;
    const fromDate = data.from;
    const toDate = data.to;

    const sql = `SELECT '' Ptname,
                            '' PtNo,
                            '' BillNo,
                            0 Amt,
                            0 Taxamt,
                            '' Customer,
                            '' UserName
                    FROM dual`;
    try {
      const result = await conn_ora.execute(sql, {}, {outFormat: oracledb.OUT_FORMAT_OBJECT});
      callBack(err, result.rows);
    } catch (error) {
      console.log(error);
    } finally {
      if (conn_ora) await conn_ora.close();
    }
  },
  creditInsuranceBillDetlPart3: async (data, callBack) => {
    let conn_ora = await getTmcConnection();

    // const ipNumberList = data.ptno.join(',');
    const ipNumberList = (data?.ptno?.length > 0 && data?.ptno?.join(",")) || null;
    const fromDate = data.from;
    const toDate = data.to;

    const sql = `SELECT INITCAP (Ptc_ptname) PtName,
                                Disbillmast.Pt_no PtNo,
                                Dm_no BillNo,
                                SUM (NVL (DMN_FINALCREDIT, 0)) + SUM (NVL (dmn_copayded_credit, 0))
                                Amt,
                                SUM (
                                    NVL (DMN_SALESTAXCH, 0)
                                + NVL (DMN_SALESTAXCR, 0)
                                + NVL (DMN_CESSCH, 0)
                                + NVL (DMN_CESSCR, 0))
                                Taxamt,
                                INITCAP (Cuc_name) Customer,
                                INITCAP (Usc_Name) UserName
                        FROM Disbillmast,
                                Patient,
                                Customer,
                                Users
                        WHERE     Disbillmast.Pt_no = Patient.Pt_no(+)
                                AND Disbillmast.Us_code = Users.Us_code
                                AND Disbillmast.Cu_code = Customer.Cu_code
                                AND dmc_slno NOT IN (SELECT dmc_slno
                                                    FROM DISBILLPAYEEALLOC
                                                    WHERE NVL (dpc_cancel, 'N') = 'N')
                                AND Dmc_cacr = 'R'
                                AND Dmd_date >=TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Dmd_date <=TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND NVL (Dmc_cancel, 'N') = 'N'
                                AND Disbillmast.IP_NO IN (${ipNumberList})
                                AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                        GROUP BY Ptc_ptname,
                                Disbillmast.Pt_no,
                                Dm_no,
                                Cuc_name,
                                Usc_Name
                        HAVING SUM (NVL (Dmn_credit, 0)) <> 0`;
    try {
      const result = await conn_ora.execute(sql, {}, {outFormat: oracledb.OUT_FORMAT_OBJECT});
      callBack(err, result.rows);
    } catch (error) {
      console.log(error);
    } finally {
      if (conn_ora) await conn_ora.close();
    }
  },
  creditInsuranceBillDetlPart4: async (data, callBack) => {
    let conn_ora = await getTmcConnection();

    // const ipNumberList = data.ptno.join(',');
    const ipNumberList = (data?.ptno?.length > 0 && data?.ptno?.join(",")) || null;
    const fromDate = data.from;
    const toDate = data.to;

    const sql = `SELECT INITCAP (Ptc_ptname) ptname,
                                Pbillmast.Pt_no PtNo,
                                Bm_no BillNo,
                                SUM (
                                    NVL (Bmn_credit, 0)
                                + NVL (PBILLMAST.BMN_SALETAXCR, 0)
                                + NVL (PBILLMAST.BMN_CESSCR, 0))
                                + SUM (NVL (Bmn_Copayded_Credit, 0))
                                Amt,
                                SUM (
                                (  NVL (BMN_SALETAXCH, 0)
                                    + NVL (BMN_SALETAXCR, 0)
                                    + NVL (BMN_CESSCH, 0)
                                    + NVL (BMN_CESSCR, 0)))
                                Taxamt,
                                INITCAP (Cuc_name) AS Customer,
                                INITCAP (Usc_Name) UserName
                        FROM Pbillmast,
                                Patient,
                                Customer,
                                Users
                        WHERE     Pbillmast.Pt_no = Patient.Pt_no(+)
                                AND Pbillmast.Us_code = Users.Us_code
                                AND Pbillmast.Cu_code = Customer.Cu_code(+)
                                AND NVL (Bmn_credit, 0) <> 0
                                AND Bmd_date >=
                                    TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Pbillmast.BMC_COLLCNCODE IS NULL
                                AND Bmd_date <=
                                    TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND pbillmast.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                                AND Bmc_cacr = 'R'
                                AND NVL (Bmc_cancel, 'N') <> 'Y'
                                AND PBILLMAST.IP_NO IN (${ipNumberList})
                        GROUP BY Ptc_ptname,
                                Pbillmast.Pt_no,
                                Bm_no,
                                Cuc_name,
                                Usc_Name
                        HAVING SUM (NVL (Bmn_credit, 0)) <> 0
                        ORDER BY Pbillmast.Pt_no`;
    try {
      const result = await conn_ora.execute(sql, {}, {outFormat: oracledb.OUT_FORMAT_OBJECT});
      callBack(err, result.rows);
    } catch (error) {
      console.log(error);
    } finally {
      if (conn_ora) await conn_ora.close();
    }
  },
  creditInsuranceBillDetlPart5: async (data, callBack) => {
    let conn_ora = await getTmcConnection();

    // const ipNumberList = data.ptno.join(',');
    const ipNumberList = (data?.ptno?.length > 0 && data?.ptno?.join(",")) || null;
    const fromDate = data.from;
    const toDate = data.to;

    const sql = `SELECT INITCAP (Ptc_ptname) ptname,
                                Pbillmast.Pt_no PtNo,
                                Bm_no BillNo,
                                SUM (NVL (Bmn_credit, 0)+ NVL (PBILLMAST.BMN_SALETAXCR, 0)+ NVL (PBILLMAST.BMN_CESSCR, 0))+ SUM (NVL (Bmn_Copayded_Credit, 0))
                                Amt,
                                SUM ( NVL (BMN_SALETAXCH, 0)+ NVL (BMN_SALETAXCR, 0)+ NVL (BMN_CESSCH, 0)+ NVL (BMN_CESSCR, 0))
                                Taxamt,
                                INITCAP (Cuc_name) AS Customer,
                                INITCAP (Usc_Name) UserName
                        FROM Pbillmast,
                                Patient,
                                Customer,
                                Users
                        WHERE     Pbillmast.Pt_no = Patient.Pt_no(+)
                                AND Pbillmast.BMC_COLLUSCODE = Users.Us_code
                                AND Pbillmast.Cu_code = Customer.Cu_code(+)
                                AND NVL (Bmn_credit, 0) <> 0
                                AND BMD_COLLDATE >=
                                    TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Pbillmast.BMC_COLLCNCODE IS NOT NULL
                                AND BMD_COLLDATE <=
                                    TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND pbillmast.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                                AND Bmc_cacr = 'R'
                                AND NVL (Bmc_cancel, 'N') <> 'Y'
                                AND PBILLMAST.IP_NO IN (${ipNumberList})
                        GROUP BY Ptc_ptname,
                                Pbillmast.Pt_no,
                                Bm_no,
                                Cuc_name,
                                Usc_Name
                        HAVING SUM (NVL (Bmn_credit, 0)) <> 0
                        ORDER BY Pbillmast.Pt_no`;
    try {
      const result = await conn_ora.execute(sql, {}, {outFormat: oracledb.OUT_FORMAT_OBJECT});
      callBack(err, result.rows);
    } catch (error) {
      console.log(error);
    } finally {
      if (conn_ora) await conn_ora.close();
    }
  },
  creditInsuranceBillDetlPart6: async (data, callBack) => {
    let conn_ora = await getTmcConnection();

    // const ipNumberList = data.ptno.join(',');
    const ipNumberList = (data?.ptno?.length > 0 && data?.ptno?.join(",")) || null;
    const fromDate = data.from;
    const toDate = data.to;

    const sql = `SELECT '' Ptname,
                            '' PtNo,
                            '' BillNo,
                            0 Amt,
                            0 Taxamt,
                            '' Customer,
                            '' UserName
                    FROM dual`;
    try {
      const result = await conn_ora.execute(sql, {}, {outFormat: oracledb.OUT_FORMAT_OBJECT});
      callBack(err, result.rows);
    } catch (error) {
      console.log(error);
    } finally {
      if (conn_ora) await conn_ora.close();
    }
  },
  unSettledAmountDetl: async (data, callBack) => {
    let conn_ora = await getTmcConnection();

    // const ipNumberList = data.ptno.join(',');
    const ipNumberList = (data?.ptno?.length > 0 && data?.ptno?.join(",")) || null;
    const fromDate = data.from;
    const toDate = data.to;

    const sql = `SELECT 
                            '' Ptname,
                            '' ptno,
                            0 billno,
                            0 Amt,
                            0 Taxamt,
                            '' Customer,
                            '' DocName,
                            '' TYPE,
                            '' Username
                    FROM DUAL`;
    try {
      const result = await conn_ora.execute(sql, {}, {outFormat: oracledb.OUT_FORMAT_OBJECT});
      callBack(err, result.rows);
    } catch (error) {
      console.log(error);
    } finally {
      if (conn_ora) await conn_ora.close();
    }
  },
  advanceCollection: async (data, callBack) => {
    let conn_ora = await getTmcConnection();

    // const ipNumberList = data.ptno.join(',');
    const ipNumberList = (data?.ptno?.length > 0 && data?.ptno?.join(",")) || null;
    const fromDate = data.from;
    const toDate = data.to;

    const sql = `SELECT INITCAP (Ptc_ptname) Ptname,
                                Opadvance.Pt_no Ptno,
                                Ar_no Billno,
                                SUM (NVL (Arn_amount, 0)) Amt,
                                INITCAP (Usc_name) UserName
                        FROM Opadvance, Patient, Users
                        WHERE     Opadvance.Pt_no = Patient.Pt_no
                                AND Opadvance.Us_code = Users.Us_code
                                AND NVL (Arc_cancel, 'N') = 'N'
                                AND Ard_date >=
                                    TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Ard_date <=
                                    TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND OPADVANCE.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                                AND OPADVANCE.IP_NO IN (${ipNumberList})
                        GROUP BY Ptc_ptname,
                                Opadvance.Pt_no,
                                Ar_no,
                                Usc_name
                        UNION ALL
                        SELECT INITCAP (Patient.Ptc_ptname) Ptname,
                                Patient.Pt_no Ptno,
                                Ar_no Billno,
                                SUM (NVL (Arn_amount, 0)) Amt,
                                INITCAP (Usc_name) UserName
                        FROM Ipadvance,
                                Ipadmiss,
                                Patient,
                                Users
                        WHERE     Ipadvance.Ip_no = Ipadmiss.Ip_no
                                AND Ipadvance.Us_code = Users.Us_code
                                AND IPadmiss.Pt_no = Patient.Pt_no
                                AND (NVL (Arc_cancel, 'N') = 'N')
                                AND Ard_date >=
                                    TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Ard_date <=
                                    TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND IPADVANCE.IAC_MHCODE IN (SELECT MH_CODE FROM multihospital)
                                AND Ipadmiss.IP_NO IN (${ipNumberList})
                        GROUP BY Patient.Ptc_ptname,
                                Patient.Pt_no,
                                Ar_no,
                                Usc_name`;
    try {
      const result = await conn_ora.execute(sql, {}, {outFormat: oracledb.OUT_FORMAT_OBJECT});
      callBack(err, result.rows);
    } catch (error) {
      console.log(error);
    } finally {
      if (conn_ora) await conn_ora.close();
    }
  },
  creditInsuranceBillCollection1: async (data, callBack) => {
    let conn_ora = await getTmcConnection();

    // const ipNumberList = data.ptno.join(',');
    const ipNumberList = (data?.ptno?.length > 0 && data?.ptno?.join(",")) || null;
    const fromDate = data.from;
    const toDate = data.to;

    const sql = `SELECT X.Rc_no BillNo,
                            NVL (Rcn_cash, 0) Cash,
                            NVL (Rcn_chk, 0) Cheque,
                            NVL (Rcn_dd, 0) DD,
                            NVL (Rcn_Card, 0) Card,
                            NVL (RCN_NEFT, 0) Bankamt,
                            INITCAP (Rcc_Bank) Bank,
                            INITCAP (Cuc_name) Customer,
                            INITCAP (Usc_name) UserName
                    FROM Recpcollectionmast X, Customer Y, Users Z,Recpcollectiondetl R
                    WHERE X.Cu_code = Y.Cu_code
                            AND X.Us_code = Z.Us_code(+)
                            AND NVL (X.Rcc_cancel, 'N') = 'N'
                            AND R.RCC_SLNO(+) = X.RCC_SLNO
                            AND X.Rcd_date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND X.Rcd_date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND X.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                            AND R.IP_NO  IN (${ipNumberList})
                            GROUP BY X.Rc_no,Rcn_cash,Rcn_chk,Rcn_dd,Rcn_Card,RCN_NEFT,Rcc_Bank,Cuc_name,Usc_name`;
    try {
      const result = await conn_ora.execute(sql, {}, {outFormat: oracledb.OUT_FORMAT_OBJECT});
      callBack(err, result.rows);
    } catch (error) {
      console.log(error);
    } finally {
      if (conn_ora) await conn_ora.close();
    }
  },
  creditInsuranceBillCollection2: async (data, callBack) => {
    let conn_ora = await getTmcConnection();

    // const ipNumberList = data.ptno.join(',');
    const ipNumberList = (data?.ptno?.length > 0 && data?.ptno?.join(",")) || null;
    const fromDate = data.from;
    const toDate = data.to;

    const sql = `SELECT X.Rc_no BillNo,
                            NVL (X.Rfn_Cash, 0) Cash,
                            NVL (X.Rfn_Chk, 0) Cheque,
                            NVL (X.Rfn_Dd, 0) DD,
                            NVL (X.Rfn_Card, 0) Card,
                            0 Bankamt,
                            INITCAP (Rcc_Bank) Bank,
                            INITCAP (Cuc_name) Customer,
                            INITCAP (Usc_name) UserName
                    FROM Recpcollectionmast X, Customer Y, Users Z,Recpcollectiondetl R
                    WHERE     X.Cu_code = Y.Cu_code
                            AND X.Us_code = Z.Us_code(+)
                            AND R.RCC_SLNO(+) = X.RCC_SLNO
                            AND NVL (X.Rcc_cancel, 'N') = 'N'
                            AND R.IP_NO IN (${ipNumberList})
                            AND X.Rfd_Date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND X.Rfd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND X.MH_CODE IN (SELECT MH_CODE FROM multihospital)`;
    try {
      const result = await conn_ora.execute(sql, {}, {outFormat: oracledb.OUT_FORMAT_OBJECT});
      callBack(err, result.rows);
    } catch (error) {
      console.log(error);
    } finally {
      if (conn_ora) await conn_ora.close();
    }
  },
};
