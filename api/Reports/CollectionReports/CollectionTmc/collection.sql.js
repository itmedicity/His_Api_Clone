const sql_one = `SELECT SUM (0) AS Cash,
                        SUM (0) AS Card,
                        SUM (0) AS Chq,
                        SUM (DECODE (billmast.bmc_cacr, 'R', Billmast.BMN_CREDIT, 0))
                            AS Credit,
                        SUM (0) AS Bank,
                        SUM (0) RoundOff,
                        SUM (DECODE (billmast.bmc_cacr, 'R', Billmast.BMN_CREDIT, 0))
                            AS Amount,
                        INITCAP (users.usc_name) AS usc_name,
                        users.us_code,
                        Billmast.IP_NO,
                        BILLMAST.BMC_IPOP,
                        COUNT (bmc_slno) AS billcount
                    FROM Billmast, Users, customer
                  WHERE Billmast.US_CODE = Users.US_CODE AND BILLMAST.BMC_COLLUSCODE IS NULL
                        AND billmast.US_CODE IN
                                (SELECT USERS.us_code
                                  FROM USERS, userclinics
                                  WHERE     USERS.USC_STATUS = 'Y'
                                        AND users.us_code = userclinics.us_code
                                        AND userclinics.mh_code = '')
                        AND billmast.BMC_CACR = 'R'
                        AND NVL (Billmast.BMC_CANCEL, 'N') = 'N'
                        AND customer.cu_code = billmast.cu_code
                        AND customer.cuc_insurance = 'H'
                        AND billmast.BMD_DATE >=TO_DATE (:fromDate, 'dd/MM/yyyy hh:mi:ss AM')
                        AND BILLMAST.MH_CODE IN ('00')
                        AND billmast.bmd_date <=TO_DATE (:toDate, 'dd/MM/yyyy hh:mi:ss AM')
                GROUP BY USERS.us_code,
                        users.usc_name,
                        Billmast.IP_NO,
                        BILLMAST.BMC_IPOP
                UNION ALL
                  SELECT SUM (0) AS Cash,
                        SUM (0) AS Card,
                        SUM (0) AS Chq,
                        SUM (DECODE (billmast.bmc_cacr, 'R', Billmast.BMN_CREDIT, 0))
                            AS Credit,
                        SUM (0) AS Bank,
                        SUM (0) RoundOff,
                        SUM (DECODE (billmast.bmc_cacr, 'R', Billmast.BMN_CREDIT, 0))
                            AS Amount,
                        INITCAP (users.usc_name) AS usc_name,
                        users.us_code,
                        Billmast.IP_NO,
                        BILLMAST.BMC_IPOP,
                        COUNT (bmc_slno) AS billcount
                    FROM Billmast, Users, customer
                  WHERE Billmast.BMC_COLLUSCODE = Users.US_CODE
                        AND billmast.BMC_COLLUSCODE IN
                                (SELECT USERS.us_code
                                  FROM USERS, userclinics
                                  WHERE     USERS.USC_STATUS = 'Y'
                                        AND users.us_code = userclinics.us_code
                                        AND userclinics.mh_code = '')
                        AND billmast.BMC_CACR = 'R'
                        AND NVL (Billmast.BMC_CANCEL, 'N') = 'N'
                        AND customer.cu_code = billmast.cu_code
                        AND customer.cuc_insurance = 'H'
                        AND billmast.BMD_COLLDATE >=
                                TO_DATE (:fromDate, 'dd/MM/yyyy hh:mi:ss AM')
                        AND BILLMAST.MH_CODE IN ('00')
                        AND billmast.BMD_COLLDATE <=
                                TO_DATE (:toDate, 'dd/MM/yyyy hh:mi:ss AM')
                GROUP BY USERS.us_code,
                        users.usc_name,
                        Billmast.IP_NO,
                        BILLMAST.BMC_IPOP`;

// ---------------------------------------------------------------------------
// User Wise Collection — Summary section (Phase 1)
// Each query below is adapted from the matching numbered query in
// Plan-User-Wise-Collection/UserWise.Sql, with MH_CODE bound as :mhCode
// instead of the hardcoded '00' literal. All branches of each source query
// are kept (including the "collected on a different day" BMC_COLLCNCODE /
// RPC_COLLCNCODE IS NOT NULL branches) — real-data verification showed the
// Excel Summary section's IP#/OP#/POS# figures include bills collected
// against an earlier-day bill, not just same-day billing.
// ---------------------------------------------------------------------------

// Source: query 46 — base cashier list so every active user appears even with zero activity
const sql_usersList = `SELECT INITCAP (usc_name) AS usc_name, us_code FROM users ORDER BY usc_name`;

// Source: query 42 — IP Bill revenue (Disbillmast). The "IP Bill refund" branch is deliberately
// excluded: real-data verification (Najam/Pradeepkumar/Rajeshkumar/Sinic, 01/12/2025) showed the
// legacy report keeps refunds in a separate "Refund" section entirely, undiminished, rather than
// netting them into the Summary section's revenue/collection columns — netting them in produced
// negative rows for refund-only cashiers where Excel shows small positive (billing-only) figures.
const sql_ipBill = `SELECT INITCAP (users.usc_name) AS usc_name, users.us_code,
                        COUNT (Dmc_slno) Billcount, SUM (NVL (DMN_NETAMT, 0)) AMOUNT,
                        SUM (NVL (Disbillmast.DMN_SALESTAXCH, 0) + NVL (Disbillmast.DMN_SALESTAXCR, 0)
                            + NVL (Disbillmast.DMN_CESSCH, 0) + NVL (Disbillmast.DMN_CESSCR, 0)) Tax,
                        SUM ((NVL (DMN_FINALCREDIT, 0)) + (NVL (dmn_copayded_credit, 0))) Credit,
                        SUM (NVL (DMN_ROUND, 0)) RoundOff
                    FROM Disbillmast, USERS
                  WHERE     Disbillmast.US_CODE = USERS.US_CODE
                        AND Dmc_cacr IN ('C', 'R')
                        AND NVL (Disbillmast.Dmc_cancel, 'N') = 'N'
                        AND Disbillmast.Dmd_date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh:mi:ss AM')
                        AND disbillmast.dmd_date <= TO_DATE (:toDate, 'dd/MM/yyyy hh:mi:ss AM')
                        AND DISBILLMAST.MH_CODE = :mhCode
                GROUP BY USC_NAME, users.us_code`;

// Source: query 44 — Consolidate OP Billing revenue (Opbillmast). Refund branch excluded — see
// the note on sql_ipBill above (refunds belong to a separate, undiminished "Refund" section).
const sql_opBillConsolidated = `SELECT INITCAP (users.usc_name) AS usc_name, users.us_code,
                        COUNT (Opc_slno) Billcount, (SUM (NVL (OPN_CASH, 0))) cash,
                        (SUM (DECODE (Opbillmast.Opc_Banktranstype, 'D', NVL (Opbillmast.Opn_Cheque, 0), 0))) cheque,
                        (SUM (NVL (OPN_CARD, 0))) card,
                        (SUM (NVL (OPN_CREDIT, 0) + NVL (OPN_SALETAXCR, 0)) + SUM (NVL (opn_copayded_credit, 0))) credit,
                        SUM (DECODE (Opbillmast.Opc_Banktranstype, 'B', NVL (Opbillmast.Opn_Cheque, 0), 0)) AS Bank,
                        SUM (NVL (OPN_ROUND, 0)) RoundOff, (SUM (NVL (OPN_NETAMT, 0))) AMOUNT,
                        (SUM (NVL (OPN_SALETAXCH, 0) + NVL (OPN_SALETAXCR, 0))) TAX
                    FROM opbillmast, USERS
                  WHERE     opbillmast.US_CODE = USERS.US_CODE
                        AND NVL (OPN_CANCEL, 'N') = 'N'
                        AND Opc_cacr IN ('R', 'C')
                        AND OPD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh:mi:ss AM')
                        AND opd_date <= TO_DATE (:toDate, 'dd/MM/yyyy hh:mi:ss AM')
                        AND OPBILLMAST.MH_CODE = :mhCode
                GROUP BY USC_NAME, users.us_code
                HAVING SUM (NVL (OPN_NETAMT, 0)) <> 0`;

