const { format, parseISO } = require('date-fns');
const { oraConnection, oracledb } = require('../../config/oradbconfig');

module.exports = {

    getPurchaseMastDatas: async (data, callBack) => {

        const { fromDate, toDate } = data
        const from = fromDate ? parseISO(fromDate) : null;
        const to = toDate ? parseISO(toDate) : null;
        // Format to Oracle format
        const FROM_DATE = from ? format(from, "dd/MM/yyyy HH:mm:ss") : null;
        const TO_DATE = to ? format(to, "dd/MM/yyyy HH:mm:ss") : null;

        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        const sql =
            `
               SELECT 
    PU_NO AS "GRN NO",
    PU_DATE AS "GRN DATE",
    MEDDESC.ITC_DESC "ITEM NAME",
    PU_QTY AS "GRN QTY",
    PU_FREE AS "GRN FREE QTY",
    PU_RATE AS "GRN RATE",
    PU_TAXPER AS "TAX %",
    SELLMRP AS "GRN SELLING RATE",
    PU_DISPER AS "GRN DIS %",
    MRP AS "GRN MRP",
    (SELLMRP - PU_RATE) AS "GRN MARGIN AMOUNT",
    ROUND(((SELLMRP - PU_RATE) / PU_RATE) *  100,2) AS "GRN MARGIN %",
    PO_NO AS "ORDER NO",
    PO_DATE AS "ORDER DATE",
    PO_QTY AS "PO QTY",
    PO_FREEQTY AS "PO FREE QTY",
    PO_RATE AS "RATE",
    PO_MRP AS "MRP",
    (PO_MRP - PO_RATE ) as "PO MARGIN AMOUNT",
    ROUND(((PO_MRP - PO_RATE ) / PO_RATE ) * 100,2) AS "PO MARGIN %",
    PO_DISPER AS "DIS %",
    PO_DISAMT AS "DIS AMT",
    SUPQTY AS "SUPPLY QTY",
    SUPFRQTY AS "SUPPLY FREE QTY",
    QU_NO AS "QUOTATION #",
    QU_RATE AS "QUO RATE",
    ROUND(QU_MRP / (1 + (TAX.TXN_PURPER / 100)), 2) AS "QUOTATION SELLING PRICE ",
    (ROUND(QU_MRP / (1 + (TAX.TXN_PURPER / 100)), 2) - QU_RATE) "QUO MARGIN AMOUNT",
    ROUND(((ROUND(QU_MRP / (1 + (TAX.TXN_PURPER / 100)), 2) - QU_RATE) / QU_RATE) * 100,2) AS "QUOTATION MARGIN %",
    QU_MRP AS "QUO MRP",
    QU_DISAMT AS "QUO DIS AMT",
    QU_DISPER AS "QUO DIS %",
    QU_FREEQTY AS "QUO FREE QTY",
    TAX.TXN_PURPER AS "GST %",
    ROUND((PU_RATE - PO_RATE),2) AS "RATE VARIATION",
    NVL(ROUND(((ROUND(QU_MRP / (1 + (TAX.TXN_PURPER / 100)), 2) - QU_RATE) / QU_RATE) * 100,2),0) AS "QUO MARGIN %",
    ROUND(((PO_MRP - PO_RATE ) / PO_RATE ) * 100,2) AS "ORDER MARGIN %",
    ROUND(((SELLMRP - PU_RATE) / PU_RATE) *  100,2) AS "PURCHASE MARGIN %"
FROM (
        SELECT DISTINCT
            PM.PU_NO,
            PM.PU_DATE,
            PM.PU_ITEM,
            PM.PDC_TYPE,
            PM.PDC_DOCNO,
            PM.PDC_DOCTYPE,
            PM.PU_QTY,
            PM.PU_FREE,
            PM.PU_RATE,
            PM.PU_TAXPER,
            PM.TX_CODE,
            PM.SELLMRP,
            PM.PU_DISPER,
            PM.MRP,
            O.IT_CODE PO_ITEM,
            O.PO_NO,
            O.POD_DATE PO_DATE,
            O.PDN_QTY PO_QTY,
            O.PDN_FREE PO_FREEQTY,
            O.PDN_RATE PO_RATE,
            O.PDN_MRP PO_MRP,
            O.PON_TAXPER,
            O.PDN_DISPER PO_DISPER,
            O.PDN_DISAMT PO_DISAMT,
            O.PDN_SUPQTY SUPQTY,
            O.PDN_SUPFRQTY SUPFRQTY,
            QD.QU_NO,
            QD.IT_CODE QU_ITEM,
            QD.QUN_RATE QU_RATE,
            QD.QUN_MRP QU_MRP,
            QD.QUN_DISAMT QU_DISAMT,
            QD.QUN_DISPER QU_DISPER,
            QD.QUN_FREEQTY QU_FREEQTY,
            QD.TX_CODE QU_TXCODE
        FROM (
            SELECT DISTINCT
                D.PU_NO,
                D.PUD_DATE PU_DATE,
                D.IT_CODE PU_ITEM,
                D.PDC_TYPE ,
                D.PDC_DOCNO,
                D.PDC_DOCTYPE,
                SUM(D.PDN_QTY) PU_QTY,
                SUM(D.PDN_FREE) PU_FREE,
                D.PDN_RATE  PU_RATE,
                D.PDN_TAXPER PU_TAXPER,
                D.TX_CODE ,
                D.ITN_MRP SELLMRP,
                D.PDN_DISPER PU_DISPER,
                D.ITN_ORIGINALMRP MRP
            FROM PURMAST M
            INNER JOIN PURDETL D ON M.PUC_SLNO = D.PUC_SLNO
            WHERE M.PUD_DATE >= TO_DATE (:FROM_DATE, 'dd/MM/yyyy hh24:mi:ss')
            AND M.PUD_DATE <= TO_DATE (:TO_DATE, 'dd/MM/yyyy hh24:mi:ss')
            AND D.PDC_DOCTYPE = 'P'
            AND M.PUC_CANCEL IS NULL 
            AND M.ST_CODE = 'C002' 
            GROUP BY D.PU_NO,D.PUD_DATE,D.IT_CODE,D.PDC_TYPE,D.PDC_DOCNO,D.PDC_DOCTYPE,D.PDN_RATE,D.PDN_TAXPER,D.TX_CODE,D.ITN_MRP,D.PDN_DISPER,D.ITN_ORIGINALMRP
        ) PM INNER JOIN GRNDETL G ON G.GRC_SLNO = PM.PDC_DOCNO AND PM.PU_ITEM = G.IT_CODE
        LEFT JOIN PORDDETL O ON O.POC_SLNO = G.GRC_DOCNO AND O.IT_CODE = PM.PU_ITEM
        LEFT JOIN QUOTATIONDETL QD ON QD.QU_NO = O.QU_NO AND O.IT_CODE = QD.IT_CODE
        UNION ALL
        SELECT DISTINCT
            PM.PU_NO,
            PM.PU_DATE,
            PM.PU_ITEM,
            PM.PDC_TYPE,
            PM.PDC_DOCNO,
            PM.PDC_DOCTYPE,
            PM.PU_QTY,
            PM.PU_FREE,
            PM.PU_RATE,
            PM.PU_TAXPER,
            PM.TX_CODE,
            PM.SELLMRP,
            PM.PU_DISPER,
            PM.MRP,
            O.IT_CODE PO_ITEM,
            O.PO_NO,
            O.POD_DATE PO_DATE,
            O.PDN_QTY PO_QTY,
            O.PDN_FREE PO_FREEQTY,
            O.PDN_RATE PO_RATE,
            O.PDN_MRP PO_MRP,
            O.PON_TAXPER,
            O.PDN_DISPER PO_DISPER,
            O.PDN_DISAMT PO_DISAMT,
            O.PDN_SUPQTY SUPQTY,
            O.PDN_SUPFRQTY SUPFRQTY,
            QD.QU_NO,
            QD.IT_CODE QU_ITEM,
            QD.QUN_RATE QU_RATE,
            QD.QUN_MRP QU_MRP,
            QD.QUN_DISAMT QU_DISAMT,
            QD.QUN_DISPER QU_DISPER,
            QD.QUN_FREEQTY QU_FREEQTY,
            QD.TX_CODE QU_TXCODE
        FROM (
            SELECT DISTINCT
                D.PU_NO,
                D.PUD_DATE PU_DATE,
                D.IT_CODE PU_ITEM,
                D.PDC_TYPE ,
                D.PDC_DOCNO,
                D.PDC_DOCTYPE,
                SUM(D.PDN_QTY) PU_QTY,
                SUM(D.PDN_FREE) PU_FREE,
                D.PDN_RATE  PU_RATE,
                D.PDN_TAXPER PU_TAXPER,
                D.TX_CODE ,
                D.ITN_MRP SELLMRP,
                D.PDN_DISPER PU_DISPER,
                D.ITN_ORIGINALMRP MRP
            FROM PURMAST M
            INNER JOIN PURDETL D ON M.PUC_SLNO = D.PUC_SLNO
            WHERE M.PUD_DATE >= TO_DATE (:FROM_DATE, 'dd/MM/yyyy hh24:mi:ss')
            AND M.PUD_DATE <= TO_DATE (:TO_DATE, 'dd/MM/yyyy hh24:mi:ss')
            AND D.PDC_DOCTYPE IS NULL
            AND M.PUC_CANCEL IS NULL 
            AND M.ST_CODE = 'C002' 
            GROUP BY D.PU_NO,D.PUD_DATE,D.IT_CODE,D.PDC_TYPE,D.PDC_DOCNO,D.PDC_DOCTYPE,D.PDN_RATE,D.PDN_TAXPER,D.TX_CODE,D.ITN_MRP,D.PDN_DISPER,D.ITN_ORIGINALMRP
        ) PM INNER JOIN PORDDETL O ON O.POC_SLNO = PM.PDC_DOCNO AND O.IT_CODE = PM.PU_ITEM
        LEFT JOIN QUOTATIONDETL QD ON QD.QU_NO = O.QU_NO AND O.IT_CODE = QD.IT_CODE ) PUR 
LEFT JOIN TAX ON PUR.QU_TXCODE = TAX.TX_CODE 
LEFT JOIN MEDDESC ON MEDDESC.IT_CODE = PUR.PU_ITEM
`


        try {
            const result = await conn_ora.execute(
                sql,
                {
                    FROM_DATE: FROM_DATE,
                    TO_DATE: TO_DATE
                },
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT },
            )
            await result.resultSet?.getRows((err, rows) => {
                callBack(err, rows)
            })
        }
        catch (error) {
            return callBack(error)
        } finally {
            if (conn_ora) {
                await conn_ora.close();
                await pool_ora.close();
            }
        }
    },

    //Grm Details
    getGrmDetails: async (data, callBack) => {

        const { fromDate, toDate } = data
        const from = fromDate ? parseISO(fromDate) : null;
        const to = toDate ? parseISO(toDate) : null;
        // Format to Oracle format
        const FROM_DATE = from ? format(from, "dd/MM/yyyy HH:mm:ss") : null;
        const TO_DATE = to ? format(to, "dd/MM/yyyy HH:mm:ss") : null;

        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        const sql =
            `
          SELECT 
    PU_NO AS "GRN NO",
    PU_DATE AS "GRN DATE",
    MEDDESC.ITC_DESC "ITEM NAME",
    PU_RATE AS "GRN RATE",
    SELLMRP AS "GRN SELLING RATE",
    PU_QTY AS "GRN QTY",
    PU_FREE AS "GRN FREE QTY",
    PU_DISPER AS "GRN DIS %",
    PO_DATE AS "ORDER DATE",
    PO_QTY AS "PO QTY",
    PO_FREEQTY AS "PO FREE QTY",
    PO_RATE AS "RATE",
    PO_DISPER AS "DIS %",
    ROUND(((PO_MRP - PO_RATE ) / PO_RATE ) * 100,2) AS "PO MARGIN %",
    ROUND((PU_RATE - PO_RATE),3) AS "RATE VARIATION",
    NVL(ROUND(((ROUND(QU_MRP / (1 + (TAX.TXN_PURPER / 100)), 2) - QU_RATE) / QU_RATE) * 100,2),0) AS "QUO MARGIN %",
    ROUND(((PO_MRP - PO_RATE ) / PO_RATE ) * 100,2) AS "ORDER MARGIN %",
    ROUND(((SELLMRP - PU_RATE) / PU_RATE) *  100,2) AS "PURCHASE MARGIN %",
    (PO_QTY - PU_QTY) AS "GRN VARIATION QTY",
    (PO_FREEQTY - PU_FREE) AS "GRN VARIATION FREE",
    (PU_DATE - PO_DATE) AS DATE_DIFF,
    (PO_DISPER - PU_DISPER) AS "DISCOUNT VARIATION",
    SU.SUC_NAME,
    PO_MRP AS "PO_MRP"
FROM (
        SELECT DISTINCT
            PM.PU_NO,
            PM.PU_DATE,
            PM.PU_ITEM,
            PM.PDC_TYPE,
            PM.PDC_DOCNO,
            PM.PDC_DOCTYPE,
            PM.PU_QTY,
            PM.PU_FREE,
            PM.PU_RATE,
            PM.PU_TAXPER,
            PM.TX_CODE,
            PM.SELLMRP,
            PM.PU_DISPER,
            PM.MRP,
            O.IT_CODE PO_ITEM,
            O.PO_NO,
            O.POD_DATE PO_DATE,
            O.PDN_QTY PO_QTY,
            O.PDN_FREE PO_FREEQTY,
            O.PDN_RATE PO_RATE,
            O.PDN_MRP PO_MRP,
            O.PON_TAXPER,
            O.PDN_DISPER PO_DISPER,
            O.PDN_DISAMT PO_DISAMT,
            O.PDN_SUPQTY SUPQTY,
            O.PDN_SUPFRQTY SUPFRQTY,
            QD.QU_NO,
            QD.IT_CODE QU_ITEM,
            QD.QUN_RATE QU_RATE,
            QD.QUN_MRP QU_MRP,
            QD.QUN_DISAMT QU_DISAMT,
            QD.QUN_DISPER QU_DISPER,
            QD.QUN_FREEQTY QU_FREEQTY,
            QD.TX_CODE QU_TXCODE,
            PM.SU_CODE
        FROM (
            SELECT DISTINCT
                D.PU_NO,
                D.PUD_DATE PU_DATE,
                D.IT_CODE PU_ITEM,
                D.PDC_TYPE ,
                D.PDC_DOCNO,
                D.PDC_DOCTYPE,
                SUM(D.PDN_QTY) PU_QTY,
                SUM(D.PDN_FREE) PU_FREE,
                D.PDN_RATE  PU_RATE,
                D.PDN_TAXPER PU_TAXPER,
                D.TX_CODE ,
                D.ITN_MRP SELLMRP,
                D.PDN_DISPER PU_DISPER,
                D.ITN_ORIGINALMRP MRP,
                M.SU_CODE
            FROM PURMAST M
            INNER JOIN PURDETL D ON M.PUC_SLNO = D.PUC_SLNO
            WHERE M.PUD_DATE >=  TO_DATE (:FROM_DATE, 'dd/MM/yyyy hh24:mi:ss')
            AND M.PUD_DATE <= TO_DATE (:TO_DATE, 'dd/MM/yyyy hh24:mi:ss')
            AND D.PDC_DOCTYPE = 'P'
            AND M.PUC_CANCEL IS NULL 
            AND M.ST_CODE = 'C002' 
            GROUP BY D.PU_NO,D.PUD_DATE,D.IT_CODE,D.PDC_TYPE,D.PDC_DOCNO,D.PDC_DOCTYPE,D.PDN_RATE,D.PDN_TAXPER,D.TX_CODE,D.ITN_MRP,D.PDN_DISPER,D.ITN_ORIGINALMRP,M.SU_CODE
        ) PM INNER JOIN GRNDETL G ON G.GRC_SLNO = PM.PDC_DOCNO AND PM.PU_ITEM = G.IT_CODE
        LEFT JOIN PORDDETL O ON O.POC_SLNO = G.GRC_DOCNO AND O.IT_CODE = PM.PU_ITEM
        LEFT JOIN QUOTATIONDETL QD ON QD.QU_NO = O.QU_NO AND O.IT_CODE = QD.IT_CODE
        UNION ALL
        SELECT DISTINCT
            PM.PU_NO,
            PM.PU_DATE,
            PM.PU_ITEM,
            PM.PDC_TYPE,
            PM.PDC_DOCNO,
            PM.PDC_DOCTYPE,
            PM.PU_QTY,
            PM.PU_FREE,
            PM.PU_RATE,
            PM.PU_TAXPER,
            PM.TX_CODE,
            PM.SELLMRP,
            PM.PU_DISPER,
            PM.MRP,
            O.IT_CODE PO_ITEM,
            O.PO_NO,
            O.POD_DATE PO_DATE,
            O.PDN_QTY PO_QTY,
            O.PDN_FREE PO_FREEQTY,
            O.PDN_RATE PO_RATE,
            O.PDN_MRP PO_MRP,
            O.PON_TAXPER,
            O.PDN_DISPER PO_DISPER,
            O.PDN_DISAMT PO_DISAMT,
            O.PDN_SUPQTY SUPQTY,
            O.PDN_SUPFRQTY SUPFRQTY,
            QD.QU_NO,
            QD.IT_CODE QU_ITEM,
            QD.QUN_RATE QU_RATE,
            QD.QUN_MRP QU_MRP,
            QD.QUN_DISAMT QU_DISAMT,
            QD.QUN_DISPER QU_DISPER,
            QD.QUN_FREEQTY QU_FREEQTY,
            QD.TX_CODE QU_TXCODE,
             PM.SU_CODE
        FROM (
            SELECT DISTINCT
                D.PU_NO,
                D.PUD_DATE PU_DATE,
                D.IT_CODE PU_ITEM,
                D.PDC_TYPE ,
                D.PDC_DOCNO,
                D.PDC_DOCTYPE,
                SUM(D.PDN_QTY) PU_QTY,
                SUM(D.PDN_FREE) PU_FREE,
                D.PDN_RATE  PU_RATE,
                D.PDN_TAXPER PU_TAXPER,
                D.TX_CODE ,
                D.ITN_MRP SELLMRP,
                D.PDN_DISPER PU_DISPER,
                D.ITN_ORIGINALMRP MRP,
                M.SU_CODE
            FROM PURMAST M
            INNER JOIN PURDETL D ON M.PUC_SLNO = D.PUC_SLNO
            WHERE M.PUD_DATE >=  TO_DATE (:FROM_DATE, 'dd/MM/yyyy hh24:mi:ss')
            AND M.PUD_DATE <= TO_DATE (:TO_DATE, 'dd/MM/yyyy hh24:mi:ss')
            AND D.PDC_DOCTYPE IS NULL
            AND M.PUC_CANCEL IS NULL 
            AND M.ST_CODE = 'C002' 
            GROUP BY D.PU_NO,D.PUD_DATE,D.IT_CODE,D.PDC_TYPE,D.PDC_DOCNO,D.PDC_DOCTYPE,D.PDN_RATE,D.PDN_TAXPER,D.TX_CODE,D.ITN_MRP,D.PDN_DISPER,D.ITN_ORIGINALMRP,M.SU_CODE
        ) PM INNER JOIN PORDDETL O ON O.POC_SLNO = PM.PDC_DOCNO AND O.IT_CODE = PM.PU_ITEM
        LEFT JOIN QUOTATIONDETL QD ON QD.QU_NO = O.QU_NO AND O.IT_CODE = QD.IT_CODE ) PUR 
LEFT JOIN TAX ON PUR.QU_TXCODE = TAX.TX_CODE 
LEFT JOIN MEDDESC ON MEDDESC.IT_CODE = PUR.PU_ITEM
JOIN SUPPLIER SU ON SU.SU_CODE = PUR.SU_CODE
`
        try {
            const result = await conn_ora.execute(
                sql,
                {
                    FROM_DATE: FROM_DATE,
                    TO_DATE: TO_DATE
                },
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT },
            )
            await result.resultSet?.getRows((err, rows) => {
                callBack(err, rows)
            })
        }
        catch (error) {
            return callBack(error)
        } finally {
            if (conn_ora) {
                await conn_ora.close();
                await pool_ora.close();
            }
        }
    },

    getpendingApprovalQtn: async (callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        const sql = `
             SELECT 
                   QM.QU_NO "QUOTATION #",
                   QM.QUC_SLNO,
                   QM.QUD_DATE "QUOTATION DATE",
                   QM.SU_CODE ,
                   SU.SUC_NAME "SUPPLIER",
                   QM.QUC_DESC "QUOTATION REMARK",
                   QM.QUN_AMOUNT "QUOTATION AMOUNT" 
               FROM QUOTATIONMAST QM 
                   JOIN SUPPLIER SU ON SU.SU_CODE = QM.SU_CODE
               WHERE QM.QUC_STCODE = 'C002' 
               AND QM.QUC_CANCEL IS NULL 
               AND QM.QOT_TOTAPPROVALSREQ = 5
               AND QM.QOT_TOTAPPROVALSCOMP IN (3,4)
               AND QM.QOT_REJECT IS NULL

            `;
        try {
            const result = await conn_ora.execute(
                sql,
                {},
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT },
            )
            await result.resultSet?.getRows((err, rows) => {
                callBack(err, rows)
            })
        }
        catch (error) {
            return callBack(error)
        } finally {
            if (conn_ora) {
                await conn_ora.close();
                await pool_ora.close();
            }
        }

    },
    getPurchaseDetails: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        try {
            const result = await conn_ora.execute(
                ` 
                               SELECT 
                    QD.QU_NO "QUOTATION #",
                    QD.QUD_DATE "QUOT DATE",
                    QD.IT_CODE,
                    MD.ITC_DESC "ITEM",
                    QD.QUN_QTY "QTY",
                    TX.TXC_DESC "GST",
                    QD.QUN_DISPER "DIS %",
                    QD.QUN_DISAMT "DIS AMNT",
                    QD.QUN_FREEQTY "FREE QTY",
                    QD.QUN_RATE "RATE",
                    QD.QUN_TAXAMT "GST AMT",
                    QD.QUN_NETAMT "RATE + GST",
                    round(QD.QUN_MRP / (1 + (TX.TXN_PURPER / 100)) ,2) "SELLING RATE",
                    QD.QUN_MRP "MRP - INCL GST",
                    ((round(QD.QUN_MRP / (1 + (TX.TXN_PURPER / 100)) ,2)) - QD.QUN_RATE ) "MARGIN AMT",
                    ROUND((((QD.QUN_MRP / (1 + (TX.TXN_PURPER / 100))) - QD.QUN_RATE) / QD.QUN_RATE ) * 100,2) "MARGIN %", 
                    QD.QUN_NETUNITRATE "QUN NET AMT"
               FROM QUOTATIONDETL QD
                   JOIN MEDDESC MD ON MD.IT_CODE = QD.IT_CODE
                   JOIN TAX TX ON TX.TX_CODE = QD.TX_CODE
               WHERE QD.QUC_SLNO = :quc_slno
               AND (QD.QUC_ACTIVE = 'Y' OR QD.QUC_ACTIVE IS NULL)
                `,
                {
                    quc_slno: data,
                },
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT },
            )
            await result.resultSet?.getRows((err, rows) => {
                callBack(err, rows)
            })

        } catch (error) {
        } finally {
            if (conn_ora) {
                await conn_ora.close();
                await pool_ora.close();
            }
        }
    },
    getItemDetails: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        try {
            const result = await conn_ora.execute(
                ` 
                   SELECT 
                  PD.PUD_DATE "PURCHASE DATE",
                  PD.SU_CODE,
                  SP.SUC_NAME "SUPPLIER",
                  PD.IT_CODE,
                  MD.ITC_DESC "ITEM",
                  SUM(PD.PDN_QTY) "QTY",
                  PD.PDN_TAXPER "GST %",
                  1 + (PD.PDN_TAXPER / 100) "PDN_TAXPER",
                  PD.PDN_RATE "COST RATE",
                  PD.PDN_TAXAMT "GST AMT",
                  PD.PDN_STVAL "COST INCL GST",
                  PD.ITN_MRP "MRP WOUT GST",
                  PD.ITN_ORIGINALMRP "MRP INCL GST",
                  PD.PDN_FREE,
                  PD.PDN_DISPER,
                  ROUND(((PD.ITN_MRP - PD.PDN_RATE)/ PD.PDN_RATE ) * 100) "MARGIN %"
              FROM PURDETL PD
                  JOIN MEDDESC MD ON MD.IT_CODE = PD.IT_CODE
                  JOIN SUPPLIER SP ON SP.SU_CODE = PD.SU_CODE
              WHERE PD.IT_CODE = :st_code
              AND PD.ST_CODE = 'C002'
              GROUP BY
                  PD.PUD_DATE,
                  PD.SU_CODE,
                  SP.SUC_NAME,
                  PD.IT_CODE,
                  MD.ITC_DESC,
                  PD.PDN_TAXPER,
                  PD.PDN_RATE,
                  PD.PDN_TAXAMT,
                  PD.PDN_STVAL,
                  PD.ITN_MRP,
                  PD.ITN_ORIGINALMRP,
                  PD.PDN_FREE,
                  PD.PDN_DISPER       
                `,
                {
                    st_code: data,
                },
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT },
            )
            await result.resultSet?.getRows((err, rows) => {
                callBack(err, rows)
            })

        } catch (error) {
        } finally {
            if (conn_ora) {
                await conn_ora.close();
                await pool_ora.close();
            }
        }
    },
}



