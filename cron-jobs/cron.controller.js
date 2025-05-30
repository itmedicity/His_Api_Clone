const cron = require("node-cron");
const { oraConnection, oracledb } = require("../config/oradbconfig");
const pool = require("../config/dbconfig");
const mysqlpool = require("../config/dbconfigmeliora");
const { format, subHours } = require("date-fns");

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


