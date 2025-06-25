const cron = require("node-cron");
const { oraConnection, oracledb, oraKmcConnection } = require("../config/oradbconfig");
const pool = require("../config/dbconfig");
const mysqlpool = require("../config/dbconfigmeliora");
const { format, subHours, subMonths } = require("date-fns");
const bispool = require("../config/dbconfbis");

// const testFun = async () => {
//   console.log("hello");
// };

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
        // console.log("No data found");
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
                    // console.log("success");
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

//get Inpatient Detail 
const getInpatientDetail = async (callBack) => {
  let pool_ora = await oraConnection();
  let conn_ora = await pool_ora.getConnection();

  const oracleSql = `
  SELECT  
        IPADMISS.IP_NO, 
        IPADMISS.IPD_DATE, 
        IPADMISS.PT_NO,
        IPADMISS.PTC_PTNAME,
        IPADMISS.SA_CODE,         
        IPADMISS.PTC_TYPE,                            
        IPADMISS.BD_CODE AS IPD_BD_CODE,
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
        IPADMISS.IPD_DISC,
        IPADMISS.IPC_STATUS,
        IPADMISS.DMC_SLNO,
        IPADMISS.DMD_DATE,
        IPADMISS.CU_CODE,
        IPADMISS.DIS_USCODE,
        IPADMISS.SC_CODE,    
        IPADMISS.IPC_DICREQSTATUS,
        IPADMISS.IPC_MHCODE,
        IPADMISS.IPC_ADMITDOCODE,
        IPADMISS.IPC_CURSTATUS,
        IPADMISS.IPD_ACTRELEASE,
        IPADMISS.IPC_CURRCCODE,
        IPADMISS.IPC_DISSUMSTATUS,
        IPADMISS.RG_CODE,
        DOCTOR.DO_CODE,
        DOCTOR.DOC_NAME,
        DOCTOR.DT_CODE,
        DOCTOR.SP_CODE,
        DOCTOR.DOC_QUAL,
        DOCTOR.DOC_REGNO,
        DOCTOR.DOC_STATUS,
        BED.BDC_NO,
        BED.NS_CODE,
        BED.RT_CODE,
        BED.BDC_OCCUP,
        BED.BDN_OCCNO,
        BED.BDC_STATUS,
        BED.HKD_CLEANINGREQ,
        BED.RM_CODE,
        BED.BDC_MHCODE,
        BED.BDC_VIPBED,
        ADMNREASON.RS_CODE,
        ADMNREASON.RSC_DESC,
        ADMNREASON.RSC_ALIAS,
        ADMNREASON.RSC_STATUS,
        CUSTOMER.CUC_NAME,
        ROOMMASTER.RM_CODE,
        ROOMMASTER.RMC_DESC,
        ROOMMASTER.RMC_ALIAS,
        ROOMMASTER.RMC_STATUS,
        ROOMMASTER.RMC_MHCODE,
        ROOMCATEGORY.RC_CODE,
        ROOMCATEGORY.RCC_DESC,
        ROOMCATEGORY.RCC_ALIAS,
        ROOMCATEGORY.RCC_STATUS,
        ROOMCATEGORY.RCC_MHCODE,
        IPADMISS.IPC_PTFLAG,
        LATEST_RTC_DESC.RTC_DESC,
        LATEST_RTC_DESC.RTC_ALIAS,
        LATEST_RTC_DESC.RTC_STATUS,
        LATEST_RTC_DESC.ICU,
        LATEST_RTC_DESC.RTC_MHCODE,
        (SELECT department.DPC_DESC
            FROM department
            LEFT JOIN speciality ON department.DP_CODE = speciality.DP_CODE
            LEFT JOIN doctor ON speciality.SP_CODE = doctor.SP_CODE
            WHERE doctor.DO_CODE = ipadmiss.DO_CODE) AS DPC_DESC                   
              FROM IPADMISS
              LEFT JOIN patient ON ipadmiss.pt_no = patient.pt_no 
              LEFT JOIN rmall ON rmall.ip_no = ipadmiss.ip_no 
              LEFT JOIN roomcategory ON roomcategory.rc_code = ipadmiss.ipc_currccode
              LEFT JOIN doctor ON doctor.do_code = ipadmiss.do_code 
              LEFT JOIN admnreason ON admnreason.rs_code = ipadmiss.rs_code 
              LEFT JOIN bed ON bed.bd_code = rmall.bd_code
              LEFT JOIN nurstation ON nurstation.ns_Code = bed.ns_code 
              LEFT JOIN salutation ON Salutation.sa_code = patient.SA_CODE 
              LEFT JOIN roommaster ON roommaster.RM_CODE = BED.RM_CODE 
              LEFT JOIN ( 
                          SELECT rc_code, MAX(rtc_desc) AS rtc_desc, MAX( rtc_alias) AS rtc_alias, MAX(rtc_status) AS rtc_status,MAX(icu) AS icu,MAX(rtc_mhcode) AS rtc_mhcode
                          FROM roomtype
                          GROUP BY rc_code ) latest_rtc_desc ON ipadmiss.rc_code = latest_rtc_desc.rc_code                                               
                        LEFT JOIN customer ON ipadmiss.cu_code = customer.cu_code
                        WHERE ipadmiss.IPC_MHCODE = '00' 
                                AND ((IPADMISS.IPC_STATUS IS NULL AND rmall.rmc_relesetype IS NULL) OR (ipd_disc IS NOT NULL 
                                AND (IPADMISS.IPD_ACTRELEASE IS NULL  OR IPADMISS.IPD_ACTRELEASE >= to_date('20/05/2025', 'dd/MM/yyyy'))))
                                AND NVL(IPD_DATE, SYSDATE) >= TO_DATE(:FROM_DATE, 'dd/MM/yyyy hh24:mi:ss')
                                AND NVL(IPD_DATE, SYSDATE) <= TO_DATE(:TO_DATE, 'dd/MM/yyyy hh24:mi:ss')
                                AND rmall.rmc_occupby IN ('P')             
                              ORDER BY BED.BDC_NO`;

  try {
    // sql get query from meliora here
    const detail = await getLastTriggerDate(1)

    // lastupdate time
    const lastInsertDate = detail?.fb_last_trigger_date
      ? new Date(detail?.fb_last_trigger_date)
      : subHours(new Date(), 1);

    // const manualFromDate = new Date(2025, 4, 20, 9, 10, 0);// test date

    // date convertion to oracle support
    const fromDate = format(new Date(lastInsertDate), 'dd/MM/yyyy HH:mm:ss')
    const toDate = format(new Date(), 'dd/MM/yyyy HH:mm:ss');

    const mysqlsupportToDate = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

    // GET DATA FROM ORACLE
    const result = await conn_ora.execute(
      oracleSql,
      {
        FROM_DATE: fromDate,
        TO_DATE: toDate
      },
      { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    await result.resultSet?.getRows((err, rows) => {
      //  CHECK DATA FROM THE ORACLE DATABASE

      if (rows.length === 0) {
        // console.log("No data found");
        return;
      }



      const VALUES = rows?.map(item => [
        item.IP_NO,
        item.IPD_DATE ? format(new Date(item?.IPD_DATE), 'yyyy-MM-dd HH:mm:ss') : null,
        item.PT_NO,
        item.PTC_PTNAME,
        item.PTC_SEX,
        item.PTD_DOB ? format(new Date(item?.PTD_DOB), 'yyyy-MM-dd HH:mm:ss') : null,
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
        item.IPD_DISC ? format(new Date(item?.IPD_DISC), 'yyyy-MM-dd HH:mm:ss') : null,
        item.IPC_STATUS,
        item.DMC_SLNO,
        item.DMD_DATE ? format(new Date(item?.DMD_DATE), 'yyyy-MM-dd HH:mm:ss') : null,
        item.PTC_MOBILE,
        item.IPC_MHCODE,
        item.DOC_NAME,
        item.IPC_CURSTATUS,
        item.DPC_DESC
      ]);

      // FILTER DATA
      // INSERT DATA INTO THE MYSQL TABLE

      mysqlpool.getConnection((err, connection) => {
        if (err) {
          // mysql db not connected check connection
          // console.log("mysql db not connected check connection");
          return;
        }
        connection.beginTransaction((err) => {
          if (err) {
            connection.release();
            console.log("error in begin transaction");
          }
          connection.query(
            `INSERT INTO fb_ipadmiss (
                        fb_ip_no,
                        fb_ipd_date,
                        fb_pt_no,
                        fb_ptc_name,
                        fb_ptc_sex,
                        fb_ptd_dob,   
                        fb_ptn_dayage,
                        fb_ptn_monthage,
                        fb_ptn_yearage,
                        fb_ptc_loadd1,
                        fb_ptc_loadd2, 
                        fb_ptc_loadd3,
                        fb_ptc_loadd4,
                        fb_ptc_lopin,
                        fb_rc_code,
                        fb_bd_code,
                        fb_do_code, 
                        fb_rs_code, 
                        fb_ipd_disc,
                        fb_ipc_status,
                        fb_dmc_slno,
                        fb_dmd_date,
                        fb_ptc_mobile, 
                        fb_ipc_mhcode,
                        fb_doc_name,
                        fb_ipc_curstatus,
                        fb_dep_desc
                    ) VALUES ?
                    `,
            [
              VALUES
            ],
            (err, result) => {
              if (err) {
                console.log(err, "err");
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

                    //inserting detail in log table fb_process_id === 1 for inpatientinsert
                    connection.query(
                      `INSERT INTO fb_ipadmiss_logdtl (fb_last_trigger_date,fb_process_id) VALUES (?,?)`,
                      [
                        mysqlsupportToDate, 1
                      ],
                      (err, result) => {
                        if (err) {
                          console.log(err, "fb_ipadmiss_log");
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
                              // console.log("success insertion");
                            }
                          });
                        }
                      }
                    );
                    //  ends here
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
    console.log(error, "Error occured!");
    return callBack(error);
  } finally {
    if (conn_ora) {
      await conn_ora.close();
      await pool_ora.close();
    }
  }
};


// update trigger for ipadmiss to set curstatus ,actrelease and Discharge date details
const UpdateIpStatusDetails = async (callBack) => {
  let pool_ora = await oraConnection();
  let conn_ora = await pool_ora.getConnection();

  const oracleSql = `
select ip_no,do_code,ipc_currccode,cu_code,ipc_curstatus,ipd_disc,ipc_status,dmd_date,dmc_slno
           from ipadmiss
           where ipc_ptflag='N' 
               and (ipd_disc >= to_date(:FROM_DATE,'dd/MM/yyyy HH24:mi:ss')
               and ipd_disc <= to_date(:TO_DATE,'dd/MM/yyyy HH24:mi:ss'))`;
  try {

    const detail = await getLastTriggerDate(2)

    const lastUpdatetDate = detail?.fb_last_update_time
      ? new Date(detail?.fb_last_update_time)
      : subHours(new Date(), 1);

    // const manualFromDate = new Date(2025, 4, 20, 9, 10, 0);// test date

    // date convertion to oracle support
    const fromDate = format(new Date(lastUpdatetDate), 'dd/MM/yyyy HH:mm:ss')
    const toDate = format(new Date(), 'dd/MM/yyyy HH:mm:ss');

    // mysqlsupport format
    const mysqlsupportToDate = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

    const result = await conn_ora.execute(
      oracleSql,
      {
        FROM_DATE: fromDate,
        TO_DATE: toDate
      },
      { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    await result.resultSet?.getRows((err, rows) => {
      //  CHECK DATA FROM THE ORACLE DATABASE
      if (rows.length === 0) {
        // console.log("No update date found UpdateIpStatusDetails");
        return;
      }

      // result of the oracle query
      const Values = rows?.map(item => [
        item.DO_CODE,
        item.IPC_CURSTATUS,
        item.IPD_DISC ? format(new Date(item?.IPD_DISC), 'yyyy-MM-dd HH:mm:ss') : null,
        item.IPC_STATUS,
        item.DMD_DATE ? format(new Date(item?.DMD_DATE), 'yyyy-MM-dd HH:mm:ss') : null,
        item.DMC_SLNO,
        item.IP_NO
      ]);
      // INSERT DATA INTO THE MYSQL TABLE
      mysqlpool.getConnection((err, connection) => {
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
          const updateQueries = Values?.map((row) => {
            return new Promise((resolve, reject) => {
              connection.query(
                `
              UPDATE fb_ipadmiss
                SET
                  fb_do_code = ?,
                  fb_ipc_curstatus = ?,
                  fb_ipd_disc = ?,
                  fb_ipc_status = ?,
                  fb_dmd_date = ?,
                  fb_dmc_slno = ?
                WHERE fb_ip_no = ?`,
                row,
                (err, result) => {
                  if (err) return reject(err);
                  resolve(result);
                }
              );
            });
          });
          Promise.all(updateQueries).
            then((result) => {
              connection.commit((err) => {
                if (err) {
                  connection.rollback(() => {
                    connection.release();
                    console.log("error in commit");
                  });
                } else {
                  // Updating detail in log table (fb_process_id === 2 for Status Update in ipadmiss)
                  connection.query(
                    `INSERT INTO fb_ipadmiss_logdtl (fb_last_trigger_date,fb_process_id) VALUES (?,?)`,
                    [
                      mysqlsupportToDate, 2
                    ],
                    (err, result) => {
                      if (err) {
                        console.log(err, "error");
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
                            // console.log("success updation in UpdateIpStatusDetails");
                          }
                        });
                      }
                    }
                  );
                  //  ends here
                }
              });
            }).catch((err) => {
              console.log(err, "Update query error");
              connection.rollback(() => {
                connection.release();
                console.log("Rolled back due to error");
              });
            });
        })
      });
    });
  } catch (error) {
    console.log(error, "Error occured!");
    return callBack(error)
  } finally {
    if (conn_ora) {
      await conn_ora.close();
      await pool_ora.close();
    }
  }
}


// tirgger for getting data form RMALL bed_code
const UpdateInpatientDetailRmall = async (callBack) => {
  let pool_ora = await oraConnection();
  let conn_ora = await pool_ora.getConnection();

  const oracleSql = `
  SELECT  rmall.bd_code,rmall.ip_no
            FROM   rmall
            left join ipadmiss on rmall.ip_no=ipadmiss.ip_no
            Where  (ipadmiss.ipc_ptflag = 'N')
                     and rmall.rmd_relesedate is null
                     and  (rmall.rmd_occupdate >= to_date(:FROM_DATE,'dd/MM/yyyy HH24:mi:ss')
                     and rmall.rmd_occupdate <= to_date(:TO_DATE,'dd/MM/yyyy HH24:mi:ss'))`;
  try {

    const detail = await getLastTriggerDate(3);

    const lastUpdatetDate = detail?.fb_last_update_time
      ? new Date(detail?.fb_last_update_time)
      : subHours(new Date(), 1);

    // const manualFromDate = new Date(2025, 4, 20, 9, 10, 0);// test date

    // date convertion to oracle support
    const fromDate = format(new Date(lastUpdatetDate), 'dd/MM/yyyy HH:mm:ss')
    const toDate = format(new Date(), 'dd/MM/yyyy HH:mm:ss');

    // mysqlsupport format
    const mysqlsupportToDate = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

    const result = await conn_ora.execute(
      oracleSql,
      {
        FROM_DATE: fromDate,
        TO_DATE: toDate
      },
      { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    await result.resultSet?.getRows((err, rows) => {
      //  CHECK DATA FROM THE ORACLE DATABASE
      if (rows.length === 0) {
        // console.log("No update date found for bed");
        return;
      }

      // result of the oracle query
      const Values = rows?.map(item => [
        item.BD_CODE,
        item.IP_NO
      ]);

      // INSERT DATA INTO THE MYSQL TABLE
      mysqlpool.getConnection((err, connection) => {
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
          const updateQueries = Values?.map((row) => {
            return new Promise((resolve, reject) => {
              connection.query(
                `
              UPDATE fb_ipadmiss
                SET
                  fb_bd_code = ?
                WHERE fb_ip_no = ?`,
                row,
                (err, result) => {
                  if (err) return reject(err);
                  resolve(result);
                }
              );
            });
          });
          Promise.all(updateQueries).
            then((result) => {
              connection.commit((err) => {
                if (err) {
                  connection.rollback(() => {
                    connection.release();
                    console.log("error in commit");
                  });
                } else {
                  // Updating detail in log table fb_process_id === 3 for Ip detail update from rmaill
                  connection.query(
                    `INSERT INTO fb_ipadmiss_logdtl (fb_last_trigger_date,fb_process_id) VALUES (?,?)`,
                    [
                      mysqlsupportToDate, 3
                    ],
                    (err, result) => {
                      if (err) {
                        console.log(err, "error");
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
                            // console.log("success updation in UpdateInpatientDetailRmall");
                          }
                        });
                      }
                    }
                  );
                  //  ends here
                }
              });
            }).catch((err) => {
              console.log(err, "Update query error");
              connection.rollback(() => {
                connection.release();
                console.log("Rolled back due to error");
              });
            });
        })
      });
    });
  } catch (error) {
    console.log(error, "Error occured!");
    return callBack(error)
  } finally {
    if (conn_ora) {
      await conn_ora.close();
      await pool_ora.close();
    }
  }
}


// trigger to fetch data from bed to update fb_bed 
const UpdateFbBedDetailMeliora = async (callBack) => {
  let pool_ora = await oraConnection();
  let conn_ora = await pool_ora.getConnection();

  const oracleSql = `
      SELECT 
          BD.BDC_OCCUP,
          BD.BD_CODE,
          SUM(BD.BDN_OCCNO) AS OCCU
      FROM 
          MEDIWARE.BED BD
      WHERE  
          BD.BDC_STATUS = 'Y' 
          AND (BD.BDD_EDDATE >= TO_DATE(:FROM_DATE, 'dd/MM/yyyy HH24:mi:ss') 
                AND BD.BDD_EDDATE <= TO_DATE(:TO_DATE, 'dd/MM/yyyy HH24:mi:ss'))
      GROUP BY 
          BD.BDC_OCCUP, 
          BD.BD_CODE`;

  try {

    const detail = await getLastTriggerDate(4);

    const lastUpdatetDate = detail?.fb_last_update_time
      ? new Date(detail?.fb_last_update_time)
      : subHours(new Date(), 1);

    // const manualFromDate = new Date(2025, 4, 20, 10, 10, 0); // test date

    // date convertion to oracle support
    const fromDate = format(new Date(lastUpdatetDate), 'dd/MM/yyyy HH:mm:ss')
    const toDate = format(new Date(), 'dd/MM/yyyy HH:mm:ss');

    // mysqlsupport format
    const mysqlsupportToDate = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

    const result = await conn_ora.execute(
      oracleSql,
      {
        FROM_DATE: fromDate,
        TO_DATE: toDate
      },
      { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    await result.resultSet?.getRows((err, rows) => {
      //  CHECK DATA FROM THE ORACLE DATABASE
      if (rows.length === 0) {
        // console.log("No update date found for bed");
        return;
      }

      // result of the oracle query
      const Values = rows?.map(item => [
        item.BDC_OCCUP,
        item.OCCU,
        item.BD_CODE
      ]);

      // INSERT DATA INTO THE MYSQL TABLE
      mysqlpool.getConnection((err, connection) => {
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
          const updateQueries = Values?.map((row) => {
            return new Promise((resolve, reject) => {
              connection.query(
                `
              UPDATE fb_bed
                SET
                  fb_bdc_occup = ?,
                  fb_bdn_cccno = ?
                WHERE fb_bd_code = ?`,
                row,
                (err, result) => {
                  if (err) return reject(err);
                  resolve(result);
                }
              );
            });
          });
          Promise.all(updateQueries).
            then((result) => {
              connection.commit((err) => {
                if (err) {
                  connection.rollback(() => {
                    connection.release();
                    console.log("error in commit");
                  });
                } else {
                  // Updating detail in log table fb_process_id === 3 for Ip detail update from rmaill
                  connection.query(
                    `INSERT INTO fb_ipadmiss_logdtl (fb_last_trigger_date,fb_process_id) VALUES (?,?)`,
                    [
                      mysqlsupportToDate, 4
                    ],
                    (err, result) => {
                      if (err) {
                        console.log(err, "error");
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
                            // console.log("success updation of Bed Details");
                          }
                        });
                      }
                    }
                  );
                  //  ends here
                }
              });
            }).catch((err) => {
              console.log(err, "Update query error");
              connection.rollback(() => {
                connection.release();
                console.log("Rolled back due to error");
              });
            });
        })
      });
    });
  } catch (error) {
    console.log(error, "Error occured!");
    return callBack(error)
  } finally {
    if (conn_ora) {
      await conn_ora.close();
      await pool_ora.close();
    }
  }
}

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
      const numericItcodes = results?.map(val => val.it_code);
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
    const fromDate = format(lastUpdateDate, 'yyyy-MM-dd HH:mm:ss');
    const toDate = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

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
    const insertResult = await conn_ora.execute(
      oracleSql,
      { FROM_DATE: fromDate, TO_DATE: toDate },
      { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const insertRows = await insertResult.resultSet.getRows();
    await insertResult.resultSet.close();

    if (!insertRows.length) {
      if (callBack) callBack(null, "No data to insert.");
      return;
    }

    const Values = insertRows.map(row => [
      row.IT_CODE, row.ITC_DESC, row.ITC_ALIAS, row.ITN_STRIP,
      row.MC_CODE, row.MCC_DESC, row.MG_CODE, row.MGC_DESC,
      row.CMC_DESC, row.MTC_DESC, row.MEDICINE, row.CONSUMABLE,
      row.HIGH_VALUE, row.HIGH_RISK, row.HAZARDOUS, row.VED,
      row.BREAKABLE, row.ITN_BREAKQTY, row.ITN_LPRATE, row.ITN_MRP,
      row.ITN_ORIGINALMRP, row.ITN_GENDISPER, row.ITN_GENIPDISPER,
      row.ITD_DATE, row.ITD_EDDATE
    ]);

    // Step 2: Begin transaction
    await mysqlConn.beginTransaction();

    // Step 3: Insert into bis_kmc_med_desc_mast
    await queryPromise(mysqlConn, `
      INSERT INTO bis_tmc_med_desc_mast (
        it_code, itc_desc, itc_alias, itn_strip, mc_code, mcc_desc,
        mg_code, mgc_desc, cmc_desc, mtc_desc, itc_medicine, itc_consumable,
        itc_highvalue, itc_highrisk, itc_hazardous, itc_ved, itc_breakable,
        itn_breakqty, itn_lprate, itn_mrp, itn_originalmrp, itn_gendisper,
        itn_genipdisper, create_date, edit_date
      ) VALUES ?`, [Values]);

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
        WHERE IT_CODE IN (${keys.join(',')})`;

      const medstoreResult = await conn_ora.execute(
        medstoreQuery, bindParams, { outFormat: oracledb.OUT_FORMAT_OBJECT });

      if (medstoreResult.rows.length) {
        medstoreData.push(...medstoreResult.rows);
      }
    }

    if (medstoreData.length) {
      const medstoreValues = medstoreData.map(row => [row.IT_CODE, row.ST_CODE]);
      await queryPromise(mysqlConn, `
        INSERT INTO bis_tmc_med_store (it_code, st_code) VALUES ?`, [medstoreValues]);
    }

    // Step 5: Update trigger table
    const currentDate = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    await queryPromise(mysqlConn, `
      UPDATE bis_tmc_trigger_details 
      SET last_insert_date = ?, last_update_date = ? 
      WHERE trgr_slno = 1`, [currentDate, currentDate]);

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
    const updateResult = await conn_ora.execute(
      oracleSqlquery,
      { FROM_DATE: fromDate, TO_DATE: toDate },
      { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const updateRows = await updateResult.resultSet.getRows();
    await updateResult.resultSet.close();

    const updateItCodes = await getTMCItCodesInChunks(mysqlConn, fromDate, toDate, 1000);
    const updateSet = new Set(updateItCodes.flat());

    const filteredUpdates = updateRows.filter(row => updateSet.has(row.IT_CODE));

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
          row.ITC_DESC, row.ITC_ALIAS, row.ITN_STRIP,
          row.MC_CODE, row.MCC_DESC, row.MG_CODE, row.MGC_DESC,
          row.CMC_DESC, row.MTC_DESC, row.MEDICINE, row.CONSUMABLE,
          row.HIGH_VALUE, row.HIGH_RISK, row.HAZARDOUS, row.VED,
          row.BREAKABLE, row.ITN_BREAKQTY, row.ITN_LPRATE, row.ITN_MRP,
          row.ITN_ORIGINALMRP, row.ITN_GENDISPER, row.ITN_GENIPDISPER,
          row.ITD_DATE, row.ITD_EDDATE,
          row.IT_CODE
        ];
        await queryPromise(mysqlConn, updateQuery, updateValues);
      }

      // Step 8: Update trigger (again, just in case)
      await queryPromise(mysqlConn, `
        UPDATE bis_tmc_trigger_details SET last_update_date = ? 
        WHERE trgr_slno = 1`, [currentDate]);
    }

    // ✅ Step 9: Commit transaction
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

// Run via cron
// cron.schedule("* * * * *", () => {
//   InsertKmcMedDesc();
// });


cron.schedule("0 0 * * *", () => {
  InsertTmcMedDesc();
});

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
      const numericItcodes = results?.map(val => val.it_code);
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
    const fromDate = format(lastUpdateDate, 'yyyy-MM-dd HH:mm:ss');
    const toDate = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

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
    const insertResult = await conn_ora.execute(
      oracleSql,
      { FROM_DATE: fromDate, TO_DATE: toDate },
      { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const insertRows = await insertResult.resultSet.getRows();
    await insertResult.resultSet.close();

    if (!insertRows.length) {
      if (callBack) callBack(null, "No data to insert.");
      return;
    }

    const Values = insertRows.map(row => [
      row.IT_CODE, row.ITC_DESC, row.ITC_ALIAS, row.ITN_STRIP,
      row.MC_CODE, row.MCC_DESC, row.MG_CODE, row.MGC_DESC,
      row.CMC_DESC, row.MTC_DESC, row.MEDICINE, row.CONSUMABLE,
      row.HIGH_VALUE, row.HIGH_RISK, row.HAZARDOUS, row.VED,
      row.BREAKABLE, row.ITN_BREAKQTY, row.ITN_LPRATE, row.ITN_MRP,
      row.ITN_ORIGINALMRP, row.ITN_GENDISPER, row.ITN_GENIPDISPER,
      row.ITD_DATE, row.ITD_EDDATE
    ]);

    // Step 2: Begin transaction
    await mysqlConn.beginTransaction();

    // Step 3: Insert into bis_kmc_med_desc_mast
    await queryPromise(mysqlConn, `
      INSERT INTO bis_kmc_med_desc_mast (
        it_code, itc_desc, itc_alias, itn_strip, mc_code, mcc_desc,
        mg_code, mgc_desc, cmc_desc, mtc_desc, itc_medicine, itc_consumable,
        itc_highvalue, itc_highrisk, itc_hazardous, itc_ved, itc_breakable,
        itn_breakqty, itn_lprate, itn_mrp, itn_originalmrp, itn_gendisper,
        itn_genipdisper, create_date, edit_date
      ) VALUES ?`, [Values]);

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
        WHERE IT_CODE IN (${keys.join(',')})`;

      const medstoreResult = await conn_ora.execute(
        medstoreQuery, bindParams, { outFormat: oracledb.OUT_FORMAT_OBJECT });

      if (medstoreResult.rows.length) {
        medstoreData.push(...medstoreResult.rows);
      }
    }

    if (medstoreData.length) {
      const medstoreValues = medstoreData.map(row => [row.IT_CODE, row.ST_CODE]);
      await queryPromise(mysqlConn, `
        INSERT INTO bis_kmc_med_store (it_code, st_code) VALUES ?`, [medstoreValues]);
    }

    // Step 5: Update trigger table
    const currentDate = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    await queryPromise(mysqlConn, `
      UPDATE bis_kmc_trigger_details 
      SET last_insert_date = ?, last_update_date = ? 
      WHERE trgr_slno = 1`, [currentDate, currentDate]);

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
    const updateResult = await conn_ora.execute(
      oracleSqlquery,
      { FROM_DATE: fromDate, TO_DATE: toDate },
      { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const updateRows = await updateResult.resultSet.getRows();
    await updateResult.resultSet.close();

    const updateItCodes = await getTMCItCodesInChunks(mysqlConn, fromDate, toDate, 1000);
    const updateSet = new Set(updateItCodes.flat());

    const filteredUpdates = updateRows.filter(row => updateSet.has(row.IT_CODE));

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
          row.ITC_DESC, row.ITC_ALIAS, row.ITN_STRIP,
          row.MC_CODE, row.MCC_DESC, row.MG_CODE, row.MGC_DESC,
          row.CMC_DESC, row.MTC_DESC, row.MEDICINE, row.CONSUMABLE,
          row.HIGH_VALUE, row.HIGH_RISK, row.HAZARDOUS, row.VED,
          row.BREAKABLE, row.ITN_BREAKQTY, row.ITN_LPRATE, row.ITN_MRP,
          row.ITN_ORIGINALMRP, row.ITN_GENDISPER, row.ITN_GENIPDISPER,
          row.ITD_DATE, row.ITD_EDDATE,
          row.IT_CODE
        ];
        await queryPromise(mysqlConn, updateQuery, updateValues);
      }

      // Step 8: Update trigger (again, just in case)
      await queryPromise(mysqlConn, `
        UPDATE bis_kmc_trigger_details SET last_update_date = ? 
        WHERE trgr_slno = 1`, [currentDate]);
    }

    // ✅ Step 9: Commit transaction
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



cron.schedule("0 0 * * *", () => {
  InsertKmcMedDesc();
});













// get last trigger date for the paritcular 
const getLastTriggerDate = async (processId) => {
  return new Promise((resolve, reject) => {
    mysqlpool.getConnection((err, connection) => {
      if (err) {
        console.error("MySQL DB not connected. Check connection.");
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


// auto sync at an interval of 10 min
cron.schedule("* * * * *", () => {
  getInpatientDetail();
});

//test triggering
cron.schedule("*/2 * * * *", () => {
  UpdateFbBedDetailMeliora();
});

// auto sync at an interval of 25 min
cron.schedule("*/5 * * * *", () => {
  UpdateInpatientDetailRmall();
});

// auto sync at an interval of 20 min
cron.schedule("*/4 * * * *", () => {
  UpdateIpStatusDetails();
});





// cron.schedule("* */2 * * *", () => {
//   UpdateBeddetailFromRmall();
// });

// const getFun = async (req, res) => {
//   //   await testFun();
//   return res.status(200).json({
//     success: 1,
//     message: "success",
//   });
// };

// module.exports = { getFun };


