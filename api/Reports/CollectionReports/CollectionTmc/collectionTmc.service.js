const {pools} = require("../../../../config/mysqldbconfig");
const {getTmcConnection, oracledb} = require("../../../../config/oradbconfig");

module.exports = {
  unsettledAmountUserWise: async () => {
    // const fromDate = "01/12/2025 12:00:00 AM";
    // const toDate = "01/12/2025 11:59:59 PM";
    const fromDate = new Date("2025-12-01T00:00:00");
    const toDate = new Date("2025-12-01T23:59:59");

    const conn = await getTmcConnection();

    const sql = `SELECT A.Usc_name, A.Us_code, SUM (NVL (Payable, 0)) Unstld
                    FROM (  SELECT 'IP Bill' bltype,
                                  INITCAP (users.usc_name) AS usc_name,
                                  Users.Us_code,
                                  SUM (NVL (DMN_FINALPTPAYABLE, 0)) Payable
                              FROM Disbillmast, Users
                            WHERE Disbillmast.Us_code = Users.Us_code
                                  AND Dmc_cacr IN ('C', 'R')
                                  AND NVL (Disbillmast.Dmc_cancel, 'N') = 'N'
                                  AND NVL (DMN_FINALPTPAYABLE, 0) <> 0
                                  AND Disbillmast.Dmd_date >= :fromDate
                                  AND disbillmast.dmd_date <= :toDate
                                  AND DISBILLMAST.MH_CODE IN ('00')
                          GROUP BY 'IP Bill', USC_NAME, users.us_code
                          UNION ALL
                            SELECT 'IP Coll' bltype,
                                  INITCAP (users.usc_name) AS usc_name,
                                  users.us_code,
                                  SUM (
                                      ( (  NVL (Ipreceipt.irn_amount, 0)
                                        + NVL (Ipreceipt.irn_cheque, 0)
                                        + NVL (Ipreceipt.irn_card, 0)
                                        + NVL (Ipreceipt.irn_neft, 0))
                                      - (  NVL (Ipreceipt.irn_balance, 0)
                                          + NVL (Ipreceipt.IRN_REFCHEQ, 0)
                                          + NVL (Ipreceipt.irn_refcard, 0)))
                                      + NVL (ipreceipt.irn_discount, 0))
                                  * -1
                                      Payable
                              FROM ipreceipt, USERS, Disbillmast
                            WHERE Ipreceipt.Us_code = Users.Us_code
                                  AND Ipreceipt.Dmc_slno = Disbillmast.Dmc_slno
                                  AND Disbillmast.Dmd_date >= :fromDate
                                  AND disbillmast.dmd_date <= :toDate
                                  AND Ipreceipt.Dmc_type IN ('C', 'R')
                                  AND IRD_DATE >= :fromDate
                                  AND ird_date <= :toDate
                                  AND NVL (Irc_cancel, 'N') = 'N'
                                  AND DISBILLMAST.MH_CODE IN ('00')
                          GROUP BY 'IP Coll', USC_NAME, users.us_code) A
                GROUP BY A.Usc_name, A.Us_code`;
    try {
      const result = await conn.execute(sql, {fromDate: fromDate, toDate: toDate}, {outFormat: oracledb.OUT_FORMAT_OBJECT});
      return result.rows;
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      await conn.close();
    }
  },
  collectionReports001: async (data) => {
    const fromDate = "01/12/2025 12:00:00 AM";
    const toDate = "01/12/2025 11:59:59 PM";
    const conn = await getTmcConnection();

    const sql = `SELECT SUM (0) AS Cash,
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
    try {
      const result = await conn.execute(sql, {fromDate: fromDate, toDate: toDate}, {outFormat: oracledb.OUT_FORMAT_OBJECT});
      const rows = await result.resultSet?.getRows();
      return rows;
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      if (conn) {
        await conn.close();
      }
    }
  },
};
