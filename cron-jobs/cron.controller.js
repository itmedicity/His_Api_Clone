const cron = require("node-cron");
const {format, subHours, subMonths, subSeconds, startOfDay} = require("date-fns");

// const pool = require("../config/dbconfig");
// const mysqlpool = require("../config/dbconfigmeliora");
// const bispool = require("../config/dbconfbis");
const {oracledb, getTmcCronConnection, getKmcConnection} = require("../config/oradbconfig");
const {pools, acquireLock, transaction, releaseLock} = require("../config/mysqldbconfig");
const {
  endLogSuccess,
  endLogFailure,
  startLog,
  getCompanySlno,
  mysqlExecuteTransaction,
  getLastTriggerDate,
  getLastProcessedAdmissionDate,
  getLastProcessedDischargeDate,
  captureDischargeHistory,
  withRetry,
  mysqlExecute,
} = require("./CronLogger");

/* %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% FEED BACK CRON-JOBS STARTS %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% */

const getAdmittedPatientInfoToInsert = async () => {
  const CRON_LOCK = "FB_IPADMISS_IMPORT_LOCK";
  let ora;
  let logId;
  let jobStartTime = new Date();
  let jobEndTime;
  /* ---------------- CRON LOCK CONTROL ---------------- */
  const locked = await acquireLock("meliora", CRON_LOCK);
  if (!locked) return;

  try {
    // 1 - starging log
    logId = await startLog("FB_IPADMISS_IMPORT");
    // 2 - Get Company Info (MySQL)
    const companySlno = await getCompanySlno();
    const mhCode = Number(companySlno) === 1 ? "00" : "KC";
    // 3 - GET LAST TRIGGER DATE (MySQL)
    const lastProcessedDate = await getLastProcessedAdmissionDate();
    // 4 - SELECT MAX(fb_dmd_date) FROM fb_ipadmiss for last processed date
    // (4a) - IF First run safety → go back 1 hour
    const fromDate = lastProcessedDate ? lastProcessedDate : subSeconds(new Date(), 3600);
    // (4b) - To Date - 1 sec
    const toDate = subSeconds(new Date(), 1);
    // 5 - FETCH Oracle Data with fromDate and toDate and toDate and mh_code
    // (5a) - CONNECT TO ORACLE
    ora = await getTmcCronConnection();
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
      WHERE IPD_DATE > :FROM_DATE
      AND IPD_DATE <= :TO_DATE
      AND IPC_PTFLAG='N' AND IP.IPC_MHCODE = :MH_CODE
    `;
    const {rows = []} = await ora.execute(
      oracleSql,
      {
        FROM_DATE: fromDate,
        TO_DATE: toDate,
        MH_CODE: mhCode,
      },
      {outFormat: oracledb.OUT_FORMAT_OBJECT},
    );

    if (!rows.length) {
      await endLogSuccess(logId, {
        oracleRows: 0,
        mysqlInserted: 0,
        mysqlUpdated: 0,
        oracleTime: jobStartTime ? new Date() - jobStartTime : null,
        mysqlTime: null,
      });
      return;
    }
    // 6. CONVERT ORACLE DATA TO MYSQL DATA
    const values = rows.map((r) => [
      r.IP_NO,
      r.IPD_DATE ? format(r.IPD_DATE, "yyyy-MM-dd HH:mm:ss") : null,
      r.PT_NO,
      r.PTC_PTNAME,
      r.PTC_SEX,
      r.PTD_DOB ? format(r.PTD_DOB, "yyyy-MM-dd HH:mm:ss") : null,
      r.PTC_LOADD1,
      r.BD_CODE,
      r.DO_CODE,
      r.DOC_NAME,
      r.DPC_DESC,
      r.IPD_DISC ? format(r.IPD_DISC, "yyyy-MM-dd HH:mm:ss") : null,
      r.IPC_STATUS,
      r.DMC_SLNO,
      r.DMD_DATE ? format(r.DMD_DATE, "yyyy-MM-dd HH:mm:ss") : null,
      r.PTC_MOBILE,
      r.IPC_MHCODE,
      r.IPC_CURSTATUS,
    ]);
    // 7. MYSQL INSERT (IDEMPOTENT)
    const insertSql = `
      INSERT INTO fb_ipadmiss (
        fb_ip_no, fb_ipd_date, fb_pt_no, fb_ptc_name, fb_ptc_sex,
        fb_ptd_dob, fb_ptc_loadd1, fb_bd_code, fb_do_code,
        fb_doc_name, fb_dep_desc, fb_ipd_disc, fb_ipc_status,
        fb_dmc_slno, fb_dmd_date, fb_ptc_mobile,
        fb_ipc_mhcode, fb_ipc_curstatus
      ) VALUES ?
      ON DUPLICATE KEY UPDATE
        fb_ipd_date        = VALUES(fb_ipd_date),
        fb_ipc_curstatus   = VALUES(fb_ipc_curstatus),
        fb_dmd_date        = VALUES(fb_dmd_date),
        fb_bd_code         = VALUES(fb_bd_code),
        fb_do_code         = VALUES(fb_do_code),
        fb_doc_name        = VALUES(fb_doc_name)
    `;
    const [res] = await transaction("meliora", [{sql: insertSql, values: [values]}]);
    // 8. SUCCESS LOG
    /* note ->
       affectedRows = inserted + updated*2 bcz on duplicate its updating 
    */
    await endLogSuccess(logId, {
      oracleRows: rows.length ?? 0,
      mysqlInserted: res.affectedRows ?? 0,
      mysqlUpdated: 0,
      oracleTime: null,
      mysqlTime: jobStartTime ? new Date() - jobStartTime : null,
    });
  } catch (err) {
    if (logId) await endLogFailure(logId, err);
    throw err;
  } finally {
    if (ora) await ora.close();
    await releaseLock("meliora", CRON_LOCK);
  }
};

//UPDATE DISCHAGE AND BED STATUS FROM ORACLE IPADMISS TO MYSQL IPADMISS BASED ON IP_NO AND DMD_DATE
const UpdateDischargeAndBedStatus = async () => {
  const CRON_LOCK = "FB_IPSTATUS_IMPORT_LOCK";
  let ora;
  let logId;
  /*****************************************************************************
   * 1 -> START THE LOG
   * 2 -> GET COMPANY INFORMATION
   * 3 -> GET LAST TRIGGER DATE FROM IPADMISS TABLE BASED ON DM_DATE ( FROM DATE)
   * 4 -> DECLARE TO DATE -> CURRENT DATE - 1 SECONDS
   * 5 -> START  ORACLE CONNECTION
   * 6 -> GET DATA FROM ORACLE BASED ON LAST TRIGGER DATE
   * 7 -> IF NO ROW FOUND THEN END THE LOG AND EXIT
   * 8 -> IF DATA -> CONVERT DATA FOR MYSQL FORMAT
   * 9 -> TRIGGER AND INSERT DATA INTO MYSQL
   * 10 -> COMMIT AND END THE LOG
   */
  /*------------------ START THE LOCK --------------------*/
  const locked = await acquireLock("meliora", CRON_LOCK);
  if (!locked) return;

  try {
    // 1 -> START THE LOG
    logId = await startLog("FB_IPSTATUS_IMPORT");
    // 2 -> GET COMPANY INFORMATION
    const companySlno = await getCompanySlno();
    const mhCode = Number(companySlno) === 1 ? "00" : "KC";
    // 3 -> GET LAST TRIGGER DATE FROM IPADMISS TABLE BASED ON DM_DATE ( FROM DATE)
    const lastDischargeDate = await getLastProcessedDischargeDate();
    const fromDate = lastDischargeDate ?? subSeconds(new Date(), 3600);
    // 4 -> DECLARE TO DATE -> CURRENT DATE - 1 SECONDS
    const toDate = subSeconds(new Date(), 1);
    // 5 -> START  ORACLE CONNECTION
    ora = await getTmcCronConnection();
    // 6 -> GET DATA FROM ORACLE BASED ON LAST TRIGGER DATE
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
        WHERE IP.DMD_DATE > :FROM_DATE AND IP.DMD_DATE <= :TO_DATE
        AND IP.ipc_ptflag = 'N' AND IP.IPC_MHCODE = :MH_CODE
      `;
    const {rows = []} = await ora.execute(oracleSql, {FROM_DATE: fromDate, TO_DATE: toDate, MH_CODE: mhCode}, {outFormat: oracledb.OUT_FORMAT_OBJECT});

    const oracleTime = Date.now() - oracleStart;

    if (!rows.length) {
      await endLogSuccess(logId, {
        oracleRows: 0,
        mysqlInserted: 0,
        mysqlUpdated: 0,
        oracleTime,
        mysqlTime: 0,
      });
      return;
    }

    /*  PREPARE TEMP DATA */
    const tempValues = rows.map((r) => [
      r.IP_NO,
      r.DO_CODE,
      r.IPC_CURSTATUS,
      r.IPD_DISC ? format(r.IPD_DISC, "yyyy-MM-dd HH:mm:ss") : null,
      r.IPC_STATUS,
      r.DMD_DATE ? format(r.DMD_DATE, "yyyy-MM-dd HH:mm:ss") : null,
      r.DMC_SLNO,
      r.DOC_NAME,
    ]);

    /*  MYSQL TRANSACTION  */
    const mysqlStart = Date.now();

    const results = await transaction("meliora", [
      {sql: `DROP TEMPORARY TABLE IF EXISTS tmp_ip_discharge`},
      {
        sql: `
        CREATE TEMPORARY TABLE tmp_ip_discharge (
          ip_no VARCHAR(20) PRIMARY KEY,
          do_code VARCHAR(20),
          ipc_curstatus VARCHAR(10),
          ipd_disc DATETIME,
          ipc_status VARCHAR(10),
          dmd_date DATETIME,
          dmc_slno INT,
          doc_name VARCHAR(255)
        ) ENGINE=MEMORY`,
      },
      {
        sql: `
        INSERT INTO tmp_ip_discharge VALUES ?
        ON DUPLICATE KEY UPDATE
          do_code=VALUES(do_code),
          ipc_curstatus=VALUES(ipc_curstatus),
          ipd_disc=VALUES(ipd_disc),
          ipc_status=VALUES(ipc_status),
          dmd_date=VALUES(dmd_date),
          dmc_slno=VALUES(dmc_slno),
          doc_name=VALUES(doc_name)`,
        values: [tempValues],
      },
      {
        sql: `
        UPDATE fb_ipadmiss f
        JOIN tmp_ip_discharge t ON t.ip_no = f.fb_ip_no
        SET
          f.fb_do_code = t.do_code,
          f.fb_ipc_curstatus = t.ipc_curstatus,
          f.fb_ipd_disc = t.ipd_disc,
          f.fb_ipc_status = t.ipc_status,
          f.fb_dmd_date = t.dmd_date,
          f.fb_dmc_slno = t.dmc_slno,
          f.fb_doc_name = t.doc_name
        WHERE f.fb_dmd_date IS NULL
           OR f.fb_dmd_date < t.dmd_date`,
      },
    ]);

    const mysqlUpdated = results.find((r) => r.affectedRows !== undefined)?.affectedRows || 0;
    const mysqlTime = Date.now() - mysqlStart;

    /*  SUCCESS LOG */
    await endLogSuccess(logId, {
      oracleRows: rows.length,
      mysqlInserted: 0,
      mysqlUpdated,
      oracleTime,
      mysqlTime,
    });
  } catch (error) {
    if (logId) await endLogFailure(logId, error);
    throw error;
  } finally {
    if (ora) await ora.close();
    await releaseLock("meliora", CRON_LOCK);
  }
};

