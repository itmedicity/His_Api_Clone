
const pool = require('../../config/dbconfig');
const { oraConnection, oracledb } = require('../../config/oradbconfig');
module.exports = {

    getMedicinesFromOracle: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        let checkMeddescAlreadyExist = (callBack) => {
            pool.query(`select it_code,itc_desc from medicine_descriptions`,
                [],
                (error, result) => {
                    if (error) throw error;
                    return callBack(JSON.parse(JSON.stringify(result)));
                })
        }
        try {
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
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT }
            )
            const medDescFromOra = await result.resultSet?.getRows();
            checkMeddescAlreadyExist((meddescFromSql) => {
                let newMedArray = medDescFromOra?.map((value) => {
                    const medId = meddescFromSql.find((val) => val.it_code === value.IT_CODE && val.itc_desc === value.ITC_DESC);
                    return medId === undefined ? value : null;
                }).filter((val) => val !== null)

                newMedArray && newMedArray?.map((value, index) => {
                    pool.query(`insert into medicine_descriptions (it_code,itc_desc,itc_alias,
                       itn_pack,itn_strip,itc_status) values (?,?,?,?,?,?)`,
                        [
                            value.IT_CODE,
                            value.ITC_DESC,
                            value.ITC_ALIAS,
                            value.ITN_PACK,
                            value.ITN_STRIP,
                            value.ITC_STATUS
                        ],
                        (error, result) => {
                            if (error)
                                throw error;
                        });
                })
            })
            return callBack(null, result)
        }
        catch (error) {
            return callBack(error)
        } finally {
            if (conn_ora) {
                await conn_ora.close();
                await pool_ora.close();
            }
        }
    },

    medicineImportedDateUpdate: (data, callBack) => {
        pool.query(
            `update medi_ellider.meddesc_lastupdate set lastupdate = ? where sl_no=1`,
            [
                data.lastupdate,
            ],
            (error, results, feilds) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        )
    },

    getImportedDate: (callBack) => {
        pool.query(
            `select lastupdate from  medi_ellider.meddesc_lastupdate where sl_no=1`,
            (error, results, feilds) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        )
    },

    getMedicinesFromMysql: (callBack) => {
        pool.query(`select * from medicine_descriptions order by itc_desc`,
            (error, results, feilds) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        )
    },

    searchMedicines: (data, callBack) => {
        pool.query(`select  * from medicine_descriptions
        where itc_alias like ? and itc_desc like ? order by itc_desc`,
            [
                '%' + data.itc_alias + '%',
                '%' + data.itc_desc + '%',
            ],
            (err, results, feilds) => {
                if (err) {
                    return callBack(err)
                }
                return callBack(null, results)
            }
        )
    },

    medicineDetailsUpdate: (data, callBack) => {
        pool.query(
            `update medi_ellider.medicine_descriptions set  itn_strip = ?, itn_pack = ? where it_code = ?`,
            [
                data.itn_strip,
                data.itn_pack,
                data.it_code
            ],
            (error, results, feilds) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        )
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


}
