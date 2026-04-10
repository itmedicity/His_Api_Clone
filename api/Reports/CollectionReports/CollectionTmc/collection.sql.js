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

module.exports = {
  sql_one,
};
