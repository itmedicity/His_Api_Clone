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


//get Inpatient Detail 
// const getAmsPatientDetails = async (callBack) => {
//   let pool_ora = await oraConnection();
//   let conn_ora = await pool_ora.getConnection();

//   const oracleSql = 
//   `SELECT P.BMD_DATE,
//             P.BM_NO,
//             P.PT_NO,
//             PT.PTC_PTNAME,
//             DECODE(PT.PTC_SEX,'M','Male','F','Female') AS GENEDER,
//             PT.PTN_YEARAGE,
//             P.IP_NO,
//             N.NSC_DESC,
//             B.BDC_NO,
//             D.DOC_NAME,
//             DP.DPC_DESC,
//             M.ITC_DESC,
//             G.CMC_DESC
//     FROM PBILLMAST P
//         LEFT JOIN PBILLDETL PL ON P.BMC_SLNO=PL.BMC_SLNO
//         LEFT JOIN PATIENT PT ON P.PT_NO=PT.PT_NO
//         LEFT JOIN IPADMISS I ON P.IP_NO=I.IP_NO
//         LEFT JOIN BED B ON I.BD_CODE=B.BD_CODE
//         LEFT JOIN NURSTATION N ON B.NS_CODE=N.NS_CODE
//         LEFT JOIN DOCTOR D ON P.DO_CODE=D.DO_CODE
//         LEFT JOIN SPECIALITY S ON D.SP_CODE=S.SP_CODE
//         LEFT JOIN DEPARTMENT DP ON S.DP_CODE=DP.DP_CODE
//         LEFT JOIN MEDDESC M ON PL.IT_CODE=M.IT_CODE
//         LEFT JOIN MEDGENCOMB G ON M.CM_CODE=G.CM_CODE
//     WHERE PL.IT_CODE='A626'
//             AND (P.BMD_DATE) >= TO_DATE(:FROM_DATE, 'dd/MM/yyyy hh24:mi:ss')
//             AND (P.BMD_DATE) <= TO_DATE(:TO_DATE, 'dd/MM/yyyy hh24:mi:ss')
//             GROUP BY P.BMD_DATE, P.BM_NO,P.PT_NO, PT.PTC_PTNAME,PT.PTC_SEX,PT.PTN_YEARAGE,
//             P.IP_NO, N.NSC_DESC, B.BDC_NO,D.DOC_NAME, DP.DPC_DESC,G.CMC_DESC,M.ITC_DESC`;

//             console.log("oracleSql",oracleSql);
            

//   try {
//     // sql get query from meliora here
//     const detail = await getAmsLastUpdatedDate(1)

//     // lastupdate time
//     const lastInsertDate = detail?.ams_last_updated_date
//       ? new Date(detail?.ams_last_updated_date)
//       : subHours(new Date(), 1);

//     // const manualFromDate = new Date(2025, 4, 20, 9, 10, 0);// test date

//     // date convertion to oracle support
//     // const fromDate = format(new Date(lastInsertDate), 'dd/MM/yyyy HH:mm:ss')
//     // const toDate = format(new Date(), 'dd/MM/yyyy HH:mm:ss');
//     // const itemCodes = ['o165', 'g612', 'p463', 'T094', 'I043',  'd059'];

//     const fromDate ='01/05/2025 00:00:00'
//     const toDate='26/05/2025 23:59:00'
//     const mysqlsupportToDate = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

//     // GET DATA FROM ORACLE
//     const result = await conn_ora.execute(
//       oracleSql,
//       {
//         FROM_DATE: fromDate,
//         TO_DATE: toDate,
//         // item_codes: itemCodes
//       },
//       { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT }
//     );
//     await result.resultSet?.getRows((err, rows) => {
//       console.log("rows",rows);
      
//       //  CHECK DATA FROM THE ORACLE DATABASE
//       if (rows.length === 0) {
//         console.log("No data found");
//         return;
//       }

//       const VALUES = rows?.map(item => [
//         item.PT_NO,
//         item.PTC_PTNAME,
//         item.PTN_YEARAGE,
//         item.GENEDER,
     
//       ]);

//       // FILTER DATA

//       // INSERT DATA INTO THE MYSQL TABLE

//       mysqlpool.getConnection((err, connection) => {
//         if (err) {
//           // mysql db not connected check connection
//           // console.log("mysql db not connected check connection");
//           return;
//         }
//         connection.beginTransaction((err) => {
//           if (err) {
//             connection.release();
//             console.log("error in begin transaction");
//           }
//           connection.query(
//             `INSERT INTO ams_antibiotic_patient_details (
//                         mrd_no,
//                         patient_name,
//                         patient_age,
//                         patient_gender
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
//                 connection.query(
//                     `UPDATE ams_patient_details_last_updated_date 
//                       SET ams_last_updated_date = ? 
//                       WHERE ams_lastupdate_slno = 1`,
//                       [mysqlsupportToDate],

//                       (err, result) => {
//                         if (err) {                       
//                           connection.rollback(() => {
//                             connection.release();                       
//                           });
//                         } else {
//                           connection.commit((err) => {
//                             if (err) {
//                               connection.rollback(() => {
//                                 connection.release();                            
//                               });
//                             } else {
//                               connection.release();
//                               console.log("success insertion");
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
//       console.log(rows);
//     });
//   } catch (error) {
//     console.log(error, "Error occured!");
//     // return callBack(error);
//   } finally {
//     if (conn_ora) {
//       await conn_ora.close();
//       await pool_ora.close();
//     }
//   }
// };


// // get last trigger date for the paritcular 
// const getAmsLastUpdatedDate = async (processId) => {
//   return new Promise((resolve, reject) => {
//     mysqlpool.getConnection((err, connection) => {
//       if (err) {
//         console.error("MySQL DB not connected. Check connection.");
//         return reject(err);
//       }
//       const query = `
//         SELECT ams_last_updated_date 
//         FROM ams_patient_details_last_updated_date      
//        ;
//       `;
//       connection.query(query, [processId], (err, results) => {
//         connection.release();
//         if (err) {
//           return reject(err);
//         }
//         resolve(results.length > 0 ? results[0] : null);
//       });
//     });
//   });
// };


// cron.schedule("* * * * *", () => {
//   getAmsPatientDetails(); 
// });