// Source: query 45 — OP Billing revenue (Receiptmast, both same-day and collected-on-a-different-
// day branches — that COLLCNCODE split is a legitimate billing distinction, unlike the refund
// branches below it, which are excluded — see the note on sql_ipBill above).
const sql_opBillReceipt = `SELECT usc_name, us_code,
                        SUM (billcount) billcount, SUM (cash) cash, SUM (card) card, SUM (cheque) cheque,
                        SUM (credit) credit, SUM (bank) bank, SUM (roundoff) roundoff, SUM (amount) amount
                    FROM (
                      SELECT 'OP Billing' bltype, INITCAP (users.usc_name) AS usc_name, users.us_code,
                            COUNT (rpc_slno) Billcount, SUM (NVL (RPN_CASH, 0)) cash, SUM (NVL (RPN_CARD, 0)) card,
                            SUM (DECODE (Receiptmast.Rpc_Banktranstype, 'D', NVL (Receiptmast.Rpn_Cheque, 0), 0)) cheque,
                            SUM (DECODE (RECEIPTMAST.RPC_CACR, 'R', RPN_CREDIT, 0)) credit,
                            SUM (DECODE (Receiptmast.Rpc_Banktranstype, 'B', NVL (Receiptmast.Rpn_Cheque, 0), 0)) AS Bank,
                            SUM (NVL (RPN_ROUND, 0)) RoundOff, (SUM (NVL (RPN_NETAMT, 0))) AMOUNT
                        FROM RECEIPTMAST, USERS
                      WHERE     RECEIPTMAST.US_CODE = USERS.US_CODE
                            AND (NVL (RECEIPTMAST.RPC_CANCEL, 'N') = 'N')
                            AND RECEIPTMAST.RPC_COLLCNCODE IS NULL
                            AND receiptmast.rpc_cacr IN ('C', 'R')
                            AND RECEIPTMAST.RPD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh:mi:ss AM')
                            AND receiptmast.rpd_date <= TO_DATE (:toDate, 'dd/MM/yyyy hh:mi:ss AM')
                            AND RECEIPTMAST.MH_CODE = :mhCode
                      GROUP BY 'OP Billing', USERS.USC_NAME, users.us_code
                      HAVING SUM (NVL (RPN_NETAMT, 0)) <> 0
                      UNION ALL
                        SELECT 'OP Billing' bltype, INITCAP (users.usc_name) AS usc_name, users.us_code,
                              COUNT (rpc_slno) Billcount, SUM (NVL (RPN_CASH, 0)) cash, SUM (NVL (RPN_CARD, 0)) card,
                              SUM (DECODE (Receiptmast.Rpc_Banktranstype, 'D', NVL (Receiptmast.Rpn_Cheque, 0), 0)) cheque,
                              SUM (DECODE (RECEIPTMAST.RPC_CACR, 'R', RPN_CREDIT, 0)) credit,
                              SUM (DECODE (Receiptmast.Rpc_Banktranstype, 'B', NVL (Receiptmast.Rpn_Cheque, 0), 0)) AS Bank,
                              SUM (NVL (RPN_ROUND, 0)) RoundOff, (SUM (NVL (RPN_NETAMT, 0))) AMOUNT
                          FROM RECEIPTMAST, USERS
                        WHERE     RECEIPTMAST.RPC_COLLUSCODE = USERS.US_CODE
                              AND RECEIPTMAST.RPC_COLLCNCODE IS NOT NULL
                              AND (NVL (RECEIPTMAST.RPC_CANCEL, 'N') = 'N')
                              AND receiptmast.rpc_cacr IN ('C', 'R')
                              AND RECEIPTMAST.RPD_COLLDATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh:mi:ss AM')
                              AND receiptmast.RPD_COLLDATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh:mi:ss AM')
                              AND RECEIPTMAST.MH_CODE = :mhCode
                      GROUP BY 'OP Billing', USERS.USC_NAME, users.us_code
                      HAVING SUM (NVL (RPN_NETAMT, 0)) <> 0
                    ) GROUP BY usc_name, us_code`;

// Source: query 38 — Pharmacy Billing revenue (Pbillmast, both billing branches). Refund branches
// (Mretmast) excluded — see the note on sql_ipBill above.
const sql_posBilling = `SELECT usc_name, us_code,
                        SUM (Billcount) Billcount, SUM (cash) cash, SUM (cheque) cheque, SUM (card) card,
                        SUM (credit) credit, SUM (bank) bank, SUM (roundoff) roundoff, SUM (amount) amount, SUM (tax) tax
                    FROM (
                      SELECT 'Pharmacy Billing' bltype, INITCAP (users.usc_name) AS usc_name, users.us_code,
                            COUNT (bmc_slno) Billcount, (SUM (NVL (BMN_CASH, 0))) cash,
                            (SUM (DECODE (Pbillmast.Bmc_Banktranstype, 'D', NVL (Pbillmast.Bmn_Cheque, 0), 0))) cheque,
                            (SUM (NVL (BMN_CARD, 0))) card,
                            (SUM (DECODE (BMC_CACR, 'R', (NVL (BMN_CREDIT, 0) + NVL (BMN_SALETAXCR, 0) + NVL (BMN_CESSCR, 0)), 0)))
                                + (SUM (DECODE (BMC_CACR, 'R', NVL (bmn_copayded_credit, 0), 0))) credit,
                            SUM (DECODE (Pbillmast.Bmc_Banktranstype, 'B', NVL (Pbillmast.Bmn_Cheque, 0), 0)) AS Bank,
                            SUM (NVL (BMD_ROUND, 0)) RoundOff, (SUM (NVL (BMN_NETAMT, 0))) AMOUNT,
                            SUM (NVL (PBILLMAST.BMN_SALETAXCH, 0) + NVL (PBILLMAST.BMN_SALETAXCR, 0)
                                + NVL (PBILLMAST.BMN_CESSCH, 0) + NVL (PBILLMAST.BMN_CESSCR, 0)) TAX
                        FROM PBILLMAST, USERS
                      WHERE     PBILLMAST.US_CODE = USERS.US_CODE
                            AND PBILLMAST.BMC_COLLCNCODE IS NULL
                            AND NVL (PBILLMAST.BMC_CANCEL, 'N') = 'N'
                            AND PBILLMAST.BMC_CACR IN ('C', 'R')
                            AND BMD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh:mi:ss AM')
                            AND bmd_date <= TO_DATE (:toDate, 'dd/MM/yyyy hh:mi:ss AM')
                            AND PBILLMAST.MH_CODE = :mhCode
                      GROUP BY 'Pharmacy Billing', USC_NAME, users.us_code
                      HAVING SUM (NVL (BMN_NETAMT, 0)) <> 0
                      UNION ALL
                        SELECT 'Pharmacy Billing' bltype, INITCAP (users.usc_name) AS usc_name, users.us_code,
                              COUNT (bmc_slno) Billcount, (SUM (NVL (BMN_CASH, 0))) cash,
                              (SUM (DECODE (Pbillmast.Bmc_Banktranstype, 'D', NVL (Pbillmast.Bmn_Cheque, 0), 0))) cheque,
                              (SUM (NVL (BMN_CARD, 0))) card,
                              (SUM (DECODE (BMC_CACR, 'R', (NVL (BMN_CREDIT, 0) + NVL (BMN_SALETAXCR, 0) + NVL (BMN_CESSCR, 0)), 0)))
                                  + (SUM (DECODE (BMC_CACR, 'R', NVL (bmn_copayded_credit, 0), 0))) credit,
                              SUM (DECODE (Pbillmast.Bmc_Banktranstype, 'B', NVL (Pbillmast.Bmn_Cheque, 0), 0)) AS Bank,
                              SUM (NVL (BMD_ROUND, 0)) RoundOff, (SUM (NVL (BMN_NETAMT, 0))) AMOUNT,
                              SUM (NVL (PBILLMAST.BMN_SALETAXCH, 0) + NVL (PBILLMAST.BMN_SALETAXCR, 0)
                                  + NVL (PBILLMAST.BMN_CESSCH, 0) + NVL (PBILLMAST.BMN_CESSCR, 0)) TAX
                          FROM PBILLMAST, USERS
                        WHERE     PBILLMAST.BMC_COLLUSCODE = USERS.US_CODE
                              AND PBILLMAST.BMC_COLLCNCODE IS NOT NULL
                              AND NVL (PBILLMAST.BMC_CANCEL, 'N') = 'N'
                              AND PBILLMAST.BMC_CACR IN ('C', 'R')
                              AND PBILLMAST.BMD_COLLDATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh:mi:ss AM')
                              AND PBILLMAST.BMD_COLLDATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh:mi:ss AM')
                              AND PBILLMAST.MH_CODE = :mhCode
                      GROUP BY 'Pharmacy Billing', USC_NAME, users.us_code
                      HAVING SUM (NVL (BMN_NETAMT, 0)) <> 0
                    ) GROUP BY usc_name, us_code`;

