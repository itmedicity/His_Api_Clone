// @ts-nocheck
const { oracledb, connectionClose, oraConnection } = require('../../../../../config/oradbconfig');

module.exports = {
    creditInsuranceBillDetlPart1: async (data, callBack) => {

        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();

        // const ipNumberList = data.ptno.join(',');
        const fromDate = data.from;
        const toDate = data.to;

        const sql = `SELECT INITCAP (A.PtName) Ptname,
                                    A.PtNo,
                                    A.BillNo,
                                    SUM (A.Amt) AS Amt,
                                    SUM (A.Taxamt) Taxamt,
                                    INITCAP (A.Customer) Customer,
                                    INITCAP (A.UserName) UserName
                            FROM (  SELECT Ptc_ptname PtName,
                                            Billmast.Pt_no PtNo,
                                            Bm_no BillNo,
                                            SUM (NVL (Bmn_credit, 0)) Amt,
                                            SUM (NVL (Billmast.BMN_TOTTAX, 0)) Taxamt,
                                            Cuc_name Customer,
                                            Usc_Name UserName
                                        FROM Billmast,
                                            Patient,
                                            Customer,
                                            Users
                                        WHERE     Billmast.Pt_no = Patient.Pt_no(+)
                                            AND Billmast.BMC_COLLUSCODE = Users.Us_code
                                            AND Billmast.Cu_code = Customer.Cu_code(+)
                                            AND Billmast.BMC_COLLcnCODE IS NOT NULL
                                            AND BMD_COLLDATE >=
                                                    TO_DATE ('${fromDate}',
                                                            'dd/MM/yyyy hh24:mi:ss')
                                            AND BMD_COLLDATE <=
                                                    TO_DATE ('${toDate}',
                                                            'dd/MM/yyyy hh24:mi:ss')
                                            AND BILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                                            AND Bmc_cacr IN ('R')
                                            AND NVL (Bmc_cancel, 'N') = 'N'
                                            AND NVL (Bmn_credit, 0) <> 0
                                    GROUP BY Ptc_ptname,
                                            Billmast.Pt_no,
                                            Bm_no,
                                            Cuc_name,
                                            Usc_Name
                                    UNION ALL
                                    SELECT Ptc_ptname PtName,
                                            Billmast.Pt_no PtNo,
                                            Bm_no BillNo,
                                            SUM (NVL (Bmn_credit, 0)) Amt,
                                            SUM (NVL (Billmast.BMN_TOTTAX, 0)) Taxamt,
                                            Cuc_name Customer,
                                            Usc_Name UserName
                                        FROM Billmast,
                                            Patient,
                                            Customer,
                                            Users
                                        WHERE     Billmast.Pt_no = Patient.Pt_no(+)
                                            AND Billmast.Us_code = Users.Us_code
                                            AND Billmast.Cu_code = Customer.Cu_code(+)
                                            AND Billmast.BMC_COLLcnCODE IS NULL
                                            AND Bmd_date >=
                                                    TO_DATE ('${fromDate}',
                                                            'dd/MM/yyyy hh24:mi:ss')
                                            AND Bmd_date <=
                                                    TO_DATE ('${toDate}',
                                                            'dd/MM/yyyy hh24:mi:ss')
                                            AND BILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                                            AND Bmc_cacr IN ('R')
                                            AND NVL (Bmc_cancel, 'N') <> 'C'
                                            AND NVL (Bmn_credit, 0) <> 0
                                    GROUP BY Ptc_ptname,
                                            Billmast.Pt_no,
                                            Bm_no,
                                            Cuc_name,
                                            Usc_Name
                                    UNION ALL
                                    SELECT Ptc_ptname PtName,
                                            Billmast.Pt_no PtNo,
                                            Bm_no BillNo,
                                            SUM (NVL (Bmn_rtcredit, 0)) * -1 Amt,
                                            SUM (NVL (Refundbillmast.RFN_TOTTAX, 0)) * -1 Taxamt,
                                            Cuc_name Customer,
                                            Usc_Name UserName
                                        FROM Refundbillmast,
                                            Billmast,
                                            Patient,
                                            Customer,
                                            Users
                                        WHERE     Refundbillmast.Bmc_slno = Billmast.Bmc_slno
                                            AND Billmast.Pt_no = Patient.Pt_no(+)
                                            AND Billmast.BMC_COLLUSCODE = Users.Us_code
                                            AND Billmast.Cu_code = Customer.Cu_code(+)
                                            AND Refundbillmast.RFD_RETDATE >=
                                                    TO_DATE ('${fromDate}',
                                                            'dd/MM/yyyy hh24:mi:ss')
                                            AND Refundbillmast.RFD_RETDATE <=
                                                    TO_DATE ('${toDate}',
                                                            'dd/MM/yyyy hh24:mi:ss')
                                            AND Refundbillmast.Rfc_cacr IN ('R')
                                            AND Refundbillmast.Roc_Slno IS NULL
                                            AND refundbillmast.RFC_RETcnCODE IS NOT NULL
                                            AND BILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                                            AND NVL (Refundbillmast.RFC_CANCEL, 'N') = 'N'
                                            AND NVL (Bmn_rtcredit, 0) <> 0
                                    GROUP BY Ptc_ptname,
                                            Billmast.Pt_no,
                                            Bm_no,
                                            Cuc_name,
                                            Usc_Name
                                    UNION ALL
                                    SELECT Ptc_ptname PtName,
                                            Billmast.Pt_no PtNo,
                                            Bm_no BillNo,
                                            SUM (NVL (Bmn_rtcredit, 0)) * -1 Amt,
                                            SUM (NVL (Refundbillmast.RFN_TOTTAX, 0)) * -1 Taxamt,
                                            Cuc_name Customer,
                                            Usc_Name UserName
                                        FROM Refundbillmast,
                                            Billmast,
                                            Patient,
                                            Customer,
                                            Users
                                        WHERE     Refundbillmast.Bmc_slno = Billmast.Bmc_slno
                                            AND Billmast.Pt_no = Patient.Pt_no(+)
                                            AND Billmast.Us_code = Users.Us_code
                                            AND refundbillmast.RFC_RETcnCODE IS NULL
                                            AND Billmast.Cu_code = Customer.Cu_code(+)
                                            AND Refundbillmast.Rfd_date >=
                                                    TO_DATE ('${fromDate}',
                                                            'dd/MM/yyyy hh24:mi:ss')
                                            AND Refundbillmast.Rfd_date <=
                                                    TO_DATE ('${toDate}',
                                                            'dd/MM/yyyy hh24:mi:ss')
                                            AND Refundbillmast.Rfc_cacr IN ('R')
                                            AND Refundbillmast.Roc_Slno IS NULL
                                            AND BILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                                            AND NVL (Refundbillmast.RFC_CANCEL, 'N') <> 'C'
                                            AND NVL (Bmn_rtcredit, 0) <> 0
                                    GROUP BY Ptc_ptname,
                                            Billmast.Pt_no,
                                            Bm_no,
                                            Cuc_name,
                                            Usc_Name
                                    UNION ALL
                                    SELECT Ptc_ptname PtName,
                                            Billmast.Pt_no PtNo,
                                            Bm_no BillNo,
                                            SUM (NVL (Bmn_rtcredit, 0)) * -1 Amt,
                                            SUM (NVL (Refundbillmast.RFN_TOTTAX, 0)) * -1 Taxamt,
                                            Cuc_name Customer,
                                            Usc_Name UserName
                                        FROM Refundbillmast,
                                            Billmast,
                                            Patient,
                                            Customer,
                                            Users,
                                            Opbillrefundmast
                                        WHERE     Refundbillmast.Bmc_slno = Billmast.Bmc_slno
                                            AND Billmast.Pt_no = Patient.Pt_no(+)
                                            AND Billmast.BMC_COLLUSCODE = Users.Us_code
                                            AND Billmast.BMC_COLLcnCODE IS NOT NULL
                                            AND Opbillrefundmast.Roc_Slno = Refundbillmast.Roc_Slno
                                            AND Refundbillmast.Rfc_Cu_code = Customer.Cu_code(+)
                                            AND Refundbillmast.RFD_RETDATE >=
                                                    TO_DATE ('${fromDate}',
                                                            'dd/MM/yyyy hh24:mi:ss')
                                            AND Refundbillmast.RFD_RETDATE <=
                                                    TO_DATE ('${toDate}',
                                                            'dd/MM/yyyy hh24:mi:ss')
                                            AND Refundbillmast.Rfc_cacr IN ('R')
                                            AND Refundbillmast.Roc_Slno IS NOT NULL
                                            AND NVL (Refundbillmast.RFC_CANCEL, 'N') = 'N'
                                            AND BILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                                    GROUP BY Ptc_ptname,
                                            Billmast.Pt_no,
                                            Bm_no,
                                            Cuc_name,
                                            Usc_Name
                                    UNION ALL
                                    SELECT Ptc_ptname PtName,
                                            Billmast.Pt_no PtNo,
                                            Bm_no BillNo,
                                            SUM (NVL (Bmn_rtcredit, 0)) * -1 Amt,
                                            SUM (NVL (Refundbillmast.RFN_TOTTAX, 0)) * -1 Taxamt,
                                            Cuc_name Customer,
                                            Usc_Name UserName
                                        FROM Refundbillmast,
                                            Billmast,
                                            Patient,
                                            Customer,
                                            Users,
                                            Opbillrefundmast
                                        WHERE     Refundbillmast.Bmc_slno = Billmast.Bmc_slno
                                            AND Billmast.Pt_no = Patient.Pt_no(+)
                                            AND Billmast.Us_code = Users.Us_code
                                            AND Billmast.BMC_COLLcnCODE IS NULL
                                            AND Opbillrefundmast.Roc_Slno = Refundbillmast.Roc_Slno
                                            AND Refundbillmast.Rfc_Cu_code = Customer.Cu_code(+)
                                            AND Refundbillmast.Rfd_date >=
                                                    TO_DATE ('${fromDate}',
                                                            'dd/MM/yyyy hh24:mi:ss')
                                            AND Refundbillmast.Rfd_date <=
                                                    TO_DATE ('${toDate}',
                                                            'dd/MM/yyyy hh24:mi:ss')
                                            AND Refundbillmast.Rfc_cacr IN ('R')
                                            AND Refundbillmast.Roc_Slno IS NOT NULL
                                            AND NVL (Refundbillmast.RFC_CANCEL, 'N') = 'N'
                                            AND BILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                                    GROUP BY Ptc_ptname,
                                            Billmast.Pt_no,
                                            Bm_no,
                                            Cuc_name,
                                            Usc_Name) A
                            GROUP BY A.PtName,
                                    A.PtNo,
                                    A.BillNo,
                                    A.Customer,
                                    A.UserName
                            HAVING SUM (A.Amt) <> 0`;
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
    creditInsuranceBillDetlPart2: async (data, callBack) => {

        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();

        // const ipNumberList = data.ptno.join(',');
        const fromDate = data.from;
        const toDate = data.to;

        const sql = `SELECT INITCAP (A.Ptc_ptname) PtName,
                                A.Pt_no PtNo,
                                A.MR_NO BillNo,
                                SUM (A.Amt) Amt,
                                SUM (A.Taxamt) Taxamt,
                                INITCAP (A.Customer) Customer,
                                INITCAP (A.UserName) UserName
                        FROM (SELECT DISTINCT
                                        (X.Mrc_slno) Mrc_slno,
                                        Ptc_ptname,
                                        X.Pt_no,
                                        X.MR_NO,
                                        (  NVL (BMN_RTCREDIT, 0)
                                        + NVL (X.MRN_SALETAXCR, 0)
                                        + NVL (X.MRN_CESSCR, 0))
                                        Amt,
                                        (  NVL (MRN_SALETAXCH, 0)
                                        + NVL (MRN_SALETAXCR, 0)
                                        + NVL (MRN_CESSCH, 0)
                                        + NVL (MRN_CESSCR, 0))
                                        Taxamt,
                                        Cuc_name AS Customer,
                                        Usc_Name UserName
                                FROM MRETMAST X,
                                        Customer,
                                        Patient,
                                        Users
                                WHERE     X.Pt_no = Patient.Pt_no(+)
                                        AND X.Cu_code = Customer.Cu_code(+)
                                        AND X.Us_code = Users.Us_code
                                        AND X.MRC_RETCNCODE IS NULL
                                        AND X.Mrc_cacr IN ('R')
                                        AND NVL (X.Mrc_cancel, 'N') <> 'Y'
                                        AND (NVL (BMN_RTCREDIT, 0)) <> 0
                                        AND X.Mrd_date >=
                                            TO_DATE ('${fromDate}',
                                                        'dd/MM/yyyy hh24:mi:ss')
                                        AND X.Mrd_date <=
                                            TO_DATE ('${toDate}',
                                                        'dd/MM/yyyy hh24:mi:ss')
                                        AND X.MH_CODE IN (SELECT MH_CODE FROM multihospital)) A
                        GROUP BY A.Ptc_ptname,
                                A.Pt_no,
                                A.MR_NO,
                                A.Customer,
                                A.UserName
                        HAVING SUM (A.Amt) <> 0
                        ORDER BY A.Pt_no`;
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
    creditInsuranceBillDetlPart3: async (data, callBack) => {

        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();

        const ipNumberList = data.ptno.join(',');
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
                                AND Dmd_date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Dmd_date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND NVL (Dmc_cancel, 'N') = 'N'
                                AND Disbillmast.IP_NO NOT IN (${ipNumberList})
                                AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                        GROUP BY Ptc_ptname,
                                Disbillmast.Pt_no,
                                Dm_no,
                                Cuc_name,
                                Usc_Name
                        HAVING SUM (NVL (Dmn_credit, 0)) <> 0`;
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
    creditInsuranceBillDetlPart4: async (data, callBack) => {

        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();

        const ipNumberList = data.ptno.join(',');
        const fromDate = data.from;
        const toDate = data.to;

        const sql = `SELECT INITCAP (Ptc_ptname) ptname,
                                Pbillmast.Pt_no PtNo,
                                Bm_no BillNo,
                                SUM (NVL (Bmn_credit, 0)+ NVL (PBILLMAST.BMN_SALETAXCR, 0)+ NVL (PBILLMAST.BMN_CESSCR, 0))+ SUM (NVL (Bmn_Copayded_Credit, 0))
                                Amt,
                                SUM ((  NVL (BMN_SALETAXCH, 0)+ NVL (BMN_SALETAXCR, 0)+ NVL (BMN_CESSCH, 0)+ NVL (BMN_CESSCR, 0)))
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
                                AND Bmd_date >=TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Pbillmast.BMC_COLLCNCODE IS NULL
                                AND Bmd_date <=TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND pbillmast.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                                AND Bmc_cacr = 'R'
                                AND NVL (Bmc_cancel, 'N') <> 'Y'
                                AND PBILLMAST.IP_NO NOT IN (${ipNumberList})
                        GROUP BY Ptc_ptname,
                                Pbillmast.Pt_no,
                                Bm_no,
                                Cuc_name,
                                Usc_Name
                        HAVING SUM (NVL (Bmn_credit, 0)) <> 0
                        ORDER BY Pbillmast.Pt_no`;
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
    creditInsuranceBillDetlPart5: async (data, callBack) => {

        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();

        const ipNumberList = data.ptno.join(',');
        const fromDate = data.from;
        const toDate = data.to;

        const sql = `SELECT INITCAP (Ptc_ptname) ptname,
                                Pbillmast.Pt_no PtNo,
                                Bm_no BillNo,
                                SUM (NVL (Bmn_credit, 0)+ NVL (PBILLMAST.BMN_SALETAXCR, 0)+ NVL (PBILLMAST.BMN_CESSCR, 0))+ SUM (NVL (Bmn_Copayded_Credit, 0))
                                Amt,
                                SUM (NVL (BMN_SALETAXCH, 0)+ NVL (BMN_SALETAXCR, 0)+ NVL (BMN_CESSCH, 0)+ NVL (BMN_CESSCR, 0))
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
                                AND PBILLMAST.IP_NO NOT IN (${ipNumberList})
                        GROUP BY Ptc_ptname,
                                Pbillmast.Pt_no,
                                Bm_no,
                                Cuc_name,
                                Usc_Name
                        HAVING SUM (NVL (Bmn_credit, 0)) <> 0
                        ORDER BY Pbillmast.Pt_no`;
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
    creditInsuranceBillDetlPart6: async (data, callBack) => {

        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();

        // const ipNumberList = data.ptno.join(',');
        const fromDate = data.from;
        const toDate = data.to;

        const sql = `SELECT INITCAP (A.Ptc_ptname) PtName,
                                A.Pt_no PtNo,
                                A.MR_NO BillNo,
                                SUM (A.Amt) Amt,
                                SUM (A.Taxamt) Taxamt,
                                INITCAP (A.Customer) Customer,
                                INITCAP (A.UserName) UserName
                        FROM (SELECT DISTINCT
                                        (X.Mrc_slno) Mrc_slno,
                                        Ptc_ptname,
                                        X.Pt_no,
                                        X.MR_NO,
                                        (  NVL (BMN_RTCREDIT, 0)
                                        + NVL (X.MRN_SALETAXCR, 0)
                                        + NVL (X.MRN_CESSCR, 0))
                                        Amt,
                                        (  NVL (MRN_SALETAXCH, 0)
                                        + NVL (MRN_SALETAXCR, 0)
                                        + NVL (MRN_CESSCH, 0)
                                        + NVL (MRN_CESSCR, 0))
                                        Taxamt,
                                        Cuc_name AS Customer,
                                        Usc_Name UserName
                                FROM MRETMAST X,
                                        Customer,
                                        Patient,
                                        Users
                                WHERE     X.Pt_no = Patient.Pt_no(+)
                                        AND X.Cu_code = Customer.Cu_code(+)
                                        AND X.MRC_RETUSCODE = Users.Us_code
                                        AND X.Mrc_cacr IN ('R')
                                        AND X.MRC_RETCNCODE IS NOT NULL
                                        AND NVL (X.Mrc_cancel, 'N') = 'N'
                                        AND (NVL (BMN_RTCREDIT, 0)) <> 0
                                        AND X.MRD_RETDATE >=
                                            TO_DATE ('${fromDate}',
                                                        'dd/MM/yyyy hh24:mi:ss')
                                        AND X.MRD_RETDATE <=
                                            TO_DATE ('${toDate}',
                                                        'dd/MM/yyyy hh24:mi:ss')
                                        AND X.MH_CODE IN (SELECT MH_CODE FROM multihospital)) A
                        GROUP BY A.Ptc_ptname,
                                A.Pt_no,
                                A.MR_NO,
                                A.Customer,
                                A.UserName
                        HAVING SUM (A.Amt) <> 0`;
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
    unSettledAmountDetl: async (data, callBack) => {

        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();

        const ipNumberList = data.ptno.join(',');
        const fromDate = data.from;
        const toDate = data.to;

        const sql = `SELECT INITCAP (Ptname) Ptname,
                                    ptno,
                                    billno,
                                    SUM (NVL (Amt, 0)) Amt,
                                    SUM (NVL (Taxamt, 0)) Taxamt,
                                    INITCAP (Customer) Customer,
                                    INITCAP (DocName) DocName,
                                    TYPE TYPE,
                                    INITCAP (UserName) Username
                            FROM (  SELECT 'IP' TYPE,
                                            Ptc_ptname Ptname,
                                            Disbillmast.Pt_no Ptno,
                                            Dm_no Billno,
                                            SUM (NVL (DMN_FINALPTPAYABLE, 0)) Amt,
                                            SUM (
                                                NVL (DMN_SALESTAXCH, 0)
                                                + NVL (DMN_SALESTAXCR, 0)
                                                + NVL (DMN_CESSCH, 0)
                                                + NVL (DMN_CESSCR, 0))
                                                Taxamt,
                                            DECODE (Dmc_cacr, 'R', Cuc_name, '') Customer,
                                            Usc_name UserName,
                                            Doc_name DocName
                                        FROM Disbillmast,
                                            Patient,
                                            Customer,
                                            Users,
                                            Doctor
                                        WHERE     Disbillmast.Pt_no = Patient.Pt_no
                                            AND Disbillmast.Cu_code = Customer.Cu_code(+)
                                            AND Disbillmast.Us_code = Users.Us_code
                                            AND Disbillmast.Do_code = Doctor.Do_code
                                            AND Dmc_cacr IN ('C', 'R')
                                            AND NVL (Disbillmast.Dmc_cancel, 'N') = 'N'
                                            AND NVL (Dmn_ptpayable, 0) <> 0
                                            AND Disbillmast.Dmd_date >=
                                                    TO_DATE ('${fromDate}',
                                                            'dd/MM/yyyy hh24:mi:ss')
                                            AND Disbillmast.Dmd_date <=
                                                    TO_DATE ('${toDate}',
                                                            'dd/MM/yyyy hh24:mi:ss')
                                            AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                                    GROUP BY Ptc_ptname,
                                            Disbillmast.Pt_no,
                                            Dm_no,
                                            DECODE (Dmc_cacr, 'R', Cuc_name, ''),
                                            Usc_name,
                                            Doc_name
                                    UNION ALL
                                    SELECT 'IP' TYPE,
                                            Ptc_ptname Ptname,
                                            Disbillmast.Pt_no Ptno,
                                            Dm_no Billno,
                                            SUM (
                                                (  NVL (Ipreceipt.irn_amount, 0)
                                                + NVL (Ipreceipt.irn_cheque, 0)
                                                + NVL (Ipreceipt.irn_card, 0)
                                                + NVL (Ipreceipt.irn_NEFT, 0))
                                                - (  NVL (Ipreceipt.irn_balance, 0)
                                                    + NVL (Ipreceipt.IRN_REFCHEQ, 0)
                                                    + NVL (Ipreceipt.irn_refcard, 0))
                                                + NVL (Ipreceipt.irn_discount, 0))
                                            * -1
                                                Amt,
                                            SUM (0) Taxamt,
                                            DECODE (Dmc_cacr, 'R', Cuc_name, '') Customer,
                                            Usc_name UserName,
                                            Doc_name DocName
                                        FROM ipreceipt,
                                            Disbillmast,
                                            Patient,
                                            Customer,
                                            Users,
                                            Doctor
                                        WHERE     Disbillmast.Pt_no = Patient.Pt_no
                                            AND ipreceipt.Us_code = Users.Us_code
                                            AND Disbillmast.Do_code = Doctor.Do_code
                                            AND Disbillmast.Cu_code = Customer.Cu_code(+)
                                            AND Ipreceipt.Dmc_slno = Disbillmast.Dmc_slno
                                            AND Disbillmast.Dmd_date >=TO_DATE ('${fromDate}','dd/MM/yyyy hh24:mi:ss')
                                            AND Disbillmast.Dmd_date <=TO_DATE ('${toDate}','dd/MM/yyyy hh24:mi:ss')
                                            AND Ipreceipt.Dmc_type IN ('C', 'R')
                                            AND IRD_DATE >=TO_DATE ('${fromDate}','dd/MM/yyyy hh24:mi:ss')
                                            AND IRD_DATE <=TO_DATE ('${toDate}','dd/MM/yyyy hh24:mi:ss')
                                            AND ipreceipt.IPC_MHCODE IN
                                                    (SELECT MH_CODE FROM multihospital)
                                            AND Irc_cancel IS NULL
                                    GROUP BY Ptc_ptname,
                                            Disbillmast.Pt_no,
                                            Dm_no,
                                            DECODE (Dmc_cacr, 'R', Cuc_name, ''),
                                            Usc_name,
                                            Doc_name
                                    UNION ALL
                                    SELECT 'BIL' TYPE,
                                            Ptc_ptname Ptname,
                                            billmast.Pt_no Ptno,
                                            bm_no Billno,
                                            SUM (NVL (billmast.bmn_netamt, 0)) Amt,
                                            SUM (0) Taxamt,
                                            DECODE (bmc_cacr, 'R', Cuc_name, '') Customer,
                                            Usc_name UserName,
                                            Doc_name DocName
                                        FROM billmast,
                                            doctor,
                                            patient,
                                            customer,
                                            users
                                        WHERE     billmast.do_code = doctor.do_code(+)
                                            AND billmast.pt_no = patient.pt_no(+)
                                            AND billmast.cu_code = customer.cu_code(+)
                                            AND billmast.Us_code = Users.Us_code
                                            AND billmast.bmc_cacr IN ('C', 'R')
                                            AND billmast.RPN_PTPAYABLE > 0
                                            AND billmast.bmd_DATE >=
                                                    TO_DATE ('${fromDate}',
                                                            'dd/MM/yyyy hh24:mi:ss')
                                            AND billmast.bmd_DATE <=
                                                    TO_DATE ('${toDate}',
                                                            'dd/MM/yyyy hh24:mi:ss')
                                            AND billmast.mh_code IN (SELECT MH_CODE FROM multihospital)
                                            AND NVL (billmast.bmc_cancel, 'N') <> 'C'
                                            AND TRUNC (billmast.bmd_DATE) <>
                                                    TRUNC (NVL (BMD_COLLDATE, SYSDATE + 1))
                                    GROUP BY Ptc_ptname,
                                            billmast.Pt_no,
                                            bm_no,
                                            DECODE (bmc_cacr, 'R', Cuc_name, ''),
                                            Usc_name,
                                            Doc_name
                                    UNION ALL
                                    SELECT 'BIL' TYPE,
                                            Ptc_ptname Ptname,
                                            billmast.Pt_no Ptno,
                                            rf_no Billno,
                                            SUM (NVL (refundbillmast.rfn_netamt, 0)) * -1 Amt,
                                            SUM (0) Taxamt,
                                            DECODE (rfc_cacr, 'R', Cuc_name, '') Customer,
                                            Usc_name UserName,
                                            Doc_name DocName
                                        FROM refundbillmast,
                                            BILLMAST,
                                            doctor,
                                            patient,
                                            customer,
                                            users
                                        WHERE     BILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                                            AND refundbillmast.bmc_slno = BILLMAST.bmc_slno
                                            AND refundbillmast.Rfc_cacr IN ('C', 'R')
                                            AND billmast.do_code = doctor.do_code(+)
                                            AND refundbillmast.us_code = users.us_code(+)
                                            AND billmast.cu_code = customer.cu_code(+)
                                            AND Billmast.Pt_No = Patient.Pt_No(+)
                                            AND NVL (refundbillmast.Rfc_Cancel, 'N') <> 'C'
                                            AND TRUNC (refundbillmast.rfd_DATE) <>
                                                    TRUNC (NVL (RFD_RETDATE, SYSDATE + 1))
                                            AND refundbillmast.RPN_RTPTPAYABLE > 0
                                            AND NVL (refundbillmast.ROC_SLNO, 'N') = 'N'
                                            AND refundbillmast.rfd_DATE >=
                                                    TO_DATE ('${fromDate}',
                                                            'dd/MM/yyyy hh24:mi:ss')
                                            AND refundbillmast.rfd_DATE <=
                                                    TO_DATE ('${toDate}',
                                                            'dd/MM/yyyy hh24:mi:ss')
                                    GROUP BY Ptc_ptname,
                                            billmast.Pt_no,
                                            rf_no,
                                            DECODE (rfc_cacr, 'R', Cuc_name, ''),
                                            Usc_name,
                                            Doc_name
                                    UNION ALL
                                    SELECT 'REG' TYPE,
                                            Ptc_ptname Ptname,
                                            receiptmast.Pt_no Ptno,
                                            rp_no Billno,
                                            SUM (NVL (receiptmast.rpn_netamt, 0)) Amt,
                                            SUM (0) Taxamt,
                                            DECODE (rpc_cacr, 'R', Cuc_name, '') Customer,
                                            Usc_name UserName,
                                            Doc_name DocName
                                        FROM receiptmast,
                                            doctor,
                                            patient,
                                            customer,
                                            users
                                        WHERE     receiptmast.do_code = doctor.do_code(+)
                                            AND receiptmast.pt_no = patient.pt_no(+)
                                            AND receiptmast.cu_code = customer.cu_code(+)
                                            AND receiptmast.RPC_CACR IN ('C', 'R')
                                            AND receiptmast.RpD_DATE >=
                                                    TO_DATE ('${fromDate}',
                                                            'dd/MM/yyyy hh24:mi:ss')
                                            AND receiptmast.Rpd_Date <=
                                                    TO_DATE ('${toDate}',
                                                            'dd/MM/yyyy hh24:mi:ss')
                                            AND receiptmast.Us_code = Users.Us_code
                                            AND receiptmast.mh_code IN (SELECT MH_CODE FROM multihospital)
                                            AND NVL (receiptmast.rpc_cancel, 'N') <> 'C'
                                            AND TRUNC (receiptmast.RpD_DATE) <>
                                                    TRUNC (NVL (RPD_COLLDATE, SYSDATE + 1))
                                            AND RPN_PTPAYABLE > 0
                                    GROUP BY Ptc_ptname,
                                            receiptmast.Pt_no,
                                            rp_no,
                                            DECODE (rpc_cacr, 'R', Cuc_name, ''),
                                            Usc_name,
                                            Doc_name
                                    UNION ALL
                                    SELECT 'REG' TYPE,
                                            Ptc_ptname Ptname,
                                            receiptmast.Pt_no Ptno,
                                            rf_no Billno,
                                            SUM (NVL (refundreceiptmast.rfn_netamt, 0)) * -1 Amt,
                                            SUM (0) Taxamt,
                                            DECODE (rfc_cacr, 'R', Cuc_name, '') Customer,
                                            Usc_name UserName,
                                            Doc_name DocName
                                        FROM refundreceiptmast,
                                            receiptmast,
                                            doctor,
                                            patient,
                                            customer,
                                            users
                                        WHERE refundreceiptmast.MH_CODE IN
                                                (SELECT MH_CODE FROM multihospital)
                                            AND refundreceiptmast.rpc_slno = receiptmast.rpc_slno
                                            AND refundreceiptmast.Rfc_cacr IN ('C', 'R')
                                            AND receiptmast.do_code = doctor.do_code(+)
                                            AND refundreceiptmast.us_code = users.us_code(+)
                                            AND receiptmast.cu_code = customer.cu_code(+)
                                            AND Receiptmast.Pt_No = Patient.Pt_No(+)
                                            AND NVL (refundreceiptmast.ROC_SLNO, 'N') = 'N'
                                            AND NVL (refundreceiptmast.RFC_CANCEL, 'N') <> 'C'
                                            AND TRUNC (refundreceiptmast.RfD_DATE) <>
                                                    TRUNC (NVL (RFD_RETDATE, SYSDATE + 1))
                                            AND refundreceiptmast.RPN_RTPTPAYABLE > 0
                                            AND refundreceiptmast.RfD_DATE >=
                                                    TO_DATE ('${fromDate}',
                                                            'dd/MM/yyyy hh24:mi:ss')
                                            AND refundreceiptmast.Rfd_Date <=
                                                    TO_DATE ('${toDate}',
                                                            'dd/MM/yyyy hh24:mi:ss')
                                            AND NVL (refundreceiptmast.rfc_cancel, 'N') = 'P'
                                    GROUP BY Ptc_ptname,
                                            receiptmast.Pt_no,
                                            rf_no,
                                            DECODE (rfc_cacr, 'R', Cuc_name, ''),
                                            Usc_name,
                                            Doc_name
                                    UNION ALL
                                    SELECT MIN (bmc_ipop) TYPE,
                                            Ptc_ptname Ptname,
                                            pbillmast.Pt_no Ptno,
                                            bm_no Billno,
                                            SUM (NVL (pbillmast.RPN_FINALPTPAYABLE, 0)) Amt,
                                            SUM (NVL (BMN_SALETAXCH, 0) + NVL (BMN_CESSCH, 0)) Taxamt,
                                            DECODE (bmc_cacr, 'R', Cuc_name, '') Customer,
                                            Usc_name UserName,
                                            Doc_name DocName
                                        FROM pbillmast,
                                            doctor,
                                            patient,
                                            customer,
                                            users
                                        WHERE     pbillmast.do_code = doctor.do_code(+)
                                            AND pbillmast.pt_no = patient.pt_no(+)
                                            AND pbillmast.cu_code = customer.cu_code(+)
                                            AND pbillmast.Us_code = Users.Us_code
                                            AND pbillmast.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                                            AND pbillmast.Bmc_cacr IN ('C', 'R')
                                            AND NVL (PBILLMAST.Bmc_cancel, 'N') <> 'Y'
                                            AND TRUNC (pbillmast.bmd_DATE) <>
                                                    TRUNC (NVL (BMD_COLLDATE, SYSDATE + 1))
                                            AND pbillmast.RPN_PTPAYABLE > 0
                                            AND pbillmast.Bmd_date >=
                                                    TO_DATE ('${fromDate}',
                                                            'dd/MM/yyyy hh24:mi:ss')
                                            AND pbillmast.Bmd_Date <=
                                                    TO_DATE ('${toDate}',
                                                            'dd/MM/yyyy hh24:mi:ss')
                                    GROUP BY Ptc_ptname,
                                            pbillmast.Pt_no,
                                            bm_no,
                                            DECODE (bmc_cacr, 'R', Cuc_name, ''),
                                            Usc_name,
                                            Doc_name
                                    UNION ALL
                                    SELECT mrc_ipop TYPE,
                                            PBILLMAST.HOC_PTNAME Ptname,
                                            PBILLMAST.Pt_no Ptno,
                                            mretmast.mr_no Billno,
                                            (NVL (RPN_FINALRTPTPAYABLE, 0)) * -1 Amt,
                                            (  NVL (mretmast.MRN_CESSCH, 0)
                                            + NVL (mretmast.MRN_CESSCH, 0)
                                            + NVL (MRETmast.MRN_SALETAXCH, 0)
                                            + NVL (Mretmast.MRN_SALETAXCR, 0))
                                            * -1
                                            Taxamt,
                                            DECODE (mretmast.mrc_cacr, 'R', Cuc_name, '') Customer,
                                            Usc_name UserName,
                                            Doc_name DocName
                                    FROM (  SELECT Mretdetl.Mrc_Slno, MAX (Mretdetl.Bmc_Slno) Bmc_Slno
                                                FROM Mretdetl
                                            GROUP BY Mretdetl.Mrc_Slno) Mretdetl,
                                            mretmast,
                                            PBILLMAST,
                                            doctor,
                                            customer,
                                            users
                                    WHERE     PBILLMAST.do_code = doctor.do_code(+)
                                            AND MRETDETL.mrc_slno = mretmast.mrc_slno
                                            AND PBILLMAST.us_code = users.us_code(+)
                                            AND PBILLMAST.cu_code = customer.cu_code(+)
                                            AND PBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                                            AND MRETDETL.Bmc_slno = PBILLMAST.Bmc_slno
                                            AND mretmast.Mrc_cacr IN ('C', 'R')
                                            AND NVL (PBILLMAST.Bmc_cancel, 'N') <> 'Y'
                                            AND NVL (mretmast.MRC_CANCEL, 'N') <> 'Y'
                                            AND TRUNC (mretmast.Mrd_date) <>
                                                TRUNC (NVL (mretmast.MRD_RETDATE, SYSDATE + 1))
                                            AND mretmast.RPN_RTPTPAYABLE > 0
                                            AND mretmast.Mrd_date >=
                                                TO_DATE ('${fromDate}',
                                                            'dd/MM/yyyy hh24:mi:ss')
                                            AND mretmast.Mrd_Date <=
                                                TO_DATE ('${toDate}',
                                                            'dd/MM/yyyy hh24:mi:ss')) A
                            GROUP BY Ptname,
                                    ptno,
                                    billno,
                                    Customer,
                                    DocName,
                                    TYPE,
                                    UserName
                            HAVING SUM (NVL (Amt, 0)) <> 0
                            ORDER BY 3, 1`;
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
    advanceCollection: async (data, callBack) => {

        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();

        const ipNumberList = data.ptno.join(',');
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
                                AND OPADVANCE.IP_NO NOT IN (${ipNumberList})
                        GROUP BY Ptc_ptname,
                                Opadvance.Pt_no,
                                Ar_no,
                                Usc_name
                        UNION ALL
                        SELECT INITCAP (Patient.Ptc_ptname) Ptname,
                                Phadvanceentry.Pt_no Ptno,
                                Ar_no Billno,
                                SUM (NVL (Arn_amount, 0)) Amt,
                                INITCAP (Usc_name) UserName
                        FROM Phadvanceentry, Patient, Users
                        WHERE     Phadvanceentry.Pt_no = Patient.Pt_no
                                AND Phadvanceentry.Us_code = Users.Us_code
                                AND (NVL (Arc_cancel, 'N') = 'N')
                                AND Ard_date >=
                                    TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Ard_date <=
                                    TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND PHADVANCEENTRY.ARC_MHCODE IN (SELECT MH_CODE FROM multihospital)
                        GROUP BY Patient.Ptc_ptname,
                                Phadvanceentry.Pt_no,
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
                                AND Ipadmiss.IP_NO NOT IN (${ipNumberList})
                        GROUP BY Patient.Ptc_ptname,
                                Patient.Pt_no,
                                Ar_no,
                                Usc_name
                        UNION ALL
                        SELECT INITCAP (Ptc_ptname) Ptname,
                                Advanceentry.Pt_no Ptno,
                                Ar_no Billno,
                                SUM (NVL (Arn_amount, 0)) Amt,
                                INITCAP (Usc_name) UserName
                        FROM Advanceentry, Patient, Users
                        WHERE     Advanceentry.Pt_no = Patient.Pt_no
                                AND Advanceentry.Us_code = Users.Us_code
                                AND (NVL (Arc_cancel, 'N') = 'N')
                                AND Ard_date >=
                                    TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Ard_Date <=
                                    TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND ADVANCEENTRY.ARC_MHCODE IN (SELECT MH_CODE FROM multihospital)
                        GROUP BY Ptc_ptname,
                                Advanceentry.Pt_no,
                                Ar_no,
                                Usc_name`;
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
    creditInsuranceBillCollection1: async (data, callBack) => {

        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();

        const ipNumberList = data.ptno.join(',');
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
                            AND (R.IP_NO IS NOT NULL)
                            AND R.IP_NO NOT IN (${ipNumberList})
                            GROUP BY X.Rc_no,Rcn_cash,Rcn_chk,Rcn_dd,Rcn_Card,RCN_NEFT,Rcc_Bank,Cuc_name,Usc_name
                    UNION ALL
                    SELECT X.Rc_no BillNo,
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
                            AND R.IP_NO IS NULL
                            GROUP BY X.Rc_no,Rcn_cash,Rcn_chk,Rcn_dd,Rcn_Card,RCN_NEFT,Rcc_Bank,Cuc_name,Usc_name`;
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
    creditInsuranceBillCollection2: async (data, callBack) => {

        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();

        const ipNumberList = data.ptno.join(',');
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
                            AND X.Rfd_Date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND X.Rfd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND X.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                            AND (R.IP_NO IS NOT NULL)
                            AND R.IP_NO NOT IN (${ipNumberList})
                    UNION 
                    SELECT X.Rc_no BillNo,
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
                            AND X.Rfd_Date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND X.Rfd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND X.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                            AND R.IP_NO IS NULL`;
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