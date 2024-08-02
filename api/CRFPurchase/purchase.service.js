
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
                       MEDDESC.ITC_DESC,TAX.TXC_DESC,PORDDETL.PDN_TAXAMT
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
    getPendingPODetails: async (callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        try {
            const result = await conn_ora.execute(
                `SELECT 
                       PORDMAST.PO_NO,
                       PORDMAST.POD_DATE,
                       PORDMAST.POC_TYPE,
                       STORE.STC_DESC,
                       SUPPLIER.SUC_NAME,
                       PORDMAST.POD_VALIDUPTO AS PO_EXPIRY,
                       PORDMAST.POC_DELIVERY,
                       PORDMAST.PON_AMOUNT,
                       PORDMAST.POD_EDD AS EXPECTED_DATE,
                       PORDDETL.IT_CODE,
                       PORDDETL.PDN_QTY,
                       PORDDETL.PDN_RATE,
                       PORDDETL.PDN_ORIGINALMRP,
                       MEDDESC.ITC_DESC,
                       TAX.TXC_DESC,
                       PORDDETL.PDN_TAXAMT
                   FROM 
                       PORDMAST,
                       STORE,
                       SUPPLIER,
                       PORDDETL,
                       MEDDESC,
                       TAX
                   WHERE
                      PORDMAST.ST_CODE=STORE.ST_CODE
                       AND PORDMAST.SU_CODE = SUPPLIER.SU_CODE
                       AND PORDMAST.POC_SLNO = PORDDETL.POC_SLNO
                       AND PORDDETL.IT_CODE = MEDDESC.IT_CODE
                       AND PORDDETL.TX_CODE = TAX.TX_CODE
                       AND PORDMAST.POC_CANCEL IS NULL
                       AND PORDMAST.POC_CLOSE IS NULL
                       AND PORDDETL.POC_CANCEL IS NULL
                       AND EXTRACT(YEAR FROM PORDMAST.POD_DATE) = EXTRACT(YEAR FROM SYSDATE)`,
                {},
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
}

