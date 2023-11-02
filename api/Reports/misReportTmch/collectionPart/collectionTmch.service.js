// @ts-ignore
const { oracledb, connectionClose, oraConnection } = require('../../../../config/oradbconfig');

module.exports = {
    //Advance Collection (C)
    advanceCollectionTmch: async (data, callBack) => {

        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();

        const ipNumberList = data.ptno.join(',');
        const fromDate = data.from;
        const toDate = data.to;

        const sql = `SELECT SUM (NVL (ARN_AMOUNT, 0)) Amt, 0 tax
                            FROM OPADVANCE
                        WHERE NVL (ARC_CANCEL, 'N') = 'N'
                                AND ARD_DATE >=  TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND ARD_DATE <=  TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND OPADVANCE.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                                AND OPADVANCE.IP_NO NOT IN (${ipNumberList})
                        UNION ALL
                        SELECT SUM (NVL (ARN_AMOUNT, 0)) Amt, 0 tax
                            FROM PHADVANCEENTRY
                        WHERE (NVL (ARC_CANCEL, 'N') = 'N')
                                AND ARD_DATE >=TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND PHADVANCEENTRY.ARC_MHCODE IN (SELECT MH_CODE FROM multihospital)
                                AND ARD_DATE <=TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND PHADVANCEENTRY. ARC_TYPE = 'I'
                        UNION ALL
                        SELECT SUM (NVL (ARN_AMOUNT, 0)) Amt, 0 tax
                            FROM IPADVANCE
                        WHERE (NVL (ARC_CANCEL, 'N') = 'N')
                                AND ARD_DATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND ARD_DATE <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND IPADVANCE.IAC_MHCODE IN (SELECT MH_CODE FROM multihospital)
                                AND IPADVANCE.IP_NO NOT IN (${ipNumberList})`;
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
    advanceRefundTmch: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();

        const ipNumberList = data.ptno.join(',');
        const fromDate = data.from;
        const toDate = data.to;
        const advanceRefndSql = `SELECT SUM (NVL (REFUNDOPADVANCE.RFN_AMT, 0)) Amt, 0 tax
                FROM REFUNDOPADVANCE
            WHERE REFUNDOPADVANCE.Rfc_Cancel = 'N'
                    AND REFUNDOPADVANCE.Rfd_Date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                    AND REFUNDOPADVANCE.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                    AND REFUNDOPADVANCE.Rfd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                    AND REFUNDOPADVANCE.AR_SLNO IN (SELECT AR_SLNO FROM OPADVANCE WHERE  IP_NO NOT IN (${ipNumberList}))
            HAVING SUM (NVL (REFUNDOPADVANCE.RFN_AMT, 0)) > 0
            UNION ALL
            SELECT SUM (NVL (REFUNDADVANCE.RFN_AMT, 0)) Amt, 0 tax
                FROM REFUNDADVANCE
            WHERE NVL (REFUNDADVANCE.RFC_CANCEL, 'N') = 'N'
                    AND REFUNDADVANCE.Rfd_Date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                    AND REFUNDADVANCE.RFC_MHCODE IN (SELECT MH_CODE FROM multihospital)
                    AND REFUNDADVANCE.Rfd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                    AND REFUNDADVANCE.AR_SLNO IN (SELECT AR_SLNO FROM OPADVANCE WHERE  IP_NO NOT IN (${ipNumberList}))
            HAVING SUM (NVL (REFUNDADVANCE.RFN_AMT, 0)) > 0
            UNION ALL
            SELECT SUM ( (  NVL (Ipreceipt.irn_balance, 0) + NVL (Ipreceipt.IRN_REFCHEQ, 0) + NVL (Ipreceipt.irn_refcard, 0)))Amt,0 tax
                FROM IPRECEIPT
            WHERE DMC_TYPE = 'A' AND IRC_CANCEL IS NULL
                    AND IPRECEIPT.IRD_DATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                    AND ipreceipt.IPC_MHCODE IN (SELECT MH_CODE FROM multihospital)
                    AND IPRECEIPT.IRD_DATE <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                    AND IPRECEIPT.DMC_SLNO IN (SELECT DMC_SLNO 
            FROM DISBILLMAST 
            WHERE DMD_DATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss') 
                    AND DMD_DATE <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss') 
                    AND IP_NO NOT IN (${ipNumberList}))
            HAVING SUM (  (  NVL (Ipreceipt.irn_balance, 0) + NVL (Ipreceipt.IRN_REFCHEQ, 0)  + NVL (Ipreceipt.irn_refcard, 0))) > 0
            UNION ALL
            SELECT SUM (NVL (ADVANCERETURN.RAN_AMT, 0)) Amt, 0 tax
                FROM ADVANCERETURN
            WHERE (NVL (ADVANCERETURN.RAC_CANCEL, 'N') = 'N')
                    AND ADVANCERETURN.RAD_DATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                    AND ADVANCERETURN.RAC_MHCODE IN (SELECT MH_CODE FROM multihospital)
                    AND ADVANCERETURN.RAD_DATE <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                    AND ADVANCERETURN.AR_SLNO IN (SELECT AR_SLNO FROM OPADVANCE WHERE  IP_NO NOT IN (${ipNumberList}))
            HAVING SUM (NVL (ADVANCERETURN.RAN_AMT, 0)) > 0`;

        try {
            const result = await conn_ora.execute(
                advanceRefndSql,
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
    //Advance Settled
    advanceSettledTmch: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();

        const ipNumberList = data.ptno.join(',');
        const fromDate = data.from;
        const toDate = data.to;

        const advanceSettledSql = `SELECT SUM (NVL (Opn_advance, 0)) Amt, 0 tax
                                        FROM Opbillmast
                                    WHERE NVL (OPN_CANCEL, 'N') = 'N'  AND OPD_DATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                            AND OPD_DATE <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                            AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                                    UNION ALL
                                    SELECT SUM (NVL (bmn_advamount, 0)) Amt, 0 tax
                                        FROM Pbillmast
                                    WHERE NVL (BMC_CANCEL, 'N') = 'N'
                                            AND BMD_DATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                            AND pbillmast.BMC_COLLCNCODE IS NULL
                                            AND BMD_DATE <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                            AND pbillmast.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                                            AND PBILLMAST.IP_NO NOT IN (${ipNumberList})
                                            AND PBILLMAST.BMC_CACR = 'I'
                                    UNION ALL
                                    SELECT SUM (NVL (Dmn_advance, 0)) Amt, 0 TAX
                                        FROM Disbillmast
                                    WHERE NVL (Disbillmast.Dmc_cancel, 'N') = 'N'
                                            AND Disbillmast.Dmd_date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                            AND Disbillmast.Dmd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                            AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                                            AND DISBILLMAST.IP_NO NOT IN (${ipNumberList})
                                    UNION ALL
                                    SELECT SUM (NVL (BMN_ADVAMOUNT, 0)) Amt, 0 Tax
                                        FROM Billmast
                                    WHERE NVL (BMC_CANCEL, 'N') = 'N'
                                            AND BMD_DATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                            AND BILLMAST.BMC_COLLCNCODE IS NULL
                                            AND BILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                                            AND Bmd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                            AND BILLMAST.IP_NO NOT IN (${ipNumberList})
                                            AND BILLMAST.BMC_CACR = 'I'
                                    UNION ALL
                                    SELECT SUM (NVL (bmn_advamount, 0)) Amt, 0 Tax
                                        FROM Pbillmast
                                    WHERE NVL (BMC_CANCEL, 'N') = 'N'
                                            AND BMD_COLLDATE >=  TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                            AND pbillmast.BMC_COLLCNCODE IS NOT NULL
                                            AND BMD_COLLDATE <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                            AND pbillmast.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                                            AND PBILLMAST.IP_NO NOT IN (${ipNumberList})
                                            AND PBILLMAST.BMC_CACR = 'I'
                                    UNION ALL
                                    SELECT SUM (NVL (BMN_ADVAMOUNT, 0)) Amt, 0 Tax
                                        FROM Billmast
                                    WHERE NVL (BMC_CANCEL, 'N') = 'N'
                                            AND BMD_COLLDATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                            AND BILLMAST.BMC_COLLCNCODE IS NOT NULL
                                            AND BILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                                            AND BMD_COLLDATE <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                            AND BILLMAST.IP_NO NOT IN (${ipNumberList})
                                            AND BILLMAST.BMC_CACR = 'I'`;
        try {
            const result = await conn_ora.execute(
                advanceSettledSql,
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
    //Collection Against Sales (A) Total Value
    collectionAgainstSalePart1Tmch: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();

        const ipNumberList = data.ptno.join(',');
        const fromDate = data.from;
        const toDate = data.to;

        const sql = `SELECT 
                        SUM ( NVL (receiptmast.RPN_CASH, 0) + NVL (receiptmast.RPN_CARD, 0) + NVL (receiptmast.RPN_CHEQUE, 0)) AS Amt
                    FROM receiptmast
                    WHERE receiptmast.RPC_CACR IN ('C', 'R')
                        AND receiptmast.RPC_CANCEL IS NULL
                        AND receiptmast.RPC_COLLCNCODE IS NULL
                        AND receiptmast.RPD_DATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                        AND receiptmast.RPD_DATE <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                        AND RECEIPTMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                    UNION ALL
                    SELECT SUM ( NVL (Opbillmast.OPN_CASH, 0) + NVL (Opbillmast.OPN_CARD, 0) + NVL (Opbillmast.OPN_CHEQUE, 0)) AS Amt
                    FROM Opbillmast
                    WHERE Opbillmast.OPC_CACR IN ('C', 'R') AND Opbillmast.OPN_CANCEL IS NULL
                        AND Opbillmast.OPD_DATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                        AND Opbillmast.OPD_DATE <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                        AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                    UNION ALL
                    SELECT SUM ( NVL (billmast.BMN_CASH, 0)  + NVL (billmast.BMN_CARD, 0) + NVL (billmast.BMN_CHEQUE, 0))
                            AS Amt
                    FROM billmast
                    WHERE billmast.Bmc_Cacr IN ('C', 'R')
                        AND billmast.BMC_CANCEL IS NULL
                        AND BILLMAST.BMC_COLLCNCODE IS NULL
                        AND billmast.BMD_DATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                        AND billmast.BMD_DATE <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                        AND BILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                    UNION ALL
                    SELECT SUM ( NVL (Pbillmast.BMN_CARD, 0) + NVL (Pbillmast.BMN_CASH, 0) + NVL (Pbillmast.BMN_CHEQUE, 0)) AS Amt
                    FROM Pbillmast
                    WHERE     Pbillmast.Bmc_Cacr IN ('C', 'R')
                        AND Pbillmast.bmc_cancel = 'N'
                        AND pbillmast.BMC_COLLCNCODE IS NULL
                        AND Pbillmast.BMD_DATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                        AND Pbillmast.BMD_DATE <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                        AND pbillmast.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                    UNION ALL
                    SELECT SUM ( NVL (ipreceipt.irn_amount, 0) + NVL (ipreceipt.irn_card, 0) + NVL (ipreceipt.irn_cheque, 0) + NVL (ipreceipt.irn_neft, 0)) - SUM (NVL (irn_balance, 0) + NVL (IRN_REFCHEQ, 0) + NVL (IPRECEIPT.IRN_REFCARD, 0)) Amt
                    FROM IPRECEIPT, Disbillmast
                    WHERE Disbillmast.Dmc_Slno = IPRECEIPT.Dmc_Slno
                        AND IPRECEIPT.DMC_TYPE IN ('C', 'R')
                        AND DMD_DATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                        AND DMD_DATE <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                        AND IRC_CANCEL IS NULL
                        AND IRD_DATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                        AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                        AND IRD_DATE <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                        AND DISBILLMAST.IP_NO NOT IN  (${ipNumberList})
                    UNION ALL
                    SELECT SUM ( NVL (billmast.BMN_CASH, 0) + NVL (billmast.BMN_CARD, 0) + NVL (billmast.BMN_CHEQUE, 0)) AS Amt
                    FROM billmast
                    WHERE     billmast.Bmc_Cacr IN ('C', 'R')
                        AND billmast.BMC_CANCEL IS NULL
                        AND BILLMAST.BMC_COLLCNCODE IS NOT NULL
                        AND BILLMAST.BMD_COLLDATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                        AND BILLMAST.BMD_COLLDATE <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                        AND BILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                    UNION ALL
                    SELECT SUM ( NVL (receiptmast.RPN_CASH, 0) + NVL (receiptmast.RPN_CARD, 0)+ NVL (receiptmast.RPN_CHEQUE, 0)) AS Amt
                    FROM receiptmast
                    WHERE     receiptmast.RPC_CACR IN ('C', 'R')
                        AND receiptmast.RPC_CANCEL IS NULL
                        AND receiptmast.RPC_COLLCNCODE IS NOT NULL
                        AND receiptmast.RPD_COLLDATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                        AND receiptmast.RPD_COLLDATE <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                        AND RECEIPTMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                    UNION ALL
                    SELECT SUM ( NVL (Pbillmast.BMN_CARD, 0) + NVL (Pbillmast.BMN_CASH, 0)+ NVL (Pbillmast.BMN_CHEQUE, 0)) AS Amt
                    FROM Pbillmast
                    WHERE     Pbillmast.Bmc_Cacr IN ('C', 'R')
                        AND NVL (Pbillmast.bmc_cancel, 'N') = 'N'
                        AND pbillmast.BMC_COLLCNCODE IS NOT NULL
                        AND Pbillmast.BMD_COLLDATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                        AND Pbillmast.BMD_COLLDATE <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                        AND pbillmast.MH_CODE IN (SELECT MH_CODE FROM multihospital)`;

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
    //Collection Against Sales (A) negative value
    collectionAgainstSalePart2Tmch: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();

        const ipNumberList = data.ptno.join(',');
        const fromDate = data.from;
        const toDate = data.to;

        const sql = `SELECT 
                        SUM ( NVL (Refundreceiptmast.RFN_CASH, 0)  + NVL (Refundreceiptmast.RFN_CARD, 0)  + NVL (Refundreceiptmast.RFN_CHEQUE, 0)) * -1 AS Amt,
                        SUM (NVL (Refundreceiptmast.RFN_TOTTAX, 0)) * -1 tax
                    FROM Refundreceiptmast
                    WHERE     Refundreceiptmast.Rfc_Cacr IN ('C', 'R')
                        AND Refundreceiptmast.Rfc_Cancel IS NULL
                        AND Refundreceiptmast.RFC_RETCNCODE IS NULL
                        AND Refundreceiptmast.Roc_Slno IS NULL
                        AND (   NVL (Refundreceiptmast.RFN_CASH, 0) > 0  OR NVL (Refundreceiptmast.RFN_CARD, 0) > 0 OR NVL (Refundreceiptmast.RFN_CHEQUE, 0) > 0)
                        AND Refundreceiptmast.Rfd_Date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                        AND Refundreceiptmast.Rfd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                        AND REFUNDRECEIPTMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                    UNION ALL
                    SELECT SUM (  NVL (refundbillmast.RFN_CASH, 0)  + NVL (refundbillmast.RFN_CARD, 0)  + NVL (refundbillmast.RFN_CHEQUE, 0))  * -1 AS Amt,
                        SUM (NVL (refundbillmast.RFN_TOTTAX, 0)) * -1 tax
                    FROM refundbillmast
                    WHERE     refundbillmast.Rfc_Cacr IN ('C', 'R')
                        AND refundbillmast.Rfc_Cancel IS NULL
                        AND Refundbillmast.RFC_RETCNCODE IS NULL
                        AND RefundBillmast.Roc_Slno IS NULL
                        AND (   NVL (refundbillmast.RFN_CASH, 0) > 0 OR NVL (refundbillmast.RFN_CARD, 0) > 0 OR NVL (refundbillmast.RFN_CHEQUE, 0) > 0)
                        AND refundbillmast.Rfd_Date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                        AND refundbillmast.Rfd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                        AND refundbillmast.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                    UNION ALL
                    SELECT 
                        SUM ( NVL (Mretmast.MRN_CASH, 0)  + NVL (Mretmast.MRN_CARD, 0) + NVL (Mretmast.MRN_CHEQUE, 0)) * -1 AS Amt,
                        SUM ( NVL (MRN_SALETAXCH, 0)  + NVL (MRN_SALETAXCR, 0)  + NVL (MRN_CESSCH, 0) + NVL (MRN_CESSCR, 0))  * -1 Tax
                    FROM Mretmast
                    WHERE     Mretmast.MRC_CACR IN ('C', 'R')
                        AND NVL (Mretmast.MRC_CANCEL, 'N') = 'N'
                        AND Mretmast.MRC_RETCNCODe IS NULL
                        AND (NVL (Mretmast.MRN_CASH, 0) > 0 OR NVL (Mretmast.MRN_CARD, 0) > 0 OR NVL (Mretmast.MRN_CHEQUE, 0) > 0)
                        AND Mretmast.MRD_DATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                        AND Mretmast.MRD_DATE <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                        AND MRETMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                    UNION ALL
                    SELECT SUM (NVL (IPRECEIPTrefund.irf_cash, 0) + NVL (IPRECEIPTrefund.irf_card, 0) + NVL (IPRECEIPTrefund.irf_cheque, 0))  * -1 AS Amt,
                        0 tax
                    FROM IPRECEIPTrefund
                    WHERE IRF_CACR IN ('C') AND IRF_CANCEL IS NULL
                        AND (NVL (IPRECEIPTrefund.irf_cash, 0) > 0 OR NVL (IPRECEIPTrefund.irf_card, 0) > 0  OR NVL (IPRECEIPTrefund.irf_cheque, 0) > 0)
                        AND IRF_DATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                        AND IRF_DATE <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                        AND ipreceiptrefund.IRC_MHCODE IN (SELECT MH_CODE FROM multihospital)
                        AND IPRECEIPTREFUND.IP_NO NOT IN (${ipNumberList})
                    UNION ALL
                    SELECT 
                        SUM (NVL (Ron_Cash, 0) + NVL (Ron_Card, 0) + NVL (Ron_Cheque, 0)) * -1 AS Amt,
                        SUM (NVL (opbillrefundmast.RON_TOTTAX, 0)) * -1 Tax
                    FROM Opbillrefundmast
                    WHERE (NVL (Roc_Cancel, 'N') = 'N')
                        AND (NVL (Ron_Cash, 0) > 0 OR NVL (Ron_Cheque, 0) > 0 OR NVL (Ron_Card, 0) > 0)
                        AND Opbillrefundmast.Rod_Date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                        AND Opbillrefundmast.Rod_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                        AND OPBILLREFUNDMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                    UNION ALL
                    SELECT 
                            SUM (NVL (Rin_Cash, 0) + NVL (Rin_Card, 0) + NVL (Rin_Cheque, 0)) * -1 Amt,
                            SUM (NVL (IPREFUNDMAST.RIN_TOTTAX, 0) * -1) Tax
                    FROM Iprefundmast
                    WHERE  Ric_Cacr IN ('C', 'R')
                        AND NVL (Ric_Cancel, 'N') = 'N'
                        AND Dmc_Slno IS NOT NULL
                        AND Rid_Date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                        AND IPREFUNDMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                        AND Rid_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                    UNION ALL
                    SELECT 
                        SUM ( NVL (Refundreceiptmast.RFN_CASH, 0) + NVL (Refundreceiptmast.RFN_CARD, 0) + NVL (Refundreceiptmast.RFN_CHEQUE, 0)) * -1  AS Amt,
                        SUM (NVL (Refundreceiptmast.RFN_TOTTAX, 0)) * -1 tax
                    FROM Refundreceiptmast
                    WHERE     Refundreceiptmast.Rfc_Cacr IN ('C', 'R')
                        AND Refundreceiptmast.Rfc_Cancel IS NULL
                        AND Refundreceiptmast.RFC_RETCNCODE IS NOT NULL
                        AND Refundreceiptmast.Roc_Slno IS NULL
                        AND (   NVL (Refundreceiptmast.RFN_CASH, 0) > 0 OR NVL (Refundreceiptmast.RFN_CARD, 0) > 0 OR NVL (Refundreceiptmast.RFN_CHEQUE, 0) > 0)
                        AND Refundreceiptmast.RFD_RETDATE >=  TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                        AND Refundreceiptmast.RFD_RETDATE <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                        AND REFUNDRECEIPTMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                    UNION ALL
                    SELECT 
                        SUM (NVL (refundbillmast.RFN_CASH, 0)  + NVL (refundbillmast.RFN_CARD, 0) + NVL (refundbillmast.RFN_CHEQUE, 0)) * -1  AS Amt,
                        SUM (NVL (refundbillmast.RFN_TOTTAX, 0)) * -1 tax
                    FROM refundbillmast
                    WHERE refundbillmast.Rfc_Cacr IN ('C', 'R')
                        AND refundbillmast.Rfc_Cancel IS NULL
                        AND Refundbillmast.RFC_RETCNCODE IS NOT NULL
                        AND RefundBillmast.Roc_Slno IS NULL
                        AND (   NVL (refundbillmast.RFN_CASH, 0) > 0 OR NVL (refundbillmast.RFN_CARD, 0) > 0 OR NVL (refundbillmast.RFN_CHEQUE, 0) > 0)
                        AND refundbillmast.RFD_RETDATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                        AND refundbillmast.RFD_RETDATE <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                        AND refundbillmast.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                    UNION ALL
                    SELECT 
                        SUM (  NVL (Mretmast.MRN_CASH, 0) + NVL (Mretmast.MRN_CARD, 0) + NVL (Mretmast.MRN_CHEQUE, 0)) * -1 AS Amt,
                        SUM ( NVL (MRN_SALETAXCH, 0) + NVL (MRN_SALETAXCR, 0) + NVL (MRN_CESSCH, 0)  + NVL (MRN_CESSCR, 0)) * -1 Tax
                    FROM Mretmast
                    WHERE     Mretmast.MRC_CACR IN ('C', 'R')
                        AND Mretmast.MRC_CANCEL = 'N'
                        AND Mretmast.MRC_RETCNCODE IS NOT NULL
                        AND (NVL (Mretmast.MRN_CASH, 0) > 0 OR NVL (Mretmast.MRN_CARD, 0) > 0 OR NVL (Mretmast.MRN_CHEQUE, 0) > 0)
                        AND Mretmast.MRD_RETDATE >=  TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                        AND Mretmast.MRD_RETDATE <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                        AND MRETMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)`;

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
    // Complimentary
    complimentory: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();

        const fromDate = data.from;
        const toDate = data.to;

        const sql = `SELECT SUM (NVL (Opbillmast.OPN_NETAMT, 0)
                                + NVL (OPBILLMAST.OPN_SALETAXCH, 0)
                                + NVL (OPBILLMAST.OPN_SALETAXCR, 0)) AS Amt,
                            SUM (NVL (opbillmast.OPN_TOTTAX, 0)) Tax
                        FROM Opbillmast
                        WHERE Opbillmast.OPC_CACR = 'M' AND Opbillmast.OPN_CANCEL IS NULL
                            AND Opbillmast.OPD_DATE >=
                                    TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND Opbillmast.OPD_DATE <=
                                    TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                        UNION ALL
                        SELECT SUM (NVL (Disbillmast.DMN_NETAMT, 0) + NVL (DMN_SALESTAXCH, 0) + NVL (DMN_SALESTAXCR, 0))Amt,
                            SUM (DECODE (NVL (Disbillmast.Dmc_Cancel, 'N'),'N',   NVL (DMN_SALESTAXCH, 0)+ NVL (DMN_SALESTAXCR, 0) + NVL (DMN_CESSCH, 0)
                                        + NVL (DMN_CESSCR, 0),0)) TAX
                        FROM Disbillmast
                        WHERE Dmc_Cacr = 'M' AND Dmc_Cancel IS NULL
                            AND DMD_DATE >=TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                            AND DMD_DATE <=TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')`;

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
    // CreditInsurance Bill Collection(D)
    creditInsuranceBillCollectionTmch: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();

        const ipNumberList = data.ptno.join(',');
        const fromDate = data.from;
        const toDate = data.to;

        const sql = `SELECT 
                            SUM (NVL (RECPCOLLECTIONMAST.RCN_CASH, 0) + NVL (RECPCOLLECTIONMAST.RCN_CHK, 0) + NVL (RECPCOLLECTIONMAST.RCN_DD, 0) + NVL (RECPCOLLECTIONMAST.RCN_Card, 0) + NVL (RECPCOLLECTIONMAST.RCN_NEFT, 0)) Amt,
                            0 tax
                        FROM RECPCOLLECTIONMAST
                        WHERE RECPCOLLECTIONMAST.RCD_DATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND RECPCOLLECTIONMAST.RCD_DATE <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND RECPCOLLECTIONMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                            AND RECPCOLLECTIONMAST.RCC_CANCEL IS NULL
                            AND RECPCOLLECTIONMAST.RCC_SLNO IN (
                                SELECT 
                                    RCC_SLNO 
                                FROM RECPCOLLECTIONDETL 
                                WHERE RECPCOLLECTIONDETL.RCD_DATE >= TO_DATE ('${fromDate}','dd/MM/yyyy hh24:mi:ss')
                                AND RECPCOLLECTIONDETL.RCD_DATE <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss') 
                                AND RECPCOLLECTIONDETL.MODULES <> 'IPC'
                            )
                        HAVING SUM ( NVL (RECPCOLLECTIONMAST.RCN_CASH, 0) + NVL (RECPCOLLECTIONMAST.RCN_CHK, 0) + NVL (RECPCOLLECTIONMAST.RCN_DD, 0)  + NVL (RECPCOLLECTIONMAST.RCN_Card, 0) + NVL (RECPCOLLECTIONMAST.RCN_NEFT, 0)) > 0
                        UNION ALL
                        SELECT 
                            SUM (NVL (RECPCOLLECTIONMAST.RCN_CASH, 0) + NVL (RECPCOLLECTIONMAST.RCN_CHK, 0) + NVL (RECPCOLLECTIONMAST.RCN_DD, 0) + NVL (RECPCOLLECTIONMAST.RCN_Card, 0) + NVL (RECPCOLLECTIONMAST.RCN_NEFT, 0)) Amt,
                            0 tax
                        FROM RECPCOLLECTIONMAST
                        WHERE RECPCOLLECTIONMAST.RCD_DATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND RECPCOLLECTIONMAST.RCD_DATE <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND RECPCOLLECTIONMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                            AND RECPCOLLECTIONMAST.RCC_CANCEL IS NULL
                            AND RECPCOLLECTIONMAST.RCC_SLNO IN (
                                SELECT 
                                    RCC_SLNO 
                                FROM RECPCOLLECTIONDETL 
                                WHERE RECPCOLLECTIONDETL.RCD_DATE >= TO_DATE ('${fromDate}','dd/MM/yyyy hh24:mi:ss')
                                AND RECPCOLLECTIONDETL.RCD_DATE <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss') 
                                AND RECPCOLLECTIONDETL.MODULES = 'IPC'
                                AND RECPCOLLECTIONDETL.IP_NO NOT IN (${ipNumberList}) 
                            )
                        HAVING SUM ( NVL (RECPCOLLECTIONMAST.RCN_CASH, 0) + NVL (RECPCOLLECTIONMAST.RCN_CHK, 0) + NVL (RECPCOLLECTIONMAST.RCN_DD, 0)  + NVL (RECPCOLLECTIONMAST.RCN_Card, 0) + NVL (RECPCOLLECTIONMAST.RCN_NEFT, 0)) > 0
                        UNION ALL
                        SELECT 
                            (SUM (NVL (Recpcollectionmast.Rfn_Cash, 0)) + SUM (NVL (Recpcollectionmast.Rfn_Chk, 0)) + SUM (NVL (Recpcollectionmast.Rfn_Dd, 0)) + SUM (NVL (Recpcollectionmast.Rfn_Card, 0))) * -1 Amt,
                            0 tax
                        FROM Recpcollectionmast
                        WHERE Recpcollectionmast.Rfd_Date >= TO_DATE ('${fromDate}',' dd/MM/yyyy hh24:mi:ss')
                            AND RECPCOLLECTIONMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                            AND Recpcollectionmast.Rfd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND NVL (Rcc_Cancel, 'N') = 'N'
                            AND RECPCOLLECTIONMAST.RCC_SLNO IN (
                                SELECT 
                                    RCC_SLNO 
                                FROM RECPCOLLECTIONDETL 
                                WHERE RECPCOLLECTIONDETL.RCD_DATE >= TO_DATE ('${fromDate}',' dd/MM/yyyy hh24:mi:ss')
                                AND RECPCOLLECTIONDETL.RCD_DATE <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss') 
                                AND RECPCOLLECTIONDETL.IP_NO NOT IN  (${ipNumberList}))`;

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
    //	Credit/Insurance Bills
    creditInsuranceBillTmch: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();

        const ipNumberList = data.ptno.join(',');
        const fromDate = data.from;
        const toDate = data.to;

        const sql = `SELECT 
                            SUM (NVL (RPN_CREDIT, 0)) AS Amt,
                            SUM (NVL (receiptmast.RPN_TOTTAX, 0)) Tax
                    FROM receiptmast
                    WHERE     receiptmast.RPC_CACR IN ('R')
                            AND NVL (receiptmast.RPC_CANCEL, 'N') = 'N'
                            AND receiptmast.rpc_collcncode IS NULL
                            AND receiptmast.RPD_DATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND receiptmast.RPD_DATE <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND NVL (Rpn_credit, 0) <> 0
                            AND RECEIPTMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                    UNION ALL
                    SELECT 
                            SUM (NVL (Opbillmast.OPN_CREDIT, 0)) + SUM (NVL (Opbillmast.opn_copayded_credit, 0)) AS Amt,
                            SUM (NVL (opbillmast.OPN_TOTTAX, 0)) Tax
                    FROM Opbillmast
                    WHERE Opbillmast.OPC_CACR IN ('C', 'R')
                            AND NVL (Opbillmast.OPN_CANCEL, 'N') = 'N'
                            AND Opbillmast.OPD_DATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND (NVL (Opbillmast.OPN_CREDIT, 0) + NVL (OPBILLMAST.OPN_SALETAXCR, 0)) <> 0
                            AND Opbillmast.Opd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                    UNION ALL
                    SELECT 
                            SUM (NVL (BMN_CREDIT, 0)) AS Amt,
                            SUM (NVL (billmast.BMN_TOTTAX, 0)) Tax
                    FROM billmast
                    WHERE billmast.Bmc_Cacr IN ('R')
                            AND NVL (billmast.BMC_CANCEL, 'N') = 'N'
                            AND BILLMAST.BMC_COLLCNCODE IS NULL
                            AND billmast.BMD_DATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND Billmast.Bmd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND billmast.mh_code IN (SELECT MH_CODE FROM multihospital)
                    UNION ALL
                    SELECT 
                            SUM ( NVL (Pbillmast.BMN_CREDIT, 0) + NVL (PBILLMAST.BMN_SALETAXCR, 0) + NVL (PBILLMAST.BMN_CESSCR, 0)) AS Amt,
                            SUM ( NVL (BMN_SALETAXCH, 0) + NVL (BMN_SALETAXCR, 0) + NVL (BMN_CESSCH, 0)  + NVL (BMN_CESSCR, 0)) Tax
                    FROM Pbillmast
                    WHERE Pbillmast.Bmc_Cacr = 'R'
                            AND NVL (Pbillmast.bmc_cancel, 'N') = 'N'
                            AND pbillmast.BMC_COLLCNCODE IS NULL
                            AND NVL (Bmn_credit, 0) <> 0
                            AND Pbillmast.BMD_DATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND Pbillmast.BMD_DATE <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND pbillmast.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                    UNION ALL
                    SELECT 
                            SUM (NVL (Disbillmast.DMN_FINALCREDIT, 0)) + SUM (NVL (dmn_copayded_credit, 0))  Amt,
                            SUM ( DECODE ( NVL (Disbillmast.Dmc_Cancel, 'N'), 'N',   NVL (DMN_SALESTAXCH, 0) + NVL (DMN_SALESTAXCR, 0) + NVL (DMN_CESSCH, 0)  + NVL (DMN_CESSCR, 0), 0)) TAX
                    FROM Disbillmast
                    WHERE Dmc_Cacr = 'R' AND NVL (Disbillmast.DMC_CANCEL, 'N') = 'N'
                            AND DMD_DATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                            AND DMD_DATE <=  TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND IP_NO NOT IN (${ipNumberList})
                    UNION ALL
                    SELECT 
                            SUM (NVL (BMN_CREDIT, 0)) AS Amt,
                            SUM (NVL (billmast.BMN_TOTTAX, 0)) Tax
                    FROM billmast
                    WHERE billmast.Bmc_Cacr IN ('R')
                            AND NVL (billmast.BMC_CANCEL, 'N') = 'N'
                            AND BILLMAST.BMC_COLLCNCODE IS NOT NULL
                            AND BILLMAST.BMD_COLLDATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND BILLMAST.BMD_COLLDATE <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND billmast.mh_code IN (SELECT MH_CODE FROM multihospital)
                    UNION ALL
                    SELECT 
                            SUM (  NVL (Pbillmast.BMN_CREDIT, 0) + NVL (PBILLMAST.BMN_SALETAXCR, 0) + NVL (PBILLMAST.BMN_CESSCR, 0)) AS Amt,
                            SUM ( NVL (BMN_SALETAXCH, 0) + NVL (BMN_SALETAXCR, 0)  + NVL (BMN_CESSCH, 0) + NVL (BMN_CESSCR, 0)) Tax
                    FROM Pbillmast
                    WHERE Pbillmast.Bmc_Cacr = 'R'
                            AND NVL (Pbillmast.bmc_cancel, 'N') = 'N'
                            AND pbillmast.BMC_COLLCNCODE IS NOT NULL
                            AND Pbillmast.BMD_COLLDATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND Pbillmast.BMD_COLLDATE <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND pbillmast.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                    UNION ALL
                    SELECT 
                            SUM (NVL (RPN_CREDIT, 0)) AS Amt,
                            SUM (NVL (receiptmast.RPN_TOTTAX, 0)) Tax
                    FROM receiptmast
                    WHERE receiptmast.RPC_CACR IN ('R')
                            AND NVL (receiptmast.RPC_CANCEL, 'N') = 'N'
                            AND receiptmast.RPC_COLLCNCODE IS NOT NULL
                            AND receiptmast.RPD_COLLDATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND receiptmast.RPD_COLLDATE <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND RECEIPTMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)`;

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
    //Ip Consolidate Discount
    ipConsolidatedDiscountTmch: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();

        const ipNumberList = data.ptno.join(',');
        const fromDate = data.from;
        const toDate = data.to;

        const sql = `SELECT SUM (NVL (irn_discount, 0)) Discount
                            FROM Ipreceipt, Disbillmast
                        WHERE  Ipreceipt.Dmc_Slno = Disbillmast.Dmc_Slno
                                AND NVL (irc_cancel, 'N') = 'N'
                                AND Ipreceipt.Dmc_Type IN ('C', 'R')
                                AND Disbillmast.Dmc_Cacr <> 'M'
                                AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                                AND Disbillmast.Dmd_Date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Disbillmast.Dmd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Ipreceipt.Ird_date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Ipreceipt.Ird_date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Disbillmast.IP_NO NOT IN (${ipNumberList})
                                AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                                AND NVL (irn_discount, 0) > 0`;

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
    // IP Previous Day's  Discount
    ipPreviousDayDiscountTmch: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();

        const ipNumberList = data.ptno.join(',');
        const fromDate = data.from;
        const toDate = data.to;

        const sql = `SELECT SUM (NVL (Irn_Discount, 0)) Discount
                        FROM ipreceipt, Disbillmast
                        WHERE Ipreceipt.Dmc_slno = Disbillmast.Dmc_slno
                            AND Disbillmast.Dmd_date < TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND Ipreceipt.Dmc_type IN ('C', 'R')
                            AND IRD_DATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                            AND IRD_DATE <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND Disbillmast.IP_NO NOT IN (${ipNumberList})
                            AND NVL (Irc_cancel, 'N') = 'N'`;

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
    // IP Previous Day's Collectoion(E)
    ipPreviousDayCollectionTmch: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();

        const ipNumberList = data.ptno.join(',');
        const fromDate = data.from;
        const toDate = data.to;

        const sql = `SELECT SUM (
                        (  NVL (Ipreceipt.irn_amount, 0)
                        + NVL (Ipreceipt.irn_cheque, 0)
                        + NVL (Ipreceipt.irn_card, 0)
                        + NVL (Ipreceipt.irn_neft, 0))
                        - (  NVL (Ipreceipt.irn_balance, 0)
                        + NVL (Ipreceipt.IRN_REFCHEQ, 0)
                        + NVL (Ipreceipt.irn_refcard, 0))
                        + NVL (Ipreceipt.irn_discount, 0)) Amt,
                        0 tax
                        FROM ipreceipt, Disbillmast
                    WHERE Ipreceipt.Dmc_Slno = Disbillmast.Dmc_Slno
                            AND Disbillmast.Dmd_date < TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND Ipreceipt.Dmc_type IN ('C', 'R')
                            AND IRD_DATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND ird_date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND Disbillmast.IP_NO NOT IN (${ipNumberList})
                            AND Irc_cancel IS NULL`;

        try {
            const result = await conn_ora.execute(
                sql,
                {},
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT },
            )

            await result.resultSet?.getRows((err, rows) => {
                callBack(err, rows)
            })

        } catch (err) {
            console.log(err)
        } finally {
            if (conn_ora) {
                await conn_ora.close();
                await pool_ora.close();
            }
        }
    },
    // UnSettled Amount
    unsettledAmount: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();

        const ipNumberList = data.ptno.join(',');
        const fromDate = data.from;
        const toDate = data.to;

        const sql = `SELECT 
                        SUM (NVL (Payable, 0)) Amt, 
                        SUM (tax) tax
                    FROM (SELECT SUM (NVL (DMN_FINALPTPAYABLE, 0)) Payable,
                                SUM ( DECODE ( NVL (Disbillmast.Dmc_Cancel, 'N'), 'N',NVL (DMN_SALESTAXCH, 0)
                                            + NVL (DMN_SALESTAXCR, 0)
                                            + NVL (DMN_CESSCH, 0)
                                            + NVL (DMN_CESSCR, 0), 0)) TAX
                            FROM Disbillmast
                        WHERE  Dmc_Cacr IN ('C', 'R')
                                AND NVL (Disbillmast.Dmc_cancel, 'N') = 'N'
                                AND NVL (DMN_FINALPTPAYABLE, 0) <> 0
                                AND Disbillmast.Dmd_date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND disbillmast.dmd_date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Disbillmast.IP_NO NOT IN (${ipNumberList})
                                AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                        UNION ALL
                        SELECT SUM ( (  NVL (Ipreceipt.irn_amount, 0)
                                    + NVL (Ipreceipt.irn_cheque, 0)
                                    + NVL (Ipreceipt.irn_card, 0)
                                    + NVL (IRN_NEFT, 0))
                                    - (  NVL (Ipreceipt.irn_balance, 0)
                                    + NVL (Ipreceipt.IRN_REFCHEQ, 0)
                                    + NVL (Ipreceipt.irn_refcard, 0))
                                    + NVL (ipreceipt.irn_discount, 0)) * -1 Payable,
                                SUM ( DECODE ( NVL (Disbillmast.Dmc_Cancel, 'N'), 'N',   NVL (DMN_SALESTAXCH, 0)
                                            + NVL (DMN_SALESTAXCR, 0)
                                            + NVL (DMN_CESSCH, 0)
                                            + NVL (DMN_CESSCR, 0), 0)) * -1 TAX
                            FROM ipreceipt, Disbillmast
                        WHERE Ipreceipt.Dmc_Slno = Disbillmast.Dmc_Slno
                                AND Disbillmast.Dmd_date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND disbillmast.dmd_date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Ipreceipt.Dmc_type IN ('C', 'R')
                                AND IRD_DATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND ipreceipt.IPC_MHCODE IN  (SELECT MH_CODE FROM multihospital)
                                AND ird_date <= TO_DATE ('${toDate}',  'dd/MM/yyyy hh24:mi:ss')
                                AND Disbillmast.IP_NO NOT IN (${ipNumberList})
                                AND Irc_cancel IS NULL
                                AND ( (  NVL (Ipreceipt.irn_amount, 0)
                                        + NVL (Ipreceipt.irn_cheque, 0)
                                        + NVL (Ipreceipt.irn_card, 0)
                                        + NVL (IRN_NEFT, 0))
                                    - (  NVL (Ipreceipt.irn_balance, 0)
                                        + NVL (Ipreceipt.IRN_REFCHEQ, 0)
                                        + NVL (Ipreceipt.irn_refcard, 0))
                                    + NVL (ipreceipt.irn_discount, 0)) <> 0) A`;

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
    // MIS GROUP & CATEGORY 
    misGroupMast: async (callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        try {
            const result = await conn_ora.execute(
                `SELECT * FROM MISINCEXPMAST`,
                {},
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT },
            )

            await result.resultSet?.getRows((err, rows) => {
                callBack(err, rows)
            })

        } catch (err) {
            console.log(err)
        } finally {
            if (conn_ora) {
                await conn_ora.close();
                await pool_ora.close();
            }
        }
    },
    misGroup: async (callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        try {
            const result = await conn_ora.execute(
                `SELECT * FROM Misincexpgroup`,
                {},
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT },
            )

            await result.resultSet?.getRows((err, rows) => {
                callBack(err, rows)
            })

        } catch (err) {
            console.log(err)
        } finally {
            if (conn_ora) {
                await conn_ora.close();
                await pool_ora.close();
            }
        }
    }
}