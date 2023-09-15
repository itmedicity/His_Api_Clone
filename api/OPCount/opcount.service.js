const pool = require('../../config/dbconfig');
const { oraConnection, oracledb } = require('../../config/oradbconfig');
module.exports = {

    getOpCountDayWise: async (callBack) => {

        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        // const fromDate = data.from;
        // const toDate = data.to;

        const sql = `SELECT 
                          DAYS, 
                          COUNT(VS_NO) COUNT,
                          YEARS
                     FROM (
                     SELECT 
                          TO_CHAR(VSD_DATE,'YYYY-MM-DD')DAYS,
                          TO_CHAR(VSD_DATE,'YYYY')YEARS,
                          VS_NO 
                     FROM 
                          VISITMAST 
                     WHERE
                          VISITMAST.VSD_DATE >= TO_DATE  ('01/01/2014 00:00:00','dd/MM/yyyy hh24:mi:ss')
                      AND VISITMAST.VSD_DATE <= TO_DATE ('31/12/2023 23:59:59','dd/MM/yyyy hh24:mi:ss')
                      AND VISITMAST.VSC_PTFLAG = 'N' 
                      AND VISITMAST.VSC_CANCEL IS NULL)
                      GROUP BY DAYS,YEARS  
                      ORDER BY DAYS`;
        try {
            const result = await conn_ora.execute(
                sql,
                {},
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT },
            )
            const dayCountFromOra = await result.resultSet?.getRows();
            dayCountFromOra && dayCountFromOra.map((value, index) => {
                pool.query(`INSERT INTO op_count_day (day, count,year) VALUES (?,?,?)`,
                    [
                        value.DAYS,
                        value.COUNT,
                        value.YEARS
                    ],
                    (error, result) => {
                        if (error)
                            throw error;
                    });
            })
            return callBack(null, result)
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

    getOpCountMonthWise: async (callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        const sql = `SELECT 
                          MONTHS, 
                          COUNT(VS_NO) COUNT,
                          YEARS 
                     FROM (
                     SELECT 
                          CONCAT(TO_CHAR (VSD_DATE,'YYYY-MM'),'-01')MONTHS,
                          TO_CHAR(VSD_DATE,'YYYY')YEARS,
                          VS_NO 
                     FROM 
                          VISITMAST 
                     WHERE
                          VISITMAST.VSD_DATE >= TO_DATE  ('01/01/2014 00:00:00','dd/MM/yyyy hh24:mi:ss')
                      AND VISITMAST.VSD_DATE <= TO_DATE ('31/12/2023 23:59:59','dd/MM/yyyy hh24:mi:ss')
                      AND VISITMAST.VSC_PTFLAG = 'N' 
                      AND VISITMAST.VSC_CANCEL IS NULL)
                      GROUP BY MONTHS,YEARS  
                      ORDER BY MONTHS`;
        try {
            const result = await conn_ora.execute(
                sql,
                {},
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT },
            )
            const monthCountFromOra = await result.resultSet?.getRows();
            monthCountFromOra && monthCountFromOra.map((value, index) => {
                pool.query(`INSERT INTO op_count_month (month,count,year) VALUES (?,?,?)`,
                    [
                        value.MONTHS,
                        value.COUNT,
                        value.YEARS
                    ],
                    (error, result) => {
                        if (error)
                            throw error;
                    });
            })
            return callBack(null, result)
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

    getOpCountYearWise: async (callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        // const fromDate = data.from;
        // const toDate = data.to;
        const sql = `SELECT 
                          YEARS, 
                          COUNT(VS_NO) COUNT,
                          DAYS
                     FROM (
                     SELECT 
                          TO_CHAR(VSD_DATE,'YYYY')YEARS,
                          VS_NO,
                          CONCAT(TO_CHAR (VSD_DATE,'YYYY'),'-01-01')DAYS
                     FROM 
                          VISITMAST 
                     WHERE
                          VISITMAST.VSD_DATE >=TO_DATE  ('01/01/2014 00:00:00','dd/MM/yyyy hh24:mi:ss')
                      AND VISITMAST.VSD_DATE <=TO_DATE ('31/12/2023 23:59:59','dd/MM/yyyy hh24:mi:ss')
                      AND VISITMAST.VSC_PTFLAG = 'N' 
                      AND VISITMAST.VSC_CANCEL IS NULL)
                      GROUP BY YEARS,DAYS 
                      ORDER BY YEARS`;
        try {
            const result = await conn_ora.execute(
                sql,
                {},
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT },
            )
            const yearCountFromOra = await result.resultSet?.getRows();
            yearCountFromOra && yearCountFromOra.map((value, index) => {
                pool.query(`INSERT INTO op_count_year (year,count,yearday) VALUES (?,?,?)`,
                    [
                        value.YEARS,
                        value.COUNT,
                        value.DAYS
                    ],
                    (error, result) => {
                        if (error)
                            throw error;
                    });
            })
            return callBack(null, result)
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

    getOpCountDeptDayWise: async (callBack) => {

        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        // const fromDate = data.from;
        // const toDate = data.to;

        const sql = `SELECT 
                           DAYS,
                           DP_CODE,
                           DPC_DESC,
                           SP_CODE, 
                           SPC_DESC,
                           COUNT(VS_NO) COUNT,
                           YEARS
                     FROM (
                     SELECT 
                            TO_CHAR(VISITDETL.VSD_DATE,'YYYY-MM-DD') DAYS,
                             DEPARTMENT.DP_CODE,
                             DEPARTMENT.DPC_DESC,
                             SPECIALITY.SP_CODE,
                             SPECIALITY.SPC_DESC,
                             VISITDETL.VS_NO,
                             TO_CHAR(VISITDETL.VSD_DATE,'YYYY')YEARS
                     FROM  
                           VISITDETL,VISITMAST,DOCTOR,SPECIALITY,DEPARTMENT   
                     WHERE 
                           VISITMAST.VS_NO= VISITDETL.VS_NO
                           AND DOCTOR.DO_CODE=VISITDETL.DO_CODE
                           AND SPECIALITY.SP_CODE=DOCTOR.SP_CODE
                           AND DEPARTMENT.DP_CODE=SPECIALITY.DP_CODE
                           AND VISITDETL.VSD_DATE >= TO_DATE  ('1/01/2014 00:00:00','dd/MM/yyyy hh24:mi:ss')
                           AND VISITDETL.VSD_DATE <= TO_DATE ('31/08/2015 23:59:59','dd/MM/yyyy hh24:mi:ss')
                           AND VISITMAST.VSC_PTFLAG = 'N' 
                           AND VISITDETL.VSC_CANCEL IS NULL) 
                           GROUP BY DAYS,DP_CODE,SP_CODE,DPC_DESC,SPC_DESC,YEARS
                           ORDER BY DAYS`;
        try {
            const result = await conn_ora.execute(
                sql,
                {},
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT },
            )
            const dayCountFromOra = await result.resultSet?.getRows();
            dayCountFromOra && dayCountFromOra.map((value, index) => {
                pool.query(`INSERT INTO op_count_dept_day(days,dp_code,dpc_desc,sp_code,spc_desc,year,count) VALUES (?,?,?,?,?,?,?)`,
                    [
                        value.DAYS,
                        value.DP_CODE,
                        value.DPC_DESC,
                        value.SP_CODE,
                        value.SPC_DESC,
                        value.YEARS,
                        value.COUNT
                    ],
                    (error, result) => {
                        if (error)
                            throw error;
                    });
            })
            return callBack(null, result)
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
    getOpCountDeptMonthWise: async (callBack) => {

        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        // const fromDate = data.from;
        // const toDate = data.to;

        const sql = `SELECT 
                           MONTHS,
                           DP_CODE,
                           DPC_DESC,
                           SP_CODE, 
                           SPC_DESC,
                           COUNT(VS_NO) COUNT,
                           YEARS
                     FROM (
                     SELECT 
                             CONCAT(TO_CHAR (VISITDETL.VSD_DATE,'YYYY-MM'),'-01')MONTHS,
                             DEPARTMENT.DP_CODE,
                             DEPARTMENT.DPC_DESC,
                             SPECIALITY.SP_CODE,
                             SPECIALITY.SPC_DESC,
                             VISITDETL.VS_NO,
                             TO_CHAR(VISITDETL.VSD_DATE,'YYYY')YEARS
                     FROM  
                           VISITDETL,VISITMAST,DOCTOR,SPECIALITY,DEPARTMENT   
                     WHERE 
                           VISITMAST.VS_NO= VISITDETL.VS_NO
                           AND DOCTOR.DO_CODE=VISITDETL.DO_CODE
                           AND SPECIALITY.SP_CODE=DOCTOR.SP_CODE
                           AND DEPARTMENT.DP_CODE=SPECIALITY.DP_CODE
                           AND VISITDETL.VSD_DATE >= TO_DATE  ('1/01/2014 00:00:00','dd/MM/yyyy hh24:mi:ss')
                           AND VISITDETL.VSD_DATE <= TO_DATE ('31/08/2023 23:59:59','dd/MM/yyyy hh24:mi:ss')
                           AND VISITMAST.VSC_PTFLAG = 'N' 
                           AND VISITDETL.VSC_CANCEL IS NULL) 
                           GROUP BY MONTHS,DP_CODE,SP_CODE,DPC_DESC,SPC_DESC,YEARS
                           ORDER BY MONTHS`;
        try {
            const result = await conn_ora.execute(
                sql,
                {},
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT },
            )
            const monthCountFromOra = await result.resultSet?.getRows();
            monthCountFromOra && monthCountFromOra.map((value, index) => {
                pool.query(`INSERT INTO op_count_dept_month(month, dp_code, dpc_desc, sp_code, spc_desc, year,count) VALUES 
                           (?,?,?,?,?,?,?)`,
                    [
                        value.MONTHS,
                        value.DP_CODE,
                        value.DPC_DESC,
                        value.SP_CODE,
                        value.SPC_DESC,
                        value.YEARS,
                        value.COUNT
                    ],
                    (error, result) => {
                        if (error)
                            throw error;
                    });
            })
            return callBack(null, result)
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

    getOpCountDeptYearWise: async (callBack) => {

        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        // const fromDate = data.from;
        // const toDate = data.to;

        const sql = `SELECT 
                           YEARS,
                           DP_CODE,
                           DPC_DESC,
                           SP_CODE, 
                           SPC_DESC,
                           COUNT(VS_NO) COUNT
                     FROM (
                     SELECT 
                             TO_CHAR(VISITDETL.VSD_DATE,'YYYY')YEARS,
                             DEPARTMENT.DP_CODE,
                             DEPARTMENT.DPC_DESC,
                             SPECIALITY.SP_CODE,
                             SPECIALITY.SPC_DESC,
                             VISITDETL.VS_NO
                     FROM  
                           VISITDETL,VISITMAST,DOCTOR,SPECIALITY,DEPARTMENT   
                     WHERE 
                           VISITMAST.VS_NO= VISITDETL.VS_NO
                           AND DOCTOR.DO_CODE=VISITDETL.DO_CODE
                           AND SPECIALITY.SP_CODE=DOCTOR.SP_CODE
                           AND DEPARTMENT.DP_CODE=SPECIALITY.DP_CODE
                           AND VISITDETL.VSD_DATE >= TO_DATE  ('1/01/2014 00:00:00','dd/MM/yyyy hh24:mi:ss')
                           AND VISITDETL.VSD_DATE <= TO_DATE ('31/08/2023 23:59:59','dd/MM/yyyy hh24:mi:ss')
                           AND VISITMAST.VSC_PTFLAG = 'N' 
                           AND VISITDETL.VSC_CANCEL IS NULL) 
                           GROUP BY YEARS,DP_CODE,SP_CODE,DPC_DESC,SPC_DESC
                           ORDER BY YEARS`;
        try {
            const result = await conn_ora.execute(
                sql,
                {},
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT },
            )
            const yearCountFromOra = await result.resultSet?.getRows();
            yearCountFromOra && yearCountFromOra.map((value, index) => {
                pool.query(`INSERT INTO op_count_dept_year(year, dp_code, dpc_desc, sp_code, spc_desc,count) VALUES 
                           (?,?,?,?,?,?)`,
                    [
                        value.YEARS,
                        value.DP_CODE,
                        value.DPC_DESC,
                        value.SP_CODE,
                        value.SPC_DESC,
                        value.COUNT
                    ],
                    (error, result) => {
                        if (error)
                            throw error;
                    });
            })
            return callBack(null, result)
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

    getOpDoctorDayWise: async (callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        const sql = `SELECT   
                           DAYS,
                           DO_CODE,
                           DOC_NAME,
                           COUNT(VS_NO) COUNT,
                           YEARS
                     FROM (
                     SELECT 
                           TO_CHAR(VISITMAST.VSD_DATE,'YYYY-MM-DD')DAYS,
                           DOCTOR.DO_CODE,
                           DOCTOR.DOC_NAME,
                           VISITMAST.VS_NO ,
                           TO_CHAR(VISITMAST.VSD_DATE,'YYYY')YEARS
                      FROM 
                           VISITMAST,VISITDETL,DOCTOR
                      WHERE
                           VISITDETL.VS_NO=VISITMAST.VS_NO
                       AND DOCTOR.DO_CODE=VISITDETL.DO_CODE
                       AND VISITMAST.VSD_DATE >= TO_DATE  ('1/01/2014 00:00:00','dd/MM/yyyy hh24:mi:ss')
                       AND VISITMAST.VSD_DATE <= TO_DATE ('10/01/2015 23:59:59','dd/MM/yyyy hh24:mi:ss')
                       AND VISITMAST.VSC_PTFLAG = 'N' 
                       AND VISITMAST.VSC_CANCEL IS NULL)
                       GROUP BY DAYS,DOC_NAME,DO_CODE,YEARS
                       ORDER BY DAYS`;
        try {
            const result = await conn_ora.execute(
                sql,
                {},
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT },
            )
            const dayCountFromOra = await result.resultSet?.getRows();
            dayCountFromOra && dayCountFromOra.map((value, index) => {
                pool.query(`INSERT INTO op_count_doctor_day (day, doc_code, doc_name, count, year) VALUES (?,?,?,?,?)`,
                    [
                        value.DAYS,
                        value.DO_CODE,
                        value.DOC_NAME,
                        value.COUNT,
                        value.YEARS
                    ],
                    (error, result) => {
                        if (error)
                            throw error;
                    });
            })
            return callBack(null, result)
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


    getOpDoctorMonthWise: async (callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        const sql = `SELECT   
                           MONTHS,
                           DO_CODE,
                           DOC_NAME,
                           COUNT(VS_NO) COUNT,
                           YEARS
                       FROM (
                       SELECT 
                           CONCAT(TO_CHAR (VISITMAST.VSD_DATE,'YYYY-MM'),'-01')MONTHS,
                           VISITMAST.VS_NO ,
                           DOCTOR.DO_CODE,
                           DOCTOR.DOC_NAME,
                           TO_CHAR(VISITMAST.VSD_DATE,'YYYY')YEARS
                       FROM 
                            VISITMAST,VISITDETL,DOCTOR
                       WHERE
                               VISITDETL.VS_NO=VISITMAST.VS_NO
                           AND DOCTOR.DO_CODE=VISITDETL.DO_CODE
                           AND VISITMAST.VSD_DATE >= TO_DATE  ('1/01/2014 00:00:00','dd/MM/yyyy hh24:mi:ss')
                           AND VISITMAST.VSD_DATE <= TO_DATE ('10/01/2020 23:59:59','dd/MM/yyyy hh24:mi:ss')
                           AND VISITMAST.VSC_PTFLAG = 'N' 
                           AND VISITMAST.VSC_CANCEL IS NULL)
                           GROUP BY MONTHS,DOC_NAME,DO_CODE,YEARS
                           ORDER BY MONTHS`;
        try {
            const result = await conn_ora.execute(
                sql,
                {},
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT },
            )
            const monthCountFromOra = await result.resultSet?.getRows();
            monthCountFromOra && monthCountFromOra.map((value, index) => {
                pool.query(`INSERT INTO op_count_doctor_month (month, doc_code, doc_name, count, year) VALUES (?,?,?,?,?)`,
                    [
                        value.MONTHS,
                        value.DO_CODE,
                        value.DOC_NAME,
                        value.COUNT,
                        value.YEARS
                    ],
                    (error, result) => {
                        if (error)
                            throw error;
                    });
            })
            return callBack(null, result)
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


    getOpDoctorYearWise: async (callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        const sql = `SELECT   
                           YEARS,
                           DO_CODE,
                           DOC_NAME,
                           COUNT(VS_NO) COUNT
                     FROM (
                     SELECT 
                           TO_CHAR(VISITMAST.VSD_DATE,'YYYY')YEARS,
                           DOCTOR.DO_CODE,
                           DOCTOR.DOC_NAME,
                           VISITMAST.VS_NO
                     FROM 
                           VISITMAST,VISITDETL,DOCTOR
                     WHERE
                           VISITDETL.VS_NO=VISITMAST.VS_NO
                       AND DOCTOR.DO_CODE=VISITDETL.DO_CODE
                       AND VISITMAST.VSD_DATE >= TO_DATE  ('1/01/2014 00:00:00','dd/MM/yyyy hh24:mi:ss')
                       AND VISITMAST.VSD_DATE <= TO_DATE ('31/01/2018 23:59:59','dd/MM/yyyy hh24:mi:ss')
                       AND VISITMAST.VSC_PTFLAG = 'N' 
                       AND VISITMAST.VSC_CANCEL IS NULL)
                       GROUP BY YEARS,DOC_NAME,DO_CODE
                       ORDER BY YEARS,DOC_NAME`;
        try {
            const result = await conn_ora.execute(
                sql,
                {},
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT },
            )
            const yearCountFromOra = await result.resultSet?.getRows();
            yearCountFromOra && yearCountFromOra.map((value, index) => {
                pool.query(`INSERT INTO op_count_doctor_year (year, doc_code, doc_name, count ) VALUES (?,?,?,?)`,
                    [
                        value.YEARS,
                        value.DO_CODE,
                        value.DOC_NAME,
                        value.COUNT
                    ],
                    (error, result) => {
                        if (error)
                            throw error;
                    });
            })
            return callBack(null, result)
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



    getOpGenderDayWise: async (callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        const sql = `SELECT
                          DAYS,
                          PTC_SEX,
                          COUNT(VS_NO) COUNT,
                          YEARS 
                    FROM (
                    SELECT 
                          TO_CHAR(VISITMAST.VSD_DATE,'YYYY-MM-DD')DAYS,
                          PATIENT.PTC_SEX,
                          VS_NO,
                          TO_CHAR(VISITMAST.VSD_DATE,'YYYY')YEARS
                    FROM  
                          VISITMAST,PATIENT 
                    WHERE 
                          PATIENT.PT_NO =VISITMAST.PT_NO
                          AND VISITMAST.VSD_DATE >= TO_DATE  ('1/01/2014 00:00:00','dd/MM/yyyy hh24:mi:ss')
                          AND VISITMAST.VSD_DATE <= TO_DATE ('31/01/2015 23:59:59','dd/MM/yyyy hh24:mi:ss')
                          AND VISITMAST.VSC_PTFLAG = 'N' 
                          AND VISITMAST.VSC_CANCEL IS NULL
                          AND PATIENT.PTC_SEX='F')
                    GROUP BY DAYS ,PTC_SEX, YEARS
                UNION ALL
                    SELECT
                          DAYS,
                          PTC_SEX,
                          COUNT(VS_NO) COUNT,
                          YEARS 
                    FROM (
                    SELECT 
                          TO_CHAR(VISITMAST.VSD_DATE,'YYYY-MM-DD')DAYS,
                          PATIENT.PTC_SEX,
                          VS_NO,
                         TO_CHAR(VISITMAST.VSD_DATE,'YYYY')YEARS 
                    FROM
                          VISITMAST,PATIENT 
                    WHERE 
                          PATIENT.PT_NO =VISITMAST.PT_NO
                          AND VISITMAST.VSD_DATE >= TO_DATE  ('1/01/2014 00:00:00','dd/MM/yyyy hh24:mi:ss')
                          AND VISITMAST.VSD_DATE <= TO_DATE ('31/01/2015 23:59:59','dd/MM/yyyy hh24:mi:ss')
                          AND VISITMAST.VSC_PTFLAG = 'N' 
                          AND VISITMAST.VSC_CANCEL IS NULL
                          AND PATIENT.PTC_SEX='M')
                    GROUP BY DAYS ,PTC_SEX, YEARS
                    ORDER BY DAYS`;
        try {
            const result = await conn_ora.execute(
                sql,
                {},
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT },
            )
            const dayCountFromOra = await result.resultSet?.getRows();
            dayCountFromOra && dayCountFromOra.map((value, index) => {
                pool.query(`INSERT INTO op_count_gender_day (day, ptc_sex, count, year) VALUES (?,?,?,?)`,
                    [
                        value.DAYS,
                        value.PTC_SEX,
                        value.COUNT,
                        value.YEARS
                    ],
                    (error, result) => {
                        if (error)
                            throw error;
                    });
            })
            return callBack(null, result)
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



    getOpGenderMonthWise: async (callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        const sql = `SELECT
                           MONTHS,
                           PTC_SEX,
                           COUNT(VS_NO) COUNT,
                           YEARS 
                     FROM (
                     SELECT 
                          CONCAT(TO_CHAR (VISITMAST.VSD_DATE,'YYYY-MM'),'-01')MONTHS,
                           PATIENT.PTC_SEX,
                           VS_NO,
                           TO_CHAR(VISITMAST.VSD_DATE,'YYYY')YEARS
                     FROM  
                           VISITMAST,PATIENT 
                     WHERE 
                           PATIENT.PT_NO =VISITMAST.PT_NO
                           AND VISITMAST.VSD_DATE >= TO_DATE  ('1/01/2014 00:00:00','dd/MM/yyyy hh24:mi:ss')
                           AND VISITMAST.VSD_DATE <= TO_DATE ('31/01/2015 23:59:59','dd/MM/yyyy hh24:mi:ss')
                           AND VISITMAST.VSC_PTFLAG = 'N' 
                           AND VISITMAST.VSC_CANCEL IS NULL
                           AND PATIENT.PTC_SEX='F')
                     GROUP BY MONTHS ,PTC_SEX, YEARS
                   UNION ALL
                     SELECT
                           MONTHS,
                           PTC_SEX,
                           COUNT(VS_NO) COUNT,
                           YEARS 
                     FROM (
                     SELECT 
                           CONCAT(TO_CHAR (VISITMAST.VSD_DATE,'YYYY-MM'),'-01')MONTHS,
                           PATIENT.PTC_SEX,
                           VS_NO,
                          TO_CHAR(VISITMAST.VSD_DATE,'YYYY')YEARS 
                     FROM
                           VISITMAST,PATIENT 
                     WHERE 
                           PATIENT.PT_NO =VISITMAST.PT_NO
                           AND VISITMAST.VSD_DATE >= TO_DATE  ('1/01/2014 00:00:00','dd/MM/yyyy hh24:mi:ss')
                           AND VISITMAST.VSD_DATE <= TO_DATE ('31/01/2015 23:59:59','dd/MM/yyyy hh24:mi:ss')
                           AND VISITMAST.VSC_PTFLAG = 'N' 
                           AND VISITMAST.VSC_CANCEL IS NULL
                           AND PATIENT.PTC_SEX='M')
                     GROUP BY MONTHS,PTC_SEX,YEARS
                     ORDER BY MONTHS`;
        try {
            const result = await conn_ora.execute(
                sql,
                {},
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT },
            )
            const monthCountFromOra = await result.resultSet?.getRows();
            monthCountFromOra && monthCountFromOra.map((value, index) => {
                pool.query(`INSERT INTO op_count_gender_month (month, ptc_sex, count, year) VALUES (?,?,?,?)`,
                    [
                        value.MONTHS,
                        value.PTC_SEX,
                        value.COUNT,
                        value.YEARS
                    ],
                    (error, result) => {
                        if (error)
                            throw error;
                    });
            })
            return callBack(null, result)
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
    getOpGenderYearWise: async (callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        const sql = `SELECT
                           YEARS,
                           PTC_SEX,
                           COUNT(VS_NO) COUNT
                     FROM (
                     SELECT 
                           TO_CHAR(VISITMAST.VSD_DATE,'YYYY')YEARS,
                           PATIENT.PTC_SEX,
                           VS_NO
                     FROM  
                           VISITMAST,PATIENT 
                     WHERE 
                           PATIENT.PT_NO =VISITMAST.PT_NO
                           AND VISITMAST.VSD_DATE >= TO_DATE  ('1/01/2014 00:00:00','dd/MM/yyyy hh24:mi:ss')
                           AND VISITMAST.VSD_DATE <= TO_DATE ('31/01/2018 23:59:59','dd/MM/yyyy hh24:mi:ss')
                           AND VISITMAST.VSC_PTFLAG = 'N' 
                           AND VISITMAST.VSC_CANCEL IS NULL
                           AND PATIENT.PTC_SEX='F')
                        GROUP BY PTC_SEX, YEARS
                   UNION ALL
                     SELECT
                           YEARS,
                           PTC_SEX,
                           COUNT(VS_NO) COUNT
                     FROM (
                     SELECT 
                           TO_CHAR(VISITMAST.VSD_DATE,'YYYY')YEARS ,
                           PATIENT.PTC_SEX,
                           VS_NO
                     FROM
                           VISITMAST,PATIENT 
                       WHERE 
                           PATIENT.PT_NO =VISITMAST.PT_NO
                           AND VISITMAST.VSD_DATE >= TO_DATE  ('1/01/2014 00:00:00','dd/MM/yyyy hh24:mi:ss')
                           AND VISITMAST.VSD_DATE <= TO_DATE ('31/01/2018 23:59:59','dd/MM/yyyy hh24:mi:ss')
                           AND VISITMAST.VSC_PTFLAG = 'N' 
                           AND VISITMAST.VSC_CANCEL IS NULL
                           AND PATIENT.PTC_SEX='M')
                        GROUP BY PTC_SEX,YEARS
                        ORDER BY YEARS`;
        try {
            const result = await conn_ora.execute(
                sql,
                {},
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT },
            )
            const yearCountFromOra = await result.resultSet?.getRows();

            yearCountFromOra && yearCountFromOra.map((value, index) => {
                pool.query(`INSERT INTO op_count_gender_year (year, ptc_sex, count) VALUES (?,?,?)`,
                    [
                        value.YEARS,
                        value.PTC_SEX,
                        value.COUNT
                    ],
                    (error, result) => {
                        if (error)
                            throw error;
                    });
            })
            return callBack(null, result)
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


    getOpRegionDayWise: async (callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        const sql = ` SELECT         
                           DAYS,
                           RG_CODE,
                           RGC_DESC,
                           COUNT(VS_NO) COUNT,
                           YEARS
                       FROM (
                       SELECT 
                           TO_CHAR(VISITMAST.VSD_DATE,'YYYY-MM-DD')DAYS,
                           REGION.RG_CODE,
                           REGION.RGC_DESC,
                           VS_NO,
                           TO_CHAR(VISITMAST.VSD_DATE,'YYYY')YEARS
                       FROM 
                           VISITMAST,PATIENT,REGION 
                       WHERE
                              PATIENT.PT_NO =VISITMAST.PT_NO
                          AND REGION.RG_CODE=PATIENT.RG_CODE
                          AND VISITMAST.VSD_DATE >= TO_DATE('1/01/2014 00:00:00','dd/MM/yyyy hh24:mi:ss')
                          AND VISITMAST.VSD_DATE <= TO_DATE('31/08/2015 23:59:59','dd/MM/yyyy hh24:mi:ss')
                          AND VISITMAST.VSC_PTFLAG = 'N' 
                          AND VISITMAST.VSC_CANCEL IS NULL)      
                        GROUP BY DAYS,RGC_DESC,RG_CODE,YEARS
                        ORDER BY DAYS,RGC_DESC`;
        try {
            const result = await conn_ora.execute(
                sql,
                {},
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT },
            )
            const dayCountFromOra = await result.resultSet?.getRows();
            dayCountFromOra && dayCountFromOra.map((value, index) => {
                pool.query(`INSERT INTO op_count_region_day (day, rg_code, rgc_desc, count, year) VALUES (?,?,?,?,?)`,
                    [
                        value.DAYS,
                        value.RG_CODE,
                        value.RGC_DESC,
                        value.COUNT,
                        value.YEARS
                    ],
                    (error, result) => {
                        if (error)
                            throw error;
                    });
            })
            return callBack(null, result)
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

    getOpRegionMonthWise: async (callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        const sql = ` SELECT         
                           MONTHS,
                           RG_CODE,
                           RGC_DESC,
                           COUNT(VS_NO) COUNT,
                           YEARS
                       FROM (
                       SELECT 
                           CONCAT(TO_CHAR (VISITMAST.VSD_DATE,'YYYY-MM'),'-01')MONTHS,
                           REGION.RG_CODE,
                           REGION.RGC_DESC,
                           VS_NO,
                           TO_CHAR(VISITMAST.VSD_DATE,'YYYY')YEARS
                       FROM 
                           VISITMAST,PATIENT,REGION 
                       WHERE
                              PATIENT.PT_NO =VISITMAST.PT_NO
                          AND REGION.RG_CODE=PATIENT.RG_CODE
                          AND VISITMAST.VSD_DATE >= TO_DATE('1/01/2014 00:00:00','dd/MM/yyyy hh24:mi:ss')
                          AND VISITMAST.VSD_DATE <= TO_DATE('31/08/2016 23:59:59','dd/MM/yyyy hh24:mi:ss')
                          AND VISITMAST.VSC_PTFLAG = 'N' 
                          AND VISITMAST.VSC_CANCEL IS NULL)      
                        GROUP BY MONTHS,RGC_DESC,RG_CODE,YEARS
                        ORDER BY MONTHS,RGC_DESC`;
        try {
            const result = await conn_ora.execute(
                sql,
                {},
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT },
            )
            const monthCountFromOra = await result.resultSet?.getRows();
            monthCountFromOra && monthCountFromOra.map((value, index) => {
                pool.query(`INSERT INTO op_count_region_month (month, rg_code, rgc_desc, count, year) VALUES (?,?,?,?,?)`,
                    [
                        value.MONTHS,
                        value.RG_CODE,
                        value.RGC_DESC,
                        value.COUNT,
                        value.YEARS
                    ],
                    (error, result) => {
                        if (error)
                            throw error;
                    });
            })
            return callBack(null, result)
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


    getOpRegionYearWise: async (callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        const sql = ` SELECT         
                           YEARS,
                           RG_CODE,
                           RGC_DESC,
                           COUNT(VS_NO) COUNT
                       FROM (
                       SELECT 
                           TO_CHAR(VISITMAST.VSD_DATE,'YYYY')YEARS,
                           REGION.RG_CODE,
                           REGION.RGC_DESC,
                           VS_NO   
                       FROM 
                           VISITMAST,PATIENT,REGION 
                       WHERE
                              PATIENT.PT_NO =VISITMAST.PT_NO
                          AND REGION.RG_CODE=PATIENT.RG_CODE
                          AND VISITMAST.VSD_DATE >= TO_DATE('1/01/2014 00:00:00','dd/MM/yyyy hh24:mi:ss')
                          AND VISITMAST.VSD_DATE <= TO_DATE('31/08/2015 23:59:59','dd/MM/yyyy hh24:mi:ss')
                          AND VISITMAST.VSC_PTFLAG = 'N' 
                          AND VISITMAST.VSC_CANCEL IS NULL)      
                        GROUP BY YEARS,RGC_DESC,RG_CODE
                        ORDER BY YEARS,RGC_DESC`;
        try {
            const result = await conn_ora.execute(
                sql,
                {},
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT },
            )
            const yearCountFromOra = await result.resultSet?.getRows();
            yearCountFromOra && yearCountFromOra.map((value, index) => {
                pool.query(`INSERT INTO op_count_region_year (year, rg_code, rgc_desc, count) VALUES (?,?,?,?)`,
                    [
                        value.YEARS,
                        value.RG_CODE,
                        value.RGC_DESC,
                        value.COUNT,
                    ],
                    (error, result) => {
                        if (error)
                            throw error;
                    });
            })
            return callBack(null, result)
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