// UPDATE BED DETAILS STATUS DETAILS
const UpdateInpatientDetailRmall = async () => {
  let conn_ora;
  let logId;

  const CRON_LOCK = "FB_IPRMALL_IMPORT_LOCK";
  /*--------------------statr lock---------------------------*/
  const locked = await acquireLock("meliora", CRON_LOCK);
  if (!locked) return;

  try {
    // 1. START LOG
    logId = await startLog("FB_IPRMALL_IMPORT");
    /* GET LAST TRIGGER DATE */
    const detail = await getLastTriggerDate(3);
    const lastTrigger = detail?.fb_last_trigger_date ? new Date(detail.fb_last_trigger_date) : subHours(new Date(), 1);
    if (isNaN(lastTrigger.getTime())) throw new Error("Invalid last trigger date");

    // 3. FETCH ORACLE DATA
    const jobStartTime = new Date();
    const oracleStart = Date.now();

    conn_ora = await getTmcCronConnection();
    const oracleSql = `
      SELECT 
        rmall.bd_code,
        rmall.ip_no,
        RMALL.RMC_OCCUPBY
      FROM rmall
       JOIN ipadmiss ON rmall.ip_no = ipadmiss.ip_no
      WHERE ipadmiss.ipc_ptflag = 'N'
        AND rmall.rmd_relesedate IS NULL
        AND rmall.rmd_occupdate >= :FROM_DATE
        AND rmall.rmd_occupdate < :TO_DATE
    `;
    const {rows = []} = await conn_ora.execute(oracleSql, {FROM_DATE: lastTrigger, TO_DATE: jobStartTime}, {outFormat: oracledb.OUT_FORMAT_OBJECT});

    const oracleTime = Date.now() - oracleStart;
    if (!rows.length) {
      await endLogSuccess(logId, {
        oracleRows: 0,
        mysqlUpdated: 0,
        oracleTime,
      });
      return;
    }

    /* 4 MYSQL BULK UPDATE */
    const mysqlStart = Date.now();
    const bulkValues = rows.map((r) => [r.IP_NO, r.BD_CODE]);

    const results = await mysqlExecuteTransaction([
      {sql: `DROP TEMPORARY TABLE IF EXISTS tmp_ip_bed`},
      {
        sql: `
          CREATE TEMPORARY TABLE tmp_ip_bed (
            ip_no   VARCHAR(20) PRIMARY KEY,
            bd_code VARCHAR(20)
          ) ENGINE=MEMORY
        `,
      },
      {
        sql: `
          INSERT INTO tmp_ip_bed (ip_no, bd_code)
          VALUES ?
          ON DUPLICATE KEY UPDATE
            bd_code = VALUES(bd_code)
        `,
        values: [bulkValues],
      },
      {
        sql: `
          UPDATE fb_ipadmiss f
          JOIN tmp_ip_bed t ON t.ip_no = f.fb_ip_no
          SET f.fb_bd_code = t.bd_code
        `,
      },
      detail
        ? {
            sql: `
              UPDATE fb_ipadmiss_logdtl
              SET fb_last_trigger_date = ?
              WHERE fb_process_id = 3
            `,
            values: [format(jobStartTime, "yyyy-MM-dd HH:mm:ss")],
          }
        : {
            sql: `
              INSERT INTO fb_ipadmiss_logdtl
              (fb_last_trigger_date, fb_process_id)
              VALUES (?, 3)
            `,
            values: [format(jobStartTime, "yyyy-MM-dd HH:mm:ss")],
          },
    ]);

    const updateResult = results.find((r) => r.affectedRows !== undefined);
    const mysqlUpdated = updateResult?.affectedRows || 0;
    const mysqlTime = Date.now() - mysqlStart;

    /* SUCCESS LOG */
    await endLogSuccess(logId, {
      oracleRows: rows.length,
      mysqlUpdated,
      oracleTime,
      mysqlTime,
    });
  } catch (err) {
    if (logId) await endLogFailure(logId, err);
    throw err;
  } finally {
    if (conn_ora) await conn_ora.close();
    await releaseLock("meliora", CRON_LOCK);
  }
};

