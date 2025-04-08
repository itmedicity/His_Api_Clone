
const pool = require('../../config/dbconfig');
const { oraConnection, oracledb } = require('../../config/oradbconfig');

module.exports = {
    getPODetails: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        try {
            const result = await conn_ora.execute(
                `SELECT 
                       PORDMAST.PO_NO,PORDMAST.POD_DATE, PORDMAST.SU_CODE,SUPPLIER.SUC_NAME,PORDMAST.POC_DELIVERY,
                       PORDMAST.PON_AMOUNT,PORDMAST.POD_EDD,PORDDETL.IT_CODE,PORDDETL.PDN_QTY,PORDDETL.PDN_RATE,
                       PORDDETL.PDN_ORIGINALMRP,MEDDESC.ITC_DESC,TAX.TXC_DESC,PORDDETL.PDN_TAXAMT,
                       PORDDETL.PDN_VALUE AS TOTAL, PORDMAST.POC_TYPE,PORDMAST.POD_VALIDUPTO AS PO_EXPIRY,
                       PORDMAST.PON_TOTAPPROVALSCOMP AS APPROVAL,PDN_SUPQTY
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
                        AND PORDMAST.POC_CANCEL IS NULL`,
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
    // AND PORDMAST.POC_CLOSE IS NULL

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
                       AND PO_NO IN (${ponoArray})
                       AND ST_CODE IN (${stcodeArray}) `;

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
    // AND POC_CLOSE IS NULL

    getItemGrnDetails: async (data, callBack) => {
        const ponoArray = data.map(d => `'${d.pono}'`).join(",");
        const stcodeArray = data.map(d => `'${d.stcode}'`).join(",");

        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        try {
            const query =
                `SELECT 
                       GRNDETL.GR_NO,GRNDETL.GRD_DATE,GRNDETL.IT_CODE, GRNDETL.GRN_QTY,PORDDETL.PDN_QTY,
                       PORDDETL.PDN_SUPQTY,PORDMAST.PO_NO,PORDMAST.ST_CODE          
                 FROM
                       GRNDETL 
                       LEFT JOIN PORDDETL ON (PORDDETL.POC_SLNO=GRNDETL.GRC_DOCNO AND PORDDETL.IT_CODE=GRNDETL.IT_CODE)
                       LEFT JOIN PORDMAST ON PORDMAST.POC_SLNO = PORDDETL.POC_SLNO
                  WHERE
                        PORDMAST.POC_CANCEL IS NULL
                        AND PORDMAST.PO_NO IN  (${ponoArray})
                        AND PORDMAST.ST_CODE IN (${stcodeArray})
                        AND PORDMAST.POD_DATE >= ADD_MONTHS(SYSDATE, -50)`;
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

    getPODetailsBySupplier: async (id, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        try {
            const result = await conn_ora.execute(
                `SELECT 
                       PORDMAST.PO_NO,PORDMAST.POD_DATE,PORDMAST.SU_CODE,SUPPLIER.SUC_NAME,PORDMAST.POC_DELIVERY,
                       PORDMAST.ST_CODE,PORDMAST.PON_AMOUNT,PORDMAST.POD_EDD,PORDDETL.IT_CODE,PORDDETL.PDN_QTY,
                       PORDDETL.PDN_RATE,PORDDETL.PDN_ORIGINALMRP,MEDDESC.ITC_DESC,TAX.TXC_DESC,PORDDETL.PDN_TAXAMT,
                       PORDDETL.PDN_VALUE AS TOTAL, PORDMAST.POC_TYPE,PORDMAST.POD_VALIDUPTO AS PO_EXPIRY,PDN_SUPQTY
                FROM 
                        PORDMAST,SUPPLIER,PORDDETL,MEDDESC,TAX
                WHERE         
                        PORDMAST.SU_CODE = SUPPLIER.SU_CODE
                        AND PORDMAST.POC_SLNO = PORDDETL.POC_SLNO
                        AND PORDDETL.IT_CODE = MEDDESC.IT_CODE
                        AND PORDDETL.TX_CODE = TAX.TX_CODE
                        AND PORDMAST.SU_CODE=:spcode
                        AND PORDMAST.POC_CANCEL IS NULL AND POC_CLOSE IS NULL
                        AND PORDMAST.PON_TOTAPPROVALSCOMP=4
                        AND PORDMAST.POD_DATE >= ADD_MONTHS(SYSDATE, -12)
                 ORDER BY PORDMAST.POD_DATE DESC `,
                {
                    spcode: id
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


    getItemDetails: async (data, callBack) => {
        const ponoArray = data.map(d => `'${d.pono}'`).join(",");
        const stcodeArray = data.map(d => `'${d.stcode}'`).join(",");

        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        try {
            const query =
                `SELECT 
                       PORDDETL.IT_CODE,PORDDETL.PDN_QTY,PORDDETL.PDN_SUPQTY,PORDMAST.PO_NO,PORDMAST.ST_CODE          
                FROM
                       PORDDETL 
                    LEFT JOIN PORDMAST ON PORDMAST.POC_SLNO = PORDDETL.POC_SLNO
                WHERE
                       PORDMAST.POC_CANCEL IS NULL
                       AND PORDMAST.PO_NO IN  (${ponoArray})
                       AND PORDMAST.ST_CODE IN (${stcodeArray})
                       AND PORDMAST.POD_DATE >= ADD_MONTHS(SYSDATE, -12)`;
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

