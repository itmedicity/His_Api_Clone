// @ts-ignore
const {oracledb, getTmcConnection} = require("../../../../config/oradbconfig");

module.exports = {
  gstreportsPartOne: async (data, callBack) => {
    let conn_ora = await getTmcConnection();
    try {
      const result = await conn_ora.execute(
        `SELECT 
                        OUCODE,CODE,BILL,BILLDATE,CACR,QTY,LOOSE,PRATE,MRP,ACTMRP,AMT,DIS,
                        TAXCODE,TAXPER,TAXAMT,OUTLET.OUC_DESC,MEDDESC.ITC_DESC,TAX.TXC_DESC
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
                        WHERE Pbilldetl.Bmc_Slno = Pbillmast.Bmc_Slno
                            AND pbillmast.BMC_COLLCNCODE IS NULL
                            AND NVL (Pbillmast.Bmc_cancel, 'N') = 'N'
                            AND Pbillmast.Bmc_Cacr IN ('C', 'R', 'M')
                            AND Pbillmast.BMD_DATE >=TO_DATE (:date1,'dd/MM/yyyy hh24:mi:ss')
                            AND Pbillmast.Bmd_Date <=TO_DATE (:date2,'dd/MM/yyyy hh24:mi:ss')
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
                            AND Mretdetl.MRD_DATE >=TO_DATE (:date3 ,'dd/MM/yyyy hh24:mi:ss')
                            AND MRETDETL.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                            AND Mretdetl.Mrd_Date <=TO_DATE (:date4,'dd/MM/yyyy hh24:mi:ss') 
                        ) A , MEDDESC, OUTLET,TAX
                            WHERE  A.OUCODE = OUTLET.OU_CODE
                                AND A.CODE = MEDDESC.IT_CODE
                                AND A.TAXCODE = TAX.TX_CODE`,
        {
          date1: data.from,
          date2: data.to,
          date3: data.from,
          date4: data.to,
        },
        {outFormat: oracledb.OUT_FORMAT_OBJECT},
      );
      callBack(err, result.rows);
    } catch (error) {
      console.log(error);
    } finally {
      if (conn_ora) await conn_ora.close();
    }
  },
  gstreportsPartTwo: async (data, callBack) => {
    let conn_ora = await getTmcConnection();
    try {
      const result = await conn_ora.execute(
        `SELECT 
                        OUCODE,CODE,BILL,BILLDATE,CACR,QTY,LOOSE,PRATE,MRP,ACTMRP,AMT,DIS,TAXCODE,
                        TAXPER,TAXAMT,OUTLET.OUC_DESC,MEDDESC.ITC_DESC,TAX.TXC_DESC
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
                                MRETDETL.TX_CODE TAXCODE,
                                MRETDETL.TXN_SALPER TAXPER,
                                (MRETDETL.MRN_SALETAX *-1) TAXAMT
                            FROM Mretdetl, Pbillmast, Disbillmast
                            WHERE Pbillmast.Bmc_Slno = Mretdetl.Bmc_Slno
                                    AND Pbillmast.Dmc_Slno = Disbillmast.Dmc_Slno
                                    AND Mretdetl.MRC_CACR IN ('I')
                                    AND NVL (Mretdetl.Mrc_cancel, 'N') = 'N'
                                    AND NVL (Dmc_Cancel, 'N') = 'N'
                                    AND Disbillmast.Dmc_Cacr <> 'M'
                                    AND Disbillmast.Dmd_date >=TO_DATE (:date1, 'dd/MM/yyyy hh24:mi:ss')
                                    AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                                    AND Disbillmast.Dmd_Date <=TO_DATE (:date2, 'dd/MM/yyyy hh24:mi:ss')
                        ) A,MEDDESC, OUTLET,TAX
                            WHERE  A.OUCODE = OUTLET.OU_CODE
                            AND A.CODE = MEDDESC.IT_CODE
                            AND A.TAXCODE = TAX.TX_CODE`,
        {
          date1: data.from,
          date2: data.to,
        },
        {outFormat: oracledb.OUT_FORMAT_OBJECT},
      );
      callBack(err, result.rows);
    } catch (error) {
      console.log(error);
    } finally {
      if (conn_ora) await conn_ora.close();
    }
  },
  gstreportsPartThree: async (data, callBack) => {
    let conn_ora = await getTmcConnection();
    try {
      const result = await conn_ora.execute(
        `SELECT 
                    OUCODE,CODE,BILL,BILLDATE,CACR,QTY,LOOSE,PRATE,MRP,ACTMRP,AMT,DIS,
                    TAXCODE,TAXPER,TAXAMT,OUTLET.OUC_DESC,MEDDESC.ITC_DESC,TAX.TXC_DESC
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
                            AND pbillmast.BMC_COLLCNCODE IS NOT NULL
                            AND NVL (Pbillmast.Bmc_cancel, 'N') = 'N'
                            AND Pbillmast.Bmc_Cacr IN ('C', 'R', 'M')
                            AND Pbillmast.BMD_COLLDATE >=TO_DATE (:date1,'dd/MM/yyyy hh24:mi:ss')
                            AND Pbillmast.BMD_COLLDATE <=TO_DATE (:date2,'dd/MM/yyyy hh24:mi:ss')
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
                            AND Mretmast.MRD_RETDATE >=TO_DATE (:date3,'dd/MM/yyyy hh24:mi:ss')
                            AND MRETDETL.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                            AND Mretmast.Mrd_RETDate <=TO_DATE (:date4,'dd/MM/yyyy hh24:mi:ss')
                ) A  , MEDDESC, OUTLET,TAX
                        WHERE  A.OUCODE = OUTLET.OU_CODE
                            AND A.CODE = MEDDESC.IT_CODE
                            AND A.TAXCODE = TAX.TX_CODE`,
        {
          date1: data.from,
          date2: data.to,
          date3: data.from,
          date4: data.to,
        },
        {outFormat: oracledb.OUT_FORMAT_OBJECT},
      );
      callBack(err, result.rows);
    } catch (error) {
      console.log(error);
    } finally {
      if (conn_ora) await conn_ora.close();
    }
  },
  gstreportsPartFour: async (data, callBack) => {
    let conn_ora = await getTmcConnection();
    try {
      const result = await conn_ora.execute(
        `SELECT 
                    OUCODE,CODE,BILL,BILLDATE,CACR,QTY,LOOSE,PRATE,MRP,ACTMRP,AMT,DIS,
                    TAXCODE,TAXPER,TAXAMT,OUTLET.OUC_DESC,MEDDESC.ITC_DESC,TAX.TXC_DESC
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
                            FROM Pbillmast, Disbillmast, Pbilldetl
                            WHERE     pbillmast.bmc_slno = pbilldetl.bmc_slno
                                    AND Pbillmast.Dmc_Slno = Disbillmast.Dmc_Slno
                                    AND NVL (Pbillmast.Bmc_cancel, 'N') = 'N'
                                    AND Pbillmast.Bmc_Cacr = 'I'
                                    AND NVL (Dmc_Cancel, 'N') = 'N'
                                    AND Disbillmast.Dmc_Cacr <> 'M'
                                    AND Disbillmast.Dmd_date >=TO_DATE (:date1, 'dd/MM/yyyy hh24:mi:ss')
                                    AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                                    AND Disbillmast.Dmd_Date <=TO_DATE (:date2, 'dd/MM/yyyy hh24:mi:ss')
                        ) A ,MEDDESC, OUTLET,TAX
                                WHERE  A.OUCODE = OUTLET.OU_CODE
                                    AND A.CODE = MEDDESC.IT_CODE
                                    AND A.TAXCODE = TAX.TX_CODE`,
        {
          date1: data.from,
          date2: data.to,
        },
        {outFormat: oracledb.OUT_FORMAT_OBJECT},
      );
      callBack(err, result.rows);
    } catch (error) {
      console.log(error);
    } finally {
      if (conn_ora) await conn_ora.close();
    }
  },
  gstreportsPartFive: async (data, callBack) => {
    let conn_ora = await getTmcConnection();
    try {
      const result = await conn_ora.execute(
        `SELECT 
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
                FROM Pbillmast, Pbilldetl, Opbillmast
                WHERE     Pbilldetl.Bmc_Slno = Pbillmast.Bmc_Slno
                    AND Pbilldetl.Opc_Slno = Opbillmast.Opc_Slno
                    AND NVL (Pbillmast.Bmc_cancel, 'N') = 'N'
                    AND Pbillmast.Bmc_Cacr = 'O'
                    AND Opbillmast.Opc_Cacr <> 'M'
                    AND NVL (Opbillmast.Opn_cancel, 'N') = 'N'
                    AND Opbillmast.Opd_date >=
                        TO_DATE (:date1, 'dd/MM/yyyy hh24:mi:ss')
                    AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                    AND Opbillmast.Opd_Date <=
                        TO_DATE (:date2, 'dd/MM/yyyy hh24:mi:ss')`,
        {
          date1: data.from,
          date2: data.to,
        },
        {outFormat: oracledb.OUT_FORMAT_OBJECT},
      );
      callBack(err, result.rows);
    } catch (error) {
      console.log(error);
    } finally {
      if (conn_ora) await conn_ora.close();
    }
  },
};
