// @ts-ignore
const {oraPool, oracledb, connectionClose, getTmcConnection} = require("../../../config/oradbconfig");

module.exports = {
  oraUsers: async () => {
    let ora_conn = getTmcConnection();
    try {
      const sql = `SELECT 
                us_code,
                usc_name,
                usc_alias,
                usc_status,
                bill_user,
                usc_default_mhcode
            FROM USERS`;
      const resutl = await ora_conn.execute(sql, {outFormat: oracledb.OUT_FORMAT_OBJECT});
      return resutl.rows;
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      await ora_conn.close();
    }
  },
};
