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
}