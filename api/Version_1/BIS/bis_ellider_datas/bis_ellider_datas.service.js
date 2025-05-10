// const pool = require('../../config/dbconfig');
const { oraConnection, oracledb } = require('../../../../config/oradbconfig');
module.exports = {

    getOpdatas: async (data, callBack) => {        
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        const sql = `                   
                     SELECT DATEE "DATEE",
       SUM(NEW_REG) "NEW_REG",
       SUM(R_VISIT) "R_VISIT",
       SUM(TOTAL) "TOTAL"
  FROM (
    SELECT DATEE,
           SUM(NR) AS NEW_REG, 
           (SUM(RV) + SUM(CV)) AS R_VISIT, 
           (SUM(NR) + SUM(RV) + SUM(CV)) AS TOTAL
      FROM (
        SELECT CASE WHEN VSC_ENT = 'N' THEN 1 ELSE 0 END AS NR,
               CASE WHEN VSC_ENT = 'V' THEN 1 ELSE 0 END AS RV,
               CASE WHEN VSC_ENT = 'C' THEN 1 ELSE 0 END AS CV,
               TO_CHAR(VSD_DATE, 'yyyy-mm-dd') AS DATEE
          FROM VISITMAST 
         WHERE VSD_DATE >= TO_DATE(:FROM_DATE, 'dd-Mon-yyyy HH24:MI:SS')
           AND VSD_DATE <= TO_DATE(:TO_DATE, 'dd-Mon-yyyy HH24:MI:SS')
           AND VSC_PTFLAG = 'N' 
           AND VSC_CANCEL IS NULL
      )
  GROUP BY DATEE
)
GROUP BY DATEE
ORDER BY DATEE`;
        try {
            const result = await conn_ora.execute(
                sql,
                {
                    FROM_DATE: data.fromdate,
                    TO_DATE: data.todate
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

}