// UPDATE BED DETAILS  DETAILS ON BED TABLE
const UpdateFbBedDetailMeliora = async () => {
  let conn_ora;
  let logId;

  const CRON_LOCK = "FB_BED_IMPORT_LOCK";

  /* --------------------statr lock--------------------------- */
  const locked = await acquireLock("meliora", CRON_LOCK);
  if (!locked) return;

  try {
    /*  START LOG */
    logId = await startLog("FB_BED_IMPORT");

    /*  LAST TRIGGER */
    const detail = await getLastTriggerDate(4);
    const lastTrigger = detail?.fb_last_trigger_date ? new Date(detail.fb_last_trigger_date) : subHours(new Date(), 1);

    if (isNaN(lastTrigger)) throw new Error("Invalid trigger date");

    const jobStartTime = new Date();

    /* ORACLE FETCH */
    const oracleStart = Date.now();
    conn_ora = await getTmcCronConnection();

    const oracleSql = `
      SELECT 
        BD.BDC_OCCUP,
        BD.BDN_OCCNO,
        BD.BD_CODE
      FROM BED BD
      WHERE BD.BDC_STATUS = 'Y'
        AND BD.BDD_EDDATE >= TO_DATE(:FROM_DATE,'dd/MM/yyyy HH24:mi:ss')
        AND BD.BDD_EDDATE < TO_DATE(:TO_DATE,'dd/MM/yyyy HH24:mi:ss')
    `;

    const {rows = []} = await conn_ora.execute(
      oracleSql,
      {
        FROM_DATE: lastTrigger,
        TO_DATE: jobStartTime,
      },
      {outFormat: oracledb.OUT_FORMAT_OBJECT},
    );

    const oracleTime = Date.now() - oracleStart;

    if (!rows.length) {
      await endLogSuccess(logId, {
        oracleRows: 0,
        mysqlUpdated: 0,
        oracleTime,
      });
      return;
    }

    /* MYSQL BULK UPDATE */
    const mysqlStart = Date.now();

    const bulkValues = rows.map((r) => [r.BD_CODE, r.BDC_OCCUP, r.BDN_OCCNO]);
    const results = await transaction("meliora", [
      {sql: `DROP TEMPORARY TABLE IF EXISTS tmp_bed_update`},
      {
        sql: `
          CREATE TEMPORARY TABLE tmp_bed_update (
            bd_code VARCHAR(20) PRIMARY KEY,
            occup   VARCHAR(5),
            occ_no  VARCHAR(20)
          ) ENGINE=MEMORY
        `,
      },
      {
        sql: `
          INSERT INTO tmp_bed_update (bd_code, occup, occ_no)
          VALUES ?
          ON DUPLICATE KEY UPDATE
            occup = VALUES(occup),
            occ_no = VALUES(occ_no)
        `,
        values: [bulkValues],
      },
      {
        sql: `
          UPDATE fb_bed b
          JOIN tmp_bed_update t ON t.bd_code = b.fb_bd_code
          SET
            b.fb_bdc_occup = t.occup,
            b.fb_bdn_cccno = t.occ_no
        `,
      },
      detail
        ? {
            sql: `
              UPDATE fb_ipadmiss_logdtl
              SET fb_last_trigger_date = ?
              WHERE fb_process_id = 4
            `,
            values: [format(jobStartTime, "yyyy-MM-dd HH:mm:ss")],
          }
        : {
            sql: `
              INSERT INTO fb_ipadmiss_logdtl
              (fb_last_trigger_date, fb_process_id)
              VALUES (?, 4)
            `,
            values: [format(jobStartTime, "yyyy-MM-dd HH:mm:ss")],
          },
    ]);

    const updateResult = results.find((r) => r.affectedRows !== undefined);
    const mysqlUpdated = updateResult?.affectedRows || 0;
    const mysqlTime = Date.now() - mysqlStart;

    /* SUCCESS LOG */
    await endLogSuccess(logId, {
      oracleRows: rows.length,
      mysqlUpdated,
      oracleTime,
      mysqlTime,
    });
  } catch (err) {
    if (logId) await endLogFailure(logId, err);
    throw err;
  } finally {
    if (conn_ora) await conn_ora.close();
    await releaseLock("meliora", CRON_LOCK);
  }
};

