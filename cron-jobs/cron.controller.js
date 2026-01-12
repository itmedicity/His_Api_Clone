const cron = require("node-cron");
const {oraConnection, oracledb, oraKmcConnection} = require("../config/oradbconfig");
const pool = require("../config/dbconfig");
const mysqlpool = require("../config/dbconfigmeliora");
const {format, subHours, subMonths, parse, isValid, subMinutes} = require("date-fns");
const bispool = require("../config/dbconfbis");
const {endLogSuccess, endLogFailure, startLog, getCompanySlno, mysqlExecuteTransaction, getLastTriggerDate} = require("./CronLogger");

{
  /* %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% FEED BACK CRON-JOBS STARTS %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% */
}

// Get Inpaitent Detail
const getInpatientDetail = async (callBack = () => {}) => {
  let pool_ora = null;
  let conn_ora = null;
  let resultSet = null;
  let logId = null;
  try {
    // 1. START LOG
    try {
      logId = await startLog("FB_IPADMISS_IMPORT");
      if (!logId) throw new Error("Failed to create log entry");
    } catch (err) {
      console.error("Log start failed:", err);
      return callBack(err);
    }

    //2. GET COMPANY INFO (MySQL)
    let mh_Code = "";
    try {
      const companySlno = await getCompanySlno();
      if (isNaN(Number(companySlno))) {
        await endLogFailure(logId, `Invalid company_slno: ${companySlno}`);
        return callBack(new Error(`Invalid company_slno: ${companySlno}`));
      }
      mh_Code = Number(companySlno) === 1 ? "00" : "KC";
    } catch (err) {
      await endLogFailure(logId, "Error fetching company details");
      return callBack(err);
    }

    // 3. GET LAST TRIGGER DATE (MySQL)
    let lastTrigger = null;
    let fromDate = null;
    let toDate = null;
    let jobStartTime = null;
    let detail = null;

    try {
      detail = await getLastTriggerDate(1);
      lastTrigger = detail?.fb_last_trigger_date ? new Date(detail.fb_last_trigger_date) : subHours(new Date(), 1);

      // FIXED job start time (VERY IMPORTANT)
      jobStartTime = new Date();

      // FROM_DATE = last cycle’s TO_DATE
      fromDate = format(lastTrigger, "dd/MM/yyyy HH:mm:ss");
      // TO_DATE is NOW (but will be used as next cycle FROM)
      toDate = format(jobStartTime, "dd/MM/yyyy HH:mm:ss");
    } catch (err) {
      await endLogFailure(logId, "Error fetching last trigger date");
      return callBack(err);
    }
    // 4. FETCH ORACLE DATA
    let rows = [];
    let oracleTime = 0;

    try {
      const oracleStart = Date.now();

      pool_ora = await oraConnection();
      conn_ora = await pool_ora.getConnection();
      const oracleSql = `
          SELECT
              IP.IP_NO,
              IP.IPD_DATE,
              IP.PT_NO,
              IP.PTC_PTNAME,
              IP.PTC_SEX,
              IP.PTD_DOB,
              IP.PTC_LOADD1,
              IP.PTC_LOADD2,
              IP.PTC_LOADD3,
              IP.PTC_LOADD4,
              IP.BD_CODE,
              IP.DO_CODE,
              DO.DOC_NAME,
              DP.DPC_DESC,
              IP.IPD_DISC,
              IP.IPC_STATUS,
              IP.DMC_SLNO,
              IP.DMD_DATE,
              IP.PTC_MOBILE,
              IP.IPC_MHCODE,
              IP.IPC_CURSTATUS
          FROM IPADMISS IP
          JOIN DOCTOR DO ON DO.DO_CODE = IP.DO_CODE
          JOIN SPECIALITY SP ON SP.SP_CODE = DO.SP_CODE
          JOIN DEPARTMENT DP ON DP.DP_CODE = SP.DP_CODE
      WHERE IPD_DATE  >= TO_DATE (:FROM_DATE,'dd/MM/yyyy hh24:mi:ss')
      AND IPD_DATE  <TO_DATE (:TO_DATE, 'dd/MM/yyyy hh24:mi:ss') AND IPC_PTFLAG='N' AND IP.IPC_MHCODE = :MH_CODE
      `;

      const result = await conn_ora.execute(oracleSql, {FROM_DATE: fromDate, TO_DATE: toDate, MH_CODE: mh_Code}, {resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT});

      resultSet = result.resultSet;
      rows = await resultSet.getRows(0);

      await resultSet.close();
      resultSet = null;

      oracleTime = Date.now() - oracleStart;
    } catch (err) {
      await endLogFailure(logId, "Oracle fetch failed");
      return callBack(err);
    }

    // 5. IF NO ROWS → SUCCESS + UPDATE LOG DATE + EXIT
    if (!rows || rows.length === 0) {
      await endLogSuccess(logId, {
        oracleRows: 0,
        mysqlInserted: 0,
        mysqlUpdated: 0,
        oracleTime,
        mysqlTime: 0,
      });
      return callBack(null, {message: "No rows from Oracle"});
    }

    // 6. TRANSFORM ROWS
    const allValues = rows.map((item) => [
      item.IP_NO,
      item.IPD_DATE ? format(new Date(item.IPD_DATE), "yyyy-MM-dd HH:mm:ss") : null,
      item.PT_NO,
      item.PTC_PTNAME,
      item.PTC_SEX,
      item.PTD_DOB ? format(new Date(item.PTD_DOB), "yyyy-MM-dd HH:mm:ss") : null,
      buildFullAddress(item),
      item.BD_CODE,
      item.DO_CODE,
      item.DOC_NAME,
      item.DPC_DESC,
      item.IPD_DISC ? format(new Date(item.IPD_DISC), "yyyy-MM-dd HH:mm:ss") : null,
      item.IPC_STATUS,
      item.DMC_SLNO,
      item.DMD_DATE ? format(new Date(item.DMD_DATE), "yyyy-MM-dd HH:mm:ss") : null,
      item.PTC_MOBILE,
      item.IPC_MHCODE,
      item.IPC_CURSTATUS,
    ]);

    // 7. MYSQL INSERT
    let mysqlTime = 0;
    let insertedRows = 0;
    // Handle fb_last_trigger_date log
    try {
      const mysqlStart = Date.now();

      const patientInsertQuery = {
        sql: `INSERT INTO fb_ipadmiss (
            fb_ip_no, fb_ipd_date, fb_pt_no, fb_ptc_name, fb_ptc_sex,
            fb_ptd_dob, fb_ptc_loadd1,fb_bd_code, fb_do_code,fb_doc_name,
            fb_dep_desc,fb_ipd_disc,fb_ipc_status,fb_dmc_slno,fb_dmd_date,
            fb_ptc_mobile,fb_ipc_mhcode,fb_ipc_curstatus
         ) VALUES ?`,
        values: [allValues],
      };

      // convert to MySQL format
      const mysqlToDate = format(jobStartTime, "yyyy-MM-dd HH:mm:ss");
      // choose query type
      const logQuery = !detail
        ? {
            sql: `INSERT INTO fb_ipadmiss_logdtl (fb_last_trigger_date, fb_process_id) VALUES (?, ?)`,
            values: [mysqlToDate, 1],
          }
        : {
            sql: `UPDATE fb_ipadmiss_logdtl SET fb_last_trigger_date = ? WHERE fb_process_id = ?`,
            values: [mysqlToDate, 1],
          };

      // const mysqlResults = await mysqlExecuteTransaction(queries);
      const mysqlResults = await mysqlExecuteTransaction([patientInsertQuery, logQuery]);

      insertedRows = mysqlResults[0]?.affectedRows || 0;

      mysqlTime = Date.now() - mysqlStart;
    } catch (err) {
      await endLogFailure(logId, `MySQL insert failed:${err}`);
      return callBack(err);
    }
    // 8. SUCCESS LOG
    await endLogSuccess(logId, {
      oracleRows: rows.length,
      mysqlInserted: insertedRows,
      mysqlUpdated: 0,
      oracleTime,
      mysqlTime,
    });

    return callBack(null, {inserted: insertedRows});
  } catch (err) {
    // UNEXPECTED FAILURE
    if (logId) await endLogFailure(logId, `Error in here ${err}`);
    return callBack(err);
  } finally {
    try {
      if (resultSet) await resultSet.close();
      if (conn_ora) await conn_ora.close();
      if (pool_ora) await pool_ora.close();
    } catch (cleanupErr) {
      if (logId) {
        await endLogFailure(logId, `Cleanup error: ${cleanupErr}`);
      }
    }
  }
};

// UPDATE IPADMISS STATUS DETAILS
const UpdateIpStatusDetails = async (callBack = () => {}) => {
  let pool_ora = null;
  let conn_ora = null;
  let resultSet = null;
  let logId = null;

  try {
    // 1. START LOG
    try {
      logId = await startLog("FB_IPSTATUS_IMPORT");
      if (!logId) throw new Error("Failed to create log entry");
    } catch (err) {
      console.error("Log start failed:", err);
      return callBack(err);
    }

    //2. GET COMPANY INFO (MySQL)
    let mh_Code = "";
    try {
      const companySlno = await getCompanySlno();
      if (isNaN(Number(companySlno))) {
        await endLogFailure(logId, `Invalid company_slno: ${companySlno}`);
        return callBack(new Error(`Invalid company_slno: ${companySlno}`));
      }
      mh_Code = Number(companySlno) === 1 ? "00" : "KC";
    } catch (err) {
      await endLogFailure(logId, "Error fetching company details");
      return callBack(err);
    }

    // 3. GET LAST TRIGGER DATE (PROCESS ID = 2)
    let detail = null;
    let lastTrigger = null;
    let fromDate = null;
    let toDate = null;
    let jobStartTime = null;

    try {
      detail = await getLastTriggerDate(2);

      lastTrigger = detail?.fb_last_trigger_date ? new Date(detail.fb_last_trigger_date) : subHours(new Date(), 1);

      if (isNaN(lastTrigger.getTime())) throw new Error("Invalid last trigger date");

      // FIXED job start time (VERY IMPORTANT)
      jobStartTime = new Date();

      fromDate = format(lastTrigger, "dd/MM/yyyy HH:mm:ss");
      toDate = format(jobStartTime, "dd/MM/yyyy HH:mm:ss");
    } catch (err) {
      await endLogFailure(logId, `Error fetching last trigger date: ${err}`);
      return callBack(err);
    }

    // 4. FETCH ORACLE DATA
    let rows = [];
    let oracleTime = 0;

    try {
      const oracleStart = Date.now();
      const oracleSql = `
        SELECT 
          IP.ip_no,
          IP.do_code,
          IP.ipc_curstatus,
          IP.ipd_disc,
          IP.ipc_status,
          IP.dmd_date,
          IP.dmc_slno,
          DO.DOC_NAME
        FROM IPADMISS IP JOIN DOCTOR DO ON DO.DO_CODE = IP.DO_CODE
        WHERE IP.DMD_DATE  >= TO_DATE(:FROM_DATE, 'dd/MM/yyyy hh24:mi:ss') AND IP.DMD_DATE < TO_DATE(:TO_DATE, 'dd/MM/yyyy hh24:mi:ss')
        AND IP.ipc_ptflag = 'N' AND IP.IPC_MHCODE = :MH_CODE
      `;

      pool_ora = await oraConnection();
      conn_ora = await pool_ora.getConnection();

      const result = await conn_ora.execute(oracleSql, {FROM_DATE: fromDate, TO_DATE: toDate, MH_CODE: mh_Code}, {resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT});

      resultSet = result.resultSet;
      rows = await resultSet.getRows(0);
      await resultSet.close();
      resultSet = null;

      oracleTime = Date.now() - oracleStart;
    } catch (err) {
      await endLogFailure(logId, `Oracle fetch failed: ${err}`);
      return callBack(err);
    }
    // 5. IF NO ROWS → SUCCESS + EXIT
    if (!rows || rows.length === 0) {
      await endLogSuccess(logId, {
        oracleRows: 0,
        mysqlInserted: 0,
        mysqlUpdated: 0,
        oracleTime,
        mysqlTime: 0,
      });
      return callBack(null, {message: "No status updates found"});
    }

    // 6. TRANSFORM
    const updateValues = rows.map((item) => [
      item.DO_CODE,
      item.IPC_CURSTATUS,
      item.IPD_DISC ? format(new Date(item.IPD_DISC), "yyyy-MM-dd HH:mm:ss") : null,
      item.IPC_STATUS,
      item.DMD_DATE ? format(new Date(item.DMD_DATE), "yyyy-MM-dd HH:mm:ss") : null,
      item.DMC_SLNO,
      item.DOC_NAME,
      item.IP_NO,
    ]);

    // 7. MYSQL UPDATE TRANSACTION
    let mysqlTime = 0;
    let mysqlUpdated = 0;

    try {
      //start time
      const mysqlStart = Date.now();

      const updateQueries = updateValues.map((row) => ({
        sql: `
          UPDATE fb_ipadmiss
          SET
            fb_do_code = ?,
            fb_ipc_curstatus = ?,
            fb_ipd_disc = ?,
            fb_ipc_status = ?,
            fb_dmd_date = ?,
            fb_dmc_slno = ?,
            fb_doc_name = ?
          WHERE fb_ip_no = ?
        `,
        values: row,
      }));
      // convert to MySQL format
      const mysqlToDate = format(jobStartTime, "yyyy-MM-dd HH:mm:ss");
      // UPDATE / INSERT LOG DATE
      const logQuery = !detail
        ? {
            sql: `INSERT INTO fb_ipadmiss_logdtl (fb_last_trigger_date, fb_process_id) VALUES (?, ?)`,
            values: [mysqlToDate, 2],
          }
        : {
            sql: `UPDATE fb_ipadmiss_logdtl SET fb_last_trigger_date = ? WHERE fb_process_id = ?`,
            values: [mysqlToDate, 2],
          };

      updateQueries.push(logQuery);

      const mysqlResults = await mysqlExecuteTransaction(updateQueries);
      //Using changedRows to calculate updated rows
      mysqlUpdated = mysqlResults.filter((r) => r.changedRows !== undefined).reduce((sum, r) => sum + r.changedRows, 0);

      // calculating the end time
      mysqlTime = Date.now() - mysqlStart;
    } catch (err) {
      await endLogFailure(logId, `MySQL update failed: ${err}`);
      return callBack(err);
    }
    // 8. SUCCESS LOG
    await endLogSuccess(logId, {
      oracleRows: rows.length,
      mysqlInserted: 0,
      mysqlUpdated: mysqlUpdated,
      oracleTime,
      mysqlTime,
    });

    return callBack(null, {updated: updateValues.length});
  } catch (err) {
    // GLOBAL ERROR
    if (logId) await endLogFailure(logId, `Error in UpdateIpStatusDetails: ${err}`);
    return callBack(err);
  } finally {
    try {
      if (resultSet) await resultSet.close();
    } catch {}
    try {
      if (conn_ora) await conn_ora.close();
    } catch {}
    try {
      if (pool_ora) await pool_ora.close();
    } catch {}
  }
};

