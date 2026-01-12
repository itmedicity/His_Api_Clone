const pool = require("../../../../config/dbconfig");
const {oraConnection, oracledb} = require("../../../../config/oradbconfig");

module.exports = {
  unsettledAmountUserWise: async (data) => {
    const fromDate = "01/11/2025 12:00:00 AM";
    const toDate = "01/11/2025 11:59:59 PM";
    const connection = await oraConnection();
    const conn = await connection.getConnection();

    const sql = `
      SELECT A.Usc_name, A.Us_code, SUM (NVL (Payable, 0)) Unstld
    FROM (  SELECT 'IP Bill' bltype,
                   INITCAP (users.usc_name) AS usc_name,
                   Users.Us_code,
                   SUM (NVL (DMN_FINALPTPAYABLE, 0)) Payable
              FROM Disbillmast, Users
             WHERE     Disbillmast.Us_code = Users.Us_code
                   AND Dmc_cacr IN ('C', 'R')
                   AND NVL (Disbillmast.Dmc_cancel, 'N') = 'N'
                   AND NVL (DMN_FINALPTPAYABLE, 0) <> 0
                   AND Disbillmast.Dmd_date >=
                          TO_DATE ('01/11/2025 12:00:00 AM',
                                   'dd/MM/yyyy hh:mi:ss AM')
                   AND disbillmast.dmd_date <=
                          TO_DATE ('01/11/2025 11:59:59 PM',
                                   'dd/MM/yyyy hh:mi:ss AM')
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
                   AND Disbillmast.Dmd_date >=
                          TO_DATE ('01/11/2025 12:00:00 AM',
                                   'dd/MM/yyyy hh:mi:ss AM')
                   AND disbillmast.dmd_date <=
                          TO_DATE ('01/11/2025 11:59:59 PM',
                                   'dd/MM/yyyy hh:mi:ss AM')
                   AND Ipreceipt.Dmc_type IN ('C', 'R')
                   AND IRD_DATE >=
                          TO_DATE ('01/11/2025 12:00:00 AM',
                                   'dd/MM/yyyy hh:mi:ss AM')
                   AND ird_date <=
                          TO_DATE ('01/11/2025 11:59:59 PM',
                                   'dd/MM/yyyy hh:mi:ss AM')
                   AND NVL (Irc_cancel, 'N') = 'N'
                   AND DISBILLMAST.MH_CODE IN ('00')
          GROUP BY 'IP Coll', USC_NAME, users.us_code) A
GROUP BY A.Usc_name, A.Us_code`;
    try {
      const result = await conn.execute(sql, {}, {resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT});
      const rows = await result.resultSet?.getRows();
      return rows;
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      if (conn) {
        await conn.close();
        await connection.close();
      }
    }
  },
};
