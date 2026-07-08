const {executeTmc} = require("../../../../config/oracleExecutor");
const {oracledb} = require("../../../../config/oradbconfig");
const {sql_one} = require("./collection.sql");

const controller_service = async (conn, bind) => {
  const result = await executeTmc(sql_one, bind, {outFormat: oracledb.OUT_FORMAT_OBJECT});
  return result.rows;
};

module.exports = {
  collectionReports001: controller_service,
};