// UPDATE BED DETAILS STATUS DETAILS
const UpdateInpatientDetailRmall = async (callBack = () => {}) => {
  let pool_ora = null;
  let conn_ora = null;
  let resultSet = null;
  let logId = null;

  try {
    // 1. START LOG
    try {
      logId = await startLog("FB_IPRMALL_IMPORT");
      if (!logId) throw new Error("Failed to create log entry");
    } catch (err) {
      console.error("Log start failed:", err);
      return callBack(err);
    }

    // 2. GET LAST TRIGGER DATE (PROCESS ID = 3)
    let detail = null;
    let lastTrigger = null;
    let jobStartTime = null;
    let fromDate = null;
    let toDate = null;

    try {
      detail = await getLastTriggerDate(3);

      lastTrigger = detail?.fb_last_trigger_date ? new Date(detail.fb_last_trigger_date) : subHours(new Date(), 1);

      if (isNaN(lastTrigger.getTime())) throw new Error("Invalid last trigger date");

      // FIXED job start time (VERY IMPORTANT)
      jobStartTime = new Date();

      fromDate = format(lastTrigger, "dd/MM/yyyy HH:mm:ss");
      toDate = format(jobStartTime, "dd/MM/yyyy HH:mm:ss");
    } catch (err) {
      await endLogFailure(logId, `Error fetching last trigger date: ${err}`);
      return callBack(err);
    }

    // 3. FETCH ORACLE DATA
    let rows = [];
    let oracleTime = 0;

    try {
      const oracleStart = Date.now();
      const oracleSql = `
        SELECT 
          rmall.bd_code,
          rmall.ip_no,
          RMALL.RMC_OCCUPBY
        FROM rmall
         JOIN ipadmiss ON rmall.ip_no = ipadmiss.ip_no
        WHERE ipadmiss.ipc_ptflag = 'N'
          AND rmall.rmd_relesedate IS NULL
          AND rmall.rmd_occupdate >= TO_DATE(:FROM_DATE, 'dd/MM/yyyy hh24:mi:ss')
          AND rmall.rmd_occupdate < TO_DATE(:TO_DATE, 'dd/MM/yyyy hh24:mi:ss')
      `;

      pool_ora = await oraConnection();
      conn_ora = await pool_ora.getConnection();

      const result = await conn_ora.execute(oracleSql, {FROM_DATE: fromDate, TO_DATE: toDate}, {resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT});

      resultSet = result.resultSet;

      rows = await resultSet.getRows(0);
      await resultSet.close();
      resultSet = null;

      oracleTime = Date.now() - oracleStart;
    } catch (err) {
      await endLogFailure(logId, `Oracle fetch failed: ${err}`);
      return callBack(err);
    }

    // 4. IF NO ROWS → COMPLETE SUCCESS
    if (!rows || rows.length === 0) {
      await endLogSuccess(logId, {
        oracleRows: 0,
        mysqlInserted: 0,
        mysqlUpdated: 0,
        oracleTime,
        mysqlTime: 0,
      });
      return callBack(null, {message: "No updates found"});
    }

    // 5. PREPARE MYSQL VALUES
    const updateValues = rows.map((item) => [item.BD_CODE, item.IP_NO]);

    // 6. MYSQL TRANSACTION
    let mysqlTime = 0;
    let mysqlUpdated = 0;

    try {
      const mysqlStart = Date.now();

      const updateQueries = updateValues.map((row) => ({
        sql: `
          UPDATE fb_ipadmiss
          SET fb_bd_code = ?
          WHERE fb_ip_no = ?
        `,
        values: row,
      }));

      const mysqlToDate = format(jobStartTime, "yyyy-MM-dd HH:mm:ss");

      // INSERT OR UPDATE LOG
      const logQuery = !detail
        ? {
            sql: `INSERT INTO fb_ipadmiss_logdtl (fb_last_trigger_date, fb_process_id) VALUES (?, ?)`,
            values: [mysqlToDate, 3],
          }
        : {
            sql: `UPDATE fb_ipadmiss_logdtl SET fb_last_trigger_date = ? WHERE fb_process_id = ?`,
            values: [mysqlToDate, 3],
          };

      updateQueries.push(logQuery);

      const mysqlResults = await mysqlExecuteTransaction(updateQueries);

      // Count updated rows ONLY from update queries
      mysqlUpdated = mysqlResults.filter((r) => r.changedRows !== undefined).reduce((sum, r) => sum + r.changedRows, 0);

      mysqlTime = Date.now() - mysqlStart;
    } catch (err) {
      await endLogFailure(logId, `MySQL update failed: ${err}`);
      return callBack(err);
    }

    // 7. SUCCESS LOG
    await endLogSuccess(logId, {
      oracleRows: rows.length,
      mysqlInserted: 0,
      mysqlUpdated,
      oracleTime,
      mysqlTime,
    });

    return callBack(null, {updated: mysqlUpdated});
  } catch (err) {
    if (logId) await endLogFailure(logId, `Error in UpdateInpatientDetailRmall: ${err}`);
    return callBack(err);
  } finally {
    try {
      if (resultSet) await resultSet.close();
    } catch {}
    try {
      if (conn_ora) await conn_ora.close();
    } catch {}
    try {
      if (pool_ora) await pool_ora.close();
    } catch {}
  }
};

// UPDATE BED DETAILS  DETAILS ON BED TABLE
const UpdateFbBedDetailMeliora = async (callBack = () => {}) => {
  let pool_ora = null;
  let conn_ora = null;
  let resultSet = null;
  let logId = null;

  try {
    // 1. START LOG
    try {
      logId = await startLog("FB_BED_IMPORT");
      if (!logId) throw new Error("Failed to create log entry");
    } catch (err) {
      console.error("Log start failed:", err);
      return callBack(err);
    }

    // 2. GET LAST TRIGGER DATE (PROCESS ID = 4)
    let detail = null;
    let lastTrigger = null;
    let fromDate = null;
    let toDate = null;
    let jobStartTime = null;

    try {
      detail = await getLastTriggerDate(4);

      lastTrigger = detail?.fb_last_trigger_date ? new Date(detail.fb_last_trigger_date) : subHours(new Date(), 1);

      if (isNaN(lastTrigger.getTime())) throw new Error("Invalid last trigger date");

      // FIXED job start time (VERY IMPORTANT)
      jobStartTime = new Date();

      fromDate = format(lastTrigger, "dd/MM/yyyy HH:mm:ss");
      toDate = format(jobStartTime, "dd/MM/yyyy HH:mm:ss");
    } catch (err) {
      await endLogFailure(logId, `Error fetching last trigger date: ${err}`);
      return callBack(err);
    }

    // 3. FETCH ORACLE DATA
    let rows = [];
    let oracleTime = 0;

    try {
      const oracleStart = Date.now();

      const oracleSql = `
        SELECT 
          BD.BDC_OCCUP,
          BD.BD_CODE,
          BD.BDN_OCCNO
        FROM BED BD
        WHERE BD.BDC_STATUS = 'Y'
          AND BD.BDD_EDDATE >= TO_DATE(:FROM_DATE, 'dd/MM/yyyy HH24:mi:ss')
          AND BD.BDD_EDDATE < TO_DATE(:TO_DATE, 'dd/MM/yyyy HH24:mi:ss')

      `;

      pool_ora = await oraConnection();
      conn_ora = await pool_ora.getConnection();

      const result = await conn_ora.execute(oracleSql, {FROM_DATE: fromDate, TO_DATE: toDate}, {resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT});

      resultSet = result.resultSet;
      rows = await resultSet.getRows(0);
      await resultSet.close();
      resultSet = null;

      oracleTime = Date.now() - oracleStart;
    } catch (err) {
      await endLogFailure(logId, `Oracle fetch failed: ${err}`);
      return callBack(err);
    }

    // 4. IF NO ROWS → SUCCESS + EXIT
    if (!rows || rows.length === 0) {
      await endLogSuccess(logId, {
        oracleRows: 0,
        mysqlInserted: 0,
        mysqlUpdated: 0,
        oracleTime,
        mysqlTime: 0,
      });
      return callBack(null, {message: "No bed updates found"});
    }

    // 5. PREPARE MYSQL VALUES
    const updateValues = rows.map((item) => [item.BDC_OCCUP, item.BDN_OCCNO, item.BD_CODE]);

    // 6. MYSQL TRANSACTION
    let mysqlTime = 0;
    let mysqlUpdated = 0;

    try {
      const mysqlStart = Date.now();

      const updateQueries = updateValues.map((row) => ({
        sql: `
          UPDATE fb_bed
          SET 
            fb_bdc_occup = ?,
            fb_bdn_cccno = ?
          WHERE fb_bd_code = ?
        `,
        values: row,
      }));

      const mysqlToDate = format(jobStartTime, "yyyy-MM-dd HH:mm:ss");

      // INSERT OR UPDATE LOG
      const logQuery = !detail
        ? {
            sql: `INSERT INTO fb_ipadmiss_logdtl (fb_last_trigger_date, fb_process_id) VALUES (?, ?)`,
            values: [mysqlToDate, 4],
          }
        : {
            sql: `UPDATE fb_ipadmiss_logdtl SET fb_last_trigger_date = ? WHERE fb_process_id = ?`,
            values: [mysqlToDate, 4],
          };

      updateQueries.push(logQuery);

      const mysqlResults = await mysqlExecuteTransaction(updateQueries);

      // Count updated rows ONLY from update queries
      mysqlUpdated = mysqlResults.filter((r) => r.changedRows !== undefined).reduce((sum, r) => sum + r.changedRows, 0);

      mysqlTime = Date.now() - mysqlStart;
    } catch (err) {
      await endLogFailure(logId, `MySQL update failed: ${err}`);
      return callBack(err);
    }

    // 7. SUCCESS LOG
    await endLogSuccess(logId, {
      oracleRows: rows.length,
      mysqlInserted: 0,
      mysqlUpdated,
      oracleTime,
      mysqlTime,
    });

    return callBack(null, {updated: mysqlUpdated});
  } catch (err) {
    if (logId) await endLogFailure(logId, `Error in UpdateFbBedDetailMeliora: ${err}`);
    return callBack(err);
  } finally {
    try {
      if (resultSet) await resultSet.close();
    } catch {}
    try {
      if (conn_ora) await conn_ora.close();
    } catch {}
    try {
      if (pool_ora) await pool_ora.close();
    } catch {}
  }
};

