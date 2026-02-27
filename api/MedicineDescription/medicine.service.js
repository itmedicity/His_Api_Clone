const {pools, query, transaction} = require("../../config/mysqldbconfig");
const {getTmcConnection, oracledb} = require("../../config/oradbconfig");
module.exports = {
  getMedicinesFromOracle: async (data, callBack) => {
    let conn_ora = await getTmcConnection();
    try {
      const medicneList = await query(`select it_code,itc_desc from medicine_descriptions`);

      let checkMeddescAlreadyExist = (callBack) => {
        pool.query(`select it_code,itc_desc from medicine_descriptions`, [], (error, result) => {
          if (error) throw error;
          return callBack(JSON.parse(JSON.stringify(result)));
        });
      };

      const result = await conn_ora.execute(
        `select meddesc.it_code,itc_desc,itc_alias,itn_pack,itn_strip,itc_status from meddesc 
                        LEFT JOIN medstore ON medstore.it_code=meddesc.it_code
                         where itc_status='Y'
                         and ITD_DATE >= to_date(:date0, 'dd/MM/yyyy hh24:mi:ss') 
                         and ITD_DATE <= to_date(:date1, 'dd/MM/yyyy hh24:mi:ss')
                         and medstore.ST_CODE in('0124')`,
        {
          date0: data.date0,
          date1: data.date1,
        },
        {outFormat: oracledb.OUT_FORMAT_OBJECT},
      );
      const medDescFromOra = result.rows;
      checkMeddescAlreadyExist((meddescFromSql) => {
        let newMedArray = medDescFromOra
          ?.map((value) => {
            const medId = meddescFromSql?.find((val) => val.it_code === value.IT_CODE && val.itc_desc === value.ITC_DESC);
            return medId === undefined ? value : null;
          })
          .filter((val) => val !== null);

        if (newMedArray.length !== 0) {
          newMedArray?.map((value, index) => {
            pool.query(
              `insert into medicine_descriptions (it_code,itc_desc,itc_alias,
                               itn_pack,itn_strip,itc_status) values (?,?,?,?,?,?)`,
              [value.IT_CODE, value.ITC_DESC, value.ITC_ALIAS, value.ITN_PACK, value.ITN_STRIP, value.ITC_STATUS],
              (error, result) => {
                if (error) throw error;
              },
            );
          });
        }
      });
      return callBack(null, result);
    } catch (error) {
      return callBack(error);
    } finally {
      await conn_ora.close();
    }
  },

  getMedicinesForUpdates: async (data) => {
    let conn_ora = await getTmcConnection();
    try {
      const meddescFromSql = await query(`select it_code,itc_desc from medicine_descriptions`);
      // let checkMeddescAlreadyExist = (callBack) => {
      //   pool.query(`select it_code,itc_desc from medicine_descriptions`, [], (error, result) => {
      //     if (error) throw error;
      //     return callBack(JSON.parse(JSON.stringify(result)));
      //   });
      // };

      const result = await conn_ora.execute(
        `SELECT meddesc.it_code,itc_desc,itc_alias,itn_pack,itn_strip,itc_status,ITD_EDDATE
                FROM meddesc             
                LEFT JOIN medstore ON medstore.it_code=meddesc.it_code
                WHERE itc_status='Y'
                      and ITD_EDDATE >= to_date(:date0, 'dd/MM/yyyy hh24:mi:ss') 
                      and ITD_EDDATE <= to_date(:date1, 'dd/MM/yyyy hh24:mi:ss')
                      and medstore.ST_CODE in('0124')`,
        {
          date0: data.date0,
          date1: data.date1,
        },
        {outFormat: oracledb.OUT_FORMAT_OBJECT},
      );

      const medDescFromOra = result.rows;

      const newMedArray = medDescFromOra
        ?.map((value) => {
          const medId = meddescFromSql?.find((val) => val.it_code === value.IT_CODE);
          return medId === undefined ? value : null;
        })
        .filter((val) => val !== null);

      const updatedData = medDescFromOra?.filter((value) => {
        return meddescFromSql?.find((val) => {
          return val.it_code === value.IT_CODE && val.itc_desc !== value.ITC_DESC;
        });
      });

      if (newMedArray.length !== 0) {
        await transaction(
          newMedArray?.map((value, index) => ({
            sql: `insert into medicine_descriptions (it_code,itc_desc,itc_alias,itn_pack,itn_strip,itc_status) values (?,?,?,?,?,?)`,
            values: [value.IT_CODE, value.ITC_DESC, value.ITC_ALIAS, value.ITN_PACK, value.ITN_STRIP, value.ITC_STATUS],
          })),
        );
      }

      if (updatedData.length !== 0) {
        return await transaction(
          updatedData?.map((value, index) => ({
            sql: `update medicine_descriptions set itc_desc = ?, itn_strip = ?, itn_pack = ? where it_code = ? `,
            values: [value.ITC_DESC, value.ITN_STRIP, value.ITN_PACK, value.IT_CODE],
          })),
        );
      }

      // return new Promise((resolve, reject) => {
      //   updatedData.map((val) => {
      //     pool.query(
      //       `update medicine_descriptions set itc_desc = ?, itn_strip = ?, itn_pack = ? where it_code = ? `,
      //       [val.ITC_DESC, val.ITN_STRIP, val.ITN_PACK, val.IT_CODE],
      //       (error, results, fields) => {
      //         if (error) {
      //           return reject(error);
      //         }
      //         return resolve(results);
      //       },
      //     );
      //   });
      // });

      // checkMeddescAlreadyExist((meddescFromSql) => {
      //   // let newMedArray = medDescFromOra
      //   //   ?.map((value) => {
      //   //     const medId = meddescFromSql?.find((val) => val.it_code === value.IT_CODE);
      //   //     return medId === undefined ? value : null;
      //   //   })
      //   //   .filter((val) => val !== null);
      //   // let updatedData = medDescFromOra?.filter((value) => {
      //   //   return meddescFromSql?.find((val) => {
      //   //     return val.it_code === value.IT_CODE && val.itc_desc !== value.ITC_DESC;
      //   //   });
      //   // });
      //   // if (newMedArray.length !== 0) {
      //   //   newMedArray?.map((value, index) => {
      //   //     pool.query(
      //   //       `insert into medicine_descriptions (it_code,itc_desc,itc_alias,
      //   //                    itn_pack,itn_strip,itc_status) values (?,?,?,?,?,?)`,
      //   //       [value.IT_CODE, value.ITC_DESC, value.ITC_ALIAS, value.ITN_PACK, value.ITN_STRIP, value.ITC_STATUS],
      //   //       (error, result) => {
      //   //         if (error) throw error;
      //   //       },
      //   //     );
      //   //   });
      //   // }
      //   // if (updatedData.length !== 0) {
      //   //   return new Promise((resolve, reject) => {
      //   //     updatedData.map((val) => {
      //   //       pool.query(
      //   //         `update medicine_descriptions
      //   //                         set itc_desc = ?, itn_strip = ?, itn_pack = ? where it_code = ? `,
      //   //         [val.ITC_DESC, val.ITN_STRIP, val.ITN_PACK, val.IT_CODE],
      //   //         (error, results, fields) => {
      //   //           if (error) {
      //   //             return reject(error);
      //   //           }
      //   //           return resolve(results);
      //   //         },
      //   //       );
      //   //     });
      //   //   });
      //   // }
      // });
    } catch (error) {
      throw error;
    } finally {
      await conn_ora.close();
    }
  },

  medicineImportedDateUpdate: async (data) => {
    const result = await query(`update medi_ellider.meddesc_lastupdate set lastupdate = ? where sl_no=1`, [data.lastupdate]);
    return result;
  },

  getImportedDate: async () => {
    const result = await query(`select lastupdate from  medi_ellider.meddesc_lastupdate where sl_no=1`);
    return result;
  },

  getMedicinesFromMysql: async () => {
    return query(`select * from medicine_descriptions order by itc_desc`);
  },

  searchMedicines: async (data) => {
    const result = await query(
      `select  * from medicine_descriptions
        where itc_alias like ? and itc_desc like ? order by itc_desc`,
      ["%" + data.itc_alias + "%", "%" + data.itc_desc + "%"],
    );
    return result;
  },

  medicineDetailsUpdate: async (data) => {
    const result = await query(`update medi_ellider.medicine_descriptions set  itn_strip = ?, itn_pack = ? where it_code = ?`, [data.itn_strip, data.itn_pack, data.it_code]);
    return result;
  },

  // updateOracleMedicine: (data, callBack) => {
  //     oraPool.query(
  //         `update meddesc set ITN_STRIP = ?, ITN_PACK = ? where IT_CODE = ?`,
  //         [
  //             data.ITN_STRIP,
  //             data.ITN_PACK,
  //             data.IT_CODE,
  //         ],
  //         (error, results, feilds) => {
  //             if (error) {
  //                 return callBack(error);
  //             }
  //             return callBack(null, results);
  //         }
  //     )

  // },
};