// Source: query 24 — Pharmacy Advance collected net of Pharmacy Advance Refund
const sql_advPharmacy = `SELECT usc_name, us_code, SUM (billcount) billcount, SUM (cash) cash, SUM (cheque) cheque, SUM (card) card, SUM (bank) bank, SUM (credit) credit
                    FROM (
                      SELECT 'Pharmacy Advance' bltype, INITCAP (users.usc_name) AS usc_name, users.us_code,
                            COUNT (AR_SLNO) Billcount, SUM (DECODE (ARC_TYPE, 'C', NVL (ARN_AMOUNT, 0), 0)) CASH,
                            SUM (DECODE (ARC_TYPE, 'Q', NVL (ARN_AMOUNT, 0), 0)) + SUM (DECODE (ARC_TYPE, 'D', NVL (ARN_AMOUNT, 0), 0)) CHEQUE,
                            SUM (DECODE (ARC_TYPE, 'R', NVL (ARN_AMOUNT, 0), 0)) CARD, SUM (0) AS Bank, SUM (0) CREDIT
                        FROM PHADVANCEENTRY, USERS
                      WHERE     PHADVANCEENTRY.US_CODE = USERS.US_CODE
                            AND (NVL (ARC_CANCEL, 'N') = 'N')
                            AND ARC_TYPE IN ('C', 'Q', 'D', 'R')
                            AND ARD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh:mi:ss AM')
                            AND ard_date <= TO_DATE (:toDate, 'dd/MM/yyyy hh:mi:ss AM')
                            AND PHADVANCEENTRY.ARC_MHCODE = :mhCode
                      GROUP BY 'Pharmacy Advance', USC_NAME, users.us_code, TRUNC (ARD_DATE)
                      UNION ALL
                        SELECT 'Pharmacy Advance Refund' bltype, INITCAP (users.usc_name) AS usc_name, USERS.US_CODE,
                              COUNT (rfc_slno) AS Billcount, SUM (DECODE (RFC_CACR, 'C', NVL (REFUNDADVANCE.RFN_AMT, 0), 0)) * -1 As Cash,
                              (SUM (DECODE (RFC_CACR, 'Q', NVL (REFUNDADVANCE.RFN_AMT, 0), 0)) + SUM (DECODE (RFC_CACR, 'D', NVL (REFUNDADVANCE.RFN_AMT, 0), 0))) * -1 As CHEQUE,
                              SUM (0) * -1 As Card, SUM (0) * -1 As Bank, SUM (0) * -1 As Credit
                          FROM REFUNDADVANCE, users
                        WHERE     REFUNDADVANCE.RFD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh:mi:ss AM')
                              AND refundadvance.rfd_date <= TO_DATE (:toDate, 'dd/MM/yyyy hh:mi:ss AM')
                              AND NVL (REFUNDADVANCE.RFC_CANCEL, 'N') = 'N'
                              AND REFUNDADVANCE.RFC_MHCODE = :mhCode
                              AND REFUNDADVANCE.US_CODE = USERS.US_CODE
                      GROUP BY USERS.US_CODE, USERS.USC_NAME
                      HAVING SUM (NVL (REFUNDADVANCE.RFN_AMT, 0)) > 0
                    ) GROUP BY usc_name, us_code`;

// Source: query 28 — IP Advance collected net of IP Advance Refund
const sql_advIp = `SELECT usc_name, us_code, SUM (billcount) billcount, SUM (cash) cash, SUM (cheque) cheque, SUM (card) card, SUM (bank) bank, SUM (credit) credit
                    FROM (
                      SELECT 'IP Advance' bltype, INITCAP (users.usc_name) AS usc_name, users.us_code,
                            COUNT (AR_SLNO) Billcount, SUM (DECODE (ARC_CANCEL, 'C', 0, NVL (ARN_CASH, 0))) CASH,
                            SUM (DECODE (ARC_CANCEL, 'C', 0, NVL (ARN_CHEQUE, 0))) CHEQUE,
                            SUM (DECODE (ARC_CANCEL, 'C', 0, NVL (ARN_CARD, 0))) Card,
                            SUM (DECODE (ARC_CANCEL, 'C', 0, NVL (ARN_NEFT, 0))) AS Bank, SUM (0) CREDIT
                        FROM IPADVANCE, USERS
                      WHERE     IPADVANCE.US_CODE = USERS.US_CODE
                            AND NVL (IPADVANCE.ARC_CANCEL, 'N') = 'N'
                            AND ARC_TYPE IN ('C', 'Q', 'D', 'R')
                            AND IPADVANCE.ARD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh:mi:ss AM')
                            AND IPADVANCE.IAC_MHCODE = :mhCode
                            AND ipadvance.ard_date <= TO_DATE (:toDate, 'dd/MM/yyyy hh:mi:ss AM')
                      GROUP BY 'IP Advance', USC_NAME, users.us_code
                      UNION ALL
                        SELECT 'IP Advance Refund' bltype, INITCAP (users.usc_name) AS usc_name, USERS.US_CODE,
                              COUNT (irc_slno) AS Billcount, SUM (NVL (IRN_BALANCE, 0)) * -1 As Cash,
                              SUM (NVL (IPRECEIPT.IRN_REFCHEQ, 0)) * -1 As CHEQUE, SUM (NVL (IPRECEIPT.IRN_REFCARD, 0)) * -1 As Card,
                              SUM (0) * -1 As Bank, SUM (0) * -1 As Credit
                          FROM IPRECEIPT, USERS
                        WHERE     DMC_TYPE = 'A'
                              AND IPRECEIPT.IRD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh:mi:ss AM')
                              AND ipreceipt.ird_date <= TO_DATE (:toDate, 'dd/MM/yyyy hh:mi:ss AM')
                              AND NVL (IRC_CANCEL, 'N') = 'N'
                              AND IPRECEIPT.US_CODE = USERS.US_CODE
                              AND ipreceipt.IPC_MHCODE = :mhCode
                      GROUP BY USERS.US_CODE, USERS.USC_NAME
                      HAVING     SUM (NVL (IRN_BALANCE, 0)) > 0
                            OR SUM (NVL (IPRECEIPT.IRN_REFCARD, 0)) > 0
                            OR SUM (NVL (IPRECEIPT.IRN_REFCHEQ, 0)) > 0
                    ) GROUP BY usc_name, us_code`;

