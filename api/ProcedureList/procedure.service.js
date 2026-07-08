const {executeKmc} = require("../../config/oracleExecutor");
const {oracledb} = require("../../config/oradbconfig");
module.exports = {
  GetProcedureList: async (data) => {
    const sql = `SELECT 
                            PRODESCRIPTION.PD_CODE,PRODESCRIPTION.PDC_DESC
                     FROM 
                            PRODESCRIPTION
                     WHERE 
                            PRODESCRIPTION.PDC_STATUS='Y' AND PDC_DESC LIKE:procname`;
    try {
      const result = await executeKmc(
        sql,
        {
          procname: "%" + data.PDC_DESC + "%",
        },
        {outFormat: oracledb.OUT_FORMAT_OBJECT},
      );
      return result.rows;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
};
