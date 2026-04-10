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

const buildFullAddress = (item) => {
  return [item.PTC_LOADD1, item.PTC_LOADD2, item.PTC_LOADD3, item.PTC_LOADD4]
    .filter((v) => v && v?.trim() !== "") // remove null/empty
    .join(", "); // separator
};

//TMCH
const getBisTmcLastTriggerDate = async () => {
  return new Promise((resolve, reject) => {
    pools.bis.getConnection((err, connection) => {
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
  let conn_ora, mysqlConn;

  try {
    conn_ora = await getTmcConnection();
    mysqlConn = await getConnection(pools.bis);

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
      [Values],
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
        [medstoreValues],
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
      [currentDate, currentDate],
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
        [currentDate],
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
    pools.bis.getConnection((err, connection) => {
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
    mysqlConn = await getConnection(pools.bis);

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
      [Values],
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
        [medstoreValues],
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
      [currentDate, currentDate],
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
        [currentDate],
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

const updateAmsPatientDetails = () => {
  pools.meliora.getConnection((err, connection) => {
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
    pools.meliora.getConnection((err, connection) => {
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

// trigger to get the childer data for the correspoding date
const getAmsPatientDetails = async (callBack) => {
  let conn_ora = await getTmcConnection();
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
      pools.meliora.query(`SELECT item_code FROM ams_antibiotic_master WHERE status = 1`, [], (err, results) => {
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

      pools.meliora.getConnection((err, connection) => {
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
                        },
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
                        },
                      );
                    },
                  );
                })
                .catch((err) => connection.rollback(() => connection.release()));
            });
          },
        );
      });
    });
  } catch (error) {
    return callBack(error);
  } finally {
    if (conn_ora) {
      await conn_ora.close();
      // await pool_ora.close();
    }
  }
};