// GET CHILD DETAIL FROM ELLIDER
const InsertChilderDetailMeliora = async (callBack = () => {}) => {
  let pool_ora = null;
  let conn_ora = null;
  let resultSet = null;

  try {
    // 1. Format today's date for Oracle query (DD-MON-YYYY)
    const formattedDate = format(new Date(), "dd-MMM-yyyy").toUpperCase();

    // 2. Oracle SQL
    const oracleSql = `
      SELECT
        B.BR_SLNO,
        B.BRD_DATE,
        B.PT_NO,
        B.PTC_PTNAME,
        B.PTC_LOADD1,
        B.PTC_LOADD2,
        B.BRC_HUSBAND,
        B.BRN_AGE,
        B.BRN_TOTAL,
        B.BRN_LIVE,
        B.BD_CODE,
        B.IP_NO,
        B.BRC_MHCODE,
        L.BRC_SEX AS CHILD_GENDER,
        L.BRD_DATE AS BIRTH_DATE,
        L.IP_NO AS MOTHER_IPNO,
        L.PT_NO AS CHILD_PT_NO,
        L.CHILD_IPNO AS CHILD_IPNO,
        L.BRN_WEIGHT AS CHILD_WEIGHT
      FROM BIRTHREGMAST B
      LEFT JOIN BRITHREGDETL L ON B.BR_SLNO = L.BR_SLNO
      WHERE B.BRD_DATE >= :GET_DATE
    `;

    // 3. Execute Oracle
    pool_ora = await oraConnection();
    conn_ora = await pool_ora.getConnection();

    const result = await conn_ora.execute(oracleSql, {GET_DATE: formattedDate}, {resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT});

    resultSet = result.resultSet;
    const rows = await resultSet.getRows(0); // fetch all rows

    await resultSet.close();
    resultSet = null;

    if (!rows || rows.length === 0) {
      return callBack(null, {message: "No Birth Registered Today"});
    }

    // 4. Convert rows to MySQL array values
    const insertValues = rows.map((item) => [
      item.BR_SLNO,
      item.BRD_DATE ? format(new Date(item.BRD_DATE), "yyyy-MM-dd HH:mm:ss") : null,
      item.PT_NO,
      item.PTC_PTNAME,
      item.PTC_LOADD1,
      item.PTC_LOADD2,
      item.BRC_HUSBAND,
      item.BRN_AGE,
      item.BRN_TOTAL,
      item.BRN_LIVE,
      item.BD_CODE,
      item.IP_NO,
      item.BRC_MHCODE,
      item.CHILD_GENDER,
      item.BIRTH_DATE ? format(new Date(item.BIRTH_DATE), "yyyy-MM-dd HH:mm:ss") : null,
      item.MOTHER_IPNO,
      item.CHILD_PT_NO,
      item.CHILD_IPNO,
      item.CHILD_WEIGHT,
    ]);

    // 5. Prepare MySQL transaction query
    const insertQuery = {
      sql: `
        INSERT INTO fb_birth_reg_mast (
          fb_br_slno,
          fb_brd_date,
          fb_pt_no,
          fb_ptc_name,
          fb_ptc_loadd1,
          fb_ptc_loadd2,
          fb_brc_husband,
          fb_brn_age,
          fb_brn_total,
          fb_brn_live,
          fb_bd_code,
          fb_ip_no,
          fb_brc_mhcode,
          fb_child_gender,
          fb_birth_date,
          fb_mother_ip_no,
          fb_child_pt_no,
          fb_child_ip_no,
          fb_child_weight
        ) VALUES ?
      `,
      values: [insertValues],
    };

    // 6. Run MySQL Transaction
    await mysqlExecuteTransaction([insertQuery]);

    // 7. Success callback
    return callBack(null, {inserted: insertValues.length});
  } catch (err) {
    return callBack(err);
  } finally {
    if (resultSet) {
      try {
        await resultSet.close();
      } catch {}
    }
    if (conn_ora) {
      try {
        await conn_ora.close();
      } catch {}
    }
    if (pool_ora) {
      try {
        await pool_ora.close();
      } catch {}
    }
  }
};

{
  /* %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% FEED BACK CRON-JOBS ENDS %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% */
}

// const getAmsPatientDetails = async (callBack) => {
//   let pool_ora = await oraConnection();
//   let conn_ora = await pool_ora.getConnection();

//   try {
//     const detail = await getAmsLastUpdatedDate(1);
//     if (!detail?.ams_last_updated_date) {
//       return; // Exit early — don’t fetch or insert anything
//     }

//     const lastInsertDate = new Date(detail.ams_last_updated_date);
//     const fromDate = format(lastInsertDate, 'dd/MM/yyyy HH:mm:ss');
//     const toDate = format(new Date(), 'dd/MM/yyyy HH:mm:ss');
//     const mysqlsupportToDate = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

//     const itemCodes = await new Promise((resolve, reject) => {
//       mysqlpool.query(
//         `SELECT item_code FROM ams_antibiotic_master WHERE status = 1`,
//         [],
//         (err, results) => {
//           if (err) return reject(err);
//           resolve(results.map(row => row.item_code));
//         }
//       );
//     });

//     if (itemCodes.length === 0) return;

//     const itemCodeBinds = itemCodes.map((_, i) => `:item_code_${i}`).join(',');
//     const itemCodeParams = {};
//     itemCodes.forEach((code, i) => {
//       itemCodeParams[`item_code_${i}`] = code;
//     });

//     const oracleSql = `
//       SELECT P.BMD_DATE,
//              P.BM_NO,
//              B.BD_CODE,
//              P.PT_NO,
//              PT.PTC_PTNAME,
//              DECODE(PT.PTC_SEX, 'M', 'Male', 'F', 'Female') AS GENEDER,
//              PT.PTN_YEARAGE,
//              P.IP_NO,
//              N.NSC_DESC,
//              D.DOC_NAME,
//              DP.DPC_DESC,
//              M.ITC_DESC,
//              G.CMC_DESC,
//              PL.IT_CODE
//       FROM PBILLMAST P
//         LEFT JOIN PBILLDETL PL ON P.BMC_SLNO = PL.BMC_SLNO
//         LEFT JOIN PATIENT PT ON P.PT_NO = PT.PT_NO
//         LEFT JOIN IPADMISS I ON P.IP_NO = I.IP_NO
//         LEFT JOIN BED B ON I.BD_CODE = B.BD_CODE
//         LEFT JOIN NURSTATION N ON B.NS_CODE = N.NS_CODE
//         LEFT JOIN DOCTOR D ON P.DO_CODE = D.DO_CODE
//         LEFT JOIN SPECIALITY S ON D.SP_CODE = S.SP_CODE
//         LEFT JOIN DEPARTMENT DP ON S.DP_CODE = DP.DP_CODE
//         LEFT JOIN MEDDESC M ON PL.IT_CODE = M.IT_CODE
//         LEFT JOIN MEDGENCOMB G ON M.CM_CODE = G.CM_CODE
//       WHERE PL.IT_CODE IN (${itemCodeBinds})
//         AND P.BMD_DATE >= TO_DATE(:FROM_DATE, 'dd/MM/yyyy hh24:mi:ss')
//         AND P.BMD_DATE <= TO_DATE(:TO_DATE, 'dd/MM/yyyy hh24:mi:ss')
//       GROUP BY P.BMD_DATE, P.BM_NO, P.PT_NO, PT.PTC_PTNAME, PT.PTC_SEX, PT.PTN_YEARAGE,
//                P.IP_NO, N.NSC_DESC,D.DOC_NAME, DP.DPC_DESC, G.CMC_DESC, M.ITC_DESC,PL.IT_CODE, B.BD_CODE`;

//     const bindParams = {
//       FROM_DATE: fromDate,
//       TO_DATE: toDate,
//       ...itemCodeParams
//     };

//     const result = await conn_ora.execute(oracleSql, bindParams, {
//       resultSet: true,
//       outFormat: oracledb.OUT_FORMAT_OBJECT,
//     });

//     await result.resultSet?.getRows((err, rows) => {
//       if (rows.length === 0) return;

//       const formatDateTime = (dateStr) => {
//         const date = new Date(dateStr);
//         return date.toISOString().slice(0, 19).replace('T', ' ');
//       };

//       const filteredRows = rows.filter(
//         (item) => item.PT_NO != null && item.IP_NO != null
//       );

//       if (filteredRows.length === 0) return;

//       // Group by IP_NO
//       const groupedMap = new Map();

//       filteredRows.forEach(item => {
//         const key = item.IP_NO;
//         const formattedDate = formatDateTime(item.BMD_DATE);

//         if (!groupedMap.has(key)) {
//           groupedMap.set(key, {
//             patient: {
//               PT_NO: item.PT_NO,
//               IP_NO: item.IP_NO,
//               PTC_PTNAME: item.PTC_PTNAME,
//               PTN_YEARAGE: item.PTN_YEARAGE,
//               GENEDER: item.GENEDER,
//               NSC_DESC: item.NSC_DESC,
//               BD_CODE: item.BD_CODE,
//               DPC_DESC: item.DPC_DESC,
//               DOC_NAME: item.DOC_NAME,
//               BMD_DATE: formattedDate
//             },
//             antibiotics: []
//           });
//         }

//         const group = groupedMap.get(key);

//         // Update earliest BMD_DATE
//         if (new Date(formattedDate) < new Date(group.patient.BMD_DATE)) {
//           group.patient.BMD_DATE = formattedDate;
//         }

//         group.antibiotics.push({
//           item_code: item.IT_CODE,
//           bill_no: item.BM_NO,
//           bill_date: formattedDate,
//           item_status: 1
//         });
//       });

//       const VALUES = [];
//       for (const [_, data] of groupedMap.entries()) {
//         const p = data.patient;
//         VALUES.push([
//           p.PT_NO,
//           p.IP_NO,
//           p.PTC_PTNAME,
//           p.PTN_YEARAGE,
//           p.GENEDER,
//           p.NSC_DESC,
//           p.BD_CODE,
//           p.DPC_DESC,
//           p.BMD_DATE,
//           p.DOC_NAME
//         ]);
//       }

//       mysqlpool.getConnection((err, connection) => {
//         if (err) return;

//         connection.beginTransaction(err => {
//           if (err) return connection.release();

//           connection.query(
//             `INSERT INTO ams_antibiotic_patient_details (
//               mrd_no,
//               patient_ip_no,
//               patient_name,
//               patient_age,
//               patient_gender,
//               patient_location,
//               bed_code,
//               consultant_department,
//               bill_date,
//               doc_name
//             ) VALUES ?`,
//             [VALUES],
//             (err, result) => {
//               if (err) {
//                 connection.query(
//                   `DELETE FROM ams_antibiotic_patient_details
//                    WHERE DATE(create_date) = CURDATE()
//                      AND TIME(create_date) >= TIME(DATE_SUB(NOW(), INTERVAL 2 MINUTE))`,
//                   [],
//                   () => connection.rollback(() => connection.release())
//                 );
//               } else {
//                 const insertedIds = Array.from({ length: result.affectedRows }, (_, i) => result.insertId + i);
//                 const antibioticsFinal = [];

