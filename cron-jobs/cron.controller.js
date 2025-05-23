const cron = require("node-cron");
const { oraConnection, oracledb } = require("../config/oradbconfig");
const pool = require("../config/dbconfig");

const testFun = async () => {
  console.log("hello");
};

const getPharmacyName = async () => {
  let pool_ora = await oraConnection();
  let conn_ora = await pool_ora.getConnection();

  const oracleSql = `select p.ph_code,p.phc_name from pharmacy p where p.phc_status='Y'`;
  try {
    // GET DATA FROM THE MYSQL TABLE FOR THE LAST INSERT DATE
    // sql get query here

    // CONVERT TO THE ORACLE DATE FORMAT FROM MYSQL FORMAT

    // GET DATA FROM ORACLE
    const result = await conn_ora.execute(
      oracleSql,
      {},
      { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    await result.resultSet?.getRows((err, rows) => {
      //  CHECK DATA FROM THE ORACLE DATABASE
      if (rows.length === 0) {
        console.log("No data found");
        return;
      }

      // FILTER DATA

      // INSERT DATA INTO THE MYSQL TABLE

      pool.getConnection((err, connection) => {
        if (err) {
          // mysql db not connected check connection
          console.log("mysql db not connected check connection");
          return;
        }

        connection.beginTransaction((err) => {
          if (err) {
            connection.release();
            console.log("error in begin transaction");
          }

          connection.query(
            `INSERT INTO pharmacy(ph_code,phc_name) VALUES ?`,
            [rows],
            (err, result) => {
              if (err) {
                connection.rollback(() => {
                  connection.release();
                  console.log("error in rollback data");
                });
              } else {
                connection.commit((err) => {
                  if (err) {
                    connection.rollback(() => {
                      connection.release();
                      console.log("error in commit");
                    });
                  } else {
                    connection.release();
                    console.log("success");
                  }
                });
              }
            }
          );
        });
      });
      // console.log(rows);
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

// cron.schedule("* * * * * *", () => {
//   testFun();
// });

// cron.schedule("* * * * *", () => {
//   getPharmacyName();
// });

const getFun = async (req, res) => {
  //   await testFun();
  return res.status(200).json({
    success: 1,
    message: "success",
  });
};

// module.exports = { getFun };
