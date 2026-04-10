const {pools} = require("../../config/mysqldbconfig");
const {getTmcConnection, oracledb} = require("../../config/oradbconfig");
module.exports = {
  getIpCountDayWise: async (callBack) => {
    let conn_ora = await getTmcConnection();
    const sql = ` SELECT 
                            DAYS,
                            COUNT(IP_NO) COUNT,
                            YEARS
                     FROM (     
                     SELECT 
                           TO_CHAR(IPD_DATE , 'YYYY-MM-DD')DAYS,
                           IP_NO,
                           TO_CHAR(IPD_DATE , 'YYYY')YEARS
                     FROM 
                           IPADMISS 
                     WHERE 
                           IPADMISS.IPD_DATE >= TO_DATE ('1/01/2014 00:00:00','dd/MM/yyyy hh24:mi:ss')
                       AND IPADMISS.IPD_DATE <= TO_DATE ('31/08/2023 23:59:59','dd/MM/yyyy hh24:mi:ss')
                       AND IPADMISS.IPC_PTFLAG = 'N' )
                    GROUP BY DAYS,YEARS
                    ORDER BY DAYS`;
    try {
      const result = await conn_ora.execute(sql, {}, {outFormat: oracledb.OUT_FORMAT_OBJECT});
      const dayCountFromOra = result.rows;
      dayCountFromOra &&
        dayCountFromOra.map((value, index) => {
          pool.query(`INSERT INTO ip_count_day (day, count,year) VALUES (?,?,?)`, [value.DAYS, value.COUNT, value.YEARS], (error, result) => {
            if (error) throw error;
          });
        });
      return callBack(null, result);
    } catch (error) {
      return callBack(error);
    } finally {
      await conn_ora.close();
    }
  },

  getIpCountMonthWise: async (callBack) => {
    let conn_ora = await getTmcConnection();
    const sql = ` SELECT 
                            MONTHS, 
                            COUNT(IP_NO)COUNT,
                            YEARS 
                       FROM (
                       SELECT 
                            CONCAT(TO_CHAR (IPD_DATE,'YYYY-MM'),'-01')MONTHS,
                            TO_CHAR(IPD_DATE,'YYYY')YEARS,
                            IP_NO 
                       FROM 
                           IPADMISS 
                       WHERE
                            IPADMISS.IPD_DATE >= TO_DATE ('01/01/2014 00:00:00','dd/MM/yyyy hh24:mi:ss')
                        AND IPADMISS.IPD_DATE <= TO_DATE ('31/12/2023 23:59:59','dd/MM/yyyy hh24:mi:ss')
                        AND IPADMISS.IPC_PTFLAG = 'N')
                        GROUP BY MONTHS,YEARS  
                        ORDER BY MONTHS`;
    try {
      const result = await conn_ora.execute(sql, {}, {outFormat: oracledb.OUT_FORMAT_OBJECT});
      const monthCountFromOra = result.rows;
      monthCountFromOra &&
        monthCountFromOra.map((value, index) => {
          pool.query(`INSERT INTO ip_count_month (month, count, year) VALUES (?,?,?)`, [value.MONTHS, value.COUNT, value.YEARS], (error, result) => {
            if (error) throw error;
          });
        });
      return callBack(null, result);
    } catch (error) {
      return callBack(error);
    } finally {
      await conn_ora.close();
    }
  },

  getIpCountYearWise: async (callBack) => {
    let conn_ora = await getTmcConnection();
    const sql = `SELECT 
                          YEARS,
                          COUNT(IP_NO) COUNT,
                          DAYS
                     FROM (     
                     SELECT 
                          TO_CHAR(IPD_DATE , 'YYYY') YEARS,
                          IP_NO,
                          CONCAT(TO_CHAR (IPD_DATE,'YYYY'),'-01-01')DAYS
                     FROM 
                          IPADMISS 
                     WHERE 
                            IPADMISS.IPD_DATE >= TO_DATE  ('1/01/2014 00:00:00','dd/MM/yyyy hh24:mi:ss')
                        AND IPADMISS.IPD_DATE <= TO_DATE ('31/08/2023 23:59:59','dd/MM/yyyy hh24:mi:ss')
                        AND IPADMISS.IPC_PTFLAG = 'N' )
                        GROUP BY YEARS,DAYS  
                        ORDER BY YEARS`;
    try {
      const result = await conn_ora.execute(sql, {}, {outFormat: oracledb.OUT_FORMAT_OBJECT});
      const yearCountFromOra = result.rows;
      yearCountFromOra &&
        yearCountFromOra.map((value, index) => {
          pool.query(`INSERT INTO ip_count_year (year, count,yearday) VALUES (?,?,?)`, [value.YEARS, value.COUNT, value.DAYS], (error, result) => {
            if (error) throw error;
          });
        });
      return callBack(null, result);
    } catch (error) {
      return callBack(error);
    } finally {
      await conn_ora.close();
    }
  },

  getIpCountDeptDayWise: async (callBack) => {
    let conn_ora = await getTmcConnection();

    const sql = `SELECT 
                           DAYS,
                           DP_CODE,
                           DPC_DESC,
                           SP_CODE, 
                           SPC_DESC,
                           COUNT(IP_NO)COUNT,
                           YEARS
                     FROM (
                     SELECT 
                           TO_CHAR(IPD_DATE ,'YYYY-MM-DD') DAYS,
                           DEPARTMENT.DP_CODE,
                           DEPARTMENT.DPC_DESC,
                           SPECIALITY.SP_CODE,
                           SPECIALITY.SPC_DESC,
                           IPADMISS.IP_NO,
                           TO_CHAR(IPD_DATE,'YYYY')YEARS
                     FROM  
                           IPADMISS,DOCTOR,SPECIALITY,DEPARTMENT 
                     WHERE 
                           DOCTOR.DO_CODE=IPADMISS.DO_CODE
                           AND SPECIALITY.SP_CODE=DOCTOR.SP_CODE
                           AND DEPARTMENT.DP_CODE=SPECIALITY.DP_CODE
                           AND IPADMISS.IPD_DATE >= TO_DATE ('1/01/2014 00:00:00','dd/MM/yyyy hh24:mi:ss')
                           AND IPADMISS.IPD_DATE <= TO_DATE ('31/08/2015 23:59:59','dd/MM/yyyy hh24:mi:ss')
                           AND IPADMISS.IPC_PTFLAG = 'N' )
                       GROUP BY DAYS,DP_CODE,SP_CODE,DPC_DESC,SPC_DESC,YEARS
                       ORDER BY DAYS`;
    try {
      const result = await conn_ora.execute(sql, {}, {outFormat: oracledb.OUT_FORMAT_OBJECT});
      const dayCountFromOra = result.rows;
      dayCountFromOra &&
        dayCountFromOra.map((value, index) => {
          pool.query(
            `INSERT INTO ip_count_dept_day(days, dp_code, dpc_desc, sp_code, spc_desc, year,count) VALUES 
                           (?,?,?,?,?,?,?)`,
            [value.DAYS, value.DP_CODE, value.DPC_DESC, value.SP_CODE, value.SPC_DESC, value.YEARS, value.COUNT],
            (error, result) => {
              if (error) throw error;
            },
          );
        });
      return callBack(null, result);
    } catch (error) {
      return callBack(error);
    } finally {
      await conn_ora.close();
    }
  },

  getIpCountDeptMonthWise: async (callBack) => {
    let conn_ora = await getTmcConnection();

    const sql = `SELECT 
                           MONTHS,
                           DP_CODE,
                           DPC_DESC,
                           SP_CODE, 
                           SPC_DESC,
                           COUNT(IP_NO)COUNT,
                           YEARS
                     FROM (
                     SELECT 
                           CONCAT(TO_CHAR (IPD_DATE,'YYYY-MM'),'-01')MONTHS,
                           DEPARTMENT.DP_CODE,
                           DEPARTMENT.DPC_DESC,
                           SPECIALITY.SP_CODE,
                           SPECIALITY.SPC_DESC,
                           IPADMISS.IP_NO,
                           TO_CHAR(IPD_DATE,'YYYY')YEARS
                     FROM  
                           IPADMISS,DOCTOR,SPECIALITY,DEPARTMENT 
                     WHERE 
                           DOCTOR.DO_CODE=IPADMISS.DO_CODE
                           AND SPECIALITY.SP_CODE=DOCTOR.SP_CODE
                           AND DEPARTMENT.DP_CODE=SPECIALITY.DP_CODE
                           AND IPADMISS.IPD_DATE >= TO_DATE ('1/01/2014 00:00:00','dd/MM/yyyy hh24:mi:ss')
                           AND IPADMISS.IPD_DATE <= TO_DATE ('31/08/2015 23:59:59','dd/MM/yyyy hh24:mi:ss')
                           AND IPADMISS.IPC_PTFLAG = 'N')
                       GROUP BY MONTHS,DP_CODE,SP_CODE,DPC_DESC,SPC_DESC,YEARS
                       ORDER BY MONTHS `;
    try {
      const result = await conn_ora.execute(sql, {}, {outFormat: oracledb.OUT_FORMAT_OBJECT});
      const monthCountFromOra = result.rows;
      monthCountFromOra &&
        monthCountFromOra.map((value, index) => {
          pool.query(
            `INSERT INTO ip_count_dept_month(month, dp_code, dpc_desc, sp_code, spc_desc, year, count) VALUES 
                           (?,?,?,?,?,?,?)`,
            [value.MONTHS, value.DP_CODE, value.DPC_DESC, value.SP_CODE, value.SPC_DESC, value.YEARS, value.COUNT],
            (error, result) => {
              if (error) throw error;
            },
          );
        });
      return callBack(null, result);
    } catch (error) {
      return callBack(error);
    } finally {
      await conn_ora.close();
    }
  },

  getIpCountDepYearWise: async (callBack) => {
    let conn_ora = await getTmcConnection();

    const sql = `SELECT 
                           YEARS,
                           DP_CODE,
                           DPC_DESC,
                           SP_CODE, 
                           SPC_DESC,
                           COUNT(IP_NO)COUNT
                     FROM (
                     SELECT 
                          TO_CHAR(IPD_DATE,'YYYY')YEARS,
                           DEPARTMENT.DP_CODE,
                           DEPARTMENT.DPC_DESC,
                           SPECIALITY.SP_CODE,
                           SPECIALITY.SPC_DESC,
                           IPADMISS.IP_NO
                     FROM  
                           IPADMISS,DOCTOR,SPECIALITY,DEPARTMENT 
                     WHERE 
                           DOCTOR.DO_CODE=IPADMISS.DO_CODE
                           AND SPECIALITY.SP_CODE=DOCTOR.SP_CODE
                           AND DEPARTMENT.DP_CODE=SPECIALITY.DP_CODE
                           AND IPADMISS.IPD_DATE >= TO_DATE ('1/01/2014 00:00:00','dd/MM/yyyy hh24:mi:ss')
                           AND IPADMISS.IPD_DATE <= TO_DATE ('31/08/2015 23:59:59','dd/MM/yyyy hh24:mi:ss')
                           AND IPADMISS.IPC_PTFLAG = 'N' )
                       GROUP BY DP_CODE,SP_CODE,DPC_DESC,SPC_DESC,YEARS
                       ORDER BY YEARS `;
    try {
      const result = await conn_ora.execute(sql, {}, {outFormat: oracledb.OUT_FORMAT_OBJECT});
      const yearCountFromOra = result.rows;
      yearCountFromOra &&
        yearCountFromOra.map((value, index) => {
          pool.query(
            `INSERT INTO ip_count_dept_year(year, dp_code, dpc_desc, sp_code, spc_desc,count) VALUES 
                           (?,?,?,?,?,?)`,
            [value.YEARS, value.DP_CODE, value.DPC_DESC, value.SP_CODE, value.SPC_DESC, value.COUNT],
            (error, result) => {
              if (error) throw error;
            },
          );
        });
      return callBack(null, result);
    } catch (error) {
      return callBack(error);
    } finally {
      await conn_ora.close();
    }
  },

  getIpDoctorDayWise: async (callBack) => {
    let conn_ora = await getTmcConnection();
    const sql = `SELECT   
                           DAYS,
                           DO_CODE,
                           DOC_NAME,
                           COUNT(IP_NO) COUNT,
                           YEARS
                     FROM (
                     SELECT 
                           TO_CHAR(IPD_DATE ,'YYYY-MM-DD') DAYS,
                           DOCTOR.DO_CODE, 
                           DOCTOR.DOC_NAME,
                           IP_NO,
                           TO_CHAR(IPD_DATE,'YYYY')YEARS
                      FROM 
                           IPADMISS,DOCTOR 
                      WHERE
                               DOCTOR.DO_CODE=IPADMISS.DO_CODE
                           AND IPADMISS.IPD_DATE >= TO_DATE ('1/01/2014 00:00:00','dd/MM/yyyy hh24:mi:ss')
                           AND IPADMISS.IPD_DATE <= TO_DATE ('31/01/2015 23:59:59','dd/MM/yyyy hh24:mi:ss')
                           AND IPADMISS.IPC_PTFLAG = 'N' )
                       GROUP BY DAYS,DOC_NAME,DO_CODE,YEARS 
                       ORDER BY DAYS `;
    try {
      const result = await conn_ora.execute(sql, {}, {outFormat: oracledb.OUT_FORMAT_OBJECT});
      const dayCountFromOra = result.rows;
      dayCountFromOra &&
        dayCountFromOra.map((value, index) => {
          pool.query(
            `INSERT INTO ip_count_doctor_day (day, doc_code, doc_name, count, year) VALUES (?,?,?,?,?)`,
            [value.DAYS, value.DO_CODE, value.DOC_NAME, value.COUNT, value.YEARS],
            (error, result) => {
              if (error) throw error;
            },
          );
        });
      return callBack(null, result);
    } catch (error) {
      return callBack(error);
    } finally {
      await conn_ora.close();
    }
  },

  getIpDoctorMonthWise: async (callBack) => {
    let conn_ora = await getTmcConnection();
    const sql = `SELECT   
                           MONTHS,
                           DO_CODE,
                           DOC_NAME,
                           COUNT(IP_NO)COUNT,
                           YEARS
                     FROM (
                     SELECT 
                           CONCAT(TO_CHAR (IPD_DATE,'YYYY-MM'),'-01')MONTHS,
                           DOCTOR.DO_CODE, 
                           DOCTOR.DOC_NAME,
                           IP_NO,
                           TO_CHAR(IPD_DATE,'YYYY')YEARS
                      FROM 
                           IPADMISS,DOCTOR 
                      WHERE
                               DOCTOR.DO_CODE=IPADMISS.DO_CODE
                           AND IPADMISS.IPD_DATE >= TO_DATE ('1/01/2014 00:00:00','dd/MM/yyyy hh24:mi:ss')
                           AND IPADMISS.IPD_DATE <= TO_DATE ('31/01/2015 23:59:59','dd/MM/yyyy hh24:mi:ss')
                           AND IPADMISS.IPC_PTFLAG = 'N' )
                       GROUP BY MONTHS,DOC_NAME,DO_CODE,YEARS 
                       ORDER BY MONTHS `;
    try {
      const result = await conn_ora.execute(sql, {}, {outFormat: oracledb.OUT_FORMAT_OBJECT});
      const monthCountFromOra = result.rows;
      monthCountFromOra &&
        monthCountFromOra.map((value, index) => {
          pool.query(
            `INSERT INTO ip_count_doctor_month (month, doc_code, doc_name, count, year) VALUES (?,?,?,?,?)`,
            [value.MONTHS, value.DO_CODE, value.DOC_NAME, value.COUNT, value.YEARS],
            (error, result) => {
              if (error) throw error;
            },
          );
        });
      return callBack(null, result);
    } catch (error) {
      return callBack(error);
    } finally {
      await conn_ora.close();
    }
  },

  getIpDoctorYearWise: async (callBack) => {
    let conn_ora = await getTmcConnection();
    const sql = `SELECT   
                           YEARS,
                           DO_CODE,
                           DOC_NAME,
                           COUNT(IP_NO) COUNT
                     FROM (
                     SELECT 
                           TO_CHAR(IPD_DATE,'YYYY')YEARS,
                           DOCTOR.DO_CODE, 
                           DOCTOR.DOC_NAME,
                           IP_NO    
                      FROM 
                           IPADMISS,DOCTOR 
                      WHERE
                               DOCTOR.DO_CODE=IPADMISS.DO_CODE
                           AND IPADMISS.IPD_DATE >= TO_DATE ('1/01/2014 00:00:00','dd/MM/yyyy hh24:mi:ss')
                           AND IPADMISS.IPD_DATE <= TO_DATE ('31/01/2015 23:59:59','dd/MM/yyyy hh24:mi:ss')
                           AND IPADMISS.IPC_PTFLAG = 'N' )
                       GROUP BY DOC_NAME,DO_CODE,YEARS 
                       ORDER BY YEARS `;
    try {
      const result = await conn_ora.execute(sql, {}, {outFormat: oracledb.OUT_FORMAT_OBJECT});
      const yearCountFromOra = result.rows;
      yearCountFromOra &&
        yearCountFromOra.map((value, index) => {
          pool.query(`INSERT INTO ip_count_doctor_year (year, doc_code, doc_name, count) VALUES (?,?,?,?)`, [value.YEARS, value.DO_CODE, value.DOC_NAME, value.COUNT], (error, result) => {
            if (error) throw error;
          });
        });
      return callBack(null, result);
    } catch (error) {
      return callBack(error);
    } finally {
      await conn_ora.close();
    }
  },

  getIpGenderDayWise: async (callBack) => {
    let conn_ora = await getTmcConnection();
    const sql = `SELECT 
                          DAYS,
                          PTC_SEX,
                          COUNT(IP_NO) COUNT,
                          YEARS
                    FROM (     
                    SELECT 
                          TO_CHAR(IPD_DATE ,'YYYY-MM-DD') DAYS,
                          PTC_SEX,
                          IP_NO,
                          TO_CHAR(IPD_DATE ,'YYYY')YEARS
                      FROM 
                            IPADMISS 
                      WHERE 
                            IPADMISS.IPD_DATE >= TO_DATE  ('1/01/2014 00:00:00','dd/MM/yyyy hh24:mi:ss')
                        AND IPADMISS.IPD_DATE <= TO_DATE ('31/08/2015 23:59:59','dd/MM/yyyy hh24:mi:ss')
                        AND IPADMISS.IPC_PTFLAG = 'N' 
                        AND PTC_SEX='F')
                      GROUP BY DAYS,PTC_SEX,YEARS
                   UNION ALL
                       SELECT 
                          DAYS,
                          PTC_SEX,
                          COUNT(IP_NO) COUNT,
                          YEARS
                    FROM (     
                    SELECT 
                          TO_CHAR(IPD_DATE ,'YYYY-MM-DD') DAYS,
                          PTC_SEX,
                          IP_NO,
                          TO_CHAR(IPD_DATE ,'YYYY')YEARS
                      FROM 
                            IPADMISS 
                      WHERE 
                            IPADMISS.IPD_DATE >= TO_DATE  ('1/01/2014 00:00:00','dd/MM/yyyy hh24:mi:ss')
                        AND IPADMISS.IPD_DATE <= TO_DATE ('31/08/2015 23:59:59','dd/MM/yyyy hh24:mi:ss')
                        AND IPADMISS.IPC_PTFLAG = 'N' 
                        AND PTC_SEX='M')
                      GROUP BY DAYS,PTC_SEX,YEARS
                      ORDER BY DAYS`;
    try {
      const result = await conn_ora.execute(sql, {}, {outFormat: oracledb.OUT_FORMAT_OBJECT});
      const dayCountFromOra = result.rows;
      dayCountFromOra &&
        dayCountFromOra.map((value, index) => {
          pool.query(`INSERT INTO ip_count_gender_day (day, ptc_sex, count, year) VALUES (?,?,?,?)`, [value.DAYS, value.PTC_SEX, value.COUNT, value.YEARS], (error, result) => {
            if (error) throw error;
          });
        });
      return callBack(null, result);
    } catch (error) {
      return callBack(error);
    } finally {
      await conn_ora.close();
    }
  },

  getIpGenderMonthWise: async (callBack) => {
    let conn_ora = await getTmcConnection();
    const sql = `SELECT 
                          MONTHS,
                          PTC_SEX,
                          COUNT(IP_NO) COUNT,
                          YEARS
                    FROM (     
                    SELECT 
                          CONCAT(TO_CHAR (IPD_DATE,'YYYY-MM'),'-01')MONTHS,
                          PTC_SEX,
                          IP_NO,
                          TO_CHAR(IPD_DATE ,'YYYY')YEARS
                      FROM 
                            IPADMISS 
                      WHERE 
                            IPADMISS.IPD_DATE >= TO_DATE  ('1/01/2014 00:00:00','dd/MM/yyyy hh24:mi:ss')
                        AND IPADMISS.IPD_DATE <= TO_DATE ('31/08/2015 23:59:59','dd/MM/yyyy hh24:mi:ss')
                        AND IPADMISS.IPC_PTFLAG = 'N' 
                        AND PTC_SEX='F')
                      GROUP BY MONTHS,PTC_SEX,YEARS
                   UNION ALL
                       SELECT 
                       MONTHS,
                          PTC_SEX,
                          COUNT(IP_NO) COUNT,
                          YEARS
                    FROM (     
                    SELECT 
                          CONCAT(TO_CHAR (IPD_DATE,'YYYY-MM'),'-01')MONTHS,
                          PTC_SEX,
                          IP_NO,
                          TO_CHAR(IPD_DATE ,'YYYY')YEARS
                      FROM 
                            IPADMISS 
                      WHERE 
                            IPADMISS.IPD_DATE >= TO_DATE  ('1/01/2014 00:00:00','dd/MM/yyyy hh24:mi:ss')
                        AND IPADMISS.IPD_DATE <= TO_DATE ('31/08/2015 23:59:59','dd/MM/yyyy hh24:mi:ss')
                        AND IPADMISS.IPC_PTFLAG = 'N' 
                        AND PTC_SEX='M')
                      GROUP BY MONTHS,PTC_SEX,YEARS
                      ORDER BY MONTHS`;
    try {
      const result = await conn_ora.execute(sql, {}, {outFormat: oracledb.OUT_FORMAT_OBJECT});
      const monthCountFromOra = result.rows;
      monthCountFromOra &&
        monthCountFromOra.map((value, index) => {
          pool.query(`INSERT INTO ip_count_gender_month (months, ptc_sex, count, year) VALUES (?,?,?,?)`, [value.MONTHS, value.PTC_SEX, value.COUNT, value.YEARS], (error, result) => {
            if (error) throw error;
          });
        });
      return callBack(null, result);
    } catch (error) {
      return callBack(error);
    } finally {
      await conn_ora.close();
    }
  },

  getIpGenderYearWise: async (callBack) => {
    let conn_ora = await getTmcConnection();
    const sql = `SELECT 
                          YEARS,
                          PTC_SEX,
                          COUNT(IP_NO) COUNT
                    FROM (     
                    SELECT 
                          TO_CHAR(IPD_DATE ,'YYYY')YEARS
                          PTC_SEX,
                          IP_NO,
                      FROM 
                          IPADMISS 
                      WHERE 
                            IPADMISS.IPD_DATE >= TO_DATE  ('1/01/2014 00:00:00','dd/MM/yyyy hh24:mi:ss')
                        AND IPADMISS.IPD_DATE <= TO_DATE ('31/08/2015 23:59:59','dd/MM/yyyy hh24:mi:ss')
                        AND IPADMISS.IPC_PTFLAG = 'N' 
                        AND PTC_SEX='F')
                      GROUP BY YEARS,PTC_SEX
                   UNION ALL
                     SELECT 
                           YEARS,
                           PTC_SEX,
                           COUNT(IP_NO) COUNT
                    FROM (     
                    SELECT 
                          TO_CHAR(IPD_DATE ,'YYYY')YEARS
                          PTC_SEX,
                          IP_NO,
                          
                      FROM 
                            IPADMISS 
                      WHERE 
                            IPADMISS.IPD_DATE >= TO_DATE  ('1/01/2014 00:00:00','dd/MM/yyyy hh24:mi:ss')
                        AND IPADMISS.IPD_DATE <= TO_DATE ('31/08/2015 23:59:59','dd/MM/yyyy hh24:mi:ss')
                        AND IPADMISS.IPC_PTFLAG = 'N' 
                        AND PTC_SEX='M')
                      GROUP BY YEARS,PTC_SEX
                      ORDER BY YEARS`;
    try {
      const result = await conn_ora.execute(sql, {}, {outFormat: oracledb.OUT_FORMAT_OBJECT});
      const yearCountFromOra = result.rows;
      yearCountFromOra &&
        yearCountFromOra.map((value, index) => {
          pool.query(`INSERT INTO ip_count_gender_year (year, ptc_sex, count) VALUES (?,?,?)`, [value.YEARS, value.PTC_SEX, value.COUNT], (error, result) => {
            if (error) throw error;
          });
        });
      return callBack(null, result);
    } catch (error) {
      return callBack(error);
    } finally {
      await conn_ora.close();
    }
  },

  getIpRegionDayWise: async (callBack) => {
    let conn_ora = await getTmcConnection();
    const sql = ` SELECT 
                            DAYS,
                            RG_CODE,
                            RGC_DESC,
                            COUNT(IP_NO) COUNT,
                            YEARS
                      FROM (     
                      SELECT 
                            TO_CHAR(IPD_DATE , 'YYYY-MM-DD') DAYS,
                            REGION.RG_CODE,
                            REGION.RGC_DESC,
                            IP_NO,
                            TO_CHAR(IPD_DATE , 'YYYY')YEARS,
                       FROM 
                             IPADMISS ,REGION
                       WHERE  
                              REGION.RG_CODE=IPADMISS.RG_CODE
                          AND IPADMISS.IPD_DATE   >= TO_DATE  ('01/01/2014 00:00:00','dd/MM/yyyy hh24:mi:ss')
                          AND IPADMISS.IPD_DATE <= TO_DATE ('31/08/2015 23:59:59','dd/MM/yyyy hh24:mi:ss')
                          AND IPADMISS.IPC_PTFLAG = 'N' )
                       GROUP BY DAYS,RGC_DESC,RG_CODE,YEARS
                       ORDER BY DAYS`;
    try {
      const result = await conn_ora.execute(sql, {}, {outFormat: oracledb.OUT_FORMAT_OBJECT});
      const dayCountFromOra = result.rows;
      dayCountFromOra &&
        dayCountFromOra.map((value, index) => {
          pool.query(
            `INSERT INTO ip_count_region_day (day, rg_code, rgc_desc, count, year) VALUES (?,?,?,?,?)`,
            [value.DAYS, value.RG_CODE, value.RGC_DESC, value.COUNT, value.YEARS],
            (error, result) => {
              if (error) throw error;
            },
          );
        });
      return callBack(null, result);
    } catch (error) {
      return callBack(error);
    } finally {
      await conn_ora.close();
    }
  },

  getIpRegionMonthWise: async (callBack) => {
    let conn_ora = await getTmcConnection();
    const sql = ` SELECT 
                            MONTHS,
                            RG_CODE,
                            RGC_DESC,
                            COUNT(IP_NO) COUNT,
                            YEARS
                      FROM (     
                      SELECT 
                           CONCAT(TO_CHAR (IPD_DATE,'YYYY-MM'),'-01')MONTHS,
                            REGION.RG_CODE,
                            REGION.RGC_DESC,
                            IP_NO,
                            TO_CHAR(IPD_DATE,'YYYY')YEARS,
                       FROM 
                             IPADMISS ,REGION
                       WHERE  
                              REGION.RG_CODE=IPADMISS.RG_CODE
                          AND IPADMISS.IPD_DATE >= TO_DATE  ('1/01/2014 00:00:00','dd/MM/yyyy hh24:mi:ss')
                          AND IPADMISS.IPD_DATE <= TO_DATE ('31/08/2015 23:59:59','dd/MM/yyyy hh24:mi:ss')
                          AND IPADMISS.IPC_PTFLAG = 'N' )
                       GROUP BY MONTHS,RGC_DESC,RG_CODE,YEARS
                       ORDER BY MONTHS`;
    try {
      const result = await conn_ora.execute(sql, {}, {outFormat: oracledb.OUT_FORMAT_OBJECT});
      const monthCountFromOra = result.rows;
      monthCountFromOra &&
        monthCountFromOra.map((value, index) => {
          pool.query(
            `INSERT INTO ip_count_region_month (month, rg_code, rgc_desc, count, year) VALUES (?,?,?,?,?)`,
            [value.MONTHS, value.RG_CODE, value.RGC_DESC, value.COUNT, value.YEARS],
            (error, result) => {
              if (error) throw error;
            },
          );
        });
      return callBack(null, result);
    } catch (error) {
      return callBack(error);
    } finally {
      await conn_ora.close();
    }
  },
  getIpRegionYearWise: async (callBack) => {
    let conn_ora = await getTmcConnection();
    const sql = ` SELECT 
                            YEARS,
                            RG_CODE,
                            RGC_DESC,
                            COUNT(IP_NO) COUNT,
                            
                      FROM (     
                      SELECT 
                            TO_CHAR(IPD_DATE , 'YYYY')YEARS,
                            REGION.RG_CODE,
                            REGION.RGC_DESC,
                            IP_NO
                            
                       FROM 
                             IPADMISS ,REGION
                       WHERE  
                              REGION.RG_CODE=IPADMISS.RG_CODE
                          AND IPADMISS.IPD_DATE <= TO_DATE ('1/01/2014 00:00:00','dd/MM/yyyy hh24:mi:ss')
                          AND IPADMISS.IPD_DATE <= TO_DATE ('31/08/2015 23:59:59','dd/MM/yyyy hh24:mi:ss')
                          AND IPADMISS.IPC_PTFLAG = 'N' )
                       GROUP BY YEARS,RGC_DESC,RG_CODE
                       ORDER BY YEARS`;
    try {
      const result = await conn_ora.execute(sql, {}, {outFormat: oracledb.OUT_FORMAT_OBJECT});
      const dayCountFromOra = result.rows;
      dayCountFromOra &&
        dayCountFromOra.map((value, index) => {
          pool.query(`INSERT INTO ip_count_region_year (year rg_code, rgc_desc, count) VALUES (?,?,?,?)`, [value.YEARS, value.RG_CODE, value.RGC_DESC, value.COUNT], (error, result) => {
            if (error) throw error;
          });
        });
      return callBack(null, result);
    } catch (error) {
      return callBack(error);
    } finally {
      await conn_ora.close();
    }
  },
};
