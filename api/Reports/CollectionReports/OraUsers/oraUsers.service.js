const {oracledb} = require("../../../../config/oradbconfig");

module.exports = {
  oraUsers: async (conn_ora) => {
    const result = await conn_ora.execute(
      `Select us_code,initcap(USC_NAME)USC_NAME,ROWNUM  from users   order by usc_name`,
      {},
      {outFormat: oracledb.OUT_FORMAT_OBJECT},
    );
    return result.rows;
  },
};
