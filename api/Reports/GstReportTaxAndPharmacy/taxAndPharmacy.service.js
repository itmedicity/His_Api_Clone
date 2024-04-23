const pool = require('../../../config/dbconfig');
const { oraConnection, oracledb } = require('../../../config/oradbconfig')

module.exports = {

    getGstReportOfPharmacy: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        const fromDate = data.from;
        const toDate = data.to;

        const sql = `SELECT OUCODE,CODE,BILL,BILLDATE,CACR,QTY,LOOSE,PRATE,MRP,ACTMRP,AMT,DIS,TAXCODE,TAXPER,TAXAMT,OUTLET.OUC_DESC,MEDDESC.ITC_DESC,TAX.TXC_DESC
                FROM (
                SELECT
                            PBILLDETL.OU_CODE OUCODE,
                            PBILLDETL.IT_CODE CODE,
                            PBILLDETL.BM_NO BILL,
                            PBILLDETL.BMD_DATE BILLDATE,
                            PBILLDETL.BMC_CACR CACR,
                            PBILLDETL.BDN_QTY QTY,
                            PBILLDETL.BDN_LOOSE LOOSE,
                            PBILLDETL.ITN_PRATE PRATE,
                            PBILLDETL.ITN_MRP MRP,
                            PBILLDETL.ITN_ACTMRP ACTMRP,
                            PBILLDETL.BDN_AMOUNT AMT,
                            PBILLDETL.BMN_DISAMT DIS,
                            PBILLDETL.PBC_ACTTXCODE TAXCODE,
                            PBILLDETL.TXN_SALPER TAXPER,
                            PBILLDETL.BMN_SALETAX TAXAMT
                    FROM Pbillmast, Pbilldetl
                    WHERE     Pbilldetl.Bmc_Slno = Pbillmast.Bmc_Slno
                            AND pbillmast.BMC_COLLCNCODE IS NULL
                            AND NVL (Pbillmast.Bmc_cancel, 'N') = 'N'
                            AND Pbillmast.Bmc_Cacr IN ('C', 'R', 'M')
                            AND Pbillmast.BMD_DATE >=
                                   TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND Pbillmast.Bmd_Date <=
                                   TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND pbillmast.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                    UNION ALL
                SELECT
                            MRETDETL.OU_CODE OUCODE,
                            MRETDETL.IT_CODE CODE,
                            MRETDETL.MR_NO BILL,
                            MRETDETL.MRD_DATE BILLDATE,
                            MRETDETL.MRC_CACR CACR,
                            (MRETDETL.MRN_QTY *-1) QTY,
                            (MRETDETL.MRN_LOOSE*-1) LOOSE,
                            MRETDETL.ITN_PRATE PRATE,
                            MRETDETL.ITN_MRP MRP,
                            MRETDETL.ITN_ACTMRP ACTMRP,
                            (MRETDETL.MRN_AMOUNT*-1) AMT,
                            (MRETDETL.MRN_DISAMT*-1) DIS,
                            MRETDETL.MRC_ACTTXCODE TAXCODE,
                            MRETDETL.TXN_SALPER TAXPER,
                            (MRETDETL.MRN_SALETAX *-1) TAXAMT
                    FROM Mretdetl, Pbilldetl, mretmast
                    WHERE  Pbilldetl.Bmc_Slno = Mretdetl.Bmc_Slno
                            AND Pbilldetl.IT_CODE = Mretdetl.It_code
                            AND Pbilldetl.ITC_DOCNO = Mretdetl.Itc_docno
                            AND mretmast.mrc_slno = Mretdetl.mrc_slno
                            AND Pbilldetl.ITC_DOCTYPE = Mretdetl.Itc_Doctype
                            AND Mretmast.mrc_retcncode IS NULL
                            AND Pbilldetl.Itc_Slno = Mretdetl.Itc_slno
                            AND NVL (Mretdetl.Mrc_cancel, 'N') = 'N'
                            AND NVL (mretmast.Mrc_cancel, 'N') = 'N'
                            AND Mretdetl.MRC_CACR IN ('C', 'R')
                            AND Mretdetl.MRD_DATE >=
                                    TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND MRETDETL.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                            AND Mretdetl.Mrd_Date <=
                                  TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                        ) A , MEDDESC, OUTLET,TAX
                        WHERE  A.OUCODE = OUTLET.OU_CODE
                            AND A.CODE = MEDDESC.IT_CODE
                            AND A.TAXCODE = TAX.TX_CODE
                    UNION ALL
        SELECT OUCODE,CODE,BILL,BILLDATE,CACR,QTY,LOOSE,PRATE,MRP,ACTMRP,AMT,DIS,TAXCODE,TAXPER,TAXAMT,OUTLET.OUC_DESC,MEDDESC.ITC_DESC,TAX.TXC_DESC
                FROM (
                SELECT
                            MRETDETL.OU_CODE OUCODE,
                            MRETDETL.IT_CODE CODE,
                            MRETDETL.MR_NO BILL,
                            MRETDETL.MRD_DATE BILLDATE,
                            MRETDETL.MRC_CACR CACR,
                            (MRETDETL.MRN_QTY *-1) QTY,
                            (MRETDETL.MRN_LOOSE*-1) LOOSE,
                            MRETDETL.ITN_PRATE PRATE,
                            MRETDETL.ITN_MRP MRP,
                            MRETDETL.ITN_ACTMRP ACTMRP,
                            (MRETDETL.MRN_AMOUNT*-1) AMT,
                            (MRETDETL.MRN_DISAMT*-1) DIS,
                            MRETDETL.MRC_ACTTXCODE TAXCODE,
                            MRETDETL.TXN_SALPER TAXPER,
                            (MRETDETL.MRN_SALETAX *-1) TAXAMT
                    FROM Mretdetl, Pbillmast, Disbillmast
                WHERE Pbillmast.Bmc_Slno = Mretdetl.Bmc_Slno
                            AND Pbillmast.Dmc_Slno = Disbillmast.Dmc_Slno
                            AND Mretdetl.MRC_CACR IN ('I')
                            AND NVL (Mretdetl.Mrc_cancel, 'N') = 'N'
                            AND NVL (Dmc_Cancel, 'N') = 'N'
                            AND Disbillmast.Dmc_Cacr <> 'M'
                            AND Disbillmast.Dmd_date >=
                                  TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                            AND Disbillmast.Dmd_Date <=
                                  TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                            ) A,MEDDESC, OUTLET,TAX
                        WHERE  A.OUCODE = OUTLET.OU_CODE
                            AND A.CODE = MEDDESC.IT_CODE
                            AND A.TAXCODE = TAX.TX_CODE
        
                UNION ALL
                SELECT OUCODE,CODE,BILL,BILLDATE,CACR,QTY,LOOSE,PRATE,MRP,ACTMRP,AMT,DIS,TAXCODE,TAXPER,TAXAMT,OUTLET.OUC_DESC,MEDDESC.ITC_DESC,TAX.TXC_DESC
                FROM (
                    SELECT
                            PBILLDETL.OU_CODE OUCODE,
                            PBILLDETL.IT_CODE CODE,
                            PBILLDETL.BM_NO BILL,
                            PBILLDETL.BMD_DATE BILLDATE,
                            PBILLDETL.BMC_CACR CACR,
                            PBILLDETL.BDN_QTY QTY,
                            PBILLDETL.BDN_LOOSE LOOSE,
                            PBILLDETL.ITN_PRATE PRATE,
                            PBILLDETL.ITN_MRP MRP,
                            PBILLDETL.ITN_ACTMRP ACTMRP,
                            PBILLDETL.BDN_AMOUNT AMT,
                            PBILLDETL.BMN_DISAMT DIS,
                            PBILLDETL.PBC_ACTTXCODE TAXCODE,
                            PBILLDETL.TXN_SALPER TAXPER,
                            PBILLDETL.BMN_SALETAX TAXAMT
                    FROM Pbillmast, Pbilldetl
                    WHERE     Pbilldetl.Bmc_Slno = Pbillmast.Bmc_Slno
                            AND pbillmast.BMC_COLLCNCODE IS NOT NULL
                            AND NVL (Pbillmast.Bmc_cancel, 'N') = 'N'
                            AND Pbillmast.Bmc_Cacr IN ('C', 'R', 'M')
                            AND Pbillmast.BMD_COLLDATE >=
                                TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND Pbillmast.BMD_COLLDATE <=
                                TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND pbillmast.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                    UNION ALL
                    SELECT
                            MRETDETL.OU_CODE OUCODE,
                            MRETDETL.IT_CODE CODE,
                            MRETDETL.MR_NO BILL,
                            MRETDETL.MRD_DATE BILLDATE,
                            MRETDETL.MRC_CACR CACR,
                            (MRETDETL.MRN_QTY *-1) QTY,
                            (MRETDETL.MRN_LOOSE*-1) LOOSE,
                            MRETDETL.ITN_PRATE PRATE,
                            MRETDETL.ITN_MRP MRP,
                            MRETDETL.ITN_ACTMRP ACTMRP,
                            (MRETDETL.MRN_AMOUNT*-1) AMT,
                            (MRETDETL.MRN_DISAMT*-1) DIS,
                            MRETDETL.MRC_ACTTXCODE TAXCODE,
                            MRETDETL.TXN_SALPER TAXPER,
                            (MRETDETL.MRN_SALETAX *-1) TAXAMT
                    FROM Mretdetl, Pbilldetl, mretmast
                    WHERE     Pbilldetl.Bmc_Slno = Mretdetl.Bmc_Slno
                            AND Pbilldetl.IT_CODE = Mretdetl.It_code
                            AND Pbilldetl.ITC_DOCNO = Mretdetl.Itc_docno
                            AND mretmast.mrc_slno = Mretdetl.mrc_slno
                            AND Pbilldetl.ITC_DOCTYPE = Mretdetl.Itc_Doctype
                            AND Mretmast.mrc_retcncode IS NOT NULL
                            AND Pbilldetl.Itc_Slno = Mretdetl.Itc_slno
                            AND NVL (Mretdetl.Mrc_cancel, 'N') = 'N'
                            AND NVL (mretmast.Mrc_cancel, 'N') = 'N'
                            AND Mretdetl.MRC_CACR IN ('C', 'R')
                            AND Mretmast.MRD_RETDATE >=
                                TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND MRETDETL.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                            AND Mretmast.Mrd_RETDate <=
                                TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                            ) A  , MEDDESC, OUTLET,TAX
                    WHERE  A.OUCODE = OUTLET.OU_CODE
                            AND A.CODE = MEDDESC.IT_CODE
                            AND A.TAXCODE = TAX.TX_CODE
                UNION ALL
                SELECT OUCODE,CODE,BILL,BILLDATE,CACR,QTY,LOOSE,PRATE,MRP,ACTMRP,AMT,DIS,TAXCODE,TAXPER,TAXAMT,OUTLET.OUC_DESC,MEDDESC.ITC_DESC,TAX.TXC_DESC
                FROM (
                    SELECT
                            PBILLDETL.OU_CODE OUCODE,
                            PBILLDETL.IT_CODE CODE,
                            PBILLDETL.BM_NO BILL,
                            PBILLDETL.BMD_DATE BILLDATE,
                            PBILLDETL.BMC_CACR CACR,
                            PBILLDETL.BDN_QTY QTY,
                            PBILLDETL.BDN_LOOSE LOOSE,
                            PBILLDETL.ITN_PRATE PRATE,
                            PBILLDETL.ITN_MRP MRP,
                            PBILLDETL.ITN_ACTMRP ACTMRP,
                            PBILLDETL.BDN_AMOUNT AMT,
                            PBILLDETL.BMN_DISAMT DIS,
                            PBILLDETL.PBC_ACTTXCODE TAXCODE,
                            PBILLDETL.TXN_SALPER TAXPER,
                            PBILLDETL.BMN_SALETAX TAXAMT
                    FROM Pbillmast, Disbillmast, Pbilldetl
                    WHERE  pbillmast.bmc_slno = pbilldetl.bmc_slno
                            AND Pbillmast.Dmc_Slno = Disbillmast.Dmc_Slno
                            AND NVL (Pbillmast.Bmc_cancel, 'N') = 'N'
                            AND Pbillmast.Bmc_Cacr = 'I'
                            AND NVL (Dmc_Cancel, 'N') = 'N'
                            AND Disbillmast.Dmc_Cacr <> 'M'
                            AND Disbillmast.Dmd_date >=
                                TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                            AND Disbillmast.Dmd_Date <=
                                TO_DATE('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                            ) A ,MEDDESC, OUTLET,TAX
                    WHERE  A.OUCODE = OUTLET.OU_CODE
                            AND A.CODE = MEDDESC.IT_CODE
                            AND A.TAXCODE = TAX.TX_CODE`;


        try {
            const result = await conn_ora.execute(
                sql,
                {},
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT }
            )
            const gstReportFromOra = await result.resultSet?.getRows();
            return callBack(null, gstReportFromOra)
        }
        catch (error) {
            return callBack(error)
        }
        finally {
            if (conn_ora) {
                await conn_ora.close();
                await pool_ora.close();
            }
        }

    },






    getGstReportPharmacyWise: async (data, callBack) => {

        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        const fromDate = data.from;
        const toDate = data.to;
        const sql = `SELECT OUCODE,CODE,BILL,BILLDATE,CACR,QTY,LOOSE,PRATE,MRP,ACTMRP,AMT,DIS,TAXCODE,TAXPER,TAXAMT,OUTLET.OUC_DESC,MEDDESC.ITC_DESC,TAX.TXC_DESC
        FROM (
          SELECT 
                    PBILLDETL.OU_CODE OUCODE,
                    PBILLDETL.IT_CODE CODE,
                    PBILLDETL.BM_NO BILL,
                    PBILLDETL.BMD_DATE BILLDATE,
                    PBILLDETL.BMC_CACR CACR,
                    PBILLDETL.BDN_QTY QTY,
                    PBILLDETL.BDN_LOOSE LOOSE, 
                    PBILLDETL.ITN_PRATE PRATE,
                    PBILLDETL.ITN_MRP MRP,
                    PBILLDETL.ITN_ACTMRP ACTMRP,
                    PBILLDETL.BDN_AMOUNT AMT,
                    PBILLDETL.BMN_DISAMT DIS,
                    PBILLDETL.PBC_ACTTXCODE TAXCODE,
                    PBILLDETL.TXN_SALPER TAXPER,
                    PBILLDETL.BMN_SALETAX TAXAMT
            FROM Pbillmast, Pbilldetl
            WHERE     Pbilldetl.Bmc_Slno = Pbillmast.Bmc_Slno
                    AND pbillmast.BMC_COLLCNCODE IS NULL
                    AND NVL (Pbillmast.Bmc_cancel, 'N') = 'N'
                    AND Pbillmast.Bmc_Cacr IN ('C', 'R', 'M')
                    AND Pbillmast.BMD_DATE >=
                        TO_DATE ('${fromDate}','dd/MM/yyyy hh24:mi:ss')
                    AND Pbillmast.Bmd_Date <=
                        TO_DATE ('${toDate}','dd/MM/yyyy hh24:mi:ss')
                    AND pbillmast.MH_CODE IN (SELECT MH_CODE FROM multihospital)
            UNION ALL                   
            SELECT 
                    MRETDETL.OU_CODE OUCODE,
                    MRETDETL.IT_CODE CODE,
                    MRETDETL.MR_NO BILL,
                    MRETDETL.MRD_DATE BILLDATE,
                    MRETDETL.MRC_CACR CACR,
                    (MRETDETL.MRN_QTY *-1) QTY,
                    (MRETDETL.MRN_LOOSE*-1) LOOSE,
                    MRETDETL.ITN_PRATE PRATE,
                    MRETDETL.ITN_MRP MRP,
                    MRETDETL.ITN_ACTMRP ACTMRP,
                    (MRETDETL.MRN_AMOUNT*-1) AMT,
                    (MRETDETL.MRN_DISAMT*-1) DIS,
                    MRETDETL.MRC_ACTTXCODE  TAXCODE,
                    MRETDETL.TXN_SALPER TAXPER,
                    (MRETDETL.MRN_SALETAX *-1) TAXAMT
            FROM Mretdetl, Pbilldetl, mretmast
            WHERE  Pbilldetl.Bmc_Slno = Mretdetl.Bmc_Slno
                    AND Pbilldetl.IT_CODE = Mretdetl.It_code
                    AND Pbilldetl.ITC_DOCNO = Mretdetl.Itc_docno
                    AND mretmast.mrc_slno = Mretdetl.mrc_slno
                    AND Pbilldetl.ITC_DOCTYPE = Mretdetl.Itc_Doctype
                    AND Mretmast.mrc_retcncode IS NULL
                    AND Pbilldetl.Itc_Slno = Mretdetl.Itc_slno
                    AND NVL (Mretdetl.Mrc_cancel, 'N') = 'N'
                    AND NVL (mretmast.Mrc_cancel, 'N') = 'N'
                    AND Mretdetl.MRC_CACR IN ('C', 'R')
                    AND Mretdetl.MRD_DATE >=
                        TO_DATE ('${fromDate}','dd/MM/yyyy hh24:mi:ss')
                    AND MRETDETL.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                    AND Mretdetl.Mrd_Date <=
                        TO_DATE ('${toDate}','dd/MM/yyyy hh24:mi:ss') 
                ) A , MEDDESC, OUTLET,TAX
                WHERE  A.OUCODE = OUTLET.OU_CODE
                    AND A.CODE = MEDDESC.IT_CODE
                    AND A.TAXCODE = TAX.TX_CODE`;

        try {
            const result = await conn_ora.execute(
                sql,
                {},
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT }
            )
            const gstReportFromOra = await result.resultSet?.getRows();
            return callBack(null, gstReportFromOra)
        }
        catch (error) {
            return callBack(error)
        }
        finally {
            if (conn_ora) {
                await conn_ora.close();
                await pool_ora.close();
            }
        }

    },

    getInPatientMedReturn: async (data, callBack) => {

        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        const fromDate = data.from;
        const toDate = data.to;
        const sql = `SELECT OUCODE,CODE,BILL,BILLDATE,CACR,QTY,LOOSE,PRATE,MRP,ACTMRP,AMT,DIS,TAXCODE,TAXPER,TAXAMT,OUTLET.OUC_DESC,MEDDESC.ITC_DESC,TAX.TXC_DESC
                                    FROM (
                                    SELECT 
                                        MRETDETL.OU_CODE OUCODE,
                                        MRETDETL.IT_CODE CODE,
                                        MRETDETL.MR_NO BILL,
                                        MRETDETL.MRD_DATE BILLDATE,
                                        MRETDETL.MRC_CACR CACR,
                                        (MRETDETL.MRN_QTY *-1) QTY,
                                        (MRETDETL.MRN_LOOSE*-1) LOOSE,
                                        MRETDETL.ITN_PRATE PRATE,
                                        MRETDETL.ITN_MRP MRP,
                                        MRETDETL.ITN_ACTMRP ACTMRP,
                                        (MRETDETL.MRN_AMOUNT*-1) AMT,
                                        (MRETDETL.MRN_DISAMT*-1) DIS,
                                        MRETDETL.MRC_ACTTXCODE TAXCODE,
                                        MRETDETL.TXN_SALPER TAXPER,
                                        (MRETDETL.MRN_SALETAX *-1) TAXAMT,
                                        MRETDETL.MRC_ACTTXCODE ACTAX
                        FROM Mretdetl, Pbillmast, Disbillmast
                        WHERE     Pbillmast.Bmc_Slno = Mretdetl.Bmc_Slno
                            AND Pbillmast.Dmc_Slno = Disbillmast.Dmc_Slno
                            AND Mretdetl.MRC_CACR IN ('I')
                            AND NVL (Mretdetl.Mrc_cancel, 'N') = 'N'
                            AND NVL (Dmc_Cancel, 'N') = 'N'
                            AND Disbillmast.Dmc_Cacr <> 'M'
                            AND Disbillmast.Dmd_date >=
                            TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                            AND Disbillmast.Dmd_Date <=
                            TO_DATE('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                            ) A,MEDDESC, OUTLET,TAX
                                    WHERE  A.OUCODE = OUTLET.OU_CODE
                                        AND A.CODE = MEDDESC.IT_CODE
                                        AND A.ACTAX = TAX.TX_CODE`;
        try {
            const result = await conn_ora.execute(
                sql,
                {},
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT }
            )
            const gstReportFromOra = await result.resultSet?.getRows();
            return callBack(null, gstReportFromOra)
        }
        catch (error) {
            return callBack(error)
        }
        finally {
            if (conn_ora) {
                await conn_ora.close();
                await pool_ora.close();
            }
        }

    },

    getInPatientMedSale: async (data, callBack) => {

        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        const fromDate = data.from;
        const toDate = data.to;
        const sql = ` SELECT OUCODE,CODE,BILL,BILLDATE,CACR,QTY,LOOSE,PRATE,MRP,ACTMRP,AMT,DIS,TAXCODE,TAXPER,TAXAMT,OUTLET.OUC_DESC,MEDDESC.ITC_DESC,TAX.TXC_DESC
        FROM (
    SELECT
                    PBILLDETL.OU_CODE OUCODE,
                    PBILLDETL.IT_CODE CODE,
                    PBILLDETL.BM_NO BILL,
                    PBILLDETL.BMD_DATE BILLDATE,
                    PBILLDETL.BMC_CACR CACR,
                    PBILLDETL.BDN_QTY QTY,
                    PBILLDETL.BDN_LOOSE LOOSE, 
                    PBILLDETL.ITN_PRATE PRATE,
                    PBILLDETL.ITN_MRP MRP,
                    PBILLDETL.ITN_ACTMRP ACTMRP,
                    PBILLDETL.BDN_AMOUNT AMT,
                    PBILLDETL.BMN_DISAMT DIS,
                    PBILLDETL.PBC_ACTTXCODE TAXCODE,
                    PBILLDETL.TXN_SALPER TAXPER,
                    PBILLDETL.BMN_SALETAX TAXAMT,
                    PBILLDETL.PBC_ACTTXCODE ACTAX
    FROM Pbillmast, Disbillmast, Pbilldetl
    WHERE     pbillmast.bmc_slno = pbilldetl.bmc_slno
            AND Pbillmast.Dmc_Slno = Disbillmast.Dmc_Slno
            AND NVL (Pbillmast.Bmc_cancel, 'N') = 'N'
            AND Pbillmast.Bmc_Cacr = 'I'
            AND NVL (Dmc_Cancel, 'N') = 'N'
            AND Disbillmast.Dmc_Cacr <> 'M'
            AND Disbillmast.Dmd_date >=
            TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
            AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
            AND Disbillmast.Dmd_Date <=
            TO_DATE('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
        ) A ,MEDDESC, OUTLET,TAX
                WHERE  A.OUCODE = OUTLET.OU_CODE
                    AND A.CODE = MEDDESC.IT_CODE
                    AND A.ACTAX = TAX.TX_CODE`;
        try {
            const result = await conn_ora.execute(
                sql,
                {},
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT }
            )
            const gstReportFromOra = await result.resultSet?.getRows();
            return callBack(null, gstReportFromOra)
        }
        catch (error) {
            return callBack(error)
        }
        finally {
            if (conn_ora) {
                await conn_ora.close();
                await pool_ora.close();
            }
        }

    },


    getSumOfAmountTaxDisc: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        const fromDate = data.from;
        const toDate = data.to;
        const sql = `SELECT sum(AMT)amount,sum(DIS)discount,SUM(TAXAMT)taxamount
        FROM (
          SELECT 
                    PBILLDETL.OU_CODE OUCODE,
                    PBILLDETL.IT_CODE CODE,
                    PBILLDETL.BM_NO BILL,
                    PBILLDETL.BMD_DATE BILLDATE,
                    PBILLDETL.BMC_CACR CACR,
                    PBILLDETL.BDN_QTY QTY,
                    PBILLDETL.BDN_LOOSE LOOSE, 
                    PBILLDETL.ITN_PRATE PRATE,
                    PBILLDETL.ITN_MRP MRP,
                    PBILLDETL.ITN_ACTMRP ACTMRP,
                    PBILLDETL.BDN_AMOUNT AMT,
                    PBILLDETL.BMN_DISAMT DIS,
                    PBILLDETL.TX_CODE TAXCODE,
                    PBILLDETL.TXN_SALPER TAXPER,
                    PBILLDETL.BMN_SALETAX TAXAMT
            FROM Pbillmast, Pbilldetl
            WHERE     Pbilldetl.Bmc_Slno = Pbillmast.Bmc_Slno
                    AND pbillmast.BMC_COLLCNCODE IS NULL
                    AND NVL (Pbillmast.Bmc_cancel, 'N') = 'N'
                    AND Pbillmast.Bmc_Cacr IN ('C', 'R', 'M')
                    AND Pbillmast.BMD_DATE >=
                    TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                    AND Pbillmast.Bmd_Date <=
                    TO_DATE('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                    AND pbillmast.MH_CODE IN (SELECT MH_CODE FROM multihospital)
            UNION ALL                   
            SELECT 
                    MRETDETL.OU_CODE OUCODE,
                    MRETDETL.IT_CODE CODE,
                    MRETDETL.MR_NO BILL,
                    MRETDETL.MRD_DATE BILLDATE,
                    MRETDETL.MRC_CACR CACR,
                    (MRETDETL.MRN_QTY *-1) QTY,
                    (MRETDETL.MRN_LOOSE*-1) LOOSE,
                    MRETDETL.ITN_PRATE PRATE,
                    MRETDETL.ITN_MRP MRP,
                    MRETDETL.ITN_ACTMRP ACTMRP,
                    (MRETDETL.MRN_AMOUNT*-1) AMT,
                    (MRETDETL.MRN_DISAMT*-1) DIS,
                    MRETDETL.TX_CODE TAXCODE,
                    MRETDETL.TXN_SALPER TAXPER,
                    (MRETDETL.MRN_SALETAX *-1) TAXAMT
            FROM Mretdetl, Pbilldetl, mretmast
            WHERE  Pbilldetl.Bmc_Slno = Mretdetl.Bmc_Slno
                    AND Pbilldetl.IT_CODE = Mretdetl.It_code
                    AND Pbilldetl.ITC_DOCNO = Mretdetl.Itc_docno
                    AND mretmast.mrc_slno = Mretdetl.mrc_slno
                    AND Pbilldetl.ITC_DOCTYPE = Mretdetl.Itc_Doctype
                    AND Mretmast.mrc_retcncode IS NULL
                    AND Pbilldetl.Itc_Slno = Mretdetl.Itc_slno
                    AND NVL (Mretdetl.Mrc_cancel, 'N') = 'N'
                    AND NVL (mretmast.Mrc_cancel, 'N') = 'N'
                    AND Mretdetl.MRC_CACR IN ('C', 'R')
                    AND Mretdetl.MRD_DATE >=
                    TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                    AND MRETDETL.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                    AND Mretdetl.Mrd_Date <=
                    TO_DATE('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                ) A , MEDDESC, OUTLET,TAX
                WHERE  A.OUCODE = OUTLET.OU_CODE
                    AND A.CODE = MEDDESC.IT_CODE
                    AND A.TAXCODE = TAX.TX_CODE`;
        try {
            const result = await conn_ora.execute(
                sql,
                {},
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT }
            )
            const gstReportFromOra = await result.resultSet?.getRows();
            return callBack(null, gstReportFromOra)
        }
        catch (error) {
            return callBack(error)
        }
        finally {
            if (conn_ora) {
                await conn_ora.close();
                await pool_ora.close();
            }
        }

    },



    getInPatientMedReturnSum: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        const fromDate = data.from;
        const toDate = data.to;
        const sql = ` SELECT  sum(AMT),sum(DIS),SUM(TAXAMT)
        FROM (
   SELECT 
                    MRETDETL.OU_CODE OUCODE,
                    MRETDETL.IT_CODE CODE,
                    MRETDETL.MR_NO BILL,
                    MRETDETL.MRD_DATE BILLDATE,
                    MRETDETL.MRC_CACR CACR,
                    (MRETDETL.MRN_QTY *-1) QTY,
                    (MRETDETL.MRN_LOOSE*-1) LOOSE,
                    MRETDETL.ITN_PRATE PRATE,
                    MRETDETL.ITN_MRP MRP,
                    MRETDETL.ITN_ACTMRP ACTMRP,
                    (MRETDETL.MRN_AMOUNT*-1) AMT,
                    (MRETDETL.MRN_DISAMT*-1) DIS,
                    MRETDETL.MRC_ACTTXCODE TAXCODE,
                    MRETDETL.TXN_SALPER TAXPER,
                    (MRETDETL.MRN_SALETAX *-1) TAXAMT
FROM Mretdetl, Pbillmast, Disbillmast
WHERE     Pbillmast.Bmc_Slno = Mretdetl.Bmc_Slno
        AND Pbillmast.Dmc_Slno = Disbillmast.Dmc_Slno
        AND Mretdetl.MRC_CACR IN ('I')
        AND NVL (Mretdetl.Mrc_cancel, 'N') = 'N'
        AND NVL (Dmc_Cancel, 'N') = 'N'
        AND Disbillmast.Dmc_Cacr <> 'M'
        AND Disbillmast.Dmd_date >=
        TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
        AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
        AND Disbillmast.Dmd_Date <=
        TO_DATE('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
        ) A,MEDDESC, OUTLET,TAX
                WHERE  A.OUCODE = OUTLET.OU_CODE
                    AND A.CODE = MEDDESC.IT_CODE
                    AND A.TAXCODE = TAX.TX_CODE`;
        try {
            const result = await conn_ora.execute(
                sql,
                {},
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT }
            )
            const gstReportFromOra = await result.resultSet?.getRows();
            return callBack(null, gstReportFromOra)
        }
        catch (error) {
            return callBack(error)
        }
        finally {
            if (conn_ora) {
                await conn_ora.close();
                await pool_ora.close();
            }
        }

    },




    getOpCreditPharmSale: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        const fromDate = data.from;
        const toDate = data.to;
        const sql = `  SELECT 
        PBILLDETL.OU_CODE OUCODE,
        PBILLDETL.IT_CODE CODE,
        PBILLDETL.BM_NO BILL,
        PBILLDETL.BMD_DATE BILLDATE,
        PBILLDETL.BMC_CACR CACR,
        PBILLDETL.BDN_QTY QTY,
        PBILLDETL.BDN_LOOSE LOOSE, 
        PBILLDETL.ITN_PRATE PRATE,
        PBILLDETL.ITN_MRP MRP,
        PBILLDETL.ITN_ACTMRP ACTMRP,
        PBILLDETL.BDN_AMOUNT AMT,
        PBILLDETL.BMN_DISAMT DIS,
        PBILLDETL.PBC_ACTTXCODE TAXCODE,
        PBILLDETL.TXN_SALPER TAXPER,
        PBILLDETL.BMN_SALETAX TAXAMT,
        PBILLDETL.PBC_ACTTXCODE ACTAX
FROM Pbillmast, Pbilldetl, Opbillmast
WHERE     Pbilldetl.Bmc_Slno = Pbillmast.Bmc_Slno
AND Pbilldetl.Opc_Slno = Opbillmast.Opc_Slno
AND NVL (Pbillmast.Bmc_cancel, 'N') = 'N'
AND Pbillmast.Bmc_Cacr = 'O'
AND Opbillmast.Opc_Cacr <> 'M'
AND NVL (Opbillmast.Opn_cancel, 'N') = 'N'
AND Opbillmast.Opd_date >=
TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
AND Opbillmast.Opd_Date <=
TO_DATE('${toDate}', 'dd/MM/yyyy hh24:mi:ss')`;
        try {
            const result = await conn_ora.execute(
                sql,
                {},
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT }
            )
            const gstReportFromOra = await result.resultSet?.getRows();
            return callBack(null, gstReportFromOra)
        }
        catch (error) {
            return callBack(error)
        }
        finally {
            if (conn_ora) {
                await conn_ora.close();
                await pool_ora.close();
            }
        }

    },

    getGstReportPharmCollection: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        const fromDate = data.from;
        const toDate = data.to;
        const sql = ` SELECT OUCODE,CODE,BILL,BILLDATE,CACR,QTY,LOOSE,PRATE,MRP,ACTMRP,AMT,DIS,TAXCODE,TAXPER,TAXAMT,OUTLET.OUC_DESC,MEDDESC.ITC_DESC,TAX.TXC_DESC
            FROM (
            SELECT 
                    PBILLDETL.OU_CODE OUCODE,
                    PBILLDETL.IT_CODE CODE,
                    PBILLDETL.BM_NO BILL,
                    PBILLDETL.BMD_DATE BILLDATE,
                    PBILLDETL.BMC_CACR CACR,
                    PBILLDETL.BDN_QTY QTY,
                    PBILLDETL.BDN_LOOSE LOOSE, 
                    PBILLDETL.ITN_PRATE PRATE,
                    PBILLDETL.ITN_MRP MRP,
                    PBILLDETL.ITN_ACTMRP ACTMRP,
                    PBILLDETL.BDN_AMOUNT AMT,
                    PBILLDETL.BMN_DISAMT DIS,
                    PBILLDETL.PBC_ACTTXCODE TAXCODE,
                    PBILLDETL.TXN_SALPER TAXPER,
                    PBILLDETL.BMN_SALETAX TAXAMT,
                    PBILLDETL.PBC_ACTTXCODE ACTAX
            FROM Pbillmast, Pbilldetl
            WHERE     Pbilldetl.Bmc_Slno = Pbillmast.Bmc_Slno
                    AND pbillmast.BMC_COLLCNCODE IS NOT NULL
                    AND NVL (Pbillmast.Bmc_cancel, 'N') = 'N'
                    AND Pbillmast.Bmc_Cacr IN ('C', 'R', 'M')
                    AND Pbillmast.BMD_COLLDATE >=
                    TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                    AND Pbillmast.BMD_COLLDATE <=
                    TO_DATE('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                    AND pbillmast.MH_CODE IN (SELECT MH_CODE FROM multihospital)
            UNION ALL
            SELECT 
                    MRETDETL.OU_CODE OUCODE,
                    MRETDETL.IT_CODE CODE,
                    MRETDETL.MR_NO BILL,
                    MRETDETL.MRD_DATE BILLDATE,
                    MRETDETL.MRC_CACR CACR,
                    (MRETDETL.MRN_QTY *-1) QTY,
                    (MRETDETL.MRN_LOOSE*-1) LOOSE,
                    MRETDETL.ITN_PRATE PRATE,
                    MRETDETL.ITN_MRP MRP,
                    MRETDETL.ITN_ACTMRP ACTMRP,
                    (MRETDETL.MRN_AMOUNT*-1) AMT,
                    (MRETDETL.MRN_DISAMT*-1) DIS,
                    MRETDETL.MRC_ACTTXCODE TAXCODE,
                    MRETDETL.TXN_SALPER TAXPER,
                    (MRETDETL.MRN_SALETAX *-1) TAXAMT,
                    MRETDETL.MRC_ACTTXCODE ACTAX
            FROM Mretdetl, Pbilldetl, mretmast
            WHERE     Pbilldetl.Bmc_Slno = Mretdetl.Bmc_Slno
                    AND Pbilldetl.IT_CODE = Mretdetl.It_code
                    AND Pbilldetl.ITC_DOCNO = Mretdetl.Itc_docno
                    AND mretmast.mrc_slno = Mretdetl.mrc_slno
                    AND Pbilldetl.ITC_DOCTYPE = Mretdetl.Itc_Doctype
                    AND Mretmast.mrc_retcncode IS NOT NULL
                    AND Pbilldetl.Itc_Slno = Mretdetl.Itc_slno
                    AND NVL (Mretdetl.Mrc_cancel, 'N') = 'N'
                    AND NVL (mretmast.Mrc_cancel, 'N') = 'N'
                    AND Mretdetl.MRC_CACR IN ('C', 'R')
                    AND Mretmast.MRD_RETDATE >=
                    TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                    AND MRETDETL.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                    AND Mretmast.Mrd_RETDate <=
                    TO_DATE('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
             ) A  , MEDDESC, OUTLET,TAX
                WHERE  A.OUCODE = OUTLET.OU_CODE
                    AND A.CODE = MEDDESC.IT_CODE
                    AND A.ACTAX = TAX.TX_CODE`;
        try {
            const result = await conn_ora.execute(
                sql,
                {},
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT }
            )
            const gstReportFromOra = await result.resultSet?.getRows();
            return callBack(null, gstReportFromOra)
        }
        catch (error) {
            return callBack(error)
        }
        finally {
            if (conn_ora) {
                await conn_ora.close();
                await pool_ora.close();
            }
        }

    }, // TSSH PHARMACY GST REPORTS
    tsshPharmacyGstRptOne: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();

        const ipNumberList = (data?.ptno?.length > 0 && data.ptno.join(',')) || null;
        const fromDate = data.from;
        const toDate = data.to;

        const sql = `SELECT 
                            Mretdetl.IT_CODE CODE,
                            MEDDESC.ITC_DESC,
                            Mretdetl.ITN_PRATE PRATE,
                            Mretdetl.ITN_MRP MRP,
                            Mretdetl.ITN_ACTMRP ACTMRP,
                            Mretdetl.MRN_QTY QTY,
                            Mretdetl.MRN_LOOSE LOOSE,
                            (Mretdetl.MRN_AMOUNT*-1) AMNT,
                            Mretdetl.ITN_ORIGINALMRP ORIGINALMRP,
                            MRETDETL.MRN_DISAMT DIS,
                            MRETDETL.MRN_SALETAX TAXAMT,
                            Mretdetl.MRC_ACTTXCODE TAX,
                            TAX.TXC_DESC
                    FROM Mretdetl, Pbillmast, Disbillmast,MEDDESC,TAX
                    WHERE Pbillmast.Bmc_Slno = Mretdetl.Bmc_Slno
                    AND Pbillmast.Dmc_Slno = Disbillmast.Dmc_Slno
                    AND Mretdetl.MRC_CACR IN ('I')
                    AND NVL (Mretdetl.Mrc_cancel, 'N') = 'N'
                    AND NVL (Dmc_Cancel, 'N') = 'N'
                    AND Disbillmast.Dmc_Cacr <> 'M'
                    AND Disbillmast.Dmd_date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                    AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                    AND Disbillmast.Dmd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                    AND MEDDESC.IT_CODE = MRETDETL.IT_CODE
                    AND TAX.TX_CODE = MRETDETL.MRC_ACTTXCODE
                    AND DISBILLMAST.IP_NO IN (${ipNumberList})`;

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
    tsshPharmacyGstRptTwo: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();

        const group = data?.group;
        const ipNumberList = group === 1 ? null : (data?.ptno?.length > 0 && data.ptno.join(',')) || null;
        // const ipNumberList = (data?.ptno?.length > 0 && data.ptno.join(',')) || null;
        const fromDate = data.from;
        const toDate = data.to;

        const sql = `SELECT 
                        PBILLDETL.IT_CODE CODE,
                        MEDDESC.ITC_DESC,
                        PBILLDETL.ITN_PRATE PRATE,
                        PBILLDETL.ITN_MRP MRP,
                        PBILLDETL.ITN_ACTMRP ACTMRP,
                        PBILLDETL.BDN_QTY QTY,
                        PBILLDETL.BDN_LOOSE LOOSE,
                        PBILLDETL.BDN_AMOUNT AMNT,
                        PBILLDETL.ITN_ORIGINALMRP ORIGINALMRP,
                        PBILLDETL.BMN_DISAMT DIS,
                        PBILLDETL.BMN_SALETAX TAXAMT,
                        PBILLDETL.PBC_ACTTXCODE TAX,
                        TAX.TXC_DESC
                    FROM Pbillmast, Disbillmast, Pbilldetl,MEDDESC,TAX
                    WHERE  pbillmast.bmc_slno = pbilldetl.bmc_slno
                            AND Pbillmast.Dmc_Slno = Disbillmast.Dmc_Slno
                            AND NVL (Pbillmast.Bmc_cancel, 'N') = 'N'
                            AND Pbillmast.Bmc_Cacr = 'I'
                            AND NVL (Dmc_Cancel, 'N') = 'N'
                            AND Disbillmast.Dmc_Cacr <> 'M'
                            AND Disbillmast.Dmd_date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                            AND Disbillmast.Dmd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND MEDDESC.IT_CODE = Pbilldetl.IT_CODE
                            AND TAX.TX_CODE = PBILLDETL.PBC_ACTTXCODE
                            AND Disbillmast.IP_NO IN (${ipNumberList})`;

        try {
            const result = await conn_ora.execute(
                sql,
                {},
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT },
            )
            result.resultSet?.getRows((err, rows) => {
                callBack(err, rows);
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
    tsshPharmacyGstRptthree: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();

        const group = data?.group;
        const ipNumberList = group === 1 ? null : (data?.ptno?.length > 0 && data.ptno.join(',')) || null;
        const fromDate = data.from;
        const toDate = data.to;

        const sql = `SELECT 
                            PBILLDETL.IT_CODE CODE,
                            MEDDESC.ITC_DESC,
                            PBILLDETL.ITN_PRATE PRATE,
                            PBILLDETL.ITN_MRP MRP,
                            PBILLDETL.ITN_ACTMRP ACTMRP,
                            PBILLDETL.BDN_QTY QTY,
                            PBILLDETL.BDN_LOOSE LOOSE,
                            PBILLDETL.BDN_AMOUNT AMNT,
                            PBILLDETL.ITN_ORIGINALMRP ORIGINALMRP,
                            PBILLDETL.BMN_DISAMT DIS,
                            PBILLDETL.BMN_SALETAX TAXAMT,
                            PBILLDETL.PBC_ACTTXCODE TAX,
                            TAX.TXC_DESC
                    FROM Pbillmast, Pbilldetl, Opbillmast,MEDDESC,TAX
                    WHERE     Pbilldetl.Bmc_Slno = Pbillmast.Bmc_Slno
                            AND Pbilldetl.Opc_Slno = Opbillmast.Opc_Slno
                            AND NVL (Pbillmast.Bmc_cancel, 'N') = 'N'
                            AND Pbillmast.Bmc_Cacr = 'O'
                            AND Opbillmast.Opc_Cacr <> 'M'
                            AND NVL (Opbillmast.Opn_cancel, 'N') = 'N'
                            AND Opbillmast.Opd_date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                            AND Opbillmast.Opd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND MEDDESC.IT_CODE = Pbilldetl.IT_CODE
                            AND TAX.TX_CODE = PBILLDETL.PBC_ACTTXCODE
                            AND PBILLMAST.IP_NO IN (${ipNumberList})`;

        try {
            const result = await conn_ora.execute(
                sql,
                {},
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT },
            )
            result.resultSet?.getRows((err, rows) => {
                callBack(err, rows);
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
    tsshPharmacyGstRptFour: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();

        const ipNumberList = (data?.ptno?.length > 0 && data.ptno.join(',')) || null;
        const fromDate = data.from;
        const toDate = data.to;

        const sql = `SELECT 
                            Mretdetl.IT_CODE CODE,
                            MEDDESC.ITC_DESC,
                            Mretdetl.ITN_PRATE PRATE,
                            Mretdetl.ITN_MRP MRP,
                            Mretdetl.ITN_ACTMRP ACTMRP,
                            Mretdetl.MRN_QTY QTY,
                            Mretdetl.MRN_LOOSE LOOSE,
                            Mretdetl.MRN_AMOUNT AMNT,
                            Mretdetl.ITN_ORIGINALMRP ORIGINALMRP,
                            Mretdetl.MRC_ACTTXCODE TAX,
                            TAX.TXC_DESC
                    FROM Mretdetl, Pbillmast, Disbillmast,MEDDESC,TAX
                    WHERE Pbillmast.Bmc_Slno = Mretdetl.Bmc_Slno
                        AND Pbillmast.Dmc_Slno = Disbillmast.Dmc_Slno
                        AND Mretdetl.MRC_CACR IN ('I')
                        AND NVL (Mretdetl.Mrc_cancel, 'N') = 'N'
                        AND NVL (Dmc_Cancel, 'N') = 'N'
                        AND Disbillmast.Dmc_Cacr <> 'M'
                        AND Disbillmast.Dmd_date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                        AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                        AND Disbillmast.Dmd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                        AND MEDDESC.IT_CODE = MRETDETL.IT_CODE
                        AND TAX.TX_CODE = MRETDETL.MRC_ACTTXCODE
                        AND DISBILLMAST.IP_NO IN (${ipNumberList})
                    UNION
                    SELECT 
                        PBILLDETL.IT_CODE CODE,
                        MEDDESC.ITC_DESC,
                        PBILLDETL.ITN_PRATE PRATE,
                        PBILLDETL.ITN_MRP MRP,
                        PBILLDETL.ITN_ACTMRP ACTMRP,
                        PBILLDETL.BDN_QTY QTY,
                        PBILLDETL.BDN_LOOSE,
                        PBILLDETL.BDN_AMOUNT,
                        PBILLDETL.ITN_ORIGINALMRP,
                        PBILLDETL.PBC_ACTTXCODE,
                        TAX.TXC_DESC
                    FROM Pbillmast, Disbillmast, Pbilldetl,MEDDESC,TAX
                    WHERE pbillmast.bmc_slno = pbilldetl.bmc_slno
                            AND Pbillmast.Dmc_Slno = Disbillmast.Dmc_Slno
                            AND NVL (Pbillmast.Bmc_cancel, 'N') = 'N'
                            AND Pbillmast.Bmc_Cacr = 'I'
                            AND NVL (Dmc_Cancel, 'N') = 'N'
                            AND Disbillmast.Dmc_Cacr <> 'M'
                            AND Disbillmast.Dmd_date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                            AND Disbillmast.Dmd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND MEDDESC.IT_CODE = Pbilldetl.IT_CODE
                            AND TAX.TX_CODE = PBILLDETL.PBC_ACTTXCODE
                            AND Disbillmast.IP_NO IN (${ipNumberList})
                    UNION 
                    SELECT 
                        PBILLDETL.IT_CODE CODE,
                        MEDDESC.ITC_DESC,
                        PBILLDETL.ITN_PRATE PRATE,
                        PBILLDETL.ITN_MRP MRP,
                        PBILLDETL.ITN_ACTMRP ACTMRP,
                        PBILLDETL.BDN_QTY QTY,
                        PBILLDETL.BDN_LOOSE,
                        PBILLDETL.BDN_AMOUNT,
                        PBILLDETL.ITN_ORIGINALMRP,
                        PBILLDETL.PBC_ACTTXCODE,
                        TAX.TXC_DESC
                    FROM Pbillmast, Pbilldetl, Opbillmast,MEDDESC,TAX
                    WHERE     Pbilldetl.Bmc_Slno = Pbillmast.Bmc_Slno
                            AND Pbilldetl.Opc_Slno = Opbillmast.Opc_Slno
                            AND NVL (Pbillmast.Bmc_cancel, 'N') = 'N'
                            AND Pbillmast.Bmc_Cacr = 'O'
                            AND Opbillmast.Opc_Cacr <> 'M'
                            AND NVL (Opbillmast.Opn_cancel, 'N') = 'N'
                            AND Opbillmast.Opd_date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                            AND Opbillmast.Opd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                        AND MEDDESC.IT_CODE = Pbilldetl.IT_CODE
                            AND TAX.TX_CODE = PBILLDETL.PBC_ACTTXCODE
                            AND PBILLMAST.IP_NO IN (${ipNumberList})`;

        try {
            const result = await conn_ora.execute(
                sql,
                {},
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT },
            )
            result.resultSet?.getRows((err, rows) => {
                callBack(err, rows);
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

    //COLLLECTION REPORTS
    collectionTmch: (data, callBack) => {
        pool.query(
            `SELECT 
                code,name,SUM(amount) amount
            FROM collection 
            WHERE date BETWEEN ? AND ?
            GROUP BY code,name`,
            [
                data.from,
                data.to
            ],
            (error, results, feilds) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results)
            }
        )
    },
    pharmacySaleGst: (data, callBack) => {
        pool.query(
            `SELECT 
                sum(ip) ip,
                sum(op_0) op0,
                sum(op_5) op5,
                sum(op_12) op12,
                sum(op_18) op18,
                sum(op_28) op28,
                sum(tax_5) tax5,
                sum(tax_12) tax12,
                sum(tax_18) tax18,
                sum(tax_28) tax28
            FROM pharmacysalegst
            WHERE date BETWEEN ? AND ?`,
            [
                data.from,
                data.to
            ],
            (error, results, feilds) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results)
            }
        )
    },
    tmchGstReport: async (data) => {
        //GST FIRST REPORTS
        const reportTmch_One = new Promise(async (resolve, reject) => {
            let pool_ora = await oraConnection();
            let conn_ora = await pool_ora.getConnection();

            const ipNumberListString = data?.ptno?.map(item => `'${item}'`).join(',') || null;
            const fromDate = data.from;
            const toDate = data.to;

            const sql = `SELECT 
                                Mretdetl.IT_CODE CODE,
                                MEDDESC.ITC_DESC,
                                Mretdetl.ITN_PRATE PRATE,
                                Mretdetl.ITN_MRP MRP,
                                Mretdetl.ITN_ACTMRP ACTMRP,
                                Mretdetl.MRN_QTY QTY,
                                Mretdetl.MRN_LOOSE LOOSE,
                                (Mretdetl.MRN_AMOUNT*-1) AMNT,
                                Mretdetl.ITN_ORIGINALMRP ORIGINALMRP,
                                MRETDETL.MRN_DISAMT DIS,
                                MRETDETL.MRN_SALETAX TAXAMT,
                                Mretdetl.MRC_ACTTXCODE TAX,
                                TAX.TXC_DESC
                        FROM Mretdetl, Pbillmast, Disbillmast,MEDDESC,TAX
                        WHERE Pbillmast.Bmc_Slno = Mretdetl.Bmc_Slno
                        AND Pbillmast.Dmc_Slno = Disbillmast.Dmc_Slno
                        AND Mretdetl.MRC_CACR IN ('I')
                        AND NVL (Mretdetl.Mrc_cancel, 'N') = 'N'
                        AND NVL (Dmc_Cancel, 'N') = 'N'
                        AND Disbillmast.Dmc_Cacr <> 'M'
                        AND Disbillmast.Dmd_date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                        AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                        AND Disbillmast.Dmd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                        AND MEDDESC.IT_CODE = MRETDETL.IT_CODE
                        AND TAX.TX_CODE = MRETDETL.MRC_ACTTXCODE
                        AND DISBILLMAST.IP_NO NOT IN (${ipNumberListString})`;


            try {

                const result = await conn_ora.execute(
                    sql,
                    {},
                    { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT },
                )

                result.resultSet?.getRows((err, rows) => {
                    if (err) {
                        reject({ status: 0, message: err, data: [] })
                    } else {
                        resolve({ status: 1, message: err, data: rows })
                    }
                })
            } catch (error) {
                reject({ status: 0, message: error, data: [] })
            } finally {
                if (conn_ora) {
                    await conn_ora.close();
                    await pool_ora.close();
                }
            }
        })

        /// SECOND REPORT
        const reportTmch_Two = new Promise(async (resolve, reject) => {
            let pool_ora = await oraConnection();
            let conn_ora = await pool_ora.getConnection();

            const ipNumberListString = data?.ptno?.map(item => `'${item}'`).join(',') || null;
            const fromDate = data.from;
            const toDate = data.to;

            const sql = `SELECT 
                        PBILLDETL.IT_CODE CODE,
                        MEDDESC.ITC_DESC,
                        PBILLDETL.ITN_PRATE PRATE,
                        PBILLDETL.ITN_MRP MRP,
                        PBILLDETL.ITN_ACTMRP ACTMRP,
                        PBILLDETL.BDN_QTY QTY,
                        PBILLDETL.BDN_LOOSE LOOSE,
                        PBILLDETL.BDN_AMOUNT AMNT,
                        PBILLDETL.ITN_ORIGINALMRP ORIGINALMRP,
                        PBILLDETL.BMN_DISAMT DIS,
                        PBILLDETL.BMN_SALETAX TAXAMT,
                        PBILLDETL.PBC_ACTTXCODE TAX,
                        TAX.TXC_DESC
                    FROM Pbillmast, Disbillmast, Pbilldetl,MEDDESC,TAX
                    WHERE  pbillmast.bmc_slno = pbilldetl.bmc_slno
                            AND Pbillmast.Dmc_Slno = Disbillmast.Dmc_Slno
                            AND NVL (Pbillmast.Bmc_cancel, 'N') = 'N'
                            AND Pbillmast.Bmc_Cacr = 'I'
                            AND NVL (Dmc_Cancel, 'N') = 'N'
                            AND Disbillmast.Dmc_Cacr <> 'M'
                            AND Disbillmast.Dmd_date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                            AND Disbillmast.Dmd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND MEDDESC.IT_CODE = Pbilldetl.IT_CODE
                            AND TAX.TX_CODE = PBILLDETL.PBC_ACTTXCODE
                            AND Disbillmast.IP_NO NOT IN (${ipNumberListString})`;

            try {
                const result = await conn_ora.execute(
                    sql,
                    {},
                    { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT },
                )
                result.resultSet?.getRows((err, rows) => {
                    if (err) {
                        reject({ status: 0, message: err, data: [] })
                    } else {
                        resolve({ status: 1, message: err, data: rows })
                    }
                })
            } catch (error) {
                reject({ status: 0, message: error, data: [] })
            } finally {
                if (conn_ora) {
                    await conn_ora.close();
                    await pool_ora.close();
                }
            }
        })

        // THIR REPORTS

        const reportTmch_Three = new Promise(async (resolve, reject) => {
            let pool_ora = await oraConnection();
            let conn_ora = await pool_ora.getConnection();

            const ipNumberListString = data?.ptno?.map(item => `'${item}'`).join(',') || null;
            const fromDate = data.from;
            const toDate = data.to;

            const sql = `SELECT 
                            PBILLDETL.IT_CODE CODE,
                            MEDDESC.ITC_DESC,
                            PBILLDETL.ITN_PRATE PRATE,
                            PBILLDETL.ITN_MRP MRP,
                            PBILLDETL.ITN_ACTMRP ACTMRP,
                            PBILLDETL.BDN_QTY QTY,
                            PBILLDETL.BDN_LOOSE LOOSE,
                            PBILLDETL.BDN_AMOUNT AMNT,
                            PBILLDETL.ITN_ORIGINALMRP ORIGINALMRP,
                            PBILLDETL.BMN_DISAMT DIS,
                            PBILLDETL.BMN_SALETAX TAXAMT,
                            PBILLDETL.PBC_ACTTXCODE TAX,
                            TAX.TXC_DESC
                        FROM Pbillmast, Pbilldetl, Opbillmast,MEDDESC,TAX
                        WHERE Pbilldetl.Bmc_Slno = Pbillmast.Bmc_Slno
                            AND Pbilldetl.Opc_Slno = Opbillmast.Opc_Slno
                            AND NVL (Pbillmast.Bmc_cancel, 'N') = 'N'
                            AND Pbillmast.Bmc_Cacr = 'O'
                            AND Opbillmast.Opc_Cacr <> 'M'
                            AND NVL (Opbillmast.Opn_cancel, 'N') = 'N'
                            AND Opbillmast.Opd_date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                            AND Opbillmast.Opd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND MEDDESC.IT_CODE = Pbilldetl.IT_CODE
                            AND TAX.TX_CODE = PBILLDETL.PBC_ACTTXCODE
                            AND PBILLMAST.IP_NO NOT IN (${ipNumberListString})`;

            try {
                const result = await conn_ora.execute(
                    sql,
                    {},
                    { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT },
                )
                result.resultSet?.getRows((err, rows) => {
                    if (err) {
                        reject({ status: 0, message: err, data: [] })
                    } else {
                        resolve({ status: 1, message: err, data: rows })
                    }
                })
            } catch (error) {
                reject({ status: 0, message: error, data: [] })
            } finally {
                if (conn_ora) {
                    await conn_ora.close();
                    await pool_ora.close();
                }
            }
        })

        const reportTmch_Four = new Promise(async (resolve, reject) => {
            let pool_ora = await oraConnection();
            let conn_ora = await pool_ora.getConnection();

            const ipNumberListString = data?.ptno?.map(item => `'${item}'`).join(',') || null;
            const fromDate = data.from;
            const toDate = data.to;

            const sql = `SELECT 
                            Mretdetl.IT_CODE CODE,
                            MEDDESC.ITC_DESC,
                            Mretdetl.ITN_PRATE PRATE,
                            Mretdetl.ITN_MRP MRP,
                            Mretdetl.ITN_ACTMRP ACTMRP,
                            Mretdetl.MRN_QTY QTY,
                            Mretdetl.MRN_LOOSE LOOSE,
                            Mretdetl.MRN_AMOUNT AMNT,
                            Mretdetl.ITN_ORIGINALMRP ORIGINALMRP,
                            Mretdetl.MRC_ACTTXCODE TAX,
                            TAX.TXC_DESC
                        FROM Mretdetl, Pbillmast, Disbillmast,MEDDESC,TAX
                        WHERE Pbillmast.Bmc_Slno = Mretdetl.Bmc_Slno
                            AND Pbillmast.Dmc_Slno = Disbillmast.Dmc_Slno
                            AND Mretdetl.MRC_CACR IN ('I')
                            AND NVL (Mretdetl.Mrc_cancel, 'N') = 'N'
                            AND NVL (Dmc_Cancel, 'N') = 'N'
                            AND Disbillmast.Dmc_Cacr <> 'M'
                            AND Disbillmast.Dmd_date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                            AND Disbillmast.Dmd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND MEDDESC.IT_CODE = MRETDETL.IT_CODE
                            AND TAX.TX_CODE = MRETDETL.MRC_ACTTXCODE
                            AND DISBILLMAST.IP_NO NOT IN (${ipNumberListString})
                        UNION
                        SELECT 
                            PBILLDETL.IT_CODE CODE,
                            MEDDESC.ITC_DESC,
                            PBILLDETL.ITN_PRATE PRATE,
                            PBILLDETL.ITN_MRP MRP,
                            PBILLDETL.ITN_ACTMRP ACTMRP,
                            PBILLDETL.BDN_QTY QTY,
                            PBILLDETL.BDN_LOOSE,
                            PBILLDETL.BDN_AMOUNT,
                            PBILLDETL.ITN_ORIGINALMRP,
                            PBILLDETL.PBC_ACTTXCODE,
                            TAX.TXC_DESC
                        FROM Pbillmast, Disbillmast, Pbilldetl,MEDDESC,TAX
                        WHERE pbillmast.bmc_slno = pbilldetl.bmc_slno
                            AND Pbillmast.Dmc_Slno = Disbillmast.Dmc_Slno
                            AND NVL (Pbillmast.Bmc_cancel, 'N') = 'N'
                            AND Pbillmast.Bmc_Cacr = 'I'
                            AND NVL (Dmc_Cancel, 'N') = 'N'
                            AND Disbillmast.Dmc_Cacr <> 'M'
                            AND Disbillmast.Dmd_date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                            AND Disbillmast.Dmd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND MEDDESC.IT_CODE = Pbilldetl.IT_CODE
                            AND TAX.TX_CODE = PBILLDETL.PBC_ACTTXCODE
                            AND Disbillmast.IP_NO NOT IN (${ipNumberListString})
                        UNION 
                        SELECT 
                            PBILLDETL.IT_CODE CODE,
                            MEDDESC.ITC_DESC,
                            PBILLDETL.ITN_PRATE PRATE,
                            PBILLDETL.ITN_MRP MRP,
                            PBILLDETL.ITN_ACTMRP ACTMRP,
                            PBILLDETL.BDN_QTY QTY,
                            PBILLDETL.BDN_LOOSE,
                            PBILLDETL.BDN_AMOUNT,
                            PBILLDETL.ITN_ORIGINALMRP,
                            PBILLDETL.PBC_ACTTXCODE,
                            TAX.TXC_DESC
                        FROM Pbillmast, Pbilldetl, Opbillmast,MEDDESC,TAX
                        WHERE Pbilldetl.Bmc_Slno = Pbillmast.Bmc_Slno
                            AND Pbilldetl.Opc_Slno = Opbillmast.Opc_Slno
                            AND NVL (Pbillmast.Bmc_cancel, 'N') = 'N'
                            AND Pbillmast.Bmc_Cacr = 'O'
                            AND Opbillmast.Opc_Cacr <> 'M'
                            AND NVL (Opbillmast.Opn_cancel, 'N') = 'N'
                            AND Opbillmast.Opd_date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                            AND Opbillmast.Opd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND MEDDESC.IT_CODE = Pbilldetl.IT_CODE
                            AND TAX.TX_CODE = PBILLDETL.PBC_ACTTXCODE
                            AND PBILLMAST.IP_NO NOT IN (${ipNumberListString})`;
            try {
                const result = await conn_ora.execute(
                    sql,
                    {},
                    { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT },
                )
                result.resultSet?.getRows((err, rows) => {
                    if (err) {
                        reject({ status: 0, message: err, data: [] })
                    } else {
                        resolve({ status: 1, message: err, data: rows })
                    }
                })
            } catch (error) {
                reject({ status: 0, message: error, data: [] })
            } finally {
                if (conn_ora) {
                    await conn_ora.close();
                    await pool_ora.close();
                }
            }
        })

        //call all promise data
        return await Promise.all([reportTmch_One, reportTmch_Two, reportTmch_Three, reportTmch_Four]).then((result) => {
            const resultChcek = result?.find(e => e.status === 0)
            const fiterdResult = result?.filter((e) => e.status === 1)?.map(e => e.data)?.flat()
            if (resultChcek === undefined) {
                return { status: 1, message: 'success', data: fiterdResult }
            } else {
                return { status: 0, message: resultChcek.message, data: [] }
            }
        }).catch((error) => {
            return { status: 0, message: error, data: [] }
        })

    }
}