// GET CHILD DETAIL FROM ELLIDER
const InsertChilderDetailMeliora = async () => {
  let conn_ora;
  let logId;
  let jobStartTime = new Date();

  const CRON_LOCK = "FB_BIRTH_IMPORT_LOCK";
  /*-----------------------starting the locking --------------------------------*/
  const locked = await acquireLock("meliora", CRON_LOCK);
  if (!locked) return;

  try {
    /* START LOG */
    logId = await startLog("FB_BIRTH_IMPORT");
    /* ORACLE DATE (START OF TODAY) */
    const fromDate = startOfDay(new Date());
    /* ORACLE FETCH */
    conn_ora = await getTmcCronConnection();

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
        L.BRC_SEX       AS CHILD_GENDER,
        L.BRD_DATE     AS BIRTH_DATE,
        L.IP_NO        AS MOTHER_IPNO,
        L.PT_NO        AS CHILD_PT_NO,
        L.CHILD_IPNO   AS CHILD_IPNO,
        L.BRN_WEIGHT   AS CHILD_WEIGHT
      FROM BIRTHREGMAST B
      LEFT JOIN BRITHREGDETL L ON B.BR_SLNO = L.BR_SLNO
      WHERE B.BRD_DATE >= :FROM_DATE
    `;
    const {rows = []} = await conn_ora.execute(oracleSql, {FROM_DATE: fromDate}, {outFormat: oracledb.OUT_FORMAT_OBJECT});

    if (!rows.length) {
      await endLogSuccess(logId, {
        oracleRows: 0,
        mysqlInserted: 0,
        oracleTime: jobStartTime ? new Date() - jobStartTime : null,
      });
      return;
    }

    /*  MAP TO MYSQL */
    const values = rows.map((r) => [
      r.BR_SLNO,
      r.BRD_DATE ? format(r.BRD_DATE, "yyyy-MM-dd HH:mm:ss") : null,
      r.PT_NO,
      r.PTC_PTNAME,
      r.PTC_LOADD1,
      r.PTC_LOADD2,
      r.BRC_HUSBAND,
      r.BRN_AGE,
      r.BRN_TOTAL,
      r.BRN_LIVE,
      r.BD_CODE,
      r.IP_NO,
      r.BRC_MHCODE,
      r.CHILD_GENDER,
      r.BIRTH_DATE ? format(r.BIRTH_DATE, "yyyy-MM-dd HH:mm:ss") : null,
      r.MOTHER_IPNO,
      r.CHILD_PT_NO,
      r.CHILD_IPNO,
      r.CHILD_WEIGHT,
    ]);

    /*  MYSQL UPSERT */
    const insertSql = `
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
      ON DUPLICATE KEY UPDATE
        fb_child_weight = VALUES(fb_child_weight),
        fb_birth_date   = VALUES(fb_birth_date),
        fb_child_gender = VALUES(fb_child_gender)
    `;
    const [res] = await transaction("meliora", [{sql: insertSql, values: [values]}]);

    /*  SUCCESS LOG */
    await endLogSuccess(logId, {
      oracleRows: rows.length,
      mysqlInserted: res.affectedRows,
      oracleTime: jobStartTime ? new Date() - jobStartTime : null,
      mysqlTime: jobStartTime ? new Date() - jobStartTime : null,
    });
  } catch (err) {
    if (logId) await endLogFailure(logId, err);
    throw err;
  } finally {
    if (conn_ora) await conn_ora.close();
    await releaseLock("meliora", CRON_LOCK);
  }
};

/* %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% FEED BACK CRON-JOBS ENDS %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% */

// const getAmsPatientDetails = async () => {
//   let conn_ora;
//   let logId;

//   const LOCK = "AMS_PATIENT_IMPORT_LOCK";

//   /* -----------------------start lock----------------------------*/
//   const locked = await acquireLock("meliora", LOCK);
//   if (!locked) return;

//   try {
//     /*  START LOG */
//     logId = await startLog("AMS_PATIENT_IMPORT");

//     /*  LAST UPDATED DATE */
//     const detail = await getAmsLastUpdatedDate(1);
//     if (!detail?.ams_last_updated_date) {
//       await endLogSuccess(logId, {oracleRows: 0, mysqlInserted: 0});
//       return;
//     }

//     const fromDate = new Date(detail.ams_last_updated_date);
//     const toDate = new Date();
//     const mysqlDate = format(toDate, "yyyy-MM-dd HH:mm:ss");

//     /*  ACTIVE ITEM CODES */
//     const itemCodes = await execute("meliora", `SELECT item_code FROM ams_antibiotic_master WHERE status = 1`);

//     if (!itemCodes.length) return;

//     /*  ORACLE FETCH */
//     conn_ora = await getTmcCronConnection();

//     const binds = itemCodes.map((_, i) => `:it${i}`).join(",");
//     const params = {FROM_DATE: fromDate, TO_DATE: toDate};

//     itemCodes.forEach((r, i) => {
//       params[`it${i}`] = r.item_code;
//     });

//     const oracleSql = `
//       SELECT
//         P.BMD_DATE,
//         P.BM_NO,
//         B.BD_CODE,
//         P.PT_NO,
//         PT.PTC_PTNAME,
//         DECODE(PT.PTC_SEX,'M','Male','F','Female') GENEDER,
//         PT.PTN_YEARAGE,
//         P.IP_NO,
//         N.NSC_DESC,
//         D.DOC_NAME,
//         DP.DPC_DESC,
//         PL.IT_CODE
//       FROM PBILLMAST P
//       JOIN PBILLDETL PL ON P.BMC_SLNO = PL.BMC_SLNO
//       JOIN PATIENT PT ON P.PT_NO = PT.PT_NO
//       LEFT JOIN IPADMISS I ON P.IP_NO = I.IP_NO
//       LEFT JOIN BED B ON I.BD_CODE = B.BD_CODE
//       LEFT JOIN NURSTATION N ON B.NS_CODE = N.NS_CODE
//       LEFT JOIN DOCTOR D ON P.DO_CODE = D.DO_CODE
//       LEFT JOIN SPECIALITY S ON D.SP_CODE = S.SP_CODE
//       LEFT JOIN DEPARTMENT DP ON S.DP_CODE = DP.DP_CODE
//       WHERE PL.IT_CODE IN (${binds})
//         AND P.BMD_DATE BETWEEN :FROM_DATE AND :TO_DATE
//     `;

//     const {rows = []} = await conn_ora.execute(oracleSql, params, {outFormat: oracledb.OUT_FORMAT_OBJECT});

//     if (!rows.length) {
//       await endLogSuccess(logId, {oracleRows: 0, mysqlInserted: 0});
//       return;
//     }

//     /*  GROUP BY IP */
//     const grouped = new Map();

//     for (const r of rows) {
//       if (!r.IP_NO || !r.PT_NO) continue;

//       const billDate = format(r.BMD_DATE, "yyyy-MM-dd HH:mm:ss");

//       if (!grouped.has(r.IP_NO)) {
//         grouped.set(r.IP_NO, {
//           patient: [r.PT_NO, r.IP_NO, r.PTC_PTNAME, r.PTN_YEARAGE, r.GENEDER, r.NSC_DESC, r.BD_CODE, r.DPC_DESC, billDate, r.DOC_NAME],
//           antibiotics: [],
//         });
//       }

//       grouped.get(r.IP_NO).antibiotics.push([r.IP_NO, r.IT_CODE, r.BM_NO, billDate, 1]);
//     }

//     /*  EXISTING PATIENTS */
//     const ipNos = [...grouped.keys()];
//     const placeholders = ipNos.map(() => "?").join(",");

//     const existing = await execute(
//       "meliora",
//       `SELECT ams_patient_detail_slno, patient_ip_no
//        FROM ams_antibiotic_patient_details
//        WHERE patient_ip_no IN (${placeholders})
//          AND report_updated = 0`,
//       ipNos,
//     );

//     const existingMap = new Map(existing.map((r) => [r.patient_ip_no, r.ams_patient_detail_slno]));

//     const newPatients = [];
//     const antibiotics = [];

//     for (const [ip, data] of grouped) {
//       if (existingMap.has(ip)) {
//         const id = existingMap.get(ip);
//         data.antibiotics.forEach((a) => antibiotics.push([id, ...a]));
//       } else {
//         newPatients.push(data.patient);
//       }
//     }

//     /*  TRANSACTION */
//     await transaction("meliora", [
//       ...(newPatients.length
//         ? [
//             {
//               sql: `
//               INSERT INTO ams_antibiotic_patient_details (
//                 mrd_no, patient_ip_no, patient_name,
//                 patient_age, patient_gender, patient_location,
//                 bed_code, consultant_department, bill_date, doc_name
//               ) VALUES ?
//             `,
//               values: [newPatients],
//             },
//           ]
//         : []),

//       ...(antibiotics.length
//         ? [
//             {
//               sql: `
//               INSERT INTO ams_patient_antibiotics (
//                 ams_patient_detail_slno, patient_ip_no,
//                 item_code, bill_no, bill_date, item_status
//               ) VALUES ?
//             `,
//               values: [antibiotics],
//             },
//           ]
//         : []),

//       {
//         sql: `
//           UPDATE ams_patient_details_last_updated_date
//           SET ams_last_updated_date = ?
//           WHERE ams_lastupdate_slno = 1
//         `,
//         values: [mysqlDate],
//       },
//     ]);

//     /*  SUCCESS */
//     await endLogSuccess(logId, {
//       oracleRows: rows.length,
//       mysqlInserted: newPatients.length,
//     });
//   } catch (err) {
//     if (logId) await endLogFailure(logId, err);
//     throw err;
//   } finally {
//     if (conn_ora) await conn_ora.close();
//     await releaseLock("meliora", LOCK);
//   }
// };

/**
 *
 * CRONE OVER LAP PREVENTION
 *
 */
// START FUN
const runningJobs = new Set();

async function safeRun(name, fn) {
  if (runningJobs.has(name)) {
    console.warn(`[CRON SKIPPED] ${name} already running`);
    return;
  }

  runningJobs.add(name);
  const start = Date.now();

  try {
    await fn();
    console.log(`[CRON SUCCESS] ${name} (${Date.now() - start} ms)`);
  } catch (e) {
    console.error(`[CRON FAILED] ${name}`, e);
  } finally {
    runningJobs.delete(name);
  }
}

// END FUN

// 1 Admit patients
cron.schedule("0,15,30,45 * * * *", async () => {
  await safeRun("getAdmittedPatientInfoToInsert", getAdmittedPatientInfoToInsert);
});

// 2 Bed / Rmall update
cron.schedule("3,18,33,48 * * * *", async () => {
  await safeRun("UpdateInpatientDetailRmall", UpdateInpatientDetailRmall);
});

// 3 Discharge & status
cron.schedule("6,21,36,51 * * * *", async () => {
  await safeRun("UpdateDischargeAndBedStatus", UpdateDischargeAndBedStatus);
});

// 4 Final bed sync
cron.schedule("9,24,39,54 * * * *", async () => {
  await safeRun("UpdateFbBedDetailMeliora", UpdateFbBedDetailMeliora);
});

cron.schedule("0 23 * * *", async () => {
  await safeRun("InsertChilderDetailMeliora", InsertChilderDetailMeliora);
});

// cron.schedule("*/49 * * * *", async () => {
//   await safeRun("getAmsPatientDetails", getAmsPatientDetails);
// });

// cron.schedule("0 */3 * * *", async () => {
//   await safeRun("updateAmsPatientDetails", updateAmsPatientDetails);
// });

/***************************************FOR TEST************************************************/

// 1 Admit patients
// cron.schedule("*/10 * * * *", async () => {
//   await safeRun("getAdmittedPatientInfoToInsert", getAdmittedPatientInfoToInsert);
//   console.log("getAdmittedPatientInfoToInsert - Test Cron executed" + new Date().toLocaleTimeString());
// });

// // // 2 Bed / Rmall update
// cron.schedule("*/13 * * * *", async () => {
//   await safeRun("UpdateInpatientDetailRmall", UpdateInpatientDetailRmall);
//   console.log("UpdateInpatientDetailRmall - Test Cron executed" + new Date().toLocaleTimeString());
// });

// // // 3 Discharge & status
// cron.schedule("*/1 * * * *", async () => {
//   await safeRun("UpdateDischargeAndBedStatus", UpdateDischargeAndBedStatus);
//   console.log("UpdateDischargeAndBedStatus - Test Cron executed" + new Date().toLocaleTimeString());
// });

// // 4 Final bed sync
// cron.schedule("*/1 * * * *", async () => {
//   await safeRun("UpdateFbBedDetailMeliora", UpdateFbBedDetailMeliora);
//   console.log("UpdateFbBedDetailMeliora - Test Cron executed" + new Date().toLocaleTimeString());
// });

// cron.schedule("*/1 * * * *", async () => {
//   await safeRun("InsertChilderDetailMeliora", InsertChilderDetailMeliora);
//   console.log("InsertChilderDetailMeliora - Test Cron executed" + new Date().toLocaleTimeString());
// });

// cron.schedule("*/49 * * * *", async () => {
//   await safeRun("getAmsPatientDetails", getAmsPatientDetails);
// });
/**************************************FOR TEST TIMI*************************************************/
