
const pool = require('../../config/dbconfig');
const { oraConnection, oracledb } = require('../../config/oradbconfig');

module.exports = {
    getPODetails: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        try {
            const result = await conn_ora.execute(
                `SELECT 
                       PORDMAST.PO_NO,PORDMAST.POD_DATE,SUPPLIER.SUC_NAME,PORDMAST.POC_DELIVERY,PORDMAST.PON_AMOUNT,
                       PORDMAST.POD_EDD,PORDDETL.IT_CODE,PORDDETL.PDN_QTY,PORDDETL.PDN_RATE,PORDDETL.PDN_ORIGINALMRP,
                       MEDDESC.ITC_DESC,TAX.TXC_DESC,PORDDETL.PDN_TAXAMT, PORDDETL.PDN_VALUE AS TOTAL, PORDMAST.POC_TYPE,
                       PORDMAST.POD_VALIDUPTO AS PO_EXPIRY, PORDMAST.PON_TOTAPPROVALSCOMP AS APPROVAL
                 FROM 
                        PORDMAST,SUPPLIER,PORDDETL,MEDDESC,TAX
                 WHERE         
                        PORDMAST.SU_CODE = SUPPLIER.SU_CODE
                        AND PORDMAST.POC_SLNO = PORDDETL.POC_SLNO
                        AND PORDDETL.IT_CODE = MEDDESC.IT_CODE
                        AND PORDDETL.TX_CODE = TAX.TX_CODE
                        AND PORDMAST.PO_NO=:ponumber
                        AND PORDMAST.POD_DATE >= TO_DATE(:date1,'dd/MM/yyyy hh24:mi:ss')
                        AND PORDMAST.POD_DATE <= TO_DATE(:date2,'dd/MM/yyyy hh24:mi:ss')
                        AND PORDMAST.ST_CODE=:stcode
                        AND PORDMAST.POC_CANCEL IS NULL
                        AND PORDMAST.POC_CLOSE IS NULL`,
                {
                    ponumber: data.ponumber,
                    date1: data.from,
                    date2: data.to,
                    stcode: data.stcode
                },
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT }
            )
            const hisData = await result.resultSet?.getRows();
            return callBack(null, hisData)
        }
        catch (error) {
            return callBack(error)
        }
        finally {
            if (conn_ora) {
                await conn_ora.close();
                await pool_ora.close();
            }
        }
    },
    // getPendingPODetails: async (data, callBack) => {
    //     console.log(data);
    //     const pono = data.pono
    //     const stcode = data.stcode
    //     let pool_ora = await oraConnection();
    //     let conn_ora = await pool_ora.getConnection();
    //     try {
    //         const result = await conn_ora.execute(
    //             `SELECT 
    //                    PO_NO,
    //                    POD_VALIDUPTO AS PO_EXPIRY,
    //                    POD_EDD AS EXPECTED_DATE,
    //                    PON_TOTAPPROVALSCOMP AS APPROVAL
    //              FROM 
    //                    PORDMAST
    //              WHERE
    //                    POC_CANCEL IS NULL
    //                    AND POC_CLOSE IS NULL
    //                    AND PO_NO IN (${pono})
    //                    AND ST_CODE IN (${stcode})`,
    //             {

    //             },
    //             { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT }
    //         )
    //         const hisData = await result.resultSet?.getRows();

    //         return callBack(null, hisData)
    //     }
    //     catch (error) {
    //         return callBack(error)
    //     }
    //     finally {
    //         if (conn_ora) {
    //             await conn_ora.close();
    //             await pool_ora.close();
    //         }
    //     }
    // },



    getPendingPODetails: async (data, callBack) => {
        const ponoArray = data.map(d => `'${d.pono}'`).join(",");
        const stcodeArray = data.map(d => `'${d.stcode}'`).join(",");

        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();

        try {
            const query = `
                SELECT 
                       PO_NO,
                       ST_CODE,
                       POD_VALIDUPTO AS PO_EXPIRY,
                       POD_EDD AS EXPECTED_DATE,
                       PON_TOTAPPROVALSCOMP AS APPROVAL
                FROM 
                       PORDMAST
                WHERE
                       POC_CANCEL IS NULL
                       AND POC_CLOSE IS NULL
                       AND PO_NO IN (${ponoArray})
                       AND ST_CODE IN (${stcodeArray})
            `;

            const result = await conn_ora.execute(
                query,
                {},
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            const hisData = await result.resultSet?.getRows();

            return callBack(null, hisData);
        }
        catch (error) {
            return callBack(error);
        }
        finally {
            if (conn_ora) {
                await conn_ora.close();
                await pool_ora.close();
            }
        }
    },




    // getPendingPODetails: async (data, callBack) => {
    //     const ponumber = data.ponumber
    //     let pool_ora = await oraConnection();
    //     let conn_ora = await pool_ora.getConnection();
    //     try {
    //         const result = await conn_ora.execute(
    //             `SELECT 
    //                    PORDMAST.PO_NO,
    //                    PORDMAST.POD_DATE,
    //                    PORDMAST.POC_TYPE,
    //                    STORE.STC_DESC,
    //                    SUPPLIER.SUC_NAME,
    //                    PORDMAST.POD_VALIDUPTO AS PO_EXPIRY,
    //                    PORDMAST.POC_DELIVERY,
    //                    PORDMAST.PON_AMOUNT,
    //                    PORDMAST.POD_EDD AS EXPECTED_DATE,
    //                    PORDDETL.IT_CODE,
    //                    PORDDETL.PDN_QTY,
    //                    PORDDETL.PDN_RATE,
    //                    PORDDETL.PDN_ORIGINALMRP,
    //                    PORDDETL.PDN_VALUE AS TOTAL,
    //                    MEDDESC.ITC_DESC,
    //                    TAX.TXC_DESC,
    //                    PORDDETL.PDN_TAXAMT,
    //                    PORDMAST.PON_TOTAPPROVALSCOMP AS APPROVAL
    //              FROM 
    //                    PORDMAST,
    //                    STORE,
    //                    SUPPLIER,
    //                    PORDDETL,
    //                    MEDDESC,
    //                    TAX
    //              WHERE
    //                   PORDMAST.ST_CODE=STORE.ST_CODE
    //                    AND PORDMAST.SU_CODE = SUPPLIER.SU_CODE
    //                    AND PORDMAST.POC_SLNO = PORDDETL.POC_SLNO
    //                    AND PORDDETL.IT_CODE = MEDDESC.IT_CODE
    //                    AND PORDDETL.TX_CODE = TAX.TX_CODE
    //                    AND PORDMAST.POC_CANCEL IS NULL
    //                    AND PORDMAST.POC_CLOSE IS NULL
    //                    AND PORDDETL.POC_CANCEL IS NULL
    //                    AND PORDMAST.PO_NO IN (${ponumber})
    //                    AND EXTRACT(YEAR FROM PORDMAST.POD_DATE) = EXTRACT(YEAR FROM SYSDATE)`,
    //             {},
    //             { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT }
    //         )
    //         const hisData = await result.resultSet?.getRows();

    //         return callBack(null, hisData)
    //     }
    //     catch (error) {
    //         return callBack(error)
    //     }
    //     finally {
    //         if (conn_ora) {
    //             await conn_ora.close();
    //             await pool_ora.close();
    //         }
    //     }
    // },

}
