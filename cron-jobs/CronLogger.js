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

// Fetching Current company Slno
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



// MySql transaction for patient insert Query
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

                    for (const { sql, values } of queries) {
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
        mysqlpool.getConnection((err, connection) => {
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

module.exports = { startLog, endLogSuccess, endLogFailure, mysqlExecute, getCompanySlno, mysqlExecuteTransaction, getLastTriggerDate };
