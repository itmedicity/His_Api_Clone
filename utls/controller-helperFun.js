const {getTmcConnection, oracleConnectionClose, closeConnection, oracledb} = require("../config/oradbconfig");

const controllerHelper = (serviceFun, successMessage) => {
  return async (req, res) => {
    let conn;
    try {
      const body = req.body;
      conn = await getTmcConnection();

      const result = await serviceFun(conn, body);
      if (!result || (Array.isArray(result) && result.length === 0)) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: successMessage || "Success",
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: 0,
        message: error.message || "Internal Server Error",
      });
    } finally {
      if (conn) {
        await oracleConnectionClose(conn);
      }
    }
  };
};

const controllerGETHelper = (serviceFun, successMessage) => {
  return async (req, res) => {
    let conn;
    try {
      conn = await getTmcConnection();
      const result = await serviceFun(conn);

      if (!result || (Array.isArray(result) && result.length === 0)) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }

      return res.status(200).json({
        success: 1,
        message: successMessage,
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: 0,
        message: error.message || "Internal Server Error",
      });
    } finally {
      if (conn) {
        await oracleConnectionClose(conn);
      }
    }
  };
};

// const insertIntoGTT = async (conn, ptnoList = []) => {
//   if (!ptnoList.length) return;

//   const rows = ptnoList.map((ip) => [ip]);

//   await conn.executeMany(`INSERT INTO GTT_EXCLUDE_IP (IP_NO) VALUES (:1)`, rows, {autoCommit: false});
// };

// const insertIntoGTT = async (conn, data = []) => {
//   if (!data.length) return;

//   let sql = `INSERT ALL\n`;
//   const binds = {};

//   data.forEach((row, index) => {
//     const ipKey = `ip${index}`;
//     const statusKey = `status${index}`;

//     sql += `  INTO MEDIWARE.GTT_EXCLUDE_IP (IP_NO, STATUS) VALUES (:${ipKey}, :${statusKey})\n`;

//     binds[ipKey] = row.ip;
//     binds[statusKey] = row.status ?? 1;
//   });

//   sql += `SELECT 1 FROM DUAL`;

//   await conn.execute(sql, binds, {autoCommit: false});
// };

const insertIntoGTT = async (conn, data = []) => {
  if (!data.length) return;

  const ipArray = data.map((d) => d.ip || d); // support both ["IP1"] or [{ip, status}]
  const statusArray = data.map((d) => d.status ?? 1);

  const sql = `
    DECLARE
      TYPE ip_tab IS TABLE OF VARCHAR2(10) INDEX BY PLS_INTEGER;
      TYPE status_tab IS TABLE OF NUMBER INDEX BY PLS_INTEGER;

      v_ip     ip_tab;
      v_status status_tab;
    BEGIN
      -- bind arrays into PL/SQL collections
      v_ip := :ip_list;
      v_status := :status_list;

      FORALL i IN 1 .. v_ip.COUNT
        INSERT INTO MEDIWARE.GTT_EXCLUDE_IP (IP_NO, STATUS)
        VALUES (v_ip(i), v_status(i));
    END;
  `;

  await conn.execute(
    sql,
    {
      ip_list: {
        dir: oracledb.BIND_IN,
        type: oracledb.STRING,
        val: ipArray,
      },
      status_list: {
        dir: oracledb.BIND_IN,
        type: oracledb.NUMBER,
        val: statusArray,
      },
    },
    {autoCommit: false},
  );
};

module.exports = {controllerHelper, controllerGETHelper, insertIntoGTT};
