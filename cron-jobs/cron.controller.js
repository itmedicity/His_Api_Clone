const cron = require("node-cron");
const {oraConnection, oracledb, oraKmcConnection} = require("../config/oradbconfig");
const pool = require("../config/dbconfig");
const mysqlpool = require("../config/dbconfigmeliora");
const {format, subHours, subMonths} = require("date-fns");
const bispool = require("../config/dbconfbis");

{
  /* %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% FEED BACK CRON-JOBS STARTS %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% */
}
// Getting Company Slno
const mysqlExecute = (sql, values = []) => {
  return new Promise((resolve, reject) => {
    mysqlpool.query(sql, values, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

// my sql transaction for patient insert Query
const mysqlExecuteTransaction = (queries = []) => {
  return new Promise((resolve, reject) => {
    mysqlpool.getConnection((err, connection) => {
      if (err) return reject(err);

      connection.beginTransaction(async (transactionerror) => {
        if (transactionerror) {
          connection.release();
          return reject(transactionerror);
        }

        try {
          const results = [];

          for (const {sql, values} of queries) {
            const data = await new Promise((ok, fail) => {
              connection.query(sql, values, (err, res) => {
                if (err) return fail(err);
                ok(res);
              });
            });
            results.push(data);
          }

          connection.commit((commitErr) => {
            if (commitErr) {
              return connection.rollback(() => {
                connection.release();
                reject(commitErr);
              });
            }
            connection.release();
            resolve(results);
          });
        } catch (error) {
          connection.rollback(() => {
            connection.release();
            reject(error);
          });
        }
      });
    });
  });
};

//Get Inpaitent Detail
const getInpatientDetail = async (callBack = () => {}) => {
  let pool_ora;
  let conn_ora;
  let resultSet;

  try {
    //  get company_slno
    const crmResult = await mysqlExecute("SELECT company_slno FROM crm_common");
    const companySlno = crmResult?.[0]?.company_slno;
    const mh_Code = Number(companySlno) === 1 ? "00" : "KC";

    //  ORACLE SQL
    const oracleSql = `
      SELECT  
        IPADMISS.IP_NO, 
        IPADMISS.IPD_DATE, 
        IPADMISS.PT_NO,
        IPADMISS.PTC_PTNAME,     
        IPADMISS.PTC_TYPE,                            
        IPADMISS.BD_CODE AS IPD_BD_CODE ,
        IPADMISS.DO_CODE,
        IPADMISS.PTC_SEX,
        IPADMISS.PTD_DOB,
        IPADMISS.PTN_DAYAGE,
        IPADMISS.PTN_MONTHAGE,
        IPADMISS.PTN_YEARAGE,
        IPADMISS.PTC_LOADD1,
        IPADMISS.PTC_LOADD2,
        IPADMISS.PTC_LOADD3,
        IPADMISS.PTC_LOADD4,
        IPADMISS.PTC_LOPIN,
        IPADMISS.PTC_LOPHONE,
        IPADMISS.PTC_MOBILE,
        IPADMISS.RC_CODE,
        IPADMISS.RS_CODE,   
        IPADMISS.IPC_CURSTATUS,   
        IPADMISS.IPC_MHCODE,
         DOCTOR.DOC_NAME ,
         (SELECT department.DPC_DESC
            FROM department
            LEFT JOIN speciality ON department.DP_CODE = speciality.DP_CODE
            LEFT JOIN doctor ON speciality.SP_CODE = doctor.SP_CODE
            WHERE doctor.DO_CODE = ipadmiss.DO_CODE) AS DPC_DESC      
              FROM IPADMISS
               LEFT JOIN rmall ON rmall.ip_no = ipadmiss.ip_no
               LEFT JOIN doctor ON doctor.do_code = ipadmiss.do_code 
               LEFT JOIN speciality ON doctor.SP_CODE=speciality.SP_CODE 
               LEFT JOIN department ON speciality.DP_CODE=department.DP_CODE
                        WHERE ipadmiss.IPC_MHCODE = :MH_CODE 
				                        AND NVL(IPD_DATE, SYSDATE) >= TO_DATE(:FROM_DATE, 'dd/MM/yyyy HH24:mi:ss')
                                AND NVL(IPD_DATE, SYSDATE) <= TO_DATE(:TO_DATE, 'dd/MM/yyyy HH24:mi:ss')
                                AND rmall.rmc_occupby IN ('P') 
                                and ipc_ptflag='N'    
                        Group by  IPADMISS.IP_NO, 
                                                IPADMISS.IPD_DATE, 
                                                IPADMISS.PT_NO,
                                                IPADMISS.PTC_PTNAME,     
                                                IPADMISS.PTC_TYPE,                            
                                                IPADMISS.BD_CODE,
                                                IPADMISS.DO_CODE,
                                                IPADMISS.PTC_SEX,
                                                IPADMISS.PTD_DOB,
                                                IPADMISS.PTN_DAYAGE,
                                                IPADMISS.PTN_MONTHAGE,
                                                IPADMISS.PTN_YEARAGE,
                                                IPADMISS.PTC_LOADD1,
                                                IPADMISS.PTC_LOADD2,
                                                IPADMISS.PTC_LOADD3,
                                                IPADMISS.PTC_LOADD4,
                                                IPADMISS.PTC_LOPIN,
                                                IPADMISS.PTC_LOPHONE,
                                                IPADMISS.PTC_MOBILE,
                                                IPADMISS.RC_CODE,
                                                IPADMISS.RS_CODE,   
                                                IPADMISS.IPC_CURSTATUS,   
                                                IPADMISS.IPC_MHCODE,
                                                DOCTOR.DOC_NAME        
                              ORDER BY  IPADMISS.IPD_DATE
    `;
    //  get date
    const detail = await getLastTriggerDate(1);
    const lastInsertDate = detail?.fb_last_trigger_date ? new Date(detail.fb_last_trigger_date) : new Date(Date.now() - 60 * 60 * 1000);

    if (isNaN(lastInsertDate)) {
      throw new Error("Invalid last trigger date");
    }

    const fromDate = format(lastInsertDate, "dd/MM/yyyy HH:mm:ss");
    const toDate = format(new Date(), "dd/MM/yyyy HH:mm:ss");
    const mysqlsupportToDate = format(new Date(), "yyyy-MM-dd HH:mm:ss");

    // Oracle execute
    pool_ora = await oraConnection();
    conn_ora = await pool_ora.getConnection();

    const result = await conn_ora.execute(oracleSql, {MH_CODE: mh_Code, FROM_DATE: fromDate, TO_DATE: toDate}, {resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT});

    resultSet = result.resultSet;

    // Fetch ALL rows at once
    const rows = await resultSet.getRows(0);

    await resultSet.close();
    resultSet = undefined;

    if (!rows || rows.length === 0) {
      return callBack(null, {message: "No rows from Oracle"});
    }

    //  Convert Oracle rows MySQL rows using map()
    const allValues = rows.map((item) => [
      item.IP_NO,
      item.IPD_DATE ? format(new Date(item.IPD_DATE), "yyyy-MM-dd HH:mm:ss") : null,
      item.PT_NO,
      item.PTC_PTNAME,
      item.PTC_SEX,
      item.PTD_DOB ? format(new Date(item.PTD_DOB), "yyyy-MM-dd HH:mm:ss") : null,
      item.PTN_DAYAGE,
      item.PTN_MONTHAGE,
      item.PTN_YEARAGE,
      item.PTC_LOADD1,
      item.PTC_LOADD2,
      item.PTC_LOADD3,
      item.PTC_LOADD4,
      item.PTC_LOPIN,
      item.RC_CODE,
      item.IPD_BD_CODE,
      item.DO_CODE,
      item.RS_CODE,
      item.IPC_CURSTATUS,
      item.PTC_MOBILE,
      item.IPC_MHCODE,
      item.DOC_NAME,
      item.DPC_DESC,
    ]);

    //  Bulk insert once (no loops used here also)
    const queries = [
      {
        sql: `INSERT INTO fb_ipadmiss (
                fb_ip_no, fb_ipd_date, fb_pt_no, fb_ptc_name, fb_ptc_sex,
                fb_ptd_dob, fb_ptn_dayage, fb_ptn_monthage, fb_ptn_yearage,
                fb_ptc_loadd1, fb_ptc_loadd2, fb_ptc_loadd3, fb_ptc_loadd4,
                fb_ptc_lopin, fb_rc_code, fb_bd_code, fb_do_code, fb_rs_code,
                fb_ipc_curstatus, fb_ptc_mobile, fb_ipc_mhcode, fb_doc_name, fb_dep_desc
             ) VALUES ?`,
        values: [allValues],
      },
      {
        sql: `INSERT INTO fb_ipadmiss_logdtl (fb_last_trigger_date, fb_process_id) VALUES (?, ?)`,
        values: [mysqlsupportToDate, 1],
      },
    ];

    await mysqlExecuteTransaction(queries);

    return callBack(null, {inserted: allValues.length});
  } catch (err) {
    console.error("getInpatientDetail error:", err);

    try {
      if (resultSet) await resultSet.close();
    } catch {}
    try {
      if (conn_ora) await conn_ora.close();
    } catch {}
    try {
      if (pool_ora) await pool_ora.close();
    } catch {}

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

// update trigger for ipadmiss to set curstatus ,actrelease and Discharge date details

// UPDATE IPADMISS STATUS DETAILS
const UpdateIpStatusDetails = async (callBack = () => {}) => {
  let pool_ora = null;
  let conn_ora = null;
  let resultSet = null;

  try {
    // 1. Get Last Trigger Date (Process ID = 2)
    const detail = await getLastTriggerDate(2);

    const lastUpdateDate = detail?.fb_last_trigger_date ? new Date(detail.fb_last_trigger_date) : new Date(Date.now() - 60 * 60 * 1000); // fallback:last 1 hour

    if (isNaN(lastUpdateDate.getTime())) {
      throw new Error("Invalid last trigger date");
    }

    // Oracle format
    const fromDate = format(lastUpdateDate, "dd/MM/yyyy HH:mm:ss");
    const toDate = format(new Date(), "dd/MM/yyyy HH:mm:ss");
    // MySQL format
    const mysqlsupportToDate = format(new Date(), "yyyy-MM-dd HH:mm:ss");

    // 2. Oracle SQL Query
    const oracleSql = `
      SELECT 
        ip_no,
        do_code,
        ipc_curstatus,
        ipd_disc,
        ipc_status,
        dmd_date,
        dmc_slno
      FROM ipadmiss
      WHERE ipc_ptflag = 'N'
        AND ipd_actrelease >= TO_DATE(:FROM_DATE, 'dd/MM/yyyy HH24:mi:ss')
        AND ipd_actrelease <= TO_DATE(:TO_DATE, 'dd/MM/yyyy HH24:mi:ss')
    `;

    // 3. Execute Oracle Query
    pool_ora = await oraConnection();
    conn_ora = await pool_ora.getConnection();

    const result = await conn_ora.execute(oracleSql, {FROM_DATE: fromDate, TO_DATE: toDate}, {resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT});

    resultSet = result.resultSet;

    const rows = await resultSet.getRows(0); // fetch all rows
    await resultSet.close();
    resultSet = null;

    if (!rows || rows.length === 0) {
      return callBack(null, {message: "No update rows found"});
    }

    // 4. Convert rows to update values
    const updateValues = rows.map((item) => [
      item.DO_CODE,
      item.IPC_CURSTATUS,
      item.IPD_DISC ? format(new Date(item.IPD_DISC), "yyyy-MM-dd HH:mm:ss") : null,
      item.IPC_STATUS,
      item.DMD_DATE ? format(new Date(item.DMD_DATE), "yyyy-MM-dd HH:mm:ss") : null,
      item.DMC_SLNO,
      item.IP_NO,
    ]);

    // 5. Prepare MySQL transaction queries
    const updateQueries = updateValues.map((row) => ({
      sql: `
        UPDATE fb_ipadmiss
        SET
          fb_do_code = ?,
          fb_ipc_curstatus = ?,
          fb_ipd_disc = ?,
          fb_ipc_status = ?,
          fb_dmd_date = ?,
          fb_dmc_slno = ?
        WHERE fb_ip_no = ?
      `,
      values: row,
    }));

    // insert log record
    updateQueries.push({
      sql: `INSERT INTO fb_ipadmiss_logdtl (fb_last_trigger_date, fb_process_id) VALUES (?, ?)`,
      values: [mysqlsupportToDate, 2],
    });

    // 6. Execute MySQL Transaction
    await mysqlExecuteTransaction(updateQueries);

    // 7. Callback success
    return callBack(null, {updated: updateValues.length});
  } catch (err) {
    return callBack(err);
  } finally {
    // Safe close
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

// tirgger for getting data form RMALL bed_code

// UPDATE BED DETAILS STATUS DETAILS
const UpdateInpatientDetailRmall = async (callBack = () => {}) => {
  let pool_ora = null;
  let conn_ora = null;
  let resultSet = null;

  try {
    // 1. Get Last Trigger Date (Process ID = 3)
    const detail = await getLastTriggerDate(3);

    const lastUpdateDate = detail?.fb_last_trigger_date ? new Date(detail.fb_last_trigger_date) : new Date(Date.now() - 60 * 60 * 1000); // fallback: last 1 hour

    if (isNaN(lastUpdateDate.getTime())) {
      throw new Error("Invalid last trigger date");
    }

    // Oracle date formats
    const fromDate = format(lastUpdateDate, "dd/MM/yyyy HH:mm:ss");
    const toDate = format(new Date(), "dd/MM/yyyy HH:mm:ss");

    // MySQL format
    const mysqlsupportToDate = format(new Date(), "yyyy-MM-dd HH:mm:ss");

    // 2. Oracle SQL
    const oracleSql = `
      SELECT 
        rmall.bd_code,
        rmall.ip_no
      FROM rmall
      LEFT JOIN ipadmiss ON rmall.ip_no = ipadmiss.ip_no
      WHERE ipadmiss.ipc_ptflag = 'N'
        AND rmall.rmd_relesedate IS NULL
        AND rmall.rmd_occupdate >= TO_DATE(:FROM_DATE, 'dd/MM/yyyy HH24:mi:ss')
        AND rmall.rmd_occupdate <= TO_DATE(:TO_DATE, 'dd/MM/yyyy HH24:mi:ss')
    `;

    // 3. Execute Oracle Query
    pool_ora = await oraConnection();
    conn_ora = await pool_ora.getConnection();

    const result = await conn_ora.execute(oracleSql, {FROM_DATE: fromDate, TO_DATE: toDate}, {resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT});

    resultSet = result.resultSet;

    const rows = await resultSet.getRows(0); // fetch all rows
    await resultSet.close();
    resultSet = null;

    if (!rows || rows.length === 0) {
      return callBack(null, {message: "No updated rows found"});
    }

    // 4. Prepare update values
    const updateValues = rows.map((item) => [item.BD_CODE, item.IP_NO]);

    // 5. Build MySQL Transaction Queries
    const updateQueries = updateValues.map((row) => ({
      sql: `
        UPDATE fb_ipadmiss
        SET fb_bd_code = ?
        WHERE fb_ip_no = ?
      `,
      values: row,
    }));

    // Add log entry
    updateQueries.push({
      sql: `
        INSERT INTO fb_ipadmiss_logdtl (fb_last_trigger_date, fb_process_id)
        VALUES (?, ?)
      `,
      values: [mysqlsupportToDate, 3],
    });

    // 6. Run MySQL Transaction
    await mysqlExecuteTransaction(updateQueries);

    // 7. Success
    return callBack(null, {updated: updateValues.length});
  } catch (error) {
    return callBack(error);
  } finally {
    // Proper resource cleanup
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

// trigger to fetch data from bed to update fb_bed

// UPDATE BED DETAILS  DETAILS ON BED TABLE
const UpdateFbBedDetailMeliora = async (callBack = () => {}) => {
  let pool_ora = null;
  let conn_ora = null;
  let resultSet = null;

  try {
    // 1. Get last trigger date (Process ID = 4)
    const detail = await getLastTriggerDate(4);

    const lastUpdateDate = detail?.fb_last_trigger_date ? new Date(detail.fb_last_trigger_date) : new Date(Date.now() - 60 * 60 * 1000); // fallback: last 1 hour

    if (isNaN(lastUpdateDate.getTime())) {
      throw new Error("Invalid last trigger date");
    }

    // Oracle formats
    const fromDate = format(lastUpdateDate, "dd/MM/yyyy HH:mm:ss");
    const toDate = format(new Date(), "dd/MM/yyyy HH:mm:ss");
    // MySQL format
    const mysqlsupportToDate = format(new Date(), "yyyy-MM-dd HH:mm:ss");

    // 2. Oracle SQL
    const oracleSql = `
      SELECT 
        BD.BDC_OCCUP,
        BD.BD_CODE,
        SUM(BD.BDN_OCCNO) AS OCCU
      FROM BED BD
      WHERE BD.BDC_STATUS = 'Y'
        AND BD.BDD_EDDATE >= TO_DATE(:FROM_DATE, 'dd/MM/yyyy HH24:mi:ss')
        AND BD.BDD_EDDATE <= TO_DATE(:TO_DATE, 'dd/MM/yyyy HH24:mi:ss')
      GROUP BY BD.BDC_OCCUP, BD.BD_CODE
    `;

    // 3. Execute Oracle
    pool_ora = await oraConnection();
    conn_ora = await pool_ora.getConnection();

    const result = await conn_ora.execute(oracleSql, {FROM_DATE: fromDate, TO_DATE: toDate}, {resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT});

    resultSet = result.resultSet;
    const rows = await resultSet.getRows(0); // fetch all rows

    await resultSet.close();
    resultSet = null;

    if (!rows || rows.length === 0) {
      return callBack(null, {message: "No bed update rows found"});
    }

    // 4. Prepare update values
    const updateValues = rows.map((item) => [item.BDC_OCCUP, item.OCCU, item.BD_CODE]);

    // 5. Build MySQL transaction queries
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

    // Add log entry (process_id = 4)
    updateQueries.push({
      sql: `
        INSERT INTO fb_ipadmiss_logdtl (fb_last_trigger_date, fb_process_id)
        VALUES (?, ?)
      `,
      values: [mysqlsupportToDate, 4],
    });

    // 6. Run MySQL transaction
    await mysqlExecuteTransaction(updateQueries);

    // 7. Success
    return callBack(null, {updated: updateValues.length});
  } catch (error) {
    return callBack(error);
  } finally {
    // Safe close of resources
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
      WHERE B.BRD_DATE >= TO_DATE(:GET_DATE, 'DD-MON-YYYY')
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

/****************************/
const getLastTriggerDate = async (processId) => {
  return new Promise((resolve, reject) => {
    mysqlpool.getConnection((err, connection) => {
      if (err) {
        console.log("MySQL DB not connected. Check connection.");
        return reject(err);
      }
      const query = `
        SELECT fb_last_trigger_date 
        FROM fb_ipadmiss_logdtl 
        WHERE fb_process_id = ? 
        ORDER BY fb_log_slno DESC 
        LIMIT 1;
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

// getting child detail from ellider
// const InsertChilderDetailMeliora = async (callBack) => {
//   let pool_ora = await oraConnection();
//   let conn_ora = await pool_ora.getConnection();

//   const oracleSql = `
//      SELECT B.BR_SLNO,
//             B.BRD_DATE,
//             B.PT_NO,
//             B.PTC_PTNAME,
//             B.PTC_LOADD1,
//             B.PTC_LOADD2,
//             B.BRC_HUSBAND,
//             B.BRN_AGE,
//             B.BRN_TOTAL,
//             B.BRN_LIVE,
//             B.BD_CODE,
//             B.IP_NO,
//             B.BRC_MHCODE,
//             L.BRC_SEX AS CHILD_GENDER,
//             L.BRD_DATE AS BIRTH_DATE,
//             L.IP_NO AS MOTHER_IPNO,
//             L.PT_NO AS CHILD_PT_NO,
//             L.CHILD_IPNO AS CHILD_IPNO,
//             L.BRN_WEIGHT AS CHILD_WEIGHT
//        FROM BIRTHREGMAST B
//             LEFT JOIN BRITHREGDETL L ON B.BR_SLNO=L.BR_SLNO
//        WHERE B.BRD_DATE>= to_date(:GET_DATE,'DD-MON-YYYY')`;
//   try {

//     // date convertion to oracle support
//     const formattedDate = format(new Date(), 'dd-MMM-yyyy').toUpperCase();

//     const result = await conn_ora.execute(
//       oracleSql,
//       {
//         GET_DATE: formattedDate
//       },
//       { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT }
//     );

//     const rows = await result.resultSet.getRows();
//     //  STOP execution if no data
//     if (!rows || rows.length === 0) {
//       console.log("No Birth Registerd Today.");
//       return; // This now stops the entire async function
//     }

//     // result of the oracle query
//     const VALUES = rows?.map(item => [
//       item.BR_SLNO,
//       item.BRD_DATE ? format(new Date(item?.BRD_DATE), 'yyyy-MM-dd HH:mm:ss') : null,
//       item.PT_NO,
//       item.PTC_PTNAME,
//       item.PTC_LOADD1,
//       item.PTC_LOADD2,
//       item.BRC_HUSBAND,
//       item.BRN_AGE,
//       item.BRN_TOTAL,
//       item.BRN_LIVE,
//       item.BD_CODE,
//       item.IP_NO,
//       item.BRC_MHCODE,
//       item.CHILD_GENDER,
//       item.BIRTH_DATE ? format(new Date(item?.BIRTH_DATE), 'yyyy-MM-dd HH:mm:ss') : null,
//       item.MOTHER_IPNO,
//       item.CHILD_PT_NO,
//       item.CHILD_IPNO,
//       item.CHILD_WEIGHT,
//     ]);
//     // INSERT DATA INTO THE MYSQL TABLE
//     mysqlpool.getConnection((err, connection) => {
//       if (err) {
//         // mysql db not connected check connection
//         console.log("mysql db not connected check connection");
//         return;
//       }
//       connection.beginTransaction((err) => {
//         if (err) {
//           connection.release();
//           console.log("error in begin transaction");
//         }
//         connection.query(
//           `INSERT INTO fb_birth_reg_mast(
//                   fb_br_slno,
//                   fb_brd_date,
//                   fb_pt_no,
//                   fb_ptc_name,
//                   fb_ptc_loadd1,
//                   fb_ptc_loadd2,
//                   fb_brc_husband,
//                   fb_brn_age,
//                   fb_brn_total,
//                   fb_brn_live,
//                   fb_bd_code,
//                   fb_ip_no,
//                   fb_brc_mhcode,
//                   fb_child_gender,
//                   fb_birth_date,
//                   fb_mother_ip_no,
//                   fb_child_pt_no,
//                   fb_child_ip_no,
//                   fb_child_weight
//                 ) VALUES ?
//                   `,
//           [
//             VALUES
//           ],
//           (err, result) => {
//             if (err) {
//               console.log(err, "err");
//               connection.rollback(() => {
//                 connection.release();
//                 console.log("error in rollback data");
//               });
//             } else {
//               connection.commit((err) => {
//                 if (err) {
//                   connection.rollback(() => {
//                     connection.release();
//                     console.log("error in commit");
//                   });
//                 } else {
//                   connection.release();
//                 }
//               });
//             }
//           }
//         );
//       })
//     });
//     // });
//   } catch (error) {
//     console.log(error, "Error occured!");
//     return callBack(error)
//   } finally {
//     if (conn_ora) {
//       await conn_ora.close();
//       await pool_ora.close();
//     }
//   }
// };

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
// cron.schedule("*/2 * * * *", () => {
//   getInpatientDetail();
// });

// //  test triggering
// cron.schedule("*/3 * * * *", () => {
//   UpdateFbBedDetailMeliora();
// });

// //  auto sync at an interval of 25 min
// cron.schedule("*/5 * * * *", () => {
//   UpdateInpatientDetailRmall();
// });

// //  auto sync at an interval of 20 min
// cron.schedule("*/7 * * * *", () => {
//   UpdateIpStatusDetails();
// });

// cron.schedule("*/49 * * * *", () => {
//   getAmsPatientDetails();
// });

// //runs at every 3 hours
// cron.schedule("0 */3 * * *", () => {
//   updateAmsPatientDetails();
// });

// // Running InsertChilderDetailMeliora at midnight... 11.00 pm
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

// const getInpatientDetail = async (callBack) => {
//   let pool_ora = await oraConnection();
//   let conn_ora = await pool_ora.getConnection();

//   let crmResult;
//   try {
//     // example call
//     crmResult = await mysqlExecute(`select company_slno from crm_common`, []);
//   } catch (error) {
//     console.log(error, "Error occured!");
//     return callBack(error);
//   }

//   const companySlno = crmResult[0]?.company_slno;
//   const mh_Code = Number(companySlno) === 1 ? '00' : 'KC';

//   //new query
//   const oracleSql = `
//       SELECT
//         IPADMISS.IP_NO,
//         IPADMISS.IPD_DATE,
//         IPADMISS.PT_NO,
//         IPADMISS.PTC_PTNAME,
//         IPADMISS.PTC_TYPE,
//         IPADMISS.BD_CODE AS IPD_BD_CODE ,
//         IPADMISS.DO_CODE,
//         IPADMISS.PTC_SEX,
//         IPADMISS.PTD_DOB,
//         IPADMISS.PTN_DAYAGE,
//         IPADMISS.PTN_MONTHAGE,
//         IPADMISS.PTN_YEARAGE,
//         IPADMISS.PTC_LOADD1,
//         IPADMISS.PTC_LOADD2,
//         IPADMISS.PTC_LOADD3,
//         IPADMISS.PTC_LOADD4,
//         IPADMISS.PTC_LOPIN,
//         IPADMISS.PTC_LOPHONE,
//         IPADMISS.PTC_MOBILE,
//         IPADMISS.RC_CODE,
//         IPADMISS.RS_CODE,
//         IPADMISS.IPC_CURSTATUS,
//         IPADMISS.IPC_MHCODE,
//          DOCTOR.DOC_NAME ,
//          (SELECT department.DPC_DESC
//             FROM department
//             LEFT JOIN speciality ON department.DP_CODE = speciality.DP_CODE
//             LEFT JOIN doctor ON speciality.SP_CODE = doctor.SP_CODE
//             WHERE doctor.DO_CODE = ipadmiss.DO_CODE) AS DPC_DESC
//               FROM IPADMISS
//                LEFT JOIN rmall ON rmall.ip_no = ipadmiss.ip_no
//                LEFT JOIN doctor ON doctor.do_code = ipadmiss.do_code
//                LEFT JOIN speciality ON doctor.SP_CODE=speciality.SP_CODE
//                LEFT JOIN department ON speciality.DP_CODE=department.DP_CODE
//                         WHERE ipadmiss.IPC_MHCODE = :MH_CODE
//                                 AND NVL(IPD_DATE, SYSDATE) >= TO_DATE(:FROM_DATE, 'dd/MM/yyyy HH24:mi:ss')
//                                 AND NVL(IPD_DATE, SYSDATE) <= TO_DATE(:TO_DATE, 'dd/MM/yyyy HH24:mi:ss')
//                                 AND rmall.rmc_occupby IN ('P')
//                                 and ipc_ptflag='N'
//                               ORDER BY  IPADMISS.IPD_DATE
//       `;

//   // chance to throw this error : Error => ORA-01849: hour must be between 1 and 12
//   try {
//     // sql get query from meliora here
//     const detail = await getLastTriggerDate(1)

//     // lastupdate time
//     const lastInsertDate = detail?.fb_last_trigger_date
//       ? new Date(detail?.fb_last_trigger_date)
//       : subHours(new Date(), 1);

//     // const manualFromDate = new Date(2025, 4, 20, 9, 10, 0);// test date

//     // date convertion to oracle support
//     const fromDate = format(new Date(lastInsertDate), 'dd/MM/yyyy HH:mm:ss');
//     const toDate = format(new Date(), 'dd/MM/yyyy HH:mm:ss');

//     const mysqlsupportToDate = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

//     // GET DATA FROM ORACLE
//     const result = await conn_ora.execute(
//       oracleSql,
//       {
//         MH_CODE: mh_Code,
//         FROM_DATE: fromDate,
//         TO_DATE: toDate
//       },
//       { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT }
//     );

//     result.resultSet?.getRows((err, rows) => {
//       //  CHECK DATA FROM THE ORACLE DATABASE
//       if (rows.length === 0) {
//         // console.log("No data found");
//         return;
//       }

//       // FILTER DATA
//       const VALUES = rows?.map(item => [
//         item.IP_NO,
//         item.IPD_DATE ? format(new Date(item?.IPD_DATE), 'yyyy-MM-dd HH:mm:ss') : null,
//         item.PT_NO,
//         item.PTC_PTNAME,
//         item.PTC_SEX,
//         item.PTD_DOB ? format(new Date(item?.PTD_DOB), 'yyyy-MM-dd HH:mm:ss') : null,
//         item.PTN_DAYAGE,
//         item.PTN_MONTHAGE,
//         item.PTN_YEARAGE,
//         item.PTC_LOADD1,
//         item.PTC_LOADD2,
//         item.PTC_LOADD3,
//         item.PTC_LOADD4,
//         item.PTC_LOPIN,
//         item.RC_CODE,
//         item.IPD_BD_CODE,
//         item.DO_CODE,
//         item.RS_CODE,
//         item.IPC_CURSTATUS,
//         item.PTC_MOBILE,
//         item.IPC_MHCODE,
//         item.DOC_NAME,
//         item.DPC_DESC
//       ]);

//       // INSERT DATA INTO THE MYSQL TABLE
//       mysqlpool.getConnection((err, connection) => {
//         if (err) {
//           // mysql db not connected check connection
//           console.log("mysql db not connected check connection");
//           return;
//         }
//         connection.beginTransaction((err) => {
//           if (err) {
//             connection.release();
//             console.log("error in begin transaction");
//           }

//           connection.query(
//             `INSERT INTO fb_ipadmiss (
//                         fb_ip_no,
//                         fb_ipd_date,
//                         fb_pt_no,
//                         fb_ptc_name,
//                         fb_ptc_sex,
//                         fb_ptd_dob,
//                         fb_ptn_dayage,
//                         fb_ptn_monthage,
//                         fb_ptn_yearage,
//                         fb_ptc_loadd1,
//                         fb_ptc_loadd2,
//                         fb_ptc_loadd3,
//                         fb_ptc_loadd4,
//                         fb_ptc_lopin,
//                         fb_rc_code,
//                         fb_bd_code,
//                         fb_do_code,
//                         fb_rs_code,
//                         fb_ipc_curstatus,
//                         fb_ptc_mobile,
//                         fb_ipc_mhcode,
//                         fb_doc_name,
//                         fb_dep_desc
//                     ) VALUES ?
//                     `,
//             [
//               VALUES
//             ],
//             (err, result) => {
//               if (err) {
//                 console.log(err, "err");
//                 connection.rollback(() => {
//                   connection.release();
//                   console.log("error in rollback data");
//                 });
//               } else {
//                 connection.commit((err) => {
//                   if (err) {
//                     connection.rollback(() => {
//                       connection.release();
//                       console.log("error in commit");
//                     });
//                   } else {

//                     //inserting detail in log table fb_process_id === 1 for inpatientinsert
//                     connection.query(
//                       `INSERT INTO fb_ipadmiss_logdtl (fb_last_trigger_date,fb_process_id) VALUES (?,?)`,
//                       [
//                         mysqlsupportToDate, 1
//                       ],
//                       (err, result) => {
//                         if (err) {

//                           connection.rollback(() => {
//                             connection.release();
//                             console.log("error in rollback data");
//                           });
//                         } else {
//                           connection.commit((err) => {
//                             if (err) {
//                               connection.rollback(() => {
//                                 connection.release();
//                                 console.log("error in commit");
//                               });
//                             } else {
//                               connection.release();
//                               // console.log("success insertion");
//                             }
//                           });
//                         }
//                       }
//                     );
//                     //  ends here
//                   }
//                 });
//               }
//             }
//           );
//         });
//       });

//     });
//   } catch (error) {
//     console.log(error, "Error occured!");
//     return callBack(error);
//   } finally {
//     if (conn_ora) {
//       await conn_ora.close();
//       await pool_ora.close();
//     }
//   }
// };