// Source: query 29 — general Billing Advance collected net of Billing Advance Refund
const sql_advBilling = `SELECT usc_name, us_code, SUM (billcount) billcount, SUM (cash) cash, SUM (cheque) cheque, SUM (card) card, SUM (bank) bank, SUM (credit) credit
                    FROM (
                      SELECT 'Billing Advance' bltype, INITCAP (users.usc_name) AS usc_name, users.us_code,
                            COUNT (AR_SLNO) Billcount, SUM (NVL (ADVANCEENTRY.ARN_CASH, 0)) CASH,
                            SUM (NVL (ARN_CHEQUE, 0)) CHEQUE, SUM (NVL (ARN_CARD, 0)) CARD, SUM (0) AS Bank, SUM (0) CREDIT
                        FROM ADVANCEENTRY, USERS
                      WHERE     (ADVANCEENTRY.US_CODE = USERS.US_CODE)
                            AND (NVL (ADVANCEENTRY.ARC_CANCEL, 'N') = 'N')
                            AND ADVANCEENTRY.ARD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh:mi:ss AM')
                            AND advanceentry.ard_date <= TO_DATE (:toDate, 'dd/MM/yyyy hh:mi:ss AM')
                            AND ADVANCEENTRY.ARC_MHCODE = :mhCode
                      GROUP BY 'Billing Advance', USC_NAME, users.us_code
                      UNION ALL
                        SELECT 'Billing Advance Refund' bltype, INITCAP (users.USC_NAME) USC_NAME, (users.US_CODE) US_CODE,
                              COUNT (RAC_SLNO) BillCount, SUM (DECODE (RAC_CACR, 'C', RAN_AMT, 0)) * -1 AS cash,
                              SUM (DECODE (RAC_CACR, 'Q', RAN_AMT, 0)) * -1 AS CHEQUE, SUM (DECODE (RAC_CACR, 'R', RAN_AMT, 0)) * -1 AS Card,
                              SUM (0) AS Bank, SUM (0) * -1 AS Credit
                          FROM users, AdvanceReturn
                        WHERE     AdvanceReturn.US_CODE = users.US_CODE
                              AND NVL (RAC_CANCEL, 'N') = 'N'
                              AND ADVANCERETURN.RAC_MHCODE = :mhCode
                              AND RAD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh:mi:ss AM')
                              AND RAD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh:mi:ss AM')
                      GROUP BY users.US_CODE, users.USC_NAME
                    ) GROUP BY usc_name, us_code`;

// Source: query 32 — OP Advance collected net of OP Advance Refund
const sql_advOp = `SELECT usc_name, us_code, SUM (billcount) billcount, SUM (cash) cash, SUM (cheque) cheque, SUM (card) card, SUM (credit) credit, SUM (bank) bank
                    FROM (
                      SELECT 'OP Advance' bltype, INITCAP (users.usc_name) AS usc_name, users.us_code,
                            COUNT (AR_SLNO) Billcount, SUM (NVL (ARN_CASH, 0)) CASH,
                            SUM (DECODE (NVL (Opc_Banktranstype, 'N'), 'D', NVL (Arn_Cheque, 0), 0)) CHEQUE,
                            SUM (NVL (ARN_CARD, 0)) CARD, SUM (0) CREDIT,
                            SUM (DECODE (NVL (Opc_Banktranstype, 'N'), 'B', NVL (Arn_Cheque, 0), 0)) AS Bank
                        FROM OPADVANCE, USERS
                      WHERE     OPADVANCE.US_CODE = USERS.US_CODE
                            AND NVL (ARC_CANCEL, 'N') = 'N'
                            AND ARC_TYPE IN ('C', 'Q', 'D', 'R')
                            AND ARD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh:mi:ss AM')
                            AND ard_date <= TO_DATE (:toDate, 'dd/MM/yyyy hh:mi:ss AM')
                            AND OPADVANCE.MH_CODE = :mhCode
                      GROUP BY 'OP Advance', USC_NAME, users.us_code
                      UNION ALL
                        SELECT 'OP Advance Refund' bltype, INITCAP (users.usc_name) AS usc_name, USERS.US_CODE,
                              COUNT (rfc_slno) AS Billcount, SUM (DECODE (REFUNDOPADVANCE.rfc_cacr, 'C', REFUNDOPADVANCE.rfn_amt, 0)) * -1 As Cash,
                              SUM (DECODE (REFUNDOPADVANCE.rfc_cacr, 'Q', REFUNDOPADVANCE.rfn_amt, 0)) * -1 As cheque,
                              SUM (DECODE (REFUNDOPADVANCE.rfc_cacr, 'R', REFUNDOPADVANCE.rfn_amt, 0)) * -1 As Card,
                              SUM (0) * -1 As Credit, SUM (0) * -1 As Bank
                          FROM REFUNDOPADVANCE, USERS
                        WHERE     REFUNDOPADVANCE.RFD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh:mi:ss AM')
                              AND refundopadvance.rfd_date <= TO_DATE (:toDate, 'dd/MM/yyyy hh:mi:ss AM')
                              AND NVL (REFUNDOPADVANCE.RFC_CANCEL, 'N') = 'N'
                              AND REFUNDOPADVANCE.US_CODE = USERS.US_CODE
                              AND REFUNDOPADVANCE.MH_CODE = :mhCode
                      GROUP BY USERS.US_CODE, USERS.USC_NAME
                      HAVING     SUM (DECODE (REFUNDOPADVANCE.rfc_cacr, 'C', REFUNDOPADVANCE.rfn_amt, 0)) > 0
                            OR SUM (DECODE (REFUNDOPADVANCE.rfc_cacr, 'R', REFUNDOPADVANCE.rfn_amt, 0)) > 0
                            OR SUM (DECODE (REFUNDOPADVANCE.rfc_cacr, 'Q', REFUNDOPADVANCE.rfn_amt, 0))
                                  + SUM (DECODE (REFUNDOPADVANCE.rfc_cacr, 'D', REFUNDOPADVANCE.rfn_amt, 0)) > 0
                    ) GROUP BY usc_name, us_code`;

// Source: query 25 — advance settled against a Billmast bill (both branches: billed-and-settled
// same visit, and settled today against a bill collected by a different cashier/day)
const sql_advSettldBill = `SELECT usc_name, us_code, SUM (amount) amount
                    FROM (
                      SELECT 'Bill Advance Stld' bltype, INITCAP (users.usc_name) AS usc_name, users.us_code, SUM (NVL (bmn_advamount, 0)) AMOUNT
                        FROM billmast, users
                      WHERE     billmast.us_code = users.us_code
                            AND NVL (bmn_advamount, 0) > 0
                            AND NVL (billmast.bmc_cancel, 'N') = 'N'
                            AND billmast.BMC_COLLCNCODE IS NULL
                            AND billmast.BMD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh:mi:ss AM')
                            AND billmast.bmd_date <= TO_DATE (:toDate, 'dd/MM/yyyy hh:mi:ss AM')
                            AND BILLMAST.MH_CODE = :mhCode
                      GROUP BY 'Bill Advance Stld', users.usc_name, USERS.us_code
                      UNION ALL
                        SELECT 'Bill Advance Stld' bltype, INITCAP (users.usc_name) AS usc_name, users.us_code, SUM (NVL (bmn_advamount, 0)) AMOUNT
                          FROM billmast, users
                        WHERE     billmast.BMC_COLLUSCODE = users.us_code
                              AND NVL (bmn_advamount, 0) > 0
                              AND NVL (billmast.bmc_cancel, 'N') = 'N'
                              AND billmast.BMC_COLLCNCODE IS NOT NULL
                              AND billmast.BMD_COLLDATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh:mi:ss AM')
                              AND billmast.BMD_COLLDATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh:mi:ss AM')
                              AND BILLMAST.MH_CODE = :mhCode
                      GROUP BY 'Bill Advance Stld', users.usc_name, USERS.us_code
                    ) GROUP BY usc_name, us_code`;

