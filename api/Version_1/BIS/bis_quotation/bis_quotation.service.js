const { oraConnection, oracledb } = require('../../../../config/oradbconfig');
module.exports = {
    getQtnMastDetails: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        const sql =
            `SELECT Q.QU_NO,
            Q.QUD_DATE,
            Q.SU_CODE,
            S.SUC_NAME,
            Q.QUC_TYPE,
            Q.QUD_EXPIRY,
            Q.QUC_STCODE,
            P.STC_DESC,
            Q.QUN_AMOUNT
            FROM QUOTATIONMAST Q
            LEFT JOIN QUOTATIONDETL D ON Q.QUC_SLNO=D.QUC_SLNO
            LEFT JOIN SUPPLIER S ON Q.SU_CODE=S.SU_CODE
            LEFT JOIN STORE P ON Q.QUC_STCODE=P.ST_CODE
            WHERE D.QUC_ACTIVE='Y'
            AND Q.QU_NO=:qtnNo
            AND (Q.QUD_DATE = :qtnDate)
            GROUP BY Q.QU_NO,
            Q.QUD_DATE,
            Q.SU_CODE,
            S.SUC_NAME,
            Q.QUC_TYPE,
            Q.QUD_EXPIRY,
            Q.QUC_STCODE,
            P.STC_DESC,
            Q.QUN_AMOUNT`;
        try {
            const result = await conn_ora.execute(
                sql,
                {
                    qtnNo: data.qtnNo,
                    qtnDate: data.qtnDate
                },
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT },
            )
            await result.resultSet?.getRows((err, rows) => {
                callBack(err, rows)
            })
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
    getQtnDetailDetails: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        const sql =
            `SELECT D.IT_CODE,
            M.ITC_DESC,
            D.QUN_RATE,
            D.QUN_DISPER,
            D.QUN_DISAMT,
            D.TX_CODE,
            TXN_PURPER,
            T.TXC_DESC,
            D.QUN_QTY,
            D.QUN_FREEQTY,
            D.QUN_MRP,
            D.QUN_NETAMT,
            D.QUN_NETUNITRATE,
            D.QUN_TAXAMT,
            D.QUN_PACK,
            D.QUN_STRIP,
            QUC_FRETYPE
            FROM QUOTATIONMAST Q
            LEFT JOIN QUOTATIONDETL D ON Q.QUC_SLNO=D.QUC_SLNO
            LEFT JOIN MEDDESC M ON D.IT_CODE=M.IT_CODE
            LEFT JOIN TAX T ON D.TX_CODE=T.TX_CODE
            WHERE D.QUC_ACTIVE='Y'
            AND Q.QU_NO=:qtnNo
            AND (Q.QUD_DATE =:qtnDate)`;
        try {
            const result = await conn_ora.execute(
                sql,
                {
                    qtnNo: data.qtnNo,
                    qtnDate: data.qtnDate
                },
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT },
            )
            await result.resultSet?.getRows((err, rows) => {
                callBack(err, rows)
            })
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
    getActiveItems: async (data, callBack) => {
        let pool_ora;
        let conn_ora;

        try {
            pool_ora = await oraConnection();
            conn_ora = await pool_ora.getConnection();

            const sql = `
            SELECT medstore.st_code, COUNT(medstore.it_code) AS item_count
            FROM meddesc
            LEFT JOIN medstore ON meddesc.it_code = medstore.it_code
            LEFT JOIN store ON medstore.st_code = store.st_code
            WHERE itc_status = 'Y'
            AND stc_status = 'Y'
            GROUP BY medstore.st_code
        `;

            const result = await conn_ora.execute(
                sql,
                {},
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            const resultSet = result.resultSet;
            const rows = await resultSet.getRows(); // Fetch all rows

            await resultSet.close(); // Close resultSet explicitly

            callBack(null, rows);
        } catch (error) {
            callBack(error);
        } finally {
            if (conn_ora) {
                try {
                    await conn_ora.close();
                } catch (closeError) {
                    console.error('Error closing connection:', closeError);
                }
            }

            if (pool_ora) {
                try {
                    await pool_ora.close();
                } catch (closeError) {
                    console.error('Error closing pool:', closeError);
                }
            }
        }
    },
    storeItems: async (data, callBack) => {
        let pool_ora;
        let conn_ora;

        try {
            pool_ora = await oraConnection();
            conn_ora = await pool_ora.getConnection();

            const sql = `
         SELECT ST_CODE,STC_DESC,STC_ALIAS
         FROM STORE
         WHERE STC_STATUS='Y'
        `;

            const result = await conn_ora.execute(
                sql,
                {},
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            const resultSet = result.resultSet;
            const rows = await resultSet.getRows(); // Fetch all rows

            await resultSet.close(); // Close resultSet explicitly

            callBack(null, rows);
        } catch (error) {
            callBack(error);
        } finally {
            if (conn_ora) {
                try {
                    await conn_ora.close();
                } catch (closeError) {
                    console.error('Error closing connection:', closeError);
                }
            }

            if (pool_ora) {
                try {
                    await pool_ora.close();
                } catch (closeError) {
                    console.error('Error closing pool:', closeError);
                }
            }
        }
    },
    medstore: async (data, callBack) => {
        let pool_ora;
        let conn_ora;

        try {
            pool_ora = await oraConnection();
            conn_ora = await pool_ora.getConnection();

            const sql = `
        SELECT MEDSTORE.IT_CODE,MEDSTORE.ST_CODE FROM MEDDESC LEFT JOIN MEDSTORE ON MEDDESC.IT_CODE = MEDSTORE.IT_CODE
        WHERE MEDDESC.ITC_STATUS = 'Y' 
        `;

            const result = await conn_ora.execute(
                sql,
                {},
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            const resultSet = result.resultSet;
            const rows = await resultSet.getRows(); // Fetch all rows

            await resultSet.close(); // Close resultSet explicitly

            callBack(null, rows);
        } catch (error) {
            callBack(error);
        } finally {
            if (conn_ora) {
                try {
                    await conn_ora.close();
                } catch (closeError) {
                    console.error('Error closing connection:', closeError);
                }
            }

            if (pool_ora) {
                try {
                    await pool_ora.close();
                } catch (closeError) {
                    console.error('Error closing pool:', closeError);
                }
            }
        }
    },

    medDescription: async (data, callBack) => {
        let pool_ora;
        let conn_ora;

        try {
            pool_ora = await oraConnection();
            conn_ora = await pool_ora.getConnection();

            const sql = `
      SELECT  meddesc.it_code,
         meddesc.itc_desc,
         meddesc.itc_alias,
         meddesc.itn_strip,
         medcategory.mc_code,
         medcategory.mcc_desc,
         medgroup.mg_code,
         medgroup.mgc_desc,
         medgencomb.cmc_desc,
         medtype.mtc_desc,
         decode(meddesc.itc_medicine,'N','No','Y','MEDICINE')"MEDICINE",
         decode(meddesc.itc_consumable,'N','No','Y','CONSUM')"CONSUMABLE",
         decode(meddesc.itc_highvalue,'N',' ','Y','VALUE')"HIGH_VALUE",
         decode(meddesc.itc_highrisk,'N',' ','Y','HIGH_RISK')"HIGH_RISK",
         decode(meddesc.itc_hazardous,'N',' ','Y','HAZARDOUS')"HAZARDOUS",
         decode(meddesc.itc_ved,'N','None','V','Vital','E','Essential','D','Desirable')"VED",
         decode(meddesc.itc_breakable,'N','No','Y','Yes')"BREAKABLE",
         meddesc.itn_breakqty,
         meddesc.itn_lprate,
         meddesc.itn_mrp,
         meddesc.itn_originalmrp,
         meddesc.itn_gendisper,
         meddesc.itn_genipdisper,
         meddesc.itd_date,
         meddesc.itd_eddate
FROM MEDDESC RIGHT JOIN (SELECT 
    DISTINCT(IT_CODE )
FROM MEDSTORE A ) B ON MEDDESC.IT_CODE = B.IT_CODE 
        left join medcategory on meddesc.mc_code=medcategory.mc_code
        left join medgroup on meddesc.mg_code=medgroup.mg_code
        left join medtype on meddesc.mt_code=medtype.mt_code
        left join medstore on meddesc.it_code=medstore.it_code 
        left join pstparam on medstore.st_code=pstparam.st_code
        left join medgencomb on meddesc.cm_code=medgencomb.cm_code
WHERE MEDDESC.ITC_STATUS = 'Y'
GROUP BY MEDDESC.IT_CODE,meddesc.itc_desc,meddesc.itc_alias,medcategory.mc_code,medcategory.mcc_desc,medgroup.mg_code,medgroup.mgc_desc,medtype.mt_code,medtype.mtc_desc,
                        meddesc.itc_assestitem,meddesc.itc_medicine,meddesc.itc_consumable,meddesc.itc_highvalue,meddesc.itc_highrisk,meddesc.itc_hazardous,medgencomb.cmc_desc,meddesc.itc_ved,
                        meddesc.itn_strip,meddesc.itc_breakable,meddesc.itn_breakqty,meddesc.itn_lprate,meddesc.itn_mrp,meddesc.itn_originalmrp,meddesc.itn_gendisper,meddesc.itn_genipdisper,meddesc.itd_date,meddesc.itd_eddate
 
        `;

            const result = await conn_ora.execute(
                sql,
                {},
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            const resultSet = result.resultSet;
            const rows = await resultSet.getRows(); // Fetch all rows

            await resultSet.close(); // Close resultSet explicitly

            callBack(null, rows);
        } catch (error) {
            callBack(error);
        } finally {
            if (conn_ora) {
                try {
                    await conn_ora.close();
                } catch (closeError) {
                    console.error('Error closing connection:', closeError);
                }
            }

            if (pool_ora) {
                try {
                    await pool_ora.close();
                } catch (closeError) {
                    console.error('Error closing pool:', closeError);
                }
            }
        }
    },

    getTotalQtn: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        const sql =
            `SELECT Q.QU_NO,
            Q.QUD_DATE,
            Q.SU_CODE,
            S.SUC_NAME,
            Q.QUC_TYPE,
            Q.QUD_EXPIRY,
            Q.QUC_STCODE,
            P.STC_DESC,
            Q.QUN_AMOUNT
            FROM QUOTATIONMAST Q
            LEFT JOIN QUOTATIONDETL D ON Q.QUC_SLNO=D.QUC_SLNO
            LEFT JOIN SUPPLIER S ON Q.SU_CODE=S.SU_CODE
            LEFT JOIN STORE P ON Q.QUC_STCODE=P.ST_CODE
            WHERE D.QUC_ACTIVE='Y'
            GROUP BY Q.QU_NO,
            Q.QUD_DATE,
            Q.SU_CODE,
            S.SUC_NAME,
            Q.QUC_TYPE,
            Q.QUD_EXPIRY,
            Q.QUC_STCODE,
            P.STC_DESC,
            Q.QUN_AMOUNT`;
        try {
            const result = await conn_ora.execute(
                sql, {},
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT },
            )
            await result.resultSet?.getRows((err, rows) => {
                callBack(err, rows)
            })
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
}