//                 let index = 0;
//                 for (const [_, data] of groupedMap.entries()) {
//                   const pid = insertedIds[index++];
//                   data.antibiotics.forEach(row => {
//                     antibioticsFinal.push([
//                       pid,
//                       data.patient.IP_NO,
//                       row.item_code,
//                       row.bill_no,
//                       row.bill_date,
//                       row.item_status
//                     ]);
//                   });
//                 }

//                 connection.query(
//                   `INSERT INTO ams_patient_antibiotics (
//                     ams_patient_detail_slno,
//                     patient_ip_no,
//                     item_code,
//                     bill_no,
//                     bill_date,
//                     item_status
//                   ) VALUES ?`,
//                   [antibioticsFinal],
//                   (err2, result2) => {
//                     if (err2) {
//                       connection.query(
//                         `DELETE FROM ams_antibiotic_patient_details
//                          WHERE DATE(create_date) = CURDATE()
//                            AND TIME(create_date) >= TIME(DATE_SUB(NOW(), INTERVAL 2 MINUTE))`,
//                         [],
//                         () => connection.rollback(() => connection.release())
//                       );
//                     } else {
//                       connection.query(
//                         `UPDATE ams_patient_details_last_updated_date
//                          SET ams_last_updated_date = ?
//                          WHERE ams_lastupdate_slno = 1`,
//                         [mysqlsupportToDate],
//                         (err, result) => {
//                           if (err) {
//                             connection.query(
//                               `DELETE FROM ams_antibiotic_patient_details
//                                WHERE DATE(create_date) = CURDATE()
//                                  AND TIME(create_date) >= TIME(DATE_SUB(NOW(), INTERVAL 2 MINUTE))`,
//                               [],
//                               () => connection.rollback(() => connection.release())
//                             );
//                           } else {
//                             connection.commit(err => {
//                               if (err) {
//                                 connection.query(
//                                   `DELETE FROM ams_antibiotic_patient_details
//                                    WHERE DATE(create_date) = CURDATE()
//                                      AND TIME(create_date) >= TIME(DATE_SUB(NOW(), INTERVAL 2 MINUTE))`,
//                                   [],
//                                   () => connection.rollback(() => connection.release())
//                                 );
//                               } else {
//                                 connection.release();
//                               }
//                             });
//                           }
//                         }
//                       );
//                     }
//                   }
//                 );
//               }
//             }
//           );
//         });
//       });
//     });
//   } catch (error) {
//     return callBack(error);
//   }
// }

