const { format, subHours, setSeconds, setMinutes, setHours, startOfDay } = require('date-fns');
const { oracledb, oraConnection } = require('../../config/oradbconfig');

module.exports = {

    getAllPatientLabResults: async (callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();

        const sql = `
                    SELECT DISTINCT
                    PT.PT_NO,
                    PT.PTC_NAME,
                    TS.BMC_SLNO,
                    TS.PD_CODE,
                    PD.PDC_DESC,
                    TS.TSC_CHECKED,
                    TS.TDC_DOCTORVIEW
                FROM (
                SELECT DISTINCT
                    BM.PT_NO,
                    BM.PTC_NAME,
                    BM.BMC_SLNO
                FROM BILLDETL BD 
                INNER JOIN BILLMAST BM ON BM.BMC_SLNO = BD.BMC_SLNO AND BM.OU_CODE = '0005'
                INNER JOIN DOCTOR DO ON DO.DO_CODE = BM.DO_CODE AND DO.SP_CODE IN ('018', 'C002')
                RIGHT JOIN VISITMAST VM ON VM.PT_NO = BM.PT_NO 
                WHERE BM.BMD_DATE BETWEEN to_date(:FROM_DATE,'dd/MM/yyyy hh24:mi:ss') AND to_date(:TO_DATE,'dd/MM/yyyy hh24:mi:ss')
                AND BM.PT_NO IS NOT NULL 
                AND VM.VSD_DATE BETWEEN to_date(:FROM_DATE,'dd/MM/yyyy hh24:mi:ss') AND to_date(:TO_DATE,'dd/MM/yyyy hh24:mi:ss') ) PT
                INNER JOIN TESTRESULT TS ON PT.BMC_SLNO = TS.BMC_SLNO
                LEFT JOIN PRODESCRIPTION PD ON TS.PD_CODE = PD.PD_CODE
                     `;
        try {


            const now = new Date();
            const startOfToday = startOfDay(now); //eg : 01/09/2025 00:00:00
            const fromDate = subHours(startOfToday, 7); // subtract 7 hours
            const formattedFromDate = format(fromDate, 'dd/MM/yyyy HH:mm:ss');
            // To date: today at 23:59:59
            const endOfDay = setSeconds(setMinutes(setHours(now, 23), 59), 59);
            const toDate = format(endOfDay, 'dd/MM/yyyy HH:mm:ss');
            const result = await conn_ora.execute(
                sql,
                {
                    FROM_DATE: formattedFromDate,
                    TO_DATE: toDate
                },
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
    getAllIcuBeds: async (callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();

        const sql = `
                    SELECT  NS AS "NS",
    SUM(TOT) AS "TOT",
    SUM(OCCUP) AS "OCCUP",
    SUM(AVAIL) AS "AVAIL",
    SUM(DIS) AS "DIS"
FROM (
    SELECT  O.OUC_DESC AS NS,
        COUNT(B.NS_CODE) AS TOT,
        SUM(DECODE(B.BDC_OCCUP, 'O', 1, 0)) AS OCCUP,
        SUM(DECODE(B.BDC_OCCUP, 'A', 1, 0)) AS AVAIL,
        SUM(DECODE(B.BDC_OCCUP, 'T', 1, 0)) AS DIS
    FROM   BED B
     LEFT JOIN   NURSTATION N ON B.NS_CODE = N.NS_CODE
     LEFT JOIN   OUTLET O ON N.OU_CODE=O.OU_CODE
     LEFT JOIN   ROOMTYPE R ON B.RT_CODE=R.RT_CODE
             WHERE  B.BDC_STATUS = 'Y'
                   AND R.ICU='Y'
                   AND N.NSC_STATUS='Y'
             GROUP BY  O.OUC_DESC )
             GROUP BY NS
             ORDER BY NS`;
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