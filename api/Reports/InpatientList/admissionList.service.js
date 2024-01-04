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
                        TO_CHAR(IPD_DATE,'YYYY-MM-DD') IPD_DATE,
                        TO_CHAR(IPD_DISC ,'YYYY-MM-DD hh24:mi') DISDATE,
                        DECODE(IPC_STATUS,NULL,'N','Y') DISSTATUS  
                    FROM IPADMISS 
                    WHERE IPD_DATE   >= TO_DATE (:date0, 'dd/MM/yyyy hh24:mi:ss') 
                    AND IPD_DATE   <= TO_DATE (:date1, 'dd/MM/yyyy hh24:mi:ss') 
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
    insertTsshPatient: (body) => {
        return Promise.all(body.map((e) => {
            console.log(e)

            return new Promise((resolve, reject) => {
                pool.query(
                    `INSERT INTO tssh_ipadmiss 
                        (date,ip_no,op_no,dis_status,dis_date)
                    VALUES (?)`,
                    [
                        e
                    ],
                    (error, results, fields) => {
                        console.log(results)
                        console.log(error)
                        if (error) {
                            return reject(error)
                        }
                        return resolve(results)
                    }
                )
            })
        }))
    },
    insertAsRemoveTmcPatient: (data, callBack) => {
        pool.query(
            `INSERT INTO tssh_ipadmiss 
                (date,ip_no,op_no,dis_status,dis_date,tmch_status) 
            VALUES (?,?,?,?,?,?)`,
            [
                data.date,
                data.ip_no,
                data.op_no,
                data.disStatus,
                data.disDate,
                data.status
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
            `DELETE FROM tssh_ipadmiss WHERE ip_slno IN (?)`,
            [
                data
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
    getTsshPatientList: (data, callBack) => {
        pool.query(
            `SELECT 
                ip_no
            FROM medi_ellider.tssh_ipadmiss
            WHERE date BETWEEN ? AND ?`,
            [
                data.fromDate,
                data.toDate
            ],
            (error, results, feilds) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results)
            }
        )
    },
    getTotalPatientList: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();

        const fromDate = data.from;
        const toDate = data.to;

        const sql = `SELECT  /* DISCHARGEDE  PATIENT LIST ON THE SAME DAY*/
                        IP_NO
                    FROM DISBILLMAST
                        WHERE DMD_DATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                        AND DMD_DATE <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                        AND DMC_PTFLAG = 'N' AND DMC_CANCEL IS NULL
                    UNION 
                    SELECT /**  ADMITTED PATIENT LIST IN THE SAME DAY**/
                        IP_NO
                    FROM IPADMISS
                        WHERE IPC_PTFLAG = 'N'
                        AND  IPD_DATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                        AND IPD_DATE <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                    UNION  
                    SELECT /** ADMITTED PATIENT LIST  DISCHARGED AFTER THE GIVEN DATE**/
                        IP_NO
                    FROM IPADMISS
                        WHERE IPC_PTFLAG = 'N'
                        AND DMD_DATE > TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss') 
                        AND IPD_DATE < TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')`;
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
    // GET DISCHARGE INFO FROM ORACLE 
    getDischargePatientList: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();

        const fromDate = data.from;
        const toDate = data.to;

        const sql = `SELECT 
                        TO_CHAR(IPD_DISC ,'YYYY-MM-DD hh24:mi') DISDATE,
                        IP_NO
                    FROM IPADMISS 
                    WHERE  IPD_DISC >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                    AND IPD_DISC <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                    AND IPADMISS.IPC_PTFLAG = 'N'`;
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
    notDischargedPatientListTssh: (callBack) => {
        pool.query(
            `SELECT 
                ip_no
            FROM tssh_ipadmiss
            WHERE dis_status = 'N'`,
            [],
            (error, results, feilds) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results)
            }
        )
    },
    getLastDischargeUpdateDate: (callBack) => {
        pool.query(
            `SELECT Last_dis_updateDate FROM last_dis_updatedate`,
            [],
            (error, results, feilds) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results)
            }
        )
    },
    updateDischargedPatient: (data) => {
        return new Promise((resolve, reject) => {
            data.map((val) => {
                pool.query(
                    `UPDATE tssh_ipadmiss 
                        SET dis_status = 'Y',
                            dis_date = ?
                        WHERE ip_no = ?`,
                    [
                        val.DISDATE,
                        val.IP_NO
                    ],
                    (error, results, fields) => {
                        if (error) {
                            return reject(error)
                        }
                        return resolve(results)
                    }
                )
            })
        })
    },
    updateLastDischargeDate: (data, callBack) => {
        pool.query(
            `UPDATE last_dis_updatedate SET Last_dis_updateDate = ? WHERE slno = 1`,
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
    getDischargedipNoFromMysql: (data, callBack) => {
        pool.query(
            `SELECT
                ip_no,tmch_status
            FROM tssh_ipadmiss
            WHERE dis_status = 'Y' AND date  <= ? and dis_date > ?
            UNION
            SELECT 
                ip_no,tmch_status
            FROM tssh_ipadmiss
            WHERE dis_status = 'N' AND dis_date IS NULL AND date  < ?
            UNION
            SELECT 
                ip_no,tmch_status
            FROM tssh_ipadmiss
            WHERE dis_date >= ?
            AND dis_date <= ?`,
            [
                data.to,
                data.to,
                data.to,
                data.from,
                data.to,
            ],
            (error, results, feilds) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results)
            }
        )
    },
    getTsshIpNoFromMysql: (data, callBack) => {
        pool.query(
            `SELECT 
				ip_no,tmch_status
            FROM tssh_ipadmiss
            WHERE dis_status = 'Y' AND date  <= ? and dis_date > ?
            AND tmch_status = 0
			UNION
            SELECT 
                ip_no,tmch_status
            FROM tssh_ipadmiss
            WHERE dis_status = 'N' AND dis_date IS NULL AND date  < ?
            AND tmch_status = 0
            UNION
            SELECT 
                ip_no,tmch_status
            FROM tssh_ipadmiss
            WHERE dis_date >= ?
            AND dis_date <= ? AND tmch_status = 0`,
            [
                data.to,
                data.to,
                data.to,
                data.from,
                data.to,
            ],
            (error, results, feilds) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results)
            }
        )
    },
    getIpadmissChecks: async (data, callBack) => {

        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        try {
            const result = await conn_ora.execute(
                ` SELECT
                 IP_NO ,IPD_DISC
                  FROM IPADMISS
                   WHERE IP_NO=:ptno AND  IPD_DISC IS NULL  AND IPC_PTFLAG='N'`,
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
    getIpReceiptPatientInfo: async (data, callBack) => {
        // GET DISCHARGE INFO FROM ORACLE 
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();

        const fromDate = data.from;
        const toDate = data.to;

        const sql = `SELECT 
                        IPADMISS.IP_NO,
                        TO_CHAR(IPADMISS.IPD_DATE,'YYYY-MM-DD hh24:mi:ss' ) ADMISSION
                    FROM IPRECEIPT,IPADMISS
                    WHERE IPRECEIPT.DMC_SLNO =  IPADMISS.DMC_SLNO
                    AND IRC_CANCEL IS NULL
                    AND IRD_DATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')  
                    AND  IRD_DATE <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')`;
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
    getDischargedIpInfoFromMysql: (data, callBack) => {
        pool.query(
            `SELECT 
                ip_no
            FROM tssh_ipadmiss
            WHERE dis_status = 'Y' 
            AND date BETWEEN ? AND ?`,
            [
                data.from,
                data.to
            ],
            (error, results, feilds) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results)
            }
        )
    },
    getTsshIpNoFromMysqlGrouping: (data, callBack) => { //For grouping
        pool.query(
            `SELECT 
				ip_no,tmch_status
            FROM tssh_ipadmiss
            WHERE dis_status = 'Y' AND date  <= ? and dis_date > ?
            AND tmch_status = 1
			UNION
            SELECT 
                ip_no,tmch_status
            FROM tssh_ipadmiss
            WHERE dis_status = 'N' AND dis_date IS NULL AND date  < ?
            AND tmch_status = 1
            UNION
            SELECT 
                ip_no,tmch_status
            FROM tssh_ipadmiss
            WHERE dis_date >= ?
            AND dis_date <= ? AND tmch_status = 1`,
            [
                data.to,
                data.to,
                data.to,
                data.from,
                data.to,
            ],
            (error, results, feilds) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results)
            }
        )
    },
    getDischargedIpInfoFromMysqlGrouped: (data, callBack) => {
        pool.query(
            `SELECT 
                ip_no
            FROM tssh_ipadmiss
            WHERE dis_status = 'Y' 
            AND date BETWEEN ? AND ?
            AND tmch_status = 1`,
            [
                data.from,
                data.to
            ],
            (error, results, feilds) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results)
            }
        )
    },
    getGroupedPatientList: (data, callBack) => {
        pool.query(
            `SELECT 
                date,
                ip_no,
                op_no,
                dis_status,
                dis_date
            FROM medi_ellider.tssh_ipadmiss
            WHERE tmch_status = ? AND date = ?`,
            [
                data.status,
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
    getTmcIncomeReport: (data, callBack) => {
        pool.query(
            `SELECT 
                SUM(bed) bed,
                SUM(ns) ns,
                SUM(room) room,
                SUM(others) others,
                SUM(consulting) consulting,
                SUM(anesthesia) anesthesia,
                SUM(operation) operation,
                SUM(theater) theater,
                SUM(theaterInstment) theaterInstment,
                SUM(cardiology) cardiology,
                SUM(disposible) disposible,
                SUM(icu) icu,
                SUM(icuProc) icuProc,
                SUM(radiology) radiology,
                SUM(lab) lab,
                SUM(bloodbank) bloodbank,
                SUM(mri) mri,
                SUM(diet) diet,
                SUM(pha_sale) pha_sale,
                SUM(pha_discount) pha_discount,
                SUM(pha_tax) pha_tax,
                SUM(pha_gross) pha_gross,
                SUM(ip_consolidate_discount) ip_consolidate_discount,
                SUM(pettycash) pettycash,
                SUM(tax) tax,
                SUM(collectionagainsale) collectionagainsale,
                SUM(advanceSettled) advanceSettled,
                SUM(creditinsurancebill) creditinsurancebill,
                SUM(unsettledAmount) unsettledAmount,
                SUM(roundOff) roundOff,
                SUM(gra_collection) gra_collection,
                SUM(gra_net) gra_net,
                SUM(gra_tax) gra_tax,
                SUM(gra_discount) gra_discount,
                SUM(gra_gross) gra_gross,
                SUM(insuranceBillDisct) insuranceBillDisct,
                SUM(insuranceWriteOff) insuranceWriteOff,
                SUM(Complimentary) Complimentary,
                SUM(previousDayDiscount) previousDayDiscount,
                SUM(advanceRefund) advanceRefund,
                SUM(advanceCollction) advanceCollction,
                SUM(insuranceBillCollection) insuranceBillCollection,
                SUM(previousDayCollection) previousDayCollection,
                SUM(counterCollection) counterCollection,
                SUM(general) general,
                SUM(otherType) otherType,
                SUM(discountTotal) discountTotal
            FROM tmc_income 
            WHERE DATE BETWEEN ? AND ?`,
            [
                data.from,
                data.to
            ],
            (error, results, feilds) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results)
            }
        )
    },
    getTsshIncomeReport: (data, callBack) => {
        pool.query(
            `SELECT 
                SUM(bed) bed,
                SUM(ns) ns,
                SUM(room) room,
                SUM(others) others,
                SUM(consulting) consulting,
                SUM(anesthesia) anesthesia,
                SUM(operation) operation,
                SUM(theater) theater,
                SUM(theaterInstment) theaterInstment,
                SUM(cardiology) cardiology,
                SUM(disposible) disposible,
                SUM(icu) icu,
                SUM(icuProc) icuProc,
                SUM(radiology) radiology,
                SUM(lab) lab,
                SUM(bloodbank) bloodbank,
                SUM(mri) mri,
                SUM(diet) diet,
                SUM(pha_sale) pha_sale,
                SUM(pha_discount) pha_discount,
                SUM(pha_tax) pha_tax,
                SUM(pha_gross) pha_gross,
                SUM(ip_consolidate_discount) ip_consolidate_discount,
                SUM(pettycash) pettycash,
                SUM(tax) tax,
                SUM(collectionagainsale) collectionagainsale,
                SUM(advanceSettled) advanceSettled,
                SUM(creditinsurancebill) creditinsurancebill,
                SUM(unsettledAmount) unsettledAmount,
                SUM(roundOff) roundOff,
                SUM(gra_collection) gra_collection,
                SUM(gra_net) gra_net,
                SUM(gra_tax) gra_tax,
                SUM(gra_discount) gra_discount,
                SUM(gra_gross) gra_gross,
                SUM(insuranceBillDisct) insuranceBillDisct,
                SUM(insuranceWriteOff) insuranceWriteOff,
                SUM(Complimentary) Complimentary,
                SUM(previousDayDiscount) previousDayDiscount,
                SUM(advanceRefund) advanceRefund,
                SUM(advanceCollction) advanceCollction,
                SUM(insuranceBillCollection) insuranceBillCollection,
                SUM(previousDayCollection) previousDayCollection,
                SUM(counterCollection) counterCollection,
                SUM(general) general,
                SUM(otherType) otherType,
                SUM(discountTotal) discountTotal
            FROM tssh_income 
            WHERE DATE BETWEEN ? AND ?`,
            [
                data.from,
                data.to
            ],
            (error, results, feilds) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results)
            }
        )
    },
}