// Source: query 26 — advance settled against an IP (Disbillmast) bill
const sql_advSettldIp = `SELECT 'IP Bill Stld' bltype, INITCAP (users.usc_name) AS usc_name, users.us_code, SUM (NVL (Dmn_advance, 0)) AMOUNT
                    FROM Disbillmast, USERS
                  WHERE     Disbillmast.US_CODE = USERS.US_CODE
                        AND NVL (Disbillmast.Dmc_cancel, 'N') = 'N'
                        AND NVL (Dmn_advance, 0) > 0
                        AND Disbillmast.Dmd_date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh:mi:ss AM')
                        AND disbillmast.dmd_date <= TO_DATE (:toDate, 'dd/MM/yyyy hh:mi:ss AM')
                        AND DISBILLMAST.MH_CODE = :mhCode
                GROUP BY 'IP Bill Stld', USC_NAME, users.us_code`;

// Source: query 33 — advance settled against an OP (Opbillmast) bill
const sql_advSettldOp = `SELECT 'OP Advance Stld' bltype, INITCAP (users.usc_name) AS usc_name, users.us_code, SUM (NVL (Opn_advance, 0)) AMOUNT
                    FROM opbillmast, USERS
                  WHERE     opbillmast.US_CODE = USERS.US_CODE
                        AND NVL (OPN_CANCEL, 'N') = 'N'
                        AND NVL (Opn_advance, 0) > 0
                        AND OPD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh:mi:ss AM')
                        AND opd_date <= TO_DATE (:toDate, 'dd/MM/yyyy hh:mi:ss AM')
                        AND OPBILLMAST.MH_CODE = :mhCode
                GROUP BY 'OP Advance Stld', USC_NAME, users.us_code`;

// Source: query 35 — advance settled against a Pharmacy (Pbillmast) bill (both branches)
const sql_advSettldPharmacy = `SELECT usc_name, us_code, SUM (amount) amount
                    FROM (
                      SELECT 'Pharmacy Advance Stld' bltype, INITCAP (users.usc_name) AS usc_name, users.us_code, SUM (NVL (bmn_advamount, 0)) AMOUNT
                        FROM pbillmast, USERS
                      WHERE     pbillmast.US_CODE = USERS.US_CODE
                            AND NVL (BMC_CANCEL, 'N') = 'N'
                            AND pbillmast.BMC_COLLCNCODE IS NULL
                            AND NVL (bmn_advamount, 0) > 0
                            AND BMD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh:mi:ss AM')
                            AND bmd_date <= TO_DATE (:toDate, 'dd/MM/yyyy hh:mi:ss AM')
                            AND PBILLMAST.MH_CODE = :mhCode
                      GROUP BY 'Pharmacy Advance Stld', USC_NAME, users.us_code
                      UNION ALL
                        SELECT 'Pharmacy Advance Stld' bltype, INITCAP (users.usc_name) AS usc_name, users.us_code, SUM (NVL (bmn_advamount, 0)) AMOUNT
                          FROM pbillmast, USERS
                        WHERE     pbillmast.BMC_COLLUSCODE = USERS.US_CODE
                              AND pbillmast.BMC_COLLCNCODE IS NOT NULL
                              AND NVL (BMC_CANCEL, 'N') = 'N'
                              AND NVL (bmn_advamount, 0) > 0
                              AND pbillmast.BMD_COLLDATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh:mi:ss AM')
                              AND pbillmast.BMD_COLLDATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh:mi:ss AM')
                              AND PBILLMAST.MH_CODE = :mhCode
                      GROUP BY 'Pharmacy Advance Stld', USC_NAME, users.us_code
                    ) GROUP BY usc_name, us_code`;

// Source: query 30 — IP bill payment-method breakdown (ipreceipt), for bills raised within the
// requested period. Includes irn_discount ("condiscount" in the original) — per the legacy
// report's own footer note ("Receipt Discount is included in the Adv. Settled"), this discount
// is folded into Adv Settld, not the payment-method columns (confirmed against real data —
// Devika@14847, 01/12/2025). The "IP Bill refund" branch (IPRECEIPTrefund) is excluded — see the
// note on sql_ipBill above.
const sql_ipReceiptCollection = `SELECT INITCAP (users.usc_name) AS usc_name, users.us_code,
                        SUM (NVL (Ipreceipt.irn_amount, 0) - NVL (Ipreceipt.irn_balance, 0)) Cash,
                        SUM (NVL (Ipreceipt.irn_cheque, 0) - NVL (Ipreceipt.IRN_REFCHEQ, 0)) Cheque,
                        SUM (NVL (Ipreceipt.irn_card, 0) - NVL (Ipreceipt.irn_refcard, 0)) Card,
                        SUM (NVL (IRN_NEFT, 0)) Bank, SUM (NVL (ipreceipt.irn_discount, 0)) condiscount
                    FROM ipreceipt, USERS, Disbillmast
                  WHERE     Ipreceipt.Us_code = Users.Us_code
                        AND Ipreceipt.Dmc_slno = Disbillmast.Dmc_slno
                        AND Disbillmast.Dmd_date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh:mi:ss AM')
                        AND disbillmast.dmd_date <= TO_DATE (:toDate, 'dd/MM/yyyy hh:mi:ss AM')
                        AND Ipreceipt.Dmc_type IN ('C', 'R')
                        AND IRD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh:mi:ss AM')
                        AND DISBILLMAST.MH_CODE = :mhCode
                        AND ird_date <= TO_DATE (:toDate, 'dd/MM/yyyy hh:mi:ss AM')
                        AND NVL (Irc_cancel, 'N') = 'N'
                GROUP BY USC_NAME, users.us_code`;

// Source: query 36 — Prev Collection: IP bills dated before fromDate, collected within the requested range
const sql_ipReceiptPrevCollection = `SELECT usc_name, us_code, SUM (cash) cash, SUM (cheque) cheque, SUM (card) card, SUM (bank) bank
                    FROM (
                      SELECT 'IP Bill' bltype, INITCAP (users.usc_name) AS usc_name, users.us_code,
                            SUM (NVL (Ipreceipt.irn_amount, 0) - NVL (Ipreceipt.irn_balance, 0)) Cash,
                            SUM (NVL (Ipreceipt.irn_cheque, 0) - NVL (Ipreceipt.IRN_REFCHEQ, 0)) Cheque,
                            SUM (NVL (Ipreceipt.irn_card, 0) - NVL (Ipreceipt.irn_refcard, 0)) Card,
                            SUM (NVL (Ipreceipt.irn_neft, 0)) Bank
                        FROM ipreceipt, USERS, Disbillmast
                      WHERE     Ipreceipt.Us_code = Users.Us_code
                            AND Ipreceipt.Dmc_slno = Disbillmast.Dmc_slno
                            AND Disbillmast.Dmd_date < TO_DATE (:fromDate, 'dd/MM/yyyy hh:mi:ss AM')
                            AND Ipreceipt.Dmc_type IN ('C', 'R')
                            AND IRD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh:mi:ss AM')
                            AND ird_date <= TO_DATE (:toDate, 'dd/MM/yyyy hh:mi:ss AM')
                            AND NVL (Irc_cancel, 'N') = 'N'
                            AND DISBILLMAST.MH_CODE = :mhCode
                      GROUP BY 'IP Bill', USC_NAME, users.us_code
                    ) GROUP BY usc_name, us_code`;

