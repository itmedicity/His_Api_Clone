const {getTmcConnection, getTmcCronConnection, getKmcConnection, oracleConnectionClose, restartPools} = require("./oradbconfig");

const RETRY_ERRORS = ["DPI-1080", "DPI-1010", "ORA-03113", "ORA-03114", "ORA-00028", "ORA-12537", "ORA-12541", "ORA-12545", "NJS-040", "NJS-003", "NJS-511"];

//ERROR DETECTION
function shouldRetry(error) {
  if (!error) return false;

  const text = String(error.message || error);

  return RETRY_ERRORS.some((e) => text.includes(e));
}

// DELEAY HELPER FUNCTION
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function execute(getConnection, sql, bind = {}, options = {}) {
  const MAX_RETRY = 3;

  let attempt = 0;

  while (attempt < MAX_RETRY) {
    let connection = null;

    try {
      connection = await getConnection();

      const result = await connection.execute(sql, bind, options);

      return result;
    } catch (err) {
      console.log("--------------------------------");
      console.log(`Oracle Execute Error (Attempt ${attempt + 1}/${MAX_RETRY})`);
      console.log(err.message);
      console.log("--------------------------------");

      // Don't retry non-recoverable errors
      if (!shouldRetry(err) || attempt === MAX_RETRY - 1) {
        throw err;
      }

      console.log("Restarting Oracle Pools...");

      await restartPools();

      // Wait for the new pools to become fully ready
      await sleep(3000);

      attempt++;

      console.log(`Retrying query... (${attempt}/${MAX_RETRY})`);
    } finally {
      await oracleConnectionClose(connection);
      connection = null;
    }
  }

  throw new Error("Oracle Retry Failed");
}

// EXECUTE TMC SQL

async function executeTmc(sql, bind = {}, options = {}) {
  return execute(
    getTmcConnection,

    sql,

    bind,

    options,
  );
}

// EXECUTE KMC SQL
async function executeKmc(sql, bind = {}, options = {}) {
  return execute(
    getKmcConnection,

    sql,

    bind,

    options,
  );
}

//EXECUTE CRON
async function executeCron(sql, bind = {}, options = {}) {
  return execute(
    getTmcCronConnection,

    sql,

    bind,

    options,
  );
}

// EXECUTE MANY SQL

async function executeMany(
  getConnection,

  sql,

  binds,

  options = {},
) {
  let connection;

  try {
    connection = await getConnection();

    return await connection.executeMany(
      sql,

      binds,

      options,
    );
  } finally {
    await oracleConnectionClose(connection);
    connection = null;
  }
}

// COMMIT HELPER
async function executeTransaction(getConnection, callback) {
  let conn;

  try {
    conn = await getConnection();

    const result = await callback(conn);

    await conn.commit();

    return result;
  } catch (err) {
    if (conn) await conn.rollback();
    throw err;
  } finally {
    await oracleConnectionClose(conn);
    conn = null;
  }
}

module.exports = {
  executeTmc,
  executeKmc,
  executeCron,
  executeTransaction,
  executeMany,
};
