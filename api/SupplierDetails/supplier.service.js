
const pool = require('../../config/dbconfig');
const { oraConnection, oracledb } = require('../../config/oradbconfig');
module.exports = {
    getSupplierList: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        const sql = `SELECT
                           SU_CODE,SUC_NAME,SUC_ALIAS,SUC_STATUS,SUC_PERSON,SUC_ADD1,SUC_ADD2,SUC_ADD3,SUC_ADD4,SUC_PHONE,
                           SUC_FAX,SUC_MOBILE,SUC_CSTNO,SUC_KGSTNO,SUC_TAXDATE,SUC_DLNO1,SUC_DLNO2,SUC_DLNO3,SUC_DLNO4,
                           SUD_DLDATE,SUN_CRDPERIOD,SUN_CRDLIMIT,SUN_OUTSTANDING,SUN_LEADTIME,SUN_SUPPLY,SUC_EMAIL,SUN_RANK,
                           SUN_RANK,US_CODE,SUC_TYPE,SUC_WEBSITE,AC_CODE,GAC_CODE,SUN_ORDER,SUD_EDDATE,SUC_OLDCODE,SUC_TIN,
                           NACC_CODE,SUC_CURRENCY,SUC_DELIVERY,VENDOR_CODE,SUC_PERSON1,SUC_PERSON2,SUC_PERSON3,SUC_PERSON_MOB1,
                           SUC_PERSON_MOB2,SUC_PERSON_MOB3,SUC_MFCODE,SUC_GSTIN,SUC_IGST,SUC_STCODE,SUC_TERMS,SUC_GROUPSUPPLIER,
                           SUC_PANNO
                     FROM
                           SUPPLIER
                     WHERE
                           SUC_STATUS='Y' AND SUC_NAME LIKE:supname`;
        try {
            const result = await conn_ora.execute(
                sql,
                {
                    supname: '%' + data.SUC_NAME + '%'
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
    getActiveSupplierList: async (callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        const sql = `SELECT
                           SUPPLIER.SU_CODE,SUC_NAME,SUC_ALIAS,SUC_STATUS
                     FROM
                           SUPPLIER
                        LEFT JOIN PORDMAST ON PORDMAST.SU_CODE=SUPPLIER.SU_CODE
                     WHERE
                           SUC_STATUS='Y' AND PORDMAST.ST_CODE IN ('C001','C002','C003','C004','0037')
                           AND PORDMAST.POC_CANCEL IS NULL AND PORDMAST.POC_CLOSE IS NULL
                           AND PORDMAST.POD_DATE >= ADD_MONTHS(SYSDATE, -12)
                           AND PORDMAST.PON_TOTAPPROVALSCOMP=4
                     GROUP BY  SUPPLIER.SU_CODE,SUC_NAME,SUC_ALIAS,SUC_STATUS
                     ORDER BY SUC_NAME`;
        try {
            const result = await conn_ora.execute(
                sql,
                {},
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