// Source: query 40 — Billmast payment-method breakdown, plus Billmast's own Billcount/Amount
// split by BMC_IPOP ('I'/'O') since Billmast is itself a revenue source for IP and OP bills,
// distinct from Disbillmast/Opbillmast/Receiptmast (confirmed against real data — Akhila@12174,
// 01/12/2025). Refundbillmast branches excluded — see the note on sql_ipBill above.
const sql_billmastCollection = `SELECT usc_name, us_code, bmc_ipop,
                        SUM (cash) cash, SUM (card) card, SUM (cheque) cheque, SUM (credit) credit,
                        SUM (bank) bank, SUM (roundoff) roundoff, SUM (billcount) billcount, SUM (amount) amount
                    FROM (
                      SELECT SUM (NVL (Billmast.BMN_CASH, 0)) AS Cash, SUM (NVL (Billmast.BMN_CARD, 0)) AS Card,
                            SUM (DECODE (Billmast.Bmc_Banktranstype, 'D', NVL (Billmast.Bmn_Cheque, 0), 0)) AS cheque,
                            SUM (DECODE (billmast.bmc_cacr, 'R', Billmast.BMN_CREDIT, 0)) AS Credit,
                            SUM (DECODE (Billmast.Bmc_Banktranstype, 'B', NVL (Billmast.Bmn_Cheque, 0), 0)) AS Bank,
                            SUM (NVL (BMN_ROUND, 0)) RoundOff, COUNT (bmc_slno) Billcount, SUM (billmast.BMN_NETAMT) Amount,
                            INITCAP (users.usc_name) AS usc_name, users.us_code, BILLMAST.BMC_IPOP
                        FROM Billmast, Users
                      WHERE     Billmast.US_CODE = Users.US_CODE
                            AND Billmast.BMC_COLLCNCODE IS NULL
                            AND billmast.BMC_CACR IN ('C', 'R')
                            AND NVL (Billmast.BMC_CANCEL, 'N') = 'N'
                            AND billmast.BMD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh:mi:ss AM')
                            AND BILLMAST.MH_CODE = :mhCode
                            AND billmast.bmd_date <= TO_DATE (:toDate, 'dd/MM/yyyy hh:mi:ss AM')
                      GROUP BY USERS.us_code, users.usc_name, BILLMAST.BMC_IPOP
                      HAVING SUM (NVL (billmast.BMN_NETAMT, 0)) <> 0
                      UNION ALL
                        SELECT SUM (NVL (Billmast.BMN_CASH, 0)) AS Cash, SUM (NVL (Billmast.BMN_CARD, 0)) AS Card,
                              SUM (DECODE (Billmast.Bmc_Banktranstype, 'D', NVL (Billmast.Bmn_Cheque, 0), 0)) AS cheque,
                              SUM (DECODE (billmast.bmc_cacr, 'R', Billmast.BMN_CREDIT, 0)) AS Credit,
                              SUM (DECODE (Billmast.Bmc_Banktranstype, 'B', NVL (Billmast.Bmn_Cheque, 0), 0)) AS Bank,
                              SUM (NVL (BMN_ROUND, 0)) RoundOff, COUNT (bmc_slno) Billcount, SUM (billmast.BMN_NETAMT) Amount,
                              INITCAP (users.usc_name) AS usc_name, users.us_code, BILLMAST.BMC_IPOP
                          FROM Billmast, Users
                        WHERE     Billmast.BMC_COLLUSCODE = Users.US_CODE
                              AND billmast.BMC_CACR IN ('C', 'R')
                              AND NVL (Billmast.BMC_CANCEL, 'N') = 'N'
                              AND Billmast.BMC_COLLCNCODE IS NOT NULL
                              AND billmast.BMD_COLLDATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh:mi:ss AM')
                              AND BILLMAST.MH_CODE = :mhCode
                              AND billmast.BMD_COLLDATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh:mi:ss AM')
                      GROUP BY USERS.us_code, users.usc_name, BILLMAST.BMC_IPOP
                      HAVING SUM (NVL (billmast.BMN_NETAMT, 0)) <> 0
                    ) GROUP BY usc_name, us_code, bmc_ipop`;

// ---------------------------------------------------------------------------
// User Wise Collection — Credit Bill Collection section (Phase 2)
// ---------------------------------------------------------------------------

// Source: query 15 — RECPCOLLECTIONMAST collection net of its own refund. Confirmed against real
// data (01/12/2025): this single table alone reproduces every row and the section footer total
// of Excel's "Credit Bill Collection" section exactly — none of the customer.cuc_insurance='H'
// filtered queries (1, 3-11, 13-14) are actually used for this section.
const sql_creditBillCollection = `SELECT usc_name, us_code, SUM (cash) cash, SUM (chqdd) chqdd, SUM (card) card, SUM (bank) bank, SUM (billcount) billcount
                    FROM (
                      SELECT INITCAP (users.usc_name) usc_name, users.us_code,
                            SUM (NVL (RCN_CASH, 0)) CASH, SUM (NVL (RCN_CHK, 0) + NVL (RCN_DD, 0)) CHQDD,
                            SUM (NVL (RCN_CARD, 0)) CARD, SUM (NVL (RCN_NEFT, 0)) Bank, COUNT (rcc_slno) Billcount
                        FROM RECPCOLLECTIONMAST, users
                      WHERE     recpcollectionmast.us_code = users.us_code
                            AND RCD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh:mi:ss AM')
                            AND rcd_date <= TO_DATE (:toDate, 'dd/MM/yyyy hh:mi:ss AM')
                            AND (NVL (RCC_CANCEL, 'N') = 'N')
                            AND RECPCOLLECTIONMAST.MH_CODE = :mhCode
                      GROUP BY users.usc_name, users.us_code
                      HAVING     SUM (NVL (RCN_CASH, 0)) > 0
                            OR SUM (NVL (RCN_CHK, 0) + NVL (RCN_DD, 0)) > 0
                            OR SUM (NVL (RCN_CARD, 0)) > 0
                            OR SUM (NVL (RCN_NEFT, 0)) > 0
                      UNION ALL
                        SELECT INITCAP (users.usc_name) usc_name, (users.us_code) us_code,
                              SUM (NVL (Recpcollectionmast.Rfn_Cash, 0)) * -1 CASH,
                              SUM (NVL (Recpcollectionmast.Rfn_Chk, 0)) + SUM (NVL (Recpcollectionmast.Rfn_Dd, 0)) * -1 CHQDD,
                              SUM (NVL (Recpcollectionmast.Rfn_Card, 0)) * -1 CARD, SUM (0) Bank, COUNT (rcc_slno) Billcount
                          FROM Recpcollectionmast, Users
                        WHERE     Recpcollectionmast.Rfd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh:mi:ss AM')
                              AND Recpcollectionmast.Rfd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh:mi:ss AM')
                              AND RECPCOLLECTIONMAST.MH_CODE = :mhCode
                              AND NVL (Rcc_Cancel, 'N') = 'N'
                              AND recpcollectionmast.rfc_user = users.us_code
                      GROUP BY users.usc_name, users.us_code
                      HAVING     SUM (NVL (Rfn_Cash, 0)) <> 0
                            OR SUM (NVL (Rfn_Chk, 0) + NVL (Rfn_Dd, 0)) <> 0
                            OR SUM (NVL (Rfn_Card, 0)) <> 0
                    ) GROUP BY usc_name, us_code`;

// ---------------------------------------------------------------------------
// User Wise Collection — Refund section (Phase 3)
// Both CACR types are included ('C' cash-type routes to Cash, 'R' credit-type routes to Credit),
// confirmed against real data (Najam, 01/12/2025: 25 cash-type + 1 credit-type row = 26 count,
// matching POS#=26, with Cash=8,318 from the cash-type rows and Credit=394 from the credit-type
// row). Both branches (refunded by the same cashier vs. a different cashier/day) are included.
// ---------------------------------------------------------------------------

