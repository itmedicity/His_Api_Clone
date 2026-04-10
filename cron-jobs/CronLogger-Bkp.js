// cronLogger.js
const {tr} = require("date-fns/locale");
const {pools} = require("../config/mysqldbconfig");
// const mysqlpool = require("../config/dbconfigmeliora");

const mysqlExecute = async (sql, values = []) => {
  const [rows] = await pools.meliora.execute(sql, values);
  return rows;
  // return new Promise((resolve, reject) => {
  //   pools.meliora.query(sql, values, (err, result) => {
  //     if (err) return reject(err);
  //     resolve(result);
  //   });
  // });
};

const startLog = async (cronName) => {
  const result = await mysqlExecute(
    `INSERT INTO cron_job_log (cron_name, start_time)
     VALUES (?, NOW())`,
    [cronName],
  );
  return result.insertId;
};

const endLogSuccess = async (logId, data) => {
  const {oracleRows = 0, mysqlInserted = 0, mysqlUpdated = 0, oracleTime = 0, mysqlTime = 0} = data;

  await mysqlExecute(
    `UPDATE cron_job_log
       SET end_time = NOW(),
           oracle_rows_fetched = ?,
           mysql_inserted = ?,
           mysql_updated = ?,
           oracle_fetch_time_ms = ?,
           mysql_write_time_ms = ?,
           status = 'SUCCESS'
       WHERE id = ?`,
    [oracleRows, mysqlInserted, mysqlUpdated, oracleTime, mysqlTime, logId],
  );
};

const endLogFailure = async (logId, error) => {
  await mysqlExecute(
    `UPDATE cron_job_log
       SET status = 'FAILED',
           error_message = ?,
           end_time = NOW()
       WHERE id = ?`,
    [error.message || String(error), logId],
  );
};

// Fetching Current company Slno
const getCompanySlno = async () => {
  const crmResult = await mysqlExecute("SELECT company_slno FROM crm_common LIMIT 1");
  const companySlno = crmResult?.[0]?.company_slno;

  if (!companySlno) {
    throw new Error("company_slno not found in crm_common");
  }

  return companySlno;
};

const getSchemaByCompanyAndModule = async (companySlno, moduleCode) => {
  const schemaDetail = await mysqlExecute(
    `
        SELECT schema_name
        FROM hsp_company_schema_map
        WHERE hsp_company_slno = ?
          AND hsp_module_code  = ?
          AND hsp_map_status = 1
        `,
    [companySlno, moduleCode],
  );

  // MySQL returns array of rows
  if (!schemaDetail || schemaDetail?.length === 0) {
    throw new Error(`Schema not found for company ${companySlno}, module ${moduleCode}`);
  }
  const schemaName = schemaDetail[0].schema_name;
  // SECURITY CHECK REMOVE INVALID SECHEMA
  if (!/^[A-Z0-9_]+$/i.test(schemaName)) {
    throw new Error("Invalid schema name");
  }
  return schemaName;
};

// MySql transaction for patient insert Query
const mysqlExecuteTransaction = (queries = []) => {
  return new Promise((resolve, reject) => {
    pools.meliora.getConnection((err, connection) => {
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

const getLastTriggerDate = async (processId) => {
  return new Promise((resolve, reject) => {
    pools.meliora.getConnection((err, connection) => {
      if (err) {
        console.log("MySQL DB not connected. Check connection.");
        return reject(err);
      }
      const query = ` SELECT fb_last_trigger_date FROM fb_ipadmiss_logdtl WHERE fb_process_id = ? `;
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

const getLastProcessedAdmissionDate = async () => {
  //  GET MAX ADMISSION DATE FROM IPADMISS
  try {
    const res = await mysqlExecute(`
      SELECT MAX(fb_ipd_date) AS last_admitted_date
      FROM fb_ipadmiss;
    `);

    return res?.[0]?.last_admitted_date ? new Date(res[0].last_admitted_date) : null;
  } catch (error) {
    throw new Error("Error fetching last processed admission date: " + error.message);
  }
};

const getLastProcessedDischargeDate = async () => {
  //  GET MAX DISCHARGE DATE FROM IPADMISS
  try {
    const res = await mysqlExecute(`
     SELECT MAX(fb_dmd_date) AS last_admitted_date
      FROM fb_ipadmiss;
    `);

    return res?.[0]?.last_discharge_date ? new Date(res[0].last_discharge_date) : null;
  } catch (error) {
    throw new Error("Error fetching last processed discharge date: " + error.message);
  }
};

const captureDischargeHistory = async (row) => {
  const existing = await mysqlExecute(
    `
    SELECT fb_ipc_curstatus, fb_dmd_date, fb_do_code, fb_doc_name
    FROM fb_ipadmiss
    WHERE fb_ip_no = ?
    `,
    [row.IP_NO],
  );

  if (!existing.length) return;

  const old = existing[0];

  if (new Date(row.DMD_DATE) <= new Date(old.fb_dmd_date) || row.IPC_CURSTATUS === old.fb_ipc_curstatus) {
    return;
  }
  await mysqlExecute(
    `
    INSERT INTO fb_ipadmiss_status_history (
      fb_ip_no,
      old_status,
      new_status,
      old_dmd_date,
      new_dmd_date,
      old_do_code,
      new_do_code,
      old_doc_name,
      new_doc_name
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [row.IP_NO, old.fb_ipc_curstatus, row.IPC_CURSTATUS, old.fb_dmd_date, row.DMD_DATE, old.fb_do_code, row.DO_CODE, old.fb_doc_name, row.DOC_NAME],
  );
};

const withRetry = async (fn, retries = 3, delayMs = 500) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if ((err.errno === 1213 || err.errno === 1205) && i < retries - 1) {
        console.warn(`⚠️ Deadlock detected. Retrying ${i + 1}/${retries}`);
        await new Promise((r) => setTimeout(r, delayMs));
      } else {
        throw err;
      }
    }
  }
};

module.exports = {
  startLog,
  endLogSuccess,
  endLogFailure,
  mysqlExecute,
  getCompanySlno,
  mysqlExecuteTransaction,
  getLastTriggerDate,
  getSchemaByCompanyAndModule,
  getLastProcessedAdmissionDate,
  getLastProcessedDischargeDate,
  captureDischargeHistory,
  withRetry,
};
