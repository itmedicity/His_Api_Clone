const {oracledb, getTmcConnection} = require("../../config/oradbconfig");
module.exports = {
  GetProcedureList: async (data, callBack) => {
    let conn_ora = await getTmcConnection();
    const sql = `SELECT 
                            PRODESCRIPTION.PD_CODE,PRODESCRIPTION.PDC_DESC
                     FROM 
                            PRODESCRIPTION
                     WHERE 
                            PRODESCRIPTION.PDC_STATUS='Y' AND PDC_DESC LIKE:procname`;
    try {
      const result = await conn_ora.execute(
        sql,
        {
          procname: "%" + data.PDC_DESC + "%",
        },
        {outFormat: oracledb.OUT_FORMAT_OBJECT},
      );
      // await result.resultSet?.getRows((err, rows) => {
      // })
      callBack(err, result.rows);
    } catch (error) {
      return callBack(error);
    } finally {
      if (conn_ora) {
        await conn_ora.close();
      }
    }
  },
};