// Source: query 6 (Mretmast) — Pharmacy refund, feeds the Refund section's POS#/POS Amt.
const sql_refundPharmacy = `SELECT usc_name, us_code, SUM (billcount) billcount, SUM (amount) amount,
                        SUM (cash) cash, SUM (card) card, SUM (cheque) cheque, SUM (credit) credit
                    FROM (
                      SELECT INITCAP (users.usc_name) usc_name, users.us_code, COUNT (mrc_slno) Billcount,
                            SUM (NVL (mrN_NETAMT, 0) + NVL (MRN_SALETAXCH, 0) + NVL (MRN_SALETAXCR, 0)
                                + NVL (MRN_CESSCH, 0) + NVL (MRN_CESSCR, 0)) AMOUNT,
                            SUM (DECODE (mretmast.MRC_CACR, 'C', NVL (mretmast.MRN_CASH, 0), 0)) Cash,
                            SUM (DECODE (mretmast.MRC_CACR, 'C', DECODE (Mretmast.Mrc_Banktranstype, 'D', NVL (Mretmast.Mrn_Cheque, 0), 0), 0)) Cheque,
                            SUM (DECODE (mretmast.MRC_CACR, 'C', NVL (mretmast.MRN_CARD, 0), 0)) Card,
                            SUM (DECODE (mretmast.MRC_CACR, 'R', (NVL (mretmast.BMN_RTCREDIT, 0) + NVL (mretmast.MRN_SALETAXCR, 0) + NVL (mretmast.MRN_CESSCR, 0))
                                + NVL (mretmast.mrn_copayded_credit, 0), 0)) Credit
                        FROM mretmast, users
                      WHERE     mretmast.MRC_RETUSCODE IS NULL
                            AND mretmast.US_CODE = users.us_code
                            AND mretmast.MRC_CACR IN ('C', 'R')
                            AND NVL (mretmast.MRC_CANCEL, 'N') = 'N'
                            AND mretmast.MRD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh:mi:ss AM')
                            AND mretmast.mrd_date <= TO_DATE (:toDate, 'dd/MM/yyyy hh:mi:ss AM')
                            AND MRETMAST.MH_CODE = :mhCode
                      GROUP BY users.usc_name, users.us_code
                      UNION ALL
                        SELECT INITCAP (users.usc_name) usc_name, users.us_code, COUNT (mrc_slno) Billcount,
                              SUM (NVL (mrN_NETAMT, 0) + NVL (MRN_SALETAXCH, 0) + NVL (MRN_SALETAXCR, 0)
                                  + NVL (MRN_CESSCH, 0) + NVL (MRN_CESSCR, 0)) AMOUNT,
                              SUM (DECODE (mretmast.MRC_CACR, 'C', NVL (mretmast.MRN_CASH, 0), 0)) Cash,
                              SUM (DECODE (mretmast.MRC_CACR, 'C', DECODE (Mretmast.Mrc_Banktranstype, 'D', NVL (Mretmast.Mrn_Cheque, 0), 0), 0)) Cheque,
                              SUM (DECODE (mretmast.MRC_CACR, 'C', NVL (mretmast.MRN_CARD, 0), 0)) Card,
                              SUM (DECODE (mretmast.MRC_CACR, 'R', (NVL (mretmast.BMN_RTCREDIT, 0) + NVL (mretmast.MRN_SALETAXCR, 0) + NVL (mretmast.MRN_CESSCR, 0))
                                  + NVL (mretmast.mrn_copayded_credit, 0), 0)) Credit
                          FROM mretmast, users
                        WHERE     mretmast.MRD_RETDATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh:mi:ss AM')
                              AND mretmast.MRD_RETDATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh:mi:ss AM')
                              AND mretmast.MRC_CACR IN ('C', 'R')
                              AND NVL (mretmast.MRC_CANCEL, 'N') = 'N'
                              AND mretmast.MRC_RETUSCODE = users.us_code
                              AND MRETMAST.MH_CODE = :mhCode
                      GROUP BY users.usc_name, users.us_code
                    ) GROUP BY usc_name, us_code`;

// Source: query 5 (Refundbillmast) — general Billmast refund. Excel's Refund section attributes
// this to its "OP#"/"OP Amt" columns (confirmed against real data — Pradeepkumar/Rajeshkumar,
// 01/12/2025 — 'I'-type rows on this table are excluded entirely; only 'C' and 'R' count).
const sql_refundBillmast = `SELECT usc_name, us_code, SUM (billcount) billcount, SUM (amount) amount,
                        SUM (cash) cash, SUM (card) card, SUM (cheque) cheque, SUM (credit) credit
                    FROM (
                      SELECT INITCAP (users.usc_name) usc_name, users.us_code, COUNT (rfc_slno) Billcount,
                            SUM (NVL (RFN_NETAMT, 0)) AMOUNT,
                            SUM (DECODE (refundbillmast.RFC_CACR, 'C', NVL (refundbillmast.RFN_CASH, 0), 0)) Cash,
                            SUM (DECODE (refundbillmast.RFC_CACR, 'C', DECODE (Refundbillmast.Rfc_Banktranstype, 'D', NVL (Refundbillmast.Rfn_Cheque, 0), 0), 0)) Cheque,
                            SUM (DECODE (refundbillmast.RFC_CACR, 'C', NVL (refundbillmast.RFN_CARD, 0), 0)) Card,
                            SUM (DECODE (refundbillmast.RFC_CACR, 'R', NVL (refundbillmast.BMN_RTCREDIT, 0), 0)) Credit
                        FROM refundbillmast, users
                      WHERE     refundbillmast.RFC_RETUSCODE IS NULL
                            AND refundbillmast.US_CODE = users.US_CODE
                            AND refundbillmast.ROC_SLNO IS NULL
                            AND refundbillmast.RFC_CACR IN ('C', 'R')
                            AND NVL (refundbillmast.RFC_CANCEL, 'N') = 'N'
                            AND refundbillmast.RFD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh:mi:ss AM')
                            AND refundbillmast.rfd_date <= TO_DATE (:toDate, 'dd/MM/yyyy hh:mi:ss AM')
                            AND REFUNDBILLMAST.MH_CODE = :mhCode
                      GROUP BY users.usc_name, users.us_code
                      UNION ALL
                        SELECT INITCAP (users.usc_name) usc_name, users.us_code, COUNT (rfc_slno) Billcount,
                              SUM (NVL (RFN_NETAMT, 0)) AMOUNT,
                              SUM (DECODE (refundbillmast.RFC_CACR, 'C', NVL (refundbillmast.RFN_CASH, 0), 0)) Cash,
                              SUM (DECODE (refundbillmast.RFC_CACR, 'C', DECODE (Refundbillmast.Rfc_Banktranstype, 'D', NVL (Refundbillmast.Rfn_Cheque, 0), 0), 0)) Cheque,
                              SUM (DECODE (refundbillmast.RFC_CACR, 'C', NVL (refundbillmast.RFN_CARD, 0), 0)) Card,
                              SUM (DECODE (refundbillmast.RFC_CACR, 'R', NVL (refundbillmast.BMN_RTCREDIT, 0), 0)) Credit
                          FROM refundbillmast, users
                        WHERE     refundbillmast.RFC_RETUSCODE = users.US_CODE
                              AND refundbillmast.ROC_SLNO IS NULL
                              AND refundbillmast.RFC_CACR IN ('C', 'R')
                              AND NVL (refundbillmast.RFC_CANCEL, 'N') = 'N'
                              AND refundbillmast.RFD_RETDATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh:mi:ss AM')
                              AND refundbillmast.RFD_RETDATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh:mi:ss AM')
                              AND REFUNDBILLMAST.MH_CODE = :mhCode
                      GROUP BY users.usc_name, users.us_code
                    ) GROUP BY usc_name, us_code`;