// trigger to get the childer data for the correspoding date
const getAmsPatientDetails = async (callBack) => {
  let pool_ora = await oraConnection();
  let conn_ora = await pool_ora.getConnection();

  try {
    const detail = await getAmsLastUpdatedDate(1);

    if (!detail?.ams_last_updated_date) {
      return; // Exit early — don’t fetch or insert anything
    }

    const lastInsertDate = new Date(detail.ams_last_updated_date);
    const fromDate = format(lastInsertDate, "dd/MM/yyyy HH:mm:ss");
    const toDate = format(new Date(), "dd/MM/yyyy HH:mm:ss");
    const mysqlsupportToDate = format(new Date(), "yyyy-MM-dd HH:mm:ss");

    const itemCodes = await new Promise((resolve, reject) => {
      mysqlpool.query(`SELECT item_code FROM ams_antibiotic_master WHERE status = 1`, [], (err, results) => {
        if (err) return reject(err);
        resolve(results.map((row) => row.item_code));
      });
    });

    if (itemCodes.length === 0) return;

    const itemCodeBinds = itemCodes.map((_, i) => `:item_code_${i}`).join(",");
    const itemCodeParams = {};
    itemCodes.forEach((code, i) => {
      itemCodeParams[`item_code_${i}`] = code;
    });

    const oracleSql = `
      SELECT P.BMD_DATE,
             P.BM_NO,
             B.BD_CODE,
             P.PT_NO,
             PT.PTC_PTNAME,
             DECODE(PT.PTC_SEX, 'M', 'Male', 'F', 'Female') AS GENEDER,
             PT.PTN_YEARAGE,
             P.IP_NO,
             N.NSC_DESC,   
             D.DOC_NAME,
             DP.DPC_DESC,
             M.ITC_DESC,
             G.CMC_DESC,
             PL.IT_CODE
      FROM PBILLMAST P
        LEFT JOIN PBILLDETL PL ON P.BMC_SLNO = PL.BMC_SLNO
        LEFT JOIN PATIENT PT ON P.PT_NO = PT.PT_NO
        LEFT JOIN IPADMISS I ON P.IP_NO = I.IP_NO
        LEFT JOIN BED B ON I.BD_CODE = B.BD_CODE
        LEFT JOIN NURSTATION N ON B.NS_CODE = N.NS_CODE
        LEFT JOIN DOCTOR D ON P.DO_CODE = D.DO_CODE
        LEFT JOIN SPECIALITY S ON D.SP_CODE = S.SP_CODE
        LEFT JOIN DEPARTMENT DP ON S.DP_CODE = DP.DP_CODE
        LEFT JOIN MEDDESC M ON PL.IT_CODE = M.IT_CODE
        LEFT JOIN MEDGENCOMB G ON M.CM_CODE = G.CM_CODE
      WHERE PL.IT_CODE IN (${itemCodeBinds})
        AND P.BMD_DATE >= TO_DATE(:FROM_DATE, 'dd/MM/yyyy hh24:mi:ss')
        AND P.BMD_DATE <= TO_DATE(:TO_DATE, 'dd/MM/yyyy hh24:mi:ss')
      GROUP BY P.BMD_DATE, P.BM_NO, P.PT_NO, PT.PTC_PTNAME, PT.PTC_SEX, PT.PTN_YEARAGE,
               P.IP_NO, N.NSC_DESC,D.DOC_NAME, DP.DPC_DESC, G.CMC_DESC, M.ITC_DESC,PL.IT_CODE, B.BD_CODE`;

    const bindParams = {
      FROM_DATE: fromDate,
      TO_DATE: toDate,
      ...itemCodeParams,
    };

    const result = await conn_ora.execute(oracleSql, bindParams, {
      resultSet: true,
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    await result.resultSet?.getRows(async (err, rows) => {
      if (rows.length === 0) return;

      const formatDateTime = (dateStr) => {
        const date = new Date(dateStr);
        return date.toISOString().slice(0, 19).replace("T", " ");
      };

      const filteredRows = rows.filter((item) => item.PT_NO != null && item.IP_NO != null);
      if (filteredRows.length === 0) return;

      const groupedMap = new Map();

      filteredRows.forEach((item) => {
        const key = item.IP_NO;
        const formattedDate = formatDateTime(item.BMD_DATE);

        if (!groupedMap.has(key)) {
          groupedMap.set(key, {
            patient: {
              PT_NO: item.PT_NO,
              IP_NO: item.IP_NO,
              PTC_PTNAME: item.PTC_PTNAME,
              PTN_YEARAGE: item.PTN_YEARAGE,
              GENEDER: item.GENEDER,
              NSC_DESC: item.NSC_DESC,
              BD_CODE: item.BD_CODE,
              DPC_DESC: item.DPC_DESC,
              DOC_NAME: item.DOC_NAME,
              BMD_DATE: formattedDate,
            },
            antibiotics: [],
          });
        }

        const group = groupedMap.get(key);
        if (new Date(formattedDate) < new Date(group.patient.BMD_DATE)) {
          group.patient.BMD_DATE = formattedDate;
        }

        group.antibiotics.push({
          item_code: item.IT_CODE,
          bill_no: item.BM_NO,
          bill_date: formattedDate,
          item_status: 1,
        });
      });

      const ipNos = Array.from(groupedMap.keys());
      const placeholders = ipNos.map(() => "?").join(",");

      mysqlpool.getConnection((err, connection) => {
        if (err) return;

        connection.query(
          `SELECT ams_patient_detail_slno, patient_ip_no 
           FROM ams_antibiotic_patient_details 
           WHERE patient_ip_no IN (${placeholders}) AND report_updated = 0`,
          ipNos,
          (err, existingRows) => {
            if (err) return connection.release();

            const existingMap = new Map();
            existingRows.forEach((row) => {
              existingMap.set(row.patient_ip_no, row.ams_patient_detail_slno);
            });

            const newPatients = [];
            const antibioticsFinal = [];

            for (const [ip_no, data] of groupedMap.entries()) {
              const p = data.patient;
              if (existingMap.has(ip_no)) {
                const existingId = existingMap.get(ip_no);
                data.antibiotics.forEach((row) => {
                  antibioticsFinal.push([existingId, ip_no, row.item_code, row.bill_no, row.bill_date, row.item_status]);
                });
              } else {
                newPatients.push([p.PT_NO, p.IP_NO, p.PTC_PTNAME, p.PTN_YEARAGE, p.GENEDER, p.NSC_DESC, p.BD_CODE, p.DPC_DESC, p.BMD_DATE, p.DOC_NAME]);
              }
            }

            connection.beginTransaction((err) => {
              if (err) return connection.release();

              const insertNewPatients =
                newPatients.length > 0
                  ? new Promise((resolve, reject) => {
                      connection.query(
                        `INSERT INTO ams_antibiotic_patient_details (
                        mrd_no,
                        patient_ip_no,
                        patient_name,
                        patient_age,
                        patient_gender,
                        patient_location,
                        bed_code,
                        consultant_department,
                        bill_date,
                        doc_name
                      ) VALUES ?`,
                        [newPatients],
                        (err, result) => {
                          if (err) return reject(err);

                          const insertedIds = Array.from({length: result.affectedRows}, (_, i) => result.insertId + i);
                          let index = 0;

                          for (const [ip_no, data] of groupedMap.entries()) {
                            if (!existingMap.has(ip_no)) {
                              const newId = insertedIds[index++];
                              existingMap.set(ip_no, newId);
                              data.antibiotics.forEach((row) => {
                                antibioticsFinal.push([newId, ip_no, row.item_code, row.bill_no, row.bill_date, row.item_status]);
                              });
                            }
                          }

                          resolve();
                        }
                      );
                    })
                  : Promise.resolve();

              insertNewPatients
                .then(() => {
                  connection.query(
                    `INSERT INTO ams_patient_antibiotics (
                      ams_patient_detail_slno,
                      patient_ip_no,
                      item_code,
                      bill_no,
                      bill_date,
                      item_status
                    ) VALUES ?`,
                    [antibioticsFinal],
                    (err2) => {
                      if (err2) return connection.rollback(() => connection.release());

                      connection.query(
                        `UPDATE ams_patient_details_last_updated_date 
                         SET ams_last_updated_date = ? 
                         WHERE ams_lastupdate_slno = 1`,
                        [mysqlsupportToDate],
                        (err3) => {
                          if (err3) return connection.rollback(() => connection.release());
                          connection.commit((err4) => {
                            if (err4) return connection.rollback(() => connection.release());
                            connection.release();
                          });
                        }
                      );
                    }
                  );
                })
                .catch((err) => connection.rollback(() => connection.release()));
            });
          }
        );
      });
    });
  } catch (error) {
    return callBack(error);
  } finally {
    if (conn_ora) {
      await conn_ora.close();
      await pool_ora.close();
    }
  }
};

//bis module- jomol
// Utility function
// const getItCodesInChunks = (mysqlConn, fromDate, toDate, chunkSize = 1000) => {
//   return new Promise((resolve, reject) => {
//     const selectQuery = `
//       SELECT it_code
//       FROM bis_kmc_med_desc_mast
//       WHERE create_date BETWEEN ? AND ?`;

//     mysqlConn.query(selectQuery, [fromDate, toDate], (err, results) => {
//       if (err) return reject(err);

//       const numericItcodes = results?.map(val => val.it_code);
//       if (!numericItcodes || numericItcodes.length === 0) {
//         console.log("No it_codes found.");
//         return resolve([]);
//       }

//       // Chunk the array
//       const chunkArray = (array, size) => {
//         const result = [];
//         for (let i = 0; i < array.length; i += size) {
//           result.push(array.slice(i, i + size));
//         }
//         return result;
//       };

//       const chunks = chunkArray(numericItcodes, chunkSize);
//       resolve(chunks);
//     });
//   });
// };

// const InsertKmcMedDesc = async (callBack) => {
//   let pool_ora, conn_ora, mysqlConn;

//   try {
//     pool_ora = await oraKmcConnection();
//     conn_ora = await pool_ora.getConnection();
//     mysqlConn = await getConnection(bispool);

//     const detail = await getBisKmcLastTriggerDate();
//     const lastUpdateDate = detail?.last_insert_date ? new Date(detail.last_insert_date) : subMonths(new Date(), 1);
//     const fromDate = format(lastUpdateDate, 'yyyy-MM-dd HH:mm:ss');
//     const toDate = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

//     // Fetch fresh records for insert
//     const oracleSql = `
//       SELECT meddesc.it_code, meddesc.itc_desc, meddesc.itc_alias, meddesc.itn_strip,
//              medcategory.mc_code, medcategory.mcc_desc, medgroup.mg_code, medgroup.mgc_desc,
//              medgencomb.cmc_desc, medtype.mtc_desc,
//              DECODE(meddesc.itc_medicine,'N','No','Y','MEDICINE') AS MEDICINE,
//              DECODE(meddesc.itc_consumable,'N','No','Y','CONSUM') AS CONSUMABLE,
//              DECODE(meddesc.itc_highvalue,'N',' ','Y','VALUE') AS HIGH_VALUE,
//              DECODE(meddesc.itc_highrisk,'N',' ','Y','HIGH_RISK') AS HIGH_RISK,
//              DECODE(meddesc.itc_hazardous,'N',' ','Y','HAZARDOUS') AS HAZARDOUS,
//              DECODE(meddesc.itc_ved,'N','None','V','Vital','E','Essential','D','Desirable') AS VED,
//              DECODE(meddesc.itc_breakable,'N','No','Y','Yes') AS BREAKABLE,
//              meddesc.itn_breakqty, meddesc.itn_lprate, meddesc.itn_mrp,
//              meddesc.itn_originalmrp, meddesc.itn_gendisper, meddesc.itn_genipdisper,
//              meddesc.itd_date, meddesc.itd_eddate
//       FROM MEDDESC
//       RIGHT JOIN (SELECT DISTINCT(IT_CODE) FROM MEDSTORE) B ON MEDDESC.IT_CODE = B.IT_CODE
//       LEFT JOIN medcategory ON meddesc.mc_code = medcategory.mc_code
//       LEFT JOIN medgroup ON meddesc.mg_code = medgroup.mg_code
//       LEFT JOIN medtype ON meddesc.mt_code = medtype.mt_code
//       LEFT JOIN medstore ON meddesc.it_code = medstore.it_code
//       LEFT JOIN pstparam ON medstore.st_code = pstparam.st_code
//       LEFT JOIN medgencomb ON meddesc.cm_code = medgencomb.cm_code
//       WHERE MEDDESC.ITC_STATUS = 'Y' AND meddesc.itd_date
//         BETWEEN TO_DATE(:FROM_DATE, 'yyyy-mm-dd hh24:mi:ss') AND TO_DATE(:TO_DATE, 'yyyy-mm-dd hh24:mi:ss')
//       GROUP BY meddesc.it_code, meddesc.itc_desc, meddesc.itc_alias, medcategory.mc_code, medcategory.mcc_desc,
//                medgroup.mg_code, medgroup.mgc_desc, medtype.mt_code, medtype.mtc_desc, meddesc.itc_assestitem,
//                meddesc.itc_medicine, meddesc.itc_consumable, meddesc.itc_highvalue, meddesc.itc_highrisk,
//                meddesc.itc_hazardous, medgencomb.cmc_desc, meddesc.itc_ved, meddesc.itn_strip,
//                meddesc.itc_breakable, meddesc.itn_breakqty, meddesc.itn_lprate, meddesc.itn_mrp,
//                meddesc.itn_originalmrp, meddesc.itn_gendisper, meddesc.itn_genipdisper, meddesc.itd_date,
//                meddesc.itd_eddate`;

//     const insertResult = await conn_ora.execute(
//       oracleSql,
//       { FROM_DATE: fromDate, TO_DATE: toDate },
//       { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT }
//     );
//     const insertRows = await insertResult.resultSet.getRows();
//     await insertResult.resultSet.close();

//     if (!insertRows.length) {
//       if (callBack) callBack(null, "No data to insert.");
//       return;
//     }

//     const Values = insertRows.map(row => [
//       row.IT_CODE, row.ITC_DESC, row.ITC_ALIAS, row.ITN_STRIP,
//       row.MC_CODE, row.MCC_DESC, row.MG_CODE, row.MGC_DESC,
//       row.CMC_DESC, row.MTC_DESC, row.MEDICINE, row.CONSUMABLE,
//       row.HIGH_VALUE, row.HIGH_RISK, row.HAZARDOUS, row.VED,
//       row.BREAKABLE, row.ITN_BREAKQTY, row.ITN_LPRATE, row.ITN_MRP,
//       row.ITN_ORIGINALMRP, row.ITN_GENDISPER, row.ITN_GENIPDISPER,
//       row.ITD_DATE, row.ITD_EDDATE
//     ]);
//     const insertQuery = `
//       INSERT INTO bis_kmc_med_desc_mast (
//         it_code, itc_desc, itc_alias, itn_strip, mc_code, mcc_desc,
//         mg_code, mgc_desc, cmc_desc, mtc_desc, itc_medicine, itc_consumable,
//         itc_highvalue, itc_highrisk, itc_hazardous, itc_ved, itc_breakable,
//         itn_breakqty, itn_lprate, itn_mrp, itn_originalmrp, itn_gendisper,
//         itn_genipdisper, create_date, edit_date
//       ) VALUES ?`;

//     await beginTransaction(mysqlConn);
//     await queryPromise(mysqlConn, insertQuery, [Values]);

//     // Step 2: MEDSTORE insert
//     const insertedChunks = await getItCodesInChunks(mysqlConn, fromDate, toDate, 1000);
//     let medstoreData = [];

//     for (const chunk of insertedChunks) {
//       const bindParams = {};
//       const keys = chunk.map((code, i) => {
//         const key = `val${i}`;
//         bindParams[key] = code;
//         return `:${key}`;
//       });

//       const medstoreQuery = `
//         SELECT IT_CODE, ST_CODE FROM MEDSTORE
//         WHERE IT_CODE IN (${keys.join(',')})`;
//       const medstoreResult = await conn_ora.execute(medstoreQuery, bindParams, { outFormat: oracledb.OUT_FORMAT_OBJECT });

//       if (medstoreResult.rows.length) {
//         medstoreData.push(...medstoreResult.rows);
//       }
//     }

//     if (medstoreData.length) {
//       const medstoreValues = medstoreData.map(row => [row.IT_CODE, row.ST_CODE]);
//       await queryPromise(mysqlConn, `INSERT INTO bis_kmc_med_store (it_code, st_code) VALUES ?`, [medstoreValues]);
//     }

//     // Step 3: Update trigger
//     const currentDate = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
//     await queryPromise(mysqlConn,
//       `UPDATE bis_kmc_trigger_details SET last_insert_date = ?, last_update_date = ? WHERE trgr_slno = 1`,
//       [currentDate, currentDate]
//     );

//     // Step 4: Update Logic
//     const oracleSqlquery = `
//       SELECT meddesc.it_code, meddesc.itc_desc, meddesc.itc_alias, meddesc.itn_strip,
//              medcategory.mc_code, medcategory.mcc_desc, medgroup.mg_code, medgroup.mgc_desc,
//              medgencomb.cmc_desc, medtype.mtc_desc,
//              DECODE(meddesc.itc_medicine,'N','No','Y','MEDICINE') AS MEDICINE,
//              DECODE(meddesc.itc_consumable,'N','No','Y','CONSUM') AS CONSUMABLE,
//              DECODE(meddesc.itc_highvalue,'N',' ','Y','VALUE') AS HIGH_VALUE,
//              DECODE(meddesc.itc_highrisk,'N',' ','Y','HIGH_RISK') AS HIGH_RISK,
//              DECODE(meddesc.itc_hazardous,'N',' ','Y','HAZARDOUS') AS HAZARDOUS,
//              DECODE(meddesc.itc_ved,'N','None','V','Vital','E','Essential','D','Desirable') AS VED,
//              DECODE(meddesc.itc_breakable,'N','No','Y','Yes') AS BREAKABLE,
//              meddesc.itn_breakqty, meddesc.itn_lprate, meddesc.itn_mrp,
//              meddesc.itn_originalmrp, meddesc.itn_gendisper, meddesc.itn_genipdisper,
//              meddesc.itd_date, meddesc.itd_eddate
//       FROM MEDDESC
//       RIGHT JOIN (SELECT DISTINCT(IT_CODE) FROM MEDSTORE) B ON MEDDESC.IT_CODE = B.IT_CODE
//       LEFT JOIN medcategory ON meddesc.mc_code = medcategory.mc_code
//       LEFT JOIN medgroup ON meddesc.mg_code = medgroup.mg_code
//       LEFT JOIN medtype ON meddesc.mt_code = medtype.mt_code
//       LEFT JOIN medstore ON meddesc.it_code = medstore.it_code
//       LEFT JOIN pstparam ON medstore.st_code = pstparam.st_code
//       LEFT JOIN medgencomb ON meddesc.cm_code = medgencomb.cm_code
//       WHERE MEDDESC.ITC_STATUS = 'Y' AND meddesc.itd_date
//         BETWEEN TO_DATE(:FROM_DATE, 'yyyy-mm-dd hh24:mi:ss') AND TO_DATE(:TO_DATE, 'yyyy-mm-dd hh24:mi:ss')
//       GROUP BY meddesc.it_code, meddesc.itc_desc, meddesc.itc_alias, medcategory.mc_code, medcategory.mcc_desc,
//                medgroup.mg_code, medgroup.mgc_desc, medtype.mt_code, medtype.mtc_desc, meddesc.itc_assestitem,
//                meddesc.itc_medicine, meddesc.itc_consumable, meddesc.itc_highvalue, meddesc.itc_highrisk,
//                meddesc.itc_hazardous, medgencomb.cmc_desc, meddesc.itc_ved, meddesc.itn_strip,
//                meddesc.itc_breakable, meddesc.itn_breakqty, meddesc.itn_lprate, meddesc.itn_mrp,
//                meddesc.itn_originalmrp, meddesc.itn_gendisper, meddesc.itn_genipdisper, meddesc.itd_date,
//                meddesc.itd_eddate`;

//     const updateResult = await conn_ora.execute(
//       oracleSqlquery,
//       { FROM_DATE: fromDate, TO_DATE: toDate },
//       { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT }
//     );
//     const updateRows = await updateResult.resultSet.getRows();
//     await updateResult.resultSet.close();

//     const updateItCodes = await getItCodesInChunks(mysqlConn, fromDate, toDate, 1000);
//     const updateSet = new Set(updateItCodes.flat());

//     const filteredUpdates = updateRows.filter(row => updateSet.has(row.IT_CODE));
//     // const filteredUpdates = updateRows.filter(row => updateSet.includes(row.IT_CODE));

//     if (!filteredUpdates.length) {
//       if (callBack) callBack(null, "No data to update.");
//       return;
//     }

//     const updateQuery = `
//                        UPDATE bis_kmc_med_desc_mast
//                        SET
//                          itc_desc = ?,
//                          itc_alias = ?,
//                          itn_strip = ?,
//                          mc_code = ?,
//                          mcc_desc = ?,
//                          mg_code = ?,
//                          mgc_desc = ?,
//                          cmc_desc = ?,
//                          mtc_desc = ?,
//                          itc_medicine = ?,
//                          itc_consumable = ?,
//                          itc_highvalue = ?,
//                          itc_highrisk = ?,
//                          itc_hazardous = ?,
//                          itc_ved = ?,
//                          itc_breakable = ?,
//                          itn_breakqty = ?,
//                          itn_lprate = ?,
//                          itn_mrp = ?,
//                          itn_originalmrp = ?,
//                          itn_gendisper = ?,
//                          itn_genipdisper = ?,
//                          create_date = ?,
//                          edit_date = ?
//                        WHERE it_code = ?
//                       `;
//     for (const row of filteredUpdates) {
//       const updateValues = [
//         row.ITC_DESC, row.ITC_ALIAS, row.ITN_STRIP,
//         row.MC_CODE, row.MCC_DESC, row.MG_CODE, row.MGC_DESC,
//         row.CMC_DESC, row.MTC_DESC, row.MEDICINE, row.CONSUMABLE,
//         row.HIGH_VALUE, row.HIGH_RISK, row.HAZARDOUS, row.VED,
//         row.BREAKABLE, row.ITN_BREAKQTY, row.ITN_LPRATE, row.ITN_MRP,
//         row.ITN_ORIGINALMRP, row.ITN_GENDISPER, row.ITN_GENIPDISPER,
//         row.ITD_DATE, row.ITD_EDDATE,
//         row.IT_CODE
//       ];
//       await queryPromise(mysqlConn, updateQuery, updateValues);
//     }

//     await commit(mysqlConn);
//     if (callBack) callBack(null, `${filteredUpdates.length} records updated successfully.`);

//     // update triger table
//     const last_update_date = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
//     await queryPromise(mysqlConn,
//       `UPDATE bis_kmc_trigger_details SET last_update_date = ? WHERE trgr_slno = 1`,
//       [last_update_date]
//     );

//   } catch (err) {
//     if (mysqlConn) await rollback(mysqlConn);
//     console.error("InsertKmcMedDesc error:", err);
//     if (callBack) callBack(err);
//   } finally {
//     if (conn_ora) await conn_ora.close();
//     if (mysqlConn) mysqlConn.release();
//   }
// };

// Run cron every minute
// cron.schedule("* * * * *", () => {
//   InsertKmcMedDesc();
// });

// TMC PROCESS

const getConnection = (pool) => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) return reject(err);
      resolve(connection);
    });
  });
};

