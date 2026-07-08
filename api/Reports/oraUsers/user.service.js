// @ts-ignore
const {executeTmc} = require("../../../config/oracleExecutor");
const {oracledb, getTmcConnection} = require("../../../config/oradbconfig");

module.exports = {
  oraUsers: async () => {
    try {
      const sql = `SELECT 
                us_code,
                usc_name,
                usc_alias,
                usc_status,
                bill_user,
                usc_default_mhcode
            FROM USERS`;
      const resutl = await executeTmc(sql, {outFormat: oracledb.OUT_FORMAT_OBJECT});
      return resutl.rows;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
};