// Source: query 10 (Refundreceiptmast) — OP refund via receipt. Combined with sql_refundBillmast,
// closes the Refund section's OP#/OP Amt/Cash exactly against the section footer (confirmed
// against real data — Sinic, 01/12/2025: 11 count / ₹2,600, the exact remainder after
// sql_refundBillmast, bringing OP# to 22 and Cash to ₹17,098, both matching the footer exactly).
const sql_refundReceipt = `SELECT usc_name, us_code, SUM (billcount) billcount, SUM (amount) amount,
                        SUM (cash) cash, SUM (card) card, SUM (cheque) cheque, SUM (credit) credit
                    FROM (
                      SELECT INITCAP (users.usc_name) usc_name, users.us_code, COUNT (rfc_slno) Billcount,
                            SUM (NVL (RfN_NETAMT, 0)) AMOUNT,
                            SUM (DECODE (refundreceiptmast.RFC_CACR, 'C', NVL (refundreceiptmast.RFN_CASH, 0), 0)) Cash,
                            SUM (DECODE (refundreceiptmast.RFC_CACR, 'C', DECODE (Refundreceiptmast.Rfc_Banktranstype, 'D', NVL (Refundreceiptmast.Rfn_Cheque, 0), 0), 0)) Cheque,
                            SUM (DECODE (refundreceiptmast.RFC_CACR, 'C', NVL (refundreceiptmast.RFN_CARD, 0), 0)) Card,
                            SUM (DECODE (refundreceiptmast.RFC_CACR, 'R', NVL (RPN_RTCREDIT, 0), 0)) Credit
                        FROM refundreceiptmast, users
                      WHERE     refundreceiptmast.RFC_CACR IN ('C', 'R')
                            AND NVL (refundreceiptmast.RFC_CANCEL, 'N') = 'N'
                            AND refundreceiptmast.roc_slno IS NULL
                            AND refundreceiptmast.US_CODE = users.US_CODE
                            AND refundreceiptmast.RFC_RETCNCODE IS NULL
                            AND refundreceiptmast.RFD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh:mi:ss AM')
                            AND refundreceiptmast.rfd_date <= TO_DATE (:toDate, 'dd/MM/yyyy hh:mi:ss AM')
                            AND REFUNDRECEIPTMAST.MH_CODE = :mhCode
                      GROUP BY users.usc_name, users.us_code
                      UNION ALL
                        SELECT INITCAP (users.usc_name) usc_name, users.us_code, COUNT (rfc_slno) Billcount,
                              SUM (NVL (RfN_NETAMT, 0)) AMOUNT,
                              SUM (DECODE (refundreceiptmast.RFC_CACR, 'C', NVL (refundreceiptmast.RFN_CASH, 0), 0)) Cash,
                              SUM (DECODE (refundreceiptmast.RFC_CACR, 'C', DECODE (Refundreceiptmast.Rfc_Banktranstype, 'D', NVL (Refundreceiptmast.Rfn_Cheque, 0), 0), 0)) Cheque,
                              SUM (DECODE (refundreceiptmast.RFC_CACR, 'C', NVL (refundreceiptmast.RFN_CARD, 0), 0)) Card,
                              SUM (DECODE (refundreceiptmast.RFC_CACR, 'R', NVL (RPN_RTCREDIT, 0), 0)) Credit
                          FROM refundreceiptmast, users
                        WHERE     refundreceiptmast.RFC_CACR IN ('C', 'R')
                              AND NVL (refundreceiptmast.RFC_CANCEL, 'N') = 'N'
                              AND refundreceiptmast.roc_slno IS NULL
                              AND refundreceiptmast.RFC_RETUSCODE = users.US_CODE
                              AND refundreceiptmast.RFC_RETCNCODE IS NOT NULL
                              AND refundreceiptmast.RFD_RETDATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh:mi:ss AM')
                              AND refundreceiptmast.RFD_RETDATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh:mi:ss AM')
                              AND REFUNDRECEIPTMAST.MH_CODE = :mhCode
                      GROUP BY users.usc_name, users.us_code
                    ) GROUP BY usc_name, us_code`;

// Source: query 14 (Iprefundmast) — IP bill refund, credit-type only per the original query
// (no cash/card fields on this table). Feeds the Refund section's IP#/IP Amt/Credit. Both this
// table and IPRECEIPTrefund below are empty in this database as of this writing, so this could
// not be verified against real non-zero data — implemented faithfully from the literal source
// query rather than left unbuilt, since it's a zero-risk addition (no rows, no effect) that
// completes the section.
const sql_refundIp = `SELECT usc_name, us_code, SUM (billcount) billcount, SUM (amount) amount, SUM (credit) credit
                    FROM (
                      SELECT INITCAP (users.usc_name) usc_name, USERS.US_CODE, COUNT (iprefundmast.ric_slno) Billcount,
                            SUM (NVL (Iprefundmast.Rin_credit, 0)) + SUM (NVL (Iprefundmast.rin_copayded_credit, 0)) AMOUNT,
                            SUM (NVL (Iprefundmast.Rin_credit, 0)) + SUM (NVL (Iprefundmast.rin_copayded_credit, 0)) Credit
                        FROM Iprefundmast, Users
                      WHERE     iprefundmast.us_code = users.us_code
                            AND Iprefundmast.Ric_Cacr = 'R'
                            AND NVL (Iprefundmast.Ric_Cancel, 'N') = 'N'
                            AND IPREFUNDMAST.MH_CODE = :mhCode
                            AND Iprefundmast.Rid_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh:mi:ss AM')
                            AND iprefundmast.rid_date <= TO_DATE (:toDate, 'dd/MM/yyyy hh:mi:ss AM')
                      GROUP BY USERS.US_CODE, users.usc_name
                    ) GROUP BY usc_name, us_code`;

// Source: IPRECEIPTrefund — cash-type IP bill refund (companion to sql_refundIp's credit-type
// Iprefundmast). Same empty-table caveat as above.
const sql_refundIpReceipt = `SELECT usc_name, us_code, SUM (billcount) billcount, SUM (cash) cash, SUM (card) card, SUM (cheque) cheque
                    FROM (
                      SELECT INITCAP (users.usc_name) usc_name, users.us_code, COUNT (*) Billcount,
                            SUM (NVL (IPRECEIPTrefund.irf_cash, 0)) cash, SUM (NVL (IPRECEIPTrefund.irf_card, 0)) card,
                            SUM (NVL (IPRECEIPTrefund.irf_cheque, 0)) cheque
                        FROM IPRECEIPTrefund, users
                      WHERE     ipreceiptrefund.us_code = users.us_code
                            AND IRF_CACR IN ('C')
                            AND NVL (IRF_CANCEL, 'N') = 'N'
                            AND ipreceiptrefund.IRC_MHCODE = :mhCode
                            AND IRF_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh:mi:ss AM')
                            AND irf_date <= TO_DATE (:toDate, 'dd/MM/yyyy hh:mi:ss AM')
                      GROUP BY users.us_code, users.usc_name
                    ) GROUP BY usc_name, us_code`;

module.exports = {
  sql_one,
  sql_usersList,
  sql_ipBill,
  sql_opBillConsolidated,
  sql_opBillReceipt,
  sql_posBilling,
  sql_advPharmacy,
  sql_advIp,
  sql_advBilling,
  sql_advOp,
  sql_advSettldBill,
  sql_advSettldIp,
  sql_advSettldOp,
  sql_advSettldPharmacy,
  sql_ipReceiptCollection,
  sql_ipReceiptPrevCollection,
  sql_billmastCollection,
  sql_creditBillCollection,
  sql_refundPharmacy,
  sql_refundBillmast,
  sql_refundReceipt,
  sql_refundIp,
  sql_refundIpReceipt,
};
