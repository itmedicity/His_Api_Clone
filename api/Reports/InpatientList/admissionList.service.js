// @ts-ignore
const { oracledb, connectionClose, oraConnection } = require('../../../config/oradbconfig');
const pool = require('../../../config/dbconfig');

module.exports = {
    ipAdmissionList: async (data, callBack) => {

        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        try {
            const result = await conn_ora.execute(
                ` SELECT 
                        IP_NO,
                        PT_NO,
                        PTC_PTNAME,
                        TO_CHAR(IPD_DATE,'YYYY-MM-DD') IPD_DATE
                    FROM IPADMISS 
                    WHERE 
                        IPD_DATE   >= TO_DATE (:date0, 'dd/MM/yyyy hh24:mi:ss') AND 
                        IPD_DATE   <= TO_DATE (:date1, 'dd/MM/yyyy hh24:mi:ss') 
                    AND IPC_PTFLAG = 'N'`,
                {
                    date0: data.from,
                    date1: data.to,
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
    insertTsshPatient: (data, callBack) => {
        pool.query(
            `INSERT INTO tssh_ipadmiss 
                (date,ip_no,op_no) 
            VALUES (?,?,?)`,
            [
                data.date,
                data.ip_no,
                data.op_no
            ],
            (error, results, feilds) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results)
            }
        )
    },
    checkPatientInserted: (data, callBack) => {
        pool.query(
            `SELECT 
                ip_slno 
            FROM 
                tssh_ipadmiss 
            WHERE ip_no = ?`,
            [
                data.ip_no
            ],
            (error, results, feilds) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results)
            }
        )
    },
    getTsshPatientDateWise: (data, callBack) => {
        pool.query(
            `SELECT * FROM tssh_ipadmiss WHERE date = ?`,
            [
                data.date
            ],
            (error, results, feilds) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results)
            }
        )
    },
    deleteIPNumberFromTssh: (data, callBack) => {
        pool.query(
            `DELETE FROM tssh_ipadmiss WHERE ip_no = ?`,
            [
                data.ip_no
            ],
            (error, results, feilds) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results)
            }
        )
    },
    getPatientData: async (data, callBack) => {

        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        try {
            const result = await conn_ora.execute(
                ` SELECT 
                    PT_NO,
                    PTC_PTNAME,
                    PTC_SEX,
                    PTN_YEARAGE,
                    PTC_LOADD1,
                    PTC_LOADD2,
                    PTC_MOBILE
                FROM PATIENT WHERE PT_NO = :ptno  AND PTC_PTFLAG = 'N'`,
                {
                    ptno: data,
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
}