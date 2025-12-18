// cronLogger.js
const mysqlpool = require("../config/dbconfigmeliora");

const mysqlExecute = (sql, values = []) => {
    return new Promise((resolve, reject) => {
        mysqlpool.query(sql, values, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};


const startLog = async (cronName) => {
    const result = await mysqlExecute(
        `INSERT INTO cron_job_log (cron_name, start_time)
     VALUES (?, NOW())`,
        [cronName]
    );
    return result.insertId;
};

const endLogSuccess = async (logId, data) => {
    const {
        oracleRows = 0,
        mysqlInserted = 0,
        mysqlUpdated = 0,
        oracleTime = 0,
        mysqlTime = 0
    } = data;

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
        [oracleRows, mysqlInserted, mysqlUpdated, oracleTime, mysqlTime, logId]
    );
};

const endLogFailure = async (logId, error) => {
    await mysqlExecute(
        `UPDATE cron_job_log
       SET status = 'FAILED',
           error_message = ?,
           end_time = NOW()
       WHERE id = ?`,
        [error.message || String(error), logId]
    );
};


const getCompanySlno = async () => {
    const crmResult = await mysqlExecute(
        "SELECT company_slno FROM crm_common LIMIT 1"
    );
    const companySlno = crmResult?.[0]?.company_slno;

    if (!companySlno) {
        throw new Error("company_slno not found in crm_common");
    }

    return companySlno;
};

module.exports = { startLog, endLogSuccess, endLogFailure, mysqlExecute, getCompanySlno };