// const queryPromise = (conn, sql, values) => {
//   return new Promise((resolve, reject) => {
//     conn.query(sql, values, (err, results) => {
//       if (err) return reject(err);
//       resolve(results);
//     });
//   });
// };

const queryPromise = (conn, sql, params) =>
  new Promise((resolve, reject) => {
    conn.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });

const beginTransaction = (conn) => {
  return new Promise((resolve, reject) => {
    conn.beginTransaction((err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

const commit = (conn) => {
  return new Promise((resolve, reject) => {
    conn.commit((err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

const rollback = (conn) => {
  return new Promise((resolve) => {
    conn.rollback(() => resolve());
  });
};

const buildFullAddress = (item) => {
  return [item.PTC_LOADD1, item.PTC_LOADD2, item.PTC_LOADD3, item.PTC_LOADD4]
    .filter((v) => v && v?.trim() !== "") // remove null/empty
    .join(", "); // separator
};

//TMCH
const getBisTmcLastTriggerDate = async () => {
  return new Promise((resolve, reject) => {
    bispool.getConnection((err, connection) => {
      if (err) {
        console.error("MySQL DB not connected. Check connection.");
        return reject(err);
      }
      const query = `SELECT last_insert_date, last_update_date FROM bis_tmc_trigger_details WHERE trgr_slno = 1`;
      connection.query(query, [], (err, results) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        resolve(results.length > 0 ? results[0] : null);
      });
    });
  });
};

const getTMCItCodesInChunks = (mysqlConn, fromDate, toDate, chunkSize = 1000) => {
  return new Promise((resolve, reject) => {
    const selectQuery = `
      SELECT it_code
      FROM bis_tmc_med_desc_mast
      WHERE create_date BETWEEN ? AND ?`;

    mysqlConn.query(selectQuery, [fromDate, toDate], (err, results) => {
      if (err) return reject(err);
      const numericItcodes = results?.map((val) => val.it_code);
      if (!numericItcodes || numericItcodes.length === 0) {
        return resolve([]);
      }

      // Chunk the array
      const chunkArray = (array, size) => {
        const result = [];
        for (let i = 0; i < array.length; i += size) {
          result.push(array.slice(i, i + size));
        }
        return result;
      };

      const chunks = chunkArray(numericItcodes, chunkSize);
      resolve(chunks);
    });
  });
};

// jomol code
const InsertTmcMedDesc = async (callBack) => {
  let pool_ora, conn_ora, mysqlConn;

  try {
    pool_ora = await oraConnection();
    conn_ora = await pool_ora.getConnection();
    mysqlConn = await getConnection(bispool);

    const detail = await getBisTmcLastTriggerDate();
    const lastUpdateDate = detail?.last_insert_date ? new Date(detail.last_insert_date) : subMonths(new Date(), 1);
    const fromDate = format(lastUpdateDate, "yyyy-MM-dd HH:mm:ss");
    const toDate = format(new Date(), "yyyy-MM-dd HH:mm:ss");

    // Step 1: Fetch insert data from Oracle
    const oracleSql = `
      SELECT meddesc.it_code, meddesc.itc_desc, meddesc.itc_alias, meddesc.itn_strip,
             medcategory.mc_code, medcategory.mcc_desc, medgroup.mg_code, medgroup.mgc_desc,
             medgencomb.cmc_desc, medtype.mtc_desc,
             DECODE(meddesc.itc_medicine,'N','No','Y','MEDICINE') AS MEDICINE,
             DECODE(meddesc.itc_consumable,'N','No','Y','CONSUM') AS CONSUMABLE,
             DECODE(meddesc.itc_highvalue,'N',' ','Y','VALUE') AS HIGH_VALUE,
             DECODE(meddesc.itc_highrisk,'N',' ','Y','HIGH_RISK') AS HIGH_RISK,
             DECODE(meddesc.itc_hazardous,'N',' ','Y','HAZARDOUS') AS HAZARDOUS,
             DECODE(meddesc.itc_ved,'N','None','V','Vital','E','Essential','D','Desirable') AS VED,
             DECODE(meddesc.itc_breakable,'N','No','Y','Yes') AS BREAKABLE,
             meddesc.itn_breakqty, meddesc.itn_lprate, meddesc.itn_mrp,
             meddesc.itn_originalmrp, meddesc.itn_gendisper, meddesc.itn_genipdisper,
             meddesc.itd_date, meddesc.itd_eddate
      FROM MEDDESC
      RIGHT JOIN (SELECT DISTINCT(IT_CODE) FROM MEDSTORE) B ON MEDDESC.IT_CODE = B.IT_CODE
      LEFT JOIN medcategory ON meddesc.mc_code = medcategory.mc_code
      LEFT JOIN medgroup ON meddesc.mg_code = medgroup.mg_code
      LEFT JOIN medtype ON meddesc.mt_code = medtype.mt_code
      LEFT JOIN medstore ON meddesc.it_code = medstore.it_code
      LEFT JOIN pstparam ON medstore.st_code = pstparam.st_code
      LEFT JOIN medgencomb ON meddesc.cm_code = medgencomb.cm_code
      WHERE MEDDESC.ITC_STATUS = 'Y' AND meddesc.itd_date
        BETWEEN TO_DATE(:FROM_DATE, 'yyyy-mm-dd hh24:mi:ss') AND TO_DATE(:TO_DATE, 'yyyy-mm-dd hh24:mi:ss')
      GROUP BY meddesc.it_code, meddesc.itc_desc, meddesc.itc_alias, medcategory.mc_code, medcategory.mcc_desc,
               medgroup.mg_code, medgroup.mgc_desc, medtype.mt_code, medtype.mtc_desc, meddesc.itc_assestitem,
               meddesc.itc_medicine, meddesc.itc_consumable, meddesc.itc_highvalue, meddesc.itc_highrisk,
               meddesc.itc_hazardous, medgencomb.cmc_desc, meddesc.itc_ved, meddesc.itn_strip,
               meddesc.itc_breakable, meddesc.itn_breakqty, meddesc.itn_lprate, meddesc.itn_mrp,
               meddesc.itn_originalmrp, meddesc.itn_gendisper, meddesc.itn_genipdisper, meddesc.itd_date,
               meddesc.itd_eddate`; // keep your existing oracleSql query here
    const insertResult = await conn_ora.execute(oracleSql, {FROM_DATE: fromDate, TO_DATE: toDate}, {resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT});
    const insertRows = await insertResult.resultSet.getRows();
    await insertResult.resultSet.close();

    if (!insertRows.length) {
      if (callBack) callBack(null, "No data to insert.");
      return;
    }

    const Values = insertRows.map((row) => [
      row.IT_CODE,
      row.ITC_DESC,
      row.ITC_ALIAS,
      row.ITN_STRIP,
      row.MC_CODE,
      row.MCC_DESC,
      row.MG_CODE,
      row.MGC_DESC,
      row.CMC_DESC,
      row.MTC_DESC,
      row.MEDICINE,
      row.CONSUMABLE,
      row.HIGH_VALUE,
      row.HIGH_RISK,
      row.HAZARDOUS,
      row.VED,
      row.BREAKABLE,
      row.ITN_BREAKQTY,
      row.ITN_LPRATE,
      row.ITN_MRP,
      row.ITN_ORIGINALMRP,
      row.ITN_GENDISPER,
      row.ITN_GENIPDISPER,
      row.ITD_DATE,
      row.ITD_EDDATE,
    ]);

    // Step 2: Begin transaction
    await mysqlConn.beginTransaction();

    // Step 3: Insert into bis_kmc_med_desc_mast
    await queryPromise(
      mysqlConn,
      `
      INSERT INTO bis_tmc_med_desc_mast (
        it_code, itc_desc, itc_alias, itn_strip, mc_code, mcc_desc,
        mg_code, mgc_desc, cmc_desc, mtc_desc, itc_medicine, itc_consumable,
        itc_highvalue, itc_highrisk, itc_hazardous, itc_ved, itc_breakable,
        itn_breakqty, itn_lprate, itn_mrp, itn_originalmrp, itn_gendisper,
        itn_genipdisper, create_date, edit_date
      ) VALUES ?`,
      [Values]
    );

    // Step 4: Fetch chunks for medstore insert
    const insertedChunks = await getTMCItCodesInChunks(mysqlConn, fromDate, toDate, 1000);
    let medstoreData = [];

    for (const chunk of insertedChunks) {
      const bindParams = {};
      const keys = chunk.map((code, i) => {
        const key = `val${i}`;
        bindParams[key] = code;
        return `:${key}`;
      });

      const medstoreQuery = `
        SELECT IT_CODE, ST_CODE FROM MEDSTORE 
        WHERE IT_CODE IN (${keys.join(",")})`;

      const medstoreResult = await conn_ora.execute(medstoreQuery, bindParams, {outFormat: oracledb.OUT_FORMAT_OBJECT});

      if (medstoreResult.rows.length) {
        medstoreData.push(...medstoreResult.rows);
      }
    }

    if (medstoreData.length) {
      const medstoreValues = medstoreData.map((row) => [row.IT_CODE, row.ST_CODE]);
      await queryPromise(
        mysqlConn,
        `
        INSERT INTO bis_tmc_med_store (it_code, st_code) VALUES ?`,
        [medstoreValues]
      );
    }

    // Step 5: Update trigger table
    const currentDate = format(new Date(), "yyyy-MM-dd HH:mm:ss");
    await queryPromise(
      mysqlConn,
      `
      UPDATE bis_tmc_trigger_details 
      SET last_insert_date = ?, last_update_date = ? 
      WHERE trgr_slno = 1`,
      [currentDate, currentDate]
    );

    // Step 6: Fetch update records
    const oracleSqlquery = ` 
      SELECT meddesc.it_code, meddesc.itc_desc, meddesc.itc_alias, meddesc.itn_strip,
             medcategory.mc_code, medcategory.mcc_desc, medgroup.mg_code, medgroup.mgc_desc,
             medgencomb.cmc_desc, medtype.mtc_desc,
             DECODE(meddesc.itc_medicine,'N','No','Y','MEDICINE') AS MEDICINE,
             DECODE(meddesc.itc_consumable,'N','No','Y','CONSUM') AS CONSUMABLE,
             DECODE(meddesc.itc_highvalue,'N',' ','Y','VALUE') AS HIGH_VALUE,
             DECODE(meddesc.itc_highrisk,'N',' ','Y','HIGH_RISK') AS HIGH_RISK,
             DECODE(meddesc.itc_hazardous,'N',' ','Y','HAZARDOUS') AS HAZARDOUS,
             DECODE(meddesc.itc_ved,'N','None','V','Vital','E','Essential','D','Desirable') AS VED,
             DECODE(meddesc.itc_breakable,'N','No','Y','Yes') AS BREAKABLE,
             meddesc.itn_breakqty, meddesc.itn_lprate, meddesc.itn_mrp,
             meddesc.itn_originalmrp, meddesc.itn_gendisper, meddesc.itn_genipdisper,
             meddesc.itd_date, meddesc.itd_eddate
      FROM MEDDESC
      RIGHT JOIN (SELECT DISTINCT(IT_CODE) FROM MEDSTORE) B ON MEDDESC.IT_CODE = B.IT_CODE
      LEFT JOIN medcategory ON meddesc.mc_code = medcategory.mc_code
      LEFT JOIN medgroup ON meddesc.mg_code = medgroup.mg_code
      LEFT JOIN medtype ON meddesc.mt_code = medtype.mt_code
      LEFT JOIN medstore ON meddesc.it_code = medstore.it_code
      LEFT JOIN pstparam ON medstore.st_code = pstparam.st_code
      LEFT JOIN medgencomb ON meddesc.cm_code = medgencomb.cm_code
      WHERE MEDDESC.ITC_STATUS = 'Y' AND meddesc.itd_eddate
        BETWEEN TO_DATE(:FROM_DATE, 'yyyy-mm-dd hh24:mi:ss') AND TO_DATE(:TO_DATE, 'yyyy-mm-dd hh24:mi:ss')
      GROUP BY meddesc.it_code, meddesc.itc_desc, meddesc.itc_alias, medcategory.mc_code, medcategory.mcc_desc,
               medgroup.mg_code, medgroup.mgc_desc, medtype.mt_code, medtype.mtc_desc, meddesc.itc_assestitem,
               meddesc.itc_medicine, meddesc.itc_consumable, meddesc.itc_highvalue, meddesc.itc_highrisk,
               meddesc.itc_hazardous, medgencomb.cmc_desc, meddesc.itc_ved, meddesc.itn_strip,
               meddesc.itc_breakable, meddesc.itn_breakqty, meddesc.itn_lprate, meddesc.itn_mrp,
               meddesc.itn_originalmrp, meddesc.itn_gendisper, meddesc.itn_genipdisper, meddesc.itd_date,
               meddesc.itd_eddate`; // keep your existing update Oracle SQL query here
    const updateResult = await conn_ora.execute(oracleSqlquery, {FROM_DATE: fromDate, TO_DATE: toDate}, {resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT});
    const updateRows = await updateResult.resultSet.getRows();
    await updateResult.resultSet.close();

    const updateItCodes = await getTMCItCodesInChunks(mysqlConn, fromDate, toDate, 1000);
    const updateSet = new Set(updateItCodes.flat());

    const filteredUpdates = updateRows.filter((row) => updateSet.has(row.IT_CODE));

    // Step 7: Perform updates
    if (filteredUpdates.length) {
      const updateQuery = `
        UPDATE bis_tmc_med_desc_mast
        SET
          itc_desc = ?, itc_alias = ?, itn_strip = ?, mc_code = ?, mcc_desc = ?,
          mg_code = ?, mgc_desc = ?, cmc_desc = ?, mtc_desc = ?, itc_medicine = ?,
          itc_consumable = ?, itc_highvalue = ?, itc_highrisk = ?, itc_hazardous = ?,
          itc_ved = ?, itc_breakable = ?, itn_breakqty = ?, itn_lprate = ?, itn_mrp = ?,
          itn_originalmrp = ?, itn_gendisper = ?, itn_genipdisper = ?, create_date = ?, edit_date = ?
        WHERE it_code = ?`;

      for (const row of filteredUpdates) {
        const updateValues = [
          row.ITC_DESC,
          row.ITC_ALIAS,
          row.ITN_STRIP,
          row.MC_CODE,
          row.MCC_DESC,
          row.MG_CODE,
          row.MGC_DESC,
          row.CMC_DESC,
          row.MTC_DESC,
          row.MEDICINE,
          row.CONSUMABLE,
          row.HIGH_VALUE,
          row.HIGH_RISK,
          row.HAZARDOUS,
          row.VED,
          row.BREAKABLE,
          row.ITN_BREAKQTY,
          row.ITN_LPRATE,
          row.ITN_MRP,
          row.ITN_ORIGINALMRP,
          row.ITN_GENDISPER,
          row.ITN_GENIPDISPER,
          row.ITD_DATE,
          row.ITD_EDDATE,
          row.IT_CODE,
        ];
        await queryPromise(mysqlConn, updateQuery, updateValues);
      }

      // Step 8: Update trigger (again, just in case)
      await queryPromise(
        mysqlConn,
        `
        UPDATE bis_tmc_trigger_details SET last_update_date = ? 
        WHERE trgr_slno = 1`,
        [currentDate]
      );
    }

    //  Step 9: Commit transaction
    await mysqlConn.commit();

    if (callBack) callBack(null, `Inserted: ${Values.length}, Updated: ${filteredUpdates.length}`);
  } catch (err) {
    if (mysqlConn) await mysqlConn.rollback();
    console.error("InsertTmcMedDesc error:", err);
    if (callBack) callBack(err);
  } finally {
    if (conn_ora) await conn_ora.close();
    if (mysqlConn) mysqlConn.release();
  }
};

///////////////////////////////////KMC*******************************

//TMCH
const getBisKmcLastTriggerDate = async () => {
  return new Promise((resolve, reject) => {
    bispool.getConnection((err, connection) => {
      if (err) {
        console.error("MySQL DB not connected. Check connection.");
        return reject(err);
      }
      const query = `SELECT last_insert_date, last_update_date FROM bis_kmc_trigger_details WHERE trgr_slno = 1`;
      connection.query(query, [], (err, results) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        resolve(results.length > 0 ? results[0] : null);
      });
    });
  });
};

const getKMCItCodesInChunks = (mysqlConn, fromDate, toDate, chunkSize = 1000) => {
  return new Promise((resolve, reject) => {
    const selectQuery = `
      SELECT it_code
      FROM bis_kmc_med_desc_mast
      WHERE create_date BETWEEN ? AND ?`;

    mysqlConn.query(selectQuery, [fromDate, toDate], (err, results) => {
      if (err) return reject(err);
      const numericItcodes = results?.map((val) => val.it_code);
      if (!numericItcodes || numericItcodes.length === 0) {
        return resolve([]);
      }

      // Chunk the array
      const chunkArray = (array, size) => {
        const result = [];
        for (let i = 0; i < array.length; i += size) {
          result.push(array.slice(i, i + size));
        }
        return result;
      };

      const chunks = chunkArray(numericItcodes, chunkSize);
      resolve(chunks);
    });
  });
};

// jomol code
const InsertKmcMedDesc = async (callBack) => {
  let pool_ora, conn_ora, mysqlConn;

  try {
    pool_ora = await oraKmcConnection();
    conn_ora = await pool_ora.getConnection();
    mysqlConn = await getConnection(bispool);

    const detail = await getBisKmcLastTriggerDate();
    const lastUpdateDate = detail?.last_insert_date ? new Date(detail.last_insert_date) : subMonths(new Date(), 1);
    const fromDate = format(lastUpdateDate, "yyyy-MM-dd HH:mm:ss");
    const toDate = format(new Date(), "yyyy-MM-dd HH:mm:ss");

    // Step 1: Fetch insert data from Oracle
    const oracleSql = `
      SELECT meddesc.it_code, meddesc.itc_desc, meddesc.itc_alias, meddesc.itn_strip,
             medcategory.mc_code, medcategory.mcc_desc, medgroup.mg_code, medgroup.mgc_desc,
             medgencomb.cmc_desc, medtype.mtc_desc,
             DECODE(meddesc.itc_medicine,'N','No','Y','MEDICINE') AS MEDICINE,
             DECODE(meddesc.itc_consumable,'N','No','Y','CONSUM') AS CONSUMABLE,
             DECODE(meddesc.itc_highvalue,'N',' ','Y','VALUE') AS HIGH_VALUE,
             DECODE(meddesc.itc_highrisk,'N',' ','Y','HIGH_RISK') AS HIGH_RISK,
             DECODE(meddesc.itc_hazardous,'N',' ','Y','HAZARDOUS') AS HAZARDOUS,
             DECODE(meddesc.itc_ved,'N','None','V','Vital','E','Essential','D','Desirable') AS VED,
             DECODE(meddesc.itc_breakable,'N','No','Y','Yes') AS BREAKABLE,
             meddesc.itn_breakqty, meddesc.itn_lprate, meddesc.itn_mrp,
             meddesc.itn_originalmrp, meddesc.itn_gendisper, meddesc.itn_genipdisper,
             meddesc.itd_date, meddesc.itd_eddate
      FROM MEDDESC
      RIGHT JOIN (SELECT DISTINCT(IT_CODE) FROM MEDSTORE) B ON MEDDESC.IT_CODE = B.IT_CODE
      LEFT JOIN medcategory ON meddesc.mc_code = medcategory.mc_code
      LEFT JOIN medgroup ON meddesc.mg_code = medgroup.mg_code
      LEFT JOIN medtype ON meddesc.mt_code = medtype.mt_code
      LEFT JOIN medstore ON meddesc.it_code = medstore.it_code
      LEFT JOIN pstparam ON medstore.st_code = pstparam.st_code
      LEFT JOIN medgencomb ON meddesc.cm_code = medgencomb.cm_code
      WHERE MEDDESC.ITC_STATUS = 'Y' AND meddesc.itd_date
        BETWEEN TO_DATE(:FROM_DATE, 'yyyy-mm-dd hh24:mi:ss') AND TO_DATE(:TO_DATE, 'yyyy-mm-dd hh24:mi:ss')
      GROUP BY meddesc.it_code, meddesc.itc_desc, meddesc.itc_alias, medcategory.mc_code, medcategory.mcc_desc,
               medgroup.mg_code, medgroup.mgc_desc, medtype.mt_code, medtype.mtc_desc, meddesc.itc_assestitem,
               meddesc.itc_medicine, meddesc.itc_consumable, meddesc.itc_highvalue, meddesc.itc_highrisk,
               meddesc.itc_hazardous, medgencomb.cmc_desc, meddesc.itc_ved, meddesc.itn_strip,
               meddesc.itc_breakable, meddesc.itn_breakqty, meddesc.itn_lprate, meddesc.itn_mrp,
               meddesc.itn_originalmrp, meddesc.itn_gendisper, meddesc.itn_genipdisper, meddesc.itd_date,
               meddesc.itd_eddate`; // keep your existing oracleSql query here
    const insertResult = await conn_ora.execute(oracleSql, {FROM_DATE: fromDate, TO_DATE: toDate}, {resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT});
    const insertRows = await insertResult.resultSet.getRows();
    await insertResult.resultSet.close();

    if (!insertRows.length) {
      if (callBack) callBack(null, "No data to insert.");
      return;
    }

    const Values = insertRows.map((row) => [
      row.IT_CODE,
      row.ITC_DESC,
      row.ITC_ALIAS,
      row.ITN_STRIP,
      row.MC_CODE,
      row.MCC_DESC,
      row.MG_CODE,
      row.MGC_DESC,
      row.CMC_DESC,
      row.MTC_DESC,
      row.MEDICINE,
      row.CONSUMABLE,
      row.HIGH_VALUE,
      row.HIGH_RISK,
      row.HAZARDOUS,
      row.VED,
      row.BREAKABLE,
      row.ITN_BREAKQTY,
      row.ITN_LPRATE,
      row.ITN_MRP,
      row.ITN_ORIGINALMRP,
      row.ITN_GENDISPER,
      row.ITN_GENIPDISPER,
      row.ITD_DATE,
      row.ITD_EDDATE,
    ]);

    // Step 2: Begin transaction
    await mysqlConn.beginTransaction();

    // Step 3: Insert into bis_kmc_med_desc_mast
    await queryPromise(
      mysqlConn,
      `
      INSERT INTO bis_kmc_med_desc_mast (
        it_code, itc_desc, itc_alias, itn_strip, mc_code, mcc_desc,
        mg_code, mgc_desc, cmc_desc, mtc_desc, itc_medicine, itc_consumable,
        itc_highvalue, itc_highrisk, itc_hazardous, itc_ved, itc_breakable,
        itn_breakqty, itn_lprate, itn_mrp, itn_originalmrp, itn_gendisper,
        itn_genipdisper, create_date, edit_date
      ) VALUES ?`,
      [Values]
    );

    // Step 4: Fetch chunks for medstore insert
    const insertedChunks = await getKMCItCodesInChunks(mysqlConn, fromDate, toDate, 1000);
    let medstoreData = [];

    for (const chunk of insertedChunks) {
      const bindParams = {};
      const keys = chunk.map((code, i) => {
        const key = `val${i}`;
        bindParams[key] = code;
        return `:${key}`;
      });

      const medstoreQuery = `
        SELECT IT_CODE, ST_CODE FROM MEDSTORE 
        WHERE IT_CODE IN (${keys.join(",")})`;

      const medstoreResult = await conn_ora.execute(medstoreQuery, bindParams, {outFormat: oracledb.OUT_FORMAT_OBJECT});

      if (medstoreResult.rows.length) {
        medstoreData.push(...medstoreResult.rows);
      }
    }

    if (medstoreData.length) {
      const medstoreValues = medstoreData.map((row) => [row.IT_CODE, row.ST_CODE]);
      await queryPromise(
        mysqlConn,
        `
        INSERT INTO bis_kmc_med_store (it_code, st_code) VALUES ?`,
        [medstoreValues]
      );
    }

    // Step 5: Update trigger table
    const currentDate = format(new Date(), "yyyy-MM-dd HH:mm:ss");
    await queryPromise(
      mysqlConn,
      `
      UPDATE bis_kmc_trigger_details 
      SET last_insert_date = ?, last_update_date = ? 
      WHERE trgr_slno = 1`,
      [currentDate, currentDate]
    );

    // Step 6: Fetch update records
    const oracleSqlquery = ` 
      SELECT meddesc.it_code, meddesc.itc_desc, meddesc.itc_alias, meddesc.itn_strip,
             medcategory.mc_code, medcategory.mcc_desc, medgroup.mg_code, medgroup.mgc_desc,
             medgencomb.cmc_desc, medtype.mtc_desc,
             DECODE(meddesc.itc_medicine,'N','No','Y','MEDICINE') AS MEDICINE,
             DECODE(meddesc.itc_consumable,'N','No','Y','CONSUM') AS CONSUMABLE,
             DECODE(meddesc.itc_highvalue,'N',' ','Y','VALUE') AS HIGH_VALUE,
             DECODE(meddesc.itc_highrisk,'N',' ','Y','HIGH_RISK') AS HIGH_RISK,
             DECODE(meddesc.itc_hazardous,'N',' ','Y','HAZARDOUS') AS HAZARDOUS,
             DECODE(meddesc.itc_ved,'N','None','V','Vital','E','Essential','D','Desirable') AS VED,
             DECODE(meddesc.itc_breakable,'N','No','Y','Yes') AS BREAKABLE,
             meddesc.itn_breakqty, meddesc.itn_lprate, meddesc.itn_mrp,
             meddesc.itn_originalmrp, meddesc.itn_gendisper, meddesc.itn_genipdisper,
             meddesc.itd_date, meddesc.itd_eddate
      FROM MEDDESC
      RIGHT JOIN (SELECT DISTINCT(IT_CODE) FROM MEDSTORE) B ON MEDDESC.IT_CODE = B.IT_CODE
      LEFT JOIN medcategory ON meddesc.mc_code = medcategory.mc_code
      LEFT JOIN medgroup ON meddesc.mg_code = medgroup.mg_code
      LEFT JOIN medtype ON meddesc.mt_code = medtype.mt_code
      LEFT JOIN medstore ON meddesc.it_code = medstore.it_code
      LEFT JOIN pstparam ON medstore.st_code = pstparam.st_code
      LEFT JOIN medgencomb ON meddesc.cm_code = medgencomb.cm_code
      WHERE MEDDESC.ITC_STATUS = 'Y' AND meddesc.itd_eddate
        BETWEEN TO_DATE(:FROM_DATE, 'yyyy-mm-dd hh24:mi:ss') AND TO_DATE(:TO_DATE, 'yyyy-mm-dd hh24:mi:ss')
      GROUP BY meddesc.it_code, meddesc.itc_desc, meddesc.itc_alias, medcategory.mc_code, medcategory.mcc_desc,
               medgroup.mg_code, medgroup.mgc_desc, medtype.mt_code, medtype.mtc_desc, meddesc.itc_assestitem,
               meddesc.itc_medicine, meddesc.itc_consumable, meddesc.itc_highvalue, meddesc.itc_highrisk,
               meddesc.itc_hazardous, medgencomb.cmc_desc, meddesc.itc_ved, meddesc.itn_strip,
               meddesc.itc_breakable, meddesc.itn_breakqty, meddesc.itn_lprate, meddesc.itn_mrp,
               meddesc.itn_originalmrp, meddesc.itn_gendisper, meddesc.itn_genipdisper, meddesc.itd_date,
               meddesc.itd_eddate`; // keep your existing update Oracle SQL query here
    const updateResult = await conn_ora.execute(oracleSqlquery, {FROM_DATE: fromDate, TO_DATE: toDate}, {resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT});
    const updateRows = await updateResult.resultSet.getRows();
    await updateResult.resultSet.close();

    const updateItCodes = await getKMCItCodesInChunks(mysqlConn, fromDate, toDate, 1000);
    const updateSet = new Set(updateItCodes.flat());

    const filteredUpdates = updateRows.filter((row) => updateSet.has(row.IT_CODE));

    // Step 7: Perform updates
    if (filteredUpdates.length) {
      const updateQuery = `
        UPDATE bis_kmc_med_desc_mast
        SET
          itc_desc = ?, itc_alias = ?, itn_strip = ?, mc_code = ?, mcc_desc = ?,
          mg_code = ?, mgc_desc = ?, cmc_desc = ?, mtc_desc = ?, itc_medicine = ?,
          itc_consumable = ?, itc_highvalue = ?, itc_highrisk = ?, itc_hazardous = ?,
          itc_ved = ?, itc_breakable = ?, itn_breakqty = ?, itn_lprate = ?, itn_mrp = ?,
          itn_originalmrp = ?, itn_gendisper = ?, itn_genipdisper = ?, create_date = ?, edit_date = ?
        WHERE it_code = ?`;

      for (const row of filteredUpdates) {
        const updateValues = [
          row.ITC_DESC,
          row.ITC_ALIAS,
          row.ITN_STRIP,
          row.MC_CODE,
          row.MCC_DESC,
          row.MG_CODE,
          row.MGC_DESC,
          row.CMC_DESC,
          row.MTC_DESC,
          row.MEDICINE,
          row.CONSUMABLE,
          row.HIGH_VALUE,
          row.HIGH_RISK,
          row.HAZARDOUS,
          row.VED,
          row.BREAKABLE,
          row.ITN_BREAKQTY,
          row.ITN_LPRATE,
          row.ITN_MRP,
          row.ITN_ORIGINALMRP,
          row.ITN_GENDISPER,
          row.ITN_GENIPDISPER,
          row.ITD_DATE,
          row.ITD_EDDATE,
          row.IT_CODE,
        ];
        await queryPromise(mysqlConn, updateQuery, updateValues);
      }

      // Step 8: Update trigger (again, just in case)
      await queryPromise(
        mysqlConn,
        `
        UPDATE bis_kmc_trigger_details SET last_update_date = ? 
        WHERE trgr_slno = 1`,
        [currentDate]
      );
    }

    //  Step 9: Commit transaction
    await mysqlConn.commit();

    if (callBack) callBack(null, `Inserted: ${Values.length}, Updated: ${filteredUpdates.length}`);
  } catch (err) {
    if (mysqlConn) await mysqlConn.rollback();
    console.error("InsertKmcMedDesc error:", err);
    if (callBack) callBack(err);
  } finally {
    if (conn_ora) await conn_ora.close();
    if (mysqlConn) mysqlConn.release();
  }
};

// cron.schedule("0 0 * * *", () => {
//   InsertKmcMedDesc();
// });

// // for 5 mints
// cron.schedule('*/5 * * * *', () => {
//   InsertKmcMedDesc();
// });

const updateAmsPatientDetails = () => {
  mysqlpool.getConnection((err, connection) => {
    if (err) {
      return;
    }
    const selectQuery = `
         SELECT 
          a.patient_ip_no,
          a.ams_patient_detail_slno,
          f.fb_bd_code,
          n.fb_ns_name
      FROM 
          ams_antibiotic_patient_details a,
          fb_ipadmiss f,
          fb_bed b,
          fb_nurse_station_master n
      WHERE 
          a.patient_ip_no = f.fb_ip_no
          AND f.fb_bd_code = b.fb_bd_code
          AND b.fb_ns_code = n.fb_ns_code
          AND a.report_updated = 0
          AND (
              a.bed_code IS NULL OR
              a.patient_location IS NULL OR
              a.bed_code <> f.fb_bd_code OR
              a.patient_location <> n.fb_ns_name
          )
        GROUP BY 
         a.ams_patient_detail_slno,
         a.patient_ip_no`;

    connection.query(selectQuery, (Err, results) => {
      if (Err) {
        connection.release();
        return;
      }
      if (results.length === 0) {
        connection.release();
        return;
      }
      const updateQuery = `
        UPDATE ams_antibiotic_patient_details 
        SET bed_code = ?, patient_location = ?
        WHERE ams_patient_detail_slno = ? AND patient_ip_no = ?
      `;

      const updatePromises = results.map((row) => {
        const {fb_bd_code, fb_ns_name, ams_patient_detail_slno, patient_ip_no} = row;
        return new Promise((resolve, reject) => {
          connection.query(updateQuery, [fb_bd_code, fb_ns_name, ams_patient_detail_slno, patient_ip_no], (updateErr) => {
            if (updateErr) {
              reject(updateErr);
            } else {
              resolve();
            }
          });
        });
      });

      // all settle works even if any of the query fails and doest throw error
      Promise.allSettled(updatePromises)
        .then(() => {
          connection.release();
        })
        .catch(() => {
          connection.release();
        });
    });
  });
};

const getAmsLastUpdatedDate = async (processId) => {
  return new Promise((resolve, reject) => {
    mysqlpool.getConnection((err, connection) => {
      if (err) {
        console.error("MySQL DB not connected. Check connection.");
        return reject(err);
      }
      const query = `
        SELECT ams_last_updated_date 
        FROM ams_patient_details_last_updated_date ;
      `;
      connection.query(query, [processId], (err, results) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        resolve(results.length > 0 ? results[0] : null);
      });
    });
  });
};

/****************************/

// // auto sync at an interval of 10 min/2
// cron.schedule("*/10 * * * *", () => {
//   getInpatientDetail();
// });

// // //  auto sync at an interval of 13 min
// cron.schedule("*/13 * * * *", () => {
//   UpdateIpStatusDetails();
// });

// // //  auto sync at an interval of 15 min
// cron.schedule("*/15 * * * *", () => {
//   UpdateInpatientDetailRmall();
// });

// // //  test triggering
// cron.schedule("*/17 * * * *", () => {
//   UpdateFbBedDetailMeliora();
// });

// cron.schedule("*/49 * * * *", () => {
//   getAmsPatientDetails();
// });

// // //runs at every 3 hours
// cron.schedule("0 */3 * * *", () => {
//   updateAmsPatientDetails();
// });

// // // Running InsertChilderDetailMeliora at midnight... 11.00 pm
// cron.schedule("0 23 * * *", () => {
//   InsertChilderDetailMeliora();
// });

// Run via cron- Jomol for BIS
// cron.schedule("*/2 * * * *", () => {
//   InsertKmcMedDesc();
// });

// ********************* BIS ************************
// cron.schedule("0 0 * * *", () => {
//   InsertKmcMedDesc();
// });

// cron.schedule("0 22 * * *", () => {
//   InsertTmcMedDesc();